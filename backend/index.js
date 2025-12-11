// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/openapi.js'; // Import swaggerSpec

import connectDB from './src/db/index.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';
import discordConfigRoutes from './src/api/integrations/discord_config_routes.js';
import discordCaptureRoutes from './src/api/integrations/discord_capture_routes.js';
import intentAnalysisRoutes from './src/api/integrations/intent_analysis_routes.js';
import contentGenerationRoutes from './src/api/integrations/content_generation_routes.js';
import conversationRoutes from './src/api/conversations/conversation_routes.js';
import templateRoutes from './src/api/conversations/template_routes.js';
import { startRetentionJob } from './src/jobs/data_retention_job.js';
import { seed as seedTemplates } from './src/db/seeds/system_templates.js';

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info(`Swagger UI available at /api-docs`);

// Routes - Discord integrations
app.use('/api/v1/integrations/discord', discordConfigRoutes);
app.use('/api/v1/integrations/discord', discordCaptureRoutes);
app.use('/api/v1/integrations/discord', intentAnalysisRoutes);
app.use('/api/v1/content', contentGenerationRoutes);

// Routes - AI Conversation Generator (002)
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/templates', templateRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' });
});

// Start the server
app.listen(config.port, async () => {
  logger.info(`Server running on port ${config.port}`);

  // Seed system templates (002-ai-conversation-generator)
  try {
    await seedTemplates();
  } catch (error) {
    logger.error('Failed to seed system templates:', error.message);
  }

  // Start data retention job (US7/NFR-8)
  startRetentionJob();
});
