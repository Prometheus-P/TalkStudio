// backend/tests/unit/test_discord_config_model.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import DiscordConfig from '../../src/models/discord_config_model.js';
import CryptoJS from 'crypto-js';

// Mock the config module to control encryption secret
jest.mock('../../src/config/index.js', () => ({
  default: {
    encryptionSecret: 'test_encryption_secret',
  },
}));

describe('DiscordConfig Model', () => {
  beforeAll(async () => {
    // Connect to a mock in-memory MongoDB
    await mongoose.connect(global.__MONGO_URI__, {
      dbName: global.__MONGO_DB_NAME__,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await DiscordConfig.deleteMany({}); // Clear collection after each test
  });

  test('should create a new DiscordConfig successfully', async () => {
    const configData = {
      serverId: '12345',
      serverName: 'Test Server',
      botToken: 'raw_bot_token',
      enabledChannels: ['channel1', 'channel2'],
    };

    const newConfig = new DiscordConfig(configData);
    const savedConfig = await newConfig.save();

    expect(savedConfig).toBeDefined();
    expect(savedConfig._id).toBeDefined();
    expect(savedConfig.serverId).toBe(configData.serverId);
    expect(savedConfig.serverName).toBe(configData.serverName);
    expect(savedConfig.enabledChannels).toEqual(expect.arrayContaining(configData.enabledChannels));
    expect(savedConfig.createdAt).toBeInstanceOf(Date);
    expect(savedConfig.updatedAt).toBeInstanceOf(Date);

    // Verify botToken is encrypted
    const decryptedToken = CryptoJS.AES.decrypt(savedConfig.botToken, 'test_encryption_secret').toString(CryptoJS.enc.Utf8);
    expect(decryptedToken).toBe(configData.botToken);
  });

  test('should retrieve and decrypt botToken', async () => {
    const configData = {
      serverId: '67890',
      botToken: 'another_raw_token',
    };
    const newConfig = new DiscordConfig(configData);
    const savedConfig = await newConfig.save();

    const foundConfig = await DiscordConfig.findById(savedConfig._id);
    expect(foundConfig).toBeDefined();

    const decryptedToken = foundConfig.getDecryptedBotToken();
    expect(decryptedToken).toBe(configData.botToken);
  });

  test('should not save DiscordConfig with duplicate serverId', async () => {
    const config1 = new DiscordConfig({ serverId: 'duplicate_id', botToken: 'token1' });
    await config1.save();

    const config2 = new DiscordConfig({ serverId: 'duplicate_id', botToken: 'token2' });
    await expect(config2.save()).rejects.toThrow(mongoose.Error.MongoServerError); // Or a specific Mongoose error for duplicate key
  });

  test('should validate botToken is required', async () => {
    const configData = { serverId: 'no_token_id' };
    const newConfig = new DiscordConfig(configData);
    await expect(newConfig.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  test('should update DiscordConfig successfully', async () => {
    const configData = { serverId: 'update_id', botToken: 'old_token', serverName: 'Old Name' };
    const newConfig = new DiscordConfig(configData);
    const savedConfig = await newConfig.save();

    savedConfig.serverName = 'New Name';
    savedConfig.botToken = 'new_token';
    savedConfig.enabledChannels.push('new_channel');
    const updatedConfig = await savedConfig.save();

    expect(updatedConfig.serverName).toBe('New Name');
    expect(updatedConfig.enabledChannels).toEqual(expect.arrayContaining(['new_channel'])); // Assuming initial enabledChannels were empty
    const decryptedToken = updatedConfig.getDecryptedBotToken();
    expect(decryptedToken).toBe('new_token');
    expect(updatedConfig.updatedAt).toBeAfter(savedConfig.updatedAt);
  });
});
