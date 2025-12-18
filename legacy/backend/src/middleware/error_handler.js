/**
 * Global Error Handler Middleware
 * 모든 에러를 표준화된 형식으로 처리
 */
import logger from '../utils/logger.js';
import { AppError, ERROR_CODES } from '../utils/errors.js';

/**
 * Error handler middleware
 * Express의 에러 핸들러로 사용 (4개 파라미터 필수)
 */
const errorHandler = (err, req, res, next) => {
  // 이미 응답이 시작된 경우 다음 핸들러로 전달
  if (res.headersSent) {
    return next(err);
  }

  // AppError 인스턴스인 경우
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
      details: err.details,
    });

    const response = err.toJSON();

    // Rate limit error에 Retry-After 헤더 추가
    if (err.retryAfter) {
      res.set('Retry-After', String(err.retryAfter));
    }

    return res.status(err.status).json(response);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));

    logger.warn('Mongoose validation error', { details, path: req.path });

    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '입력 값을 확인해 주세요.',
      details,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    logger.warn('Invalid ObjectId', { value: err.value, path: req.path });

    return res.status(400).json({
      status: 'error',
      code: 'INVALID_ID',
      message: '유효하지 않은 ID 형식입니다.',
    });
  }

  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('JSON parse error', { path: req.path });

    return res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: '잘못된 JSON 형식입니다.',
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      code: 'FILE_TOO_LARGE',
      message: '파일 크기가 너무 큽니다. (최대 5MB)',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: 'error',
      code: 'UNEXPECTED_FILE',
      message: '예상치 못한 파일 필드입니다.',
    });
  }

  // AI Service errors (Upstage/OpenAI)
  if (err.message?.includes('API') || err.message?.includes('timeout')) {
    logger.error('AI service error', {
      message: err.message,
      path: req.path,
    });

    return res.status(503).json({
      status: 'error',
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
    });
  }

  // Unknown error - log full details for debugging
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // 프로덕션에서는 스택 트레이스 숨김
  const isDev = process.env.NODE_ENV !== 'production';
  const errorInfo = ERROR_CODES.INTERNAL_SERVER_ERROR;

  return res.status(500).json({
    status: 'error',
    code: errorInfo.code,
    message: errorInfo.message,
    ...(isDev && { debug: { message: err.message, stack: err.stack } }),
  });
};

/**
 * 404 Not Found handler
 * 정의되지 않은 라우트에 대한 처리
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', { path: req.path, method: req.method });

  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: `요청한 경로를 찾을 수 없습니다: ${req.method} ${req.path}`,
  });
};

export default errorHandler;
