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

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info(`Swagger UI available at /api-docs`);

// Routes
app.use('/api/v1/integrations/discord', discordConfigRoutes);
app.use('/api/v1/integrations/discord', discordCaptureRoutes);
app.use('/api/v1/integrations/discord', intentAnalysisRoutes);
app.use('/api/v1/content', contentGenerationRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' });
});

// Start the server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});