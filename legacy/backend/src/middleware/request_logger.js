// backend/src/middleware/request_logger.js
// HTTP Request/Response logging middleware (NFR-9)

import { randomUUID } from 'crypto';
import logger, { createRequestLogger } from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs all HTTP requests and responses with structured JSON format
 */
export const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = process.hrtime.bigint();

  // Attach request ID to request object for downstream use
  req.requestId = requestId;
  req.log = createRequestLogger(requestId);

  // Set request ID in response header
  res.setHeader('X-Request-Id', requestId);

  // Log incoming request
  req.log.info({
    type: 'request',
    method: req.method,
    url: req.originalUrl || req.url,
    query: req.query,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection?.remoteAddress,
    contentLength: req.headers['content-length'],
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    // Log response
    req.log.info({
      type: 'response',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      contentLength: body ? Buffer.byteLength(body) : 0,
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Error logging middleware
 * Should be registered after all routes
 */
export const errorLogger = (err, req, res, next) => {
  const log = req.log || logger;

  log.error({
    type: 'error',
    method: req.method,
    url: req.originalUrl || req.url,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
  });

  next(err);
};

export default requestLogger;
