// backend/src/config/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/talkstudio',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey', // IMPORTANT: Change in production
  encryptionSecret: process.env.ENCRYPTION_SECRET || 'supersecretencryptionkey', // NEW: Encryption secret
  discordBotToken: process.env.DISCORD_BOT_TOKEN, // Used for AI Agent System communication
  upstageApiKey: process.env.UPSTAGE_API_KEY, // If backend calls Upstage API directly

  // Data retention settings (US7/NFR-8)
  dataRetention: {
    // Retention period in days (default: 90 days)
    retentionDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 90,
    // Cron schedule for cleanup job (default: daily at 2:00 AM)
    cleanupCronSchedule: process.env.DATA_RETENTION_CRON || '0 2 * * *',
    // Enable/disable retention job
    enabled: process.env.DATA_RETENTION_ENABLED !== 'false',
  },
};

// Validate essential configurations
if (!config.databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set. Please set it in .env file.');
  process.exit(1);
}
if (!config.encryptionSecret || config.encryptionSecret === 'supersecretencryptionkey') {
  console.warn('WARNING: ENCRYPTION_SECRET is not set or is using default. Please set a strong secret in .env file.');
}
if (!config.discordBotToken) {
  console.warn('WARNING: DISCORD_BOT_TOKEN is not set in backend config.');
}
if (!config.upstageApiKey) {
  console.warn('WARNING: UPSTAGE_API_KEY is not set in backend config.');
}

export default config;