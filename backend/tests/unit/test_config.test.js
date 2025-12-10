// backend/tests/unit/test_config.test.js
import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock dotenv.config to prevent actual .env file loading during tests
const mockDotenvConfig = jest.fn();
jest.mock('dotenv', () => ({
  config: mockDotenvConfig,
}));

// Before each test, reset environment variables and mocks
beforeEach(() => {
  jest.resetModules(); // This is crucial to re-import config with new env vars
  mockDotenvConfig.mockClear();
  // Clear environment variables for isolation, but keep NODE_ENV if set for testing frameworks
  for (const key in process.env) {
    if (key.startsWith('TEST_') || ['NODE_ENV'].includes(key)) {
      continue;
    }
    delete process.env[key];
  }
});

describe('Config Module', () => {
  test('should load default values if no environment variables are set', async () => {
    // Dynamically import the config module after clearing env vars
    const { default: config } = await import('../../src/config/index.js');

    expect(config.port).toBe(3000);
    expect(config.databaseUrl).toBe('mongodb://localhost:27017/talkstudio');
    expect(config.jwtSecret).toBe('supersecretjwtkey');
    expect(config.encryptionSecret).toBe('supersecretencryptionkey');
    expect(config.discordBotToken).toBeUndefined();
    expect(config.upstageApiKey).toBeUndefined();
    expect(mockDotenvConfig).toHaveBeenCalledTimes(1);
    expect(mockDotenvConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        path: expect.stringContaining(path.join('backend', '.env'))
      })
    );
  });

  test('should load values from environment variables', async () => {
    process.env.PORT = '4000';
    process.env.DATABASE_URL = 'mongodb://test:27017/test_db';
    process.env.JWT_SECRET = 'mytestjwtsecret';
    process.env.ENCRYPTION_SECRET = 'mytestencryptionsecret';
    process.env.DISCORD_BOT_TOKEN = 'test_discord_token';
    process.env.UPSTAGE_API_KEY = 'test_upstage_key';

    const { default: config } = await import('../../src/config/index.js');

    expect(config.port).toBe('4000');
    expect(config.databaseUrl).toBe('mongodb://test:27017/test_db');
    expect(config.jwtSecret).toBe('mytestjwtsecret');
    expect(config.encryptionSecret).toBe('mytestencryptionsecret');
    expect(config.discordBotToken).toBe('test_discord_token');
    expect(config.upstageApiKey).toBe('test_upstage_key');
  });

  test('should log a warning if ENCRYPTION_SECRET is default', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.DATABASE_URL = 'mongodb://valid:27017/db'; // Prevent process.exit
    process.env.ENCRYPTION_SECRET = 'supersecretencryptionkey'; // Default value

    await import('../../src/config/index.js');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING: ENCRYPTION_SECRET is not set or is using default.')
    );
    consoleWarnSpy.mockRestore();
  });

  test('should log a warning if DISCORD_BOT_TOKEN is not set', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.DATABASE_URL = 'mongodb://valid:27017/db'; // Prevent process.exit
    process.env.ENCRYPTION_SECRET = 'custom_secret';

    await import('../../src/config/index.js');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING: DISCORD_BOT_TOKEN is not set in backend config.')
    );
    consoleWarnSpy.mockRestore();
  });

  test('should log a warning if UPSTAGE_API_KEY is not set', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.DATABASE_URL = 'mongodb://valid:27017/db'; // Prevent process.exit
    process.env.ENCRYPTION_SECRET = 'custom_secret';
    process.env.DISCORD_BOT_TOKEN = 'dummy_discord_token';

    await import('../../src/config/index.js');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING: UPSTAGE_API_KEY is not set in backend config.')
    );
    consoleWarnSpy.mockRestore();
  });

  test('should exit if DATABASE_URL is not set', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called'); // Throw to stop execution cleanly
    });

    await expect(import('../../src/config/index.js')).rejects.toThrow('process.exit called');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: DATABASE_URL is not set.')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
