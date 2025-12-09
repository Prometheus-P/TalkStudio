// backend/src/utils/logger.js
// In a production environment, consider a more robust logging library like Winston or Pino.

const logLevels = {
  info: 0,
  warn: 1,
  error: 2,
  debug: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || 'info';

const logger = {
  info: (...args) => {
    if (logLevels[currentLogLevel] <= logLevels.info) {
      console.log(`[INFO] [${new Date().toISOString()}]`, ...args);
    }
  },
  warn: (...args) => {
    if (logLevels[currentLogLevel] <= logLevels.warn) {
      console.warn(`[WARN] [${new Date().toISOString()}]`, ...args);
    }
  },
  error: (...args) => {
    if (logLevels[currentLogLevel] <= logLevels.error) {
      console.error(`[ERROR] [${new Date().toISOString()}]`, ...args);
    }
  },
  debug: (...args) => {
    if (logLevels[currentLogLevel] <= logLevels.debug) {
      console.debug(`[DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  },
};

export default logger;
