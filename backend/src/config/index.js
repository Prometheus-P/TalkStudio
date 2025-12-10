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