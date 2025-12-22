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
        // AI Conversation Generator Schemas (002)
        Conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB ObjectId' },
            scenario: { type: 'string', description: '시나리오 설명' },
            participants: { type: 'array', items: { type: 'string' }, description: '참여자 이름 목록' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sender: { type: 'string', description: '발신자 이름' },
                  text: { type: 'string', description: '메시지 내용' },
                  timestamp: { type: 'string', description: '타임스탬프' },
                },
              },
            },
            tone: { type: 'string', enum: ['casual', 'formal', 'humorous'], description: '대화 톤' },
            platform: { type: 'string', enum: ['kakaotalk', 'discord', 'telegram', 'instagram'], description: '플랫폼' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time', description: '90일 후 자동 삭제' },
          },
        },
        ConversationGenerateRequest: {
          type: 'object',
          required: ['scenario'],
          properties: {
            scenario: { type: 'string', minLength: 10, maxLength: 500, description: '시나리오 설명 (10-500자)' },
            participants: { type: 'integer', minimum: 2, maximum: 5, default: 2, description: '참여자 수' },
            messageCount: { type: 'integer', minimum: 5, maximum: 50, default: 10, description: '메시지 수' },
            tone: { type: 'string', enum: ['casual', 'formal', 'humorous'], default: 'casual', description: '대화 톤' },
            platform: { type: 'string', enum: ['kakaotalk', 'discord', 'telegram', 'instagram'], default: 'kakaotalk', description: '플랫폼' },
            participantNames: { type: 'array', items: { type: 'string' }, maxItems: 5, description: '참여자 이름 (선택)' },
            templateId: { type: 'string', description: '템플릿 ID (선택)' },
          },
        },
        Template: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', description: '템플릿 이름' },
            description: { type: 'string', description: '템플릿 설명' },
            scenario: { type: 'string', description: '시나리오 프롬프트' },
            category: { type: 'string', enum: ['game_trade', 'daily_chat', 'customer_support', 'friend_chat', 'custom'], description: '카테고리' },
            participants: { type: 'integer', minimum: 2, maximum: 5, description: '기본 참여자 수' },
            messageCount: { type: 'integer', minimum: 5, maximum: 50, description: '기본 메시지 수' },
            tone: { type: 'string', enum: ['casual', 'formal', 'humorous'], description: '기본 톤' },
            isSystem: { type: 'boolean', description: '시스템 템플릿 여부' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BulkJob: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'], description: '작업 상태' },
            totalCount: { type: 'integer', description: '전체 시나리오 수' },
            completedCount: { type: 'integer', description: '완료된 시나리오 수' },
            failedCount: { type: 'integer', description: '실패한 시나리오 수' },
            progress: { type: 'number', minimum: 0, maximum: 100, description: '진행률 (%)' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time', description: '24시간 후 자동 삭제' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['error'] },
            code: { type: 'string', description: '에러 코드' },
            message: { type: 'string', description: '사용자 친화적 에러 메시지' },
            details: { type: 'object', description: '상세 에러 정보 (선택)' },
          },
        },
      },
    },
    tags: [
      { name: 'Discord', description: 'Discord 연동 API' },
      { name: 'Conversations', description: 'AI 대화 생성 API' },
      { name: 'Templates', description: '시나리오 템플릿 API' },
      { name: 'Bulk', description: '대량 생성 API' },
    ],
  },
  apis: ['./src/api/**/*.js'], // Path to the API routes files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
