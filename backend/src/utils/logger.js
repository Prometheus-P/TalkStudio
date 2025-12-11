// backend/src/utils/logger.js
// Pino-based structured JSON logger (NFR-9)

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// Base configuration for structured JSON logging
const baseConfig = {
  level: logLevel,
  base: {
    service: 'talkstudio-backend',
    version: process.env.npm_package_version || '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'apiKey'],
    censor: '[REDACTED]',
  },
};

// Development: use pino-pretty for readable output
// Production: pure JSON for log aggregation (ELK, Datadog, etc.)
const transport = isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };

const logger = pino({
  ...baseConfig,
  transport,
});

// Child logger factory for request context
export const createRequestLogger = (requestId, userId = null) => {
  return logger.child({
    requestId,
    userId,
  });
};

// Child logger factory for specific modules
export const createModuleLogger = (moduleName) => {
  return logger.child({ module: moduleName });
};

export default logger;
