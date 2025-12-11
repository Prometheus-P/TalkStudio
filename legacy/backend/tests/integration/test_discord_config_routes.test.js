// backend/tests/integration/test_discord_config_routes.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import DiscordConfig from '../../src/models/discord_config_model.js';
import discordConfigRoutes from '../../src/api/integrations/discord_config_routes.js';
import connectDB from '../../src/db/index.js'; // Assuming you have a DB connection utility

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the config module for encryptionSecret
jest.mock('../../src/config/index.js', () => ({
  default: {
    encryptionSecret: 'test_encryption_secret',
    databaseUrl: global.__MONGO_URI__, // Use the in-memory DB URI
  },
}));

const app = express();
app.use(express.json());
app.use('/api/v1/integrations/discord', discordConfigRoutes);

describe('DiscordConfig API Integration', () => {
  beforeAll(async () => {
    // Connect to the in-memory MongoDB
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await DiscordConfig.deleteMany({}); // Clear collection after each test
  });

  // Test POST /integrations/discord/config (Create)
  test('should create a new Discord config', async () => {
    const configData = {
      serverId: 'new_server_1',
      serverName: 'New Test Server',
      botToken: 'bot_token_123',
      enabledChannels: ['channel_a', 'channel_b'],
    };

    const res = await request(app)
      .post('/api/v1/integrations/discord/config')
      .send(configData)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.data.configId).toBeDefined();
    expect(res.body.data.serverId).toBe(configData.serverId);
    expect(res.body.data.serverName).toBe(configData.serverName);
    expect(res.body.message).toBe('Discord 설정이 성공적으로 저장되었습니다.');

    const savedConfig = await DiscordConfig.findById(res.body.data.configId);
    expect(savedConfig).toBeDefined();
    expect(savedConfig.serverId).toBe(configData.serverId);
    // botToken should be encrypted
    expect(savedConfig.botToken).not.toBe(configData.botToken);
  });

  // Test POST /integrations/discord/config (Update)
  test('should update an existing Discord config', async () => {
    const configData = {
      serverId: 'existing_server_1',
      botToken: 'old_bot_token',
      enabledChannels: ['channel_old'],
    };
    const existingConfig = await new DiscordConfig(configData).save();

    const updateData = {
      serverId: 'existing_server_1',
      serverName: 'Updated Server Name',
      botToken: 'new_bot_token',
      enabledChannels: ['channel_new_1', 'channel_new_2'],
    };

    const res = await request(app)
      .post('/api/v1/integrations/discord/config')
      .send(updateData)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.configId).toBe(existingConfig._id);
    expect(res.body.data.serverName).toBe(updateData.serverName);
    expect(res.body.message).toBe('Discord 설정이 성공적으로 업데이트되었습니다.');

    const updatedConfig = await DiscordConfig.findById(existingConfig._id);
    expect(updatedConfig.serverName).toBe(updateData.serverName);
    expect(updatedConfig.enabledChannels).toEqual(expect.arrayContaining(updateData.enabledChannels));
    const decryptedToken = updatedConfig.getDecryptedBotToken();
    expect(decryptedToken).toBe(updateData.botToken);
  });

  // Test GET /integrations/discord/config/:configId (Found)
  test('should get a Discord config by ID', async () => {
    const configData = {
      serverId: 'get_server_1',
      serverName: 'Get Test Server',
      botToken: 'get_bot_token',
    };
    const existingConfig = await new DiscordConfig(configData).save();

    const res = await request(app)
      .get(`/api/v1/integrations/discord/config/${existingConfig._id}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.configId).toBe(existingConfig._id);
    expect(res.body.data.serverId).toBe(configData.serverId);
    expect(res.body.data.serverName).toBe(configData.serverName);
    expect(res.body.data.botToken).toBeUndefined(); // botToken should not be returned
  });

  // Test GET /integrations/discord/config/:configId (Not Found)
  test('should return 404 if config not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString(); // Generate a valid-looking but non-existent ID
    const res = await request(app)
      .get(`/api/v1/integrations/discord/config/${nonExistentId}`)
      .expect(404);

    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('DISCORD_CONFIG_NOT_FOUND');
  });

  // Test DELETE /integrations/discord/config/:configId (Success)
  test('should delete a Discord config by ID', async () => {
    const configData = {
      serverId: 'delete_server_1',
      botToken: 'delete_bot_token',
    };
    const existingConfig = await new DiscordConfig(configData).save();

    const res = await request(app)
      .delete(`/api/v1/integrations/discord/config/${existingConfig._id}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Discord 설정이 성공적으로 삭제되었습니다.');

    const foundConfig = await DiscordConfig.findById(existingConfig._id);
    expect(foundConfig).toBeNull();
  });

  // Test DELETE /integrations/discord/config/:configId (Not Found)
  test('should return 404 if config to delete not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/v1/integrations/discord/config/${nonExistentId}`)
      .expect(404);

    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('DISCORD_CONFIG_NOT_FOUND');
  });
});
