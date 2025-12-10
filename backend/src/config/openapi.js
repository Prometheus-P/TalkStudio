// backend/src/config/openapi.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TalkStudio Backend API',
      version: '1.0.0',
      description: 'AI Software Factory v4.0 기반 TalkStudio 백엔드 API 문서',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Default Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        DiscordConfig: {
          type: 'object',
          properties: {
            serverId: { type: 'string', description: "Discord's actual server ID" },
            serverName: { type: 'string', description: 'Name of the Discord server' },
            botToken: { type: 'string', description: 'Discord bot token (should be encrypted)' },
            enabledChannels: { type: 'array', items: { type: 'string' }, description: 'Array of Discord channel IDs' },
            captureStartDate: { type: 'string', format: 'date-time', description: 'Date from which to start capturing messages' },
            isActive: { type: 'boolean', description: 'Whether this configuration is active' },
          },
          required: ['serverId', 'botToken'],
        },
        CaptureStartRequest: {
          type: 'object',
          properties: {
            fromTimestamp: { type: 'string', format: 'date-time', description: 'Start capturing messages from this timestamp' },
            limitMessages: { type: 'integer', description: 'Maximum number of messages to capture' },
          },
        },
        CaptureStatus: {
          type: 'object',
          properties: {
            captureJobId: { type: 'string' },
            configId: { type: 'string' },
            status: { type: 'string', enum: ['running', 'completed', 'failed', 'pending'] },
            messagesCaptured: { type: 'integer' },
            totalMessagesExpected: { type: 'integer', nullable: true },
            progress: { type: 'number' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time', nullable: true },
            errorMessage: { type: 'string', nullable: true },
          },
        },
        GeneratedContentRequest: {
          type: 'object',
          properties: {
            discordMessageIds: { type: 'array', items: { type: 'string' } },
            contentType: { type: 'string', enum: ['summary', 'faq_answer', 'idea_list'] },
            generationParameters: { type: 'object' },
          },
          required: ['discordMessageIds', 'contentType'],
        },
        GeneratedContentResponse: {
          type: 'object',
          properties: {
            generatedContentId: { type: 'string' },
            relatedDiscordMessageIds: { type: 'array', items: { type: 'string' } },
            contentType: { type: 'string' },
            generatedText: { type: 'string' },
            upstageModelUsed: { type: 'string' },
            promptUsed: { type: 'string' },
            temperature: { type: 'number' },
            generatedAt: { type: 'string', format: 'date-time' },
            feedback: { type: 'object', nullable: true },
            status: { type: 'string', enum: ['pending', 'generating', 'completed', 'failed'] },
          },
        },
        IntentAnalysisResult: {
          type: 'object',
          properties: {
            discordMessageId: { type: 'string' },
            extractedIntents: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } },
            sentiment: { type: 'string' },
            analysisModelVersion: { type: 'string' },
            analysisTimestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/api/**/*.js'], // Path to the API routes files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
