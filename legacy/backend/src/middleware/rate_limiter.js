/**
 * Rate Limiter Middleware - API 요청 제한
 * T054: API Rate Limiting 미들웨어 구현
 */
import logger from '../utils/logger.js';

// In-memory store for rate limiting (for development/single instance)
// For production, consider using Redis
const requestCounts = new Map();

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.windowEnd) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Prevent the cleanup interval from keeping the process alive
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} [options.windowMs=60000] - Window duration in milliseconds
 * @param {number} [options.max=100] - Maximum requests per window
 * @param {string} [options.keyGenerator] - Function to generate unique key (default: IP address)
 * @param {string} [options.message] - Error message when rate limited
 */
export const createRateLimiter = ({
  windowMs = 60000,
  max = 100,
  keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown',
  message = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
} = {}) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let requestData = requestCounts.get(key);

    // Initialize or reset window
    if (!requestData || now > requestData.windowEnd) {
      requestData = {
        count: 0,
        windowEnd: now + windowMs,
      };
      requestCounts.set(key, requestData);
    }

    // Increment request count
    requestData.count++;

    // Set rate limit headers
    const remaining = Math.max(0, max - requestData.count);
    const resetTime = Math.ceil(requestData.windowEnd / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    // Check if rate limited
    if (requestData.count > max) {
      logger.warn('Rate limit exceeded', {
        key,
        count: requestData.count,
        max,
        path: req.path,
      });

      const retryAfter = Math.ceil((requestData.windowEnd - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter,
      });
    }

    next();
  };
};

// Pre-configured rate limiters

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const generalLimiter = createRateLimiter({
  windowMs: 60000,
  max: 100,
  message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
});

/**
 * AI generation rate limiter (stricter)
 * 10 requests per minute
 */
export const aiGenerationLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10,
  message: 'AI 대화 생성 요청이 너무 많습니다. 1분 후 다시 시도해 주세요.',
});

/**
 * Bulk generation rate limiter (very strict)
 * 3 requests per minute
 */
export const bulkGenerationLimiter = createRateLimiter({
  windowMs: 60000,
  max: 3,
  message: '대량 생성 요청이 너무 많습니다. 1분 후 다시 시도해 주세요.',
});

/**
 * Template API rate limiter
 * 30 requests per minute
 */
export const templateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 30,
  message: '템플릿 API 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
});

export default {
  createRateLimiter,
  generalLimiter,
  aiGenerationLimiter,
  bulkGenerationLimiter,
  templateLimiter,
};
