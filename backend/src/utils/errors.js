/**
 * Centralized Error Handling System
 * 사용자 친화적 에러 메시지와 표준화된 에러 코드 제공
 */

// Error codes with Korean user-friendly messages
export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: '입력 값을 확인해 주세요.',
  },
  INVALID_SCENARIO: {
    code: 'INVALID_SCENARIO',
    status: 400,
    message: '시나리오는 10-500자 사이여야 합니다.',
  },
  INVALID_PARTICIPANTS: {
    code: 'INVALID_PARTICIPANTS',
    status: 400,
    message: '참여자 수는 2-5명 사이여야 합니다.',
  },
  INVALID_MESSAGE_COUNT: {
    code: 'INVALID_MESSAGE_COUNT',
    status: 400,
    message: '메시지 수는 5-50개 사이여야 합니다.',
  },
  INVALID_FILE_FORMAT: {
    code: 'INVALID_FILE_FORMAT',
    status: 400,
    message: 'Excel 파일(.xlsx) 형식만 지원합니다.',
  },
  EMPTY_FILE: {
    code: 'EMPTY_FILE',
    status: 400,
    message: '파일에 처리할 데이터가 없습니다.',
  },

  // Authentication/Authorization Errors (401, 403)
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: '인증이 필요합니다.',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
    message: '접근 권한이 없습니다.',
  },

  // Not Found Errors (404)
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: '요청한 리소스를 찾을 수 없습니다.',
  },
  CONVERSATION_NOT_FOUND: {
    code: 'CONVERSATION_NOT_FOUND',
    status: 404,
    message: '대화를 찾을 수 없습니다.',
  },
  TEMPLATE_NOT_FOUND: {
    code: 'TEMPLATE_NOT_FOUND',
    status: 404,
    message: '템플릿을 찾을 수 없습니다.',
  },
  JOB_NOT_FOUND: {
    code: 'JOB_NOT_FOUND',
    status: 404,
    message: '작업을 찾을 수 없습니다.',
  },

  // Content Policy Errors (422)
  CONTENT_POLICY_VIOLATION: {
    code: 'CONTENT_POLICY_VIOLATION',
    status: 422,
    message: '부적절한 콘텐츠가 감지되었습니다. 시나리오를 수정해 주세요.',
  },
  CONTENT_FILTER_BLOCKED: {
    code: 'CONTENT_FILTER_BLOCKED',
    status: 422,
    message: '안전하지 않은 내용이 포함되어 있습니다.',
  },

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429,
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  },

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  },
  GENERATION_FAILED: {
    code: 'GENERATION_FAILED',
    status: 500,
    message: '대화 생성에 실패했습니다. 다시 시도해 주세요.',
  },
  AI_SERVICE_UNAVAILABLE: {
    code: 'AI_SERVICE_UNAVAILABLE',
    status: 503,
    message: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    status: 500,
    message: '데이터 처리 중 오류가 발생했습니다.',
  },

  // Bulk Generation Errors
  BULK_LIMIT_EXCEEDED: {
    code: 'BULK_LIMIT_EXCEEDED',
    status: 400,
    message: '한 번에 최대 100개까지 처리할 수 있습니다.',
  },
  BULK_JOB_FAILED: {
    code: 'BULK_JOB_FAILED',
    status: 500,
    message: '대량 생성 작업이 실패했습니다.',
  },
  BULK_JOB_NOT_COMPLETED: {
    code: 'BULK_JOB_NOT_COMPLETED',
    status: 400,
    message: '작업이 아직 완료되지 않았습니다.',
  },
};

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(errorType, details = null) {
    const errorInfo = ERROR_CODES[errorType] || ERROR_CODES.INTERNAL_SERVER_ERROR;
    super(errorInfo.message);

    this.name = 'AppError';
    this.code = errorInfo.code;
    this.status = errorInfo.status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp,
    };
  }
}

/**
 * Validation Error - for express-validator errors
 */
export class ValidationError extends AppError {
  constructor(errors) {
    super('VALIDATION_ERROR');
    this.details = errors.map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    const errorType = `${resource.toUpperCase()}_NOT_FOUND`;
    super(ERROR_CODES[errorType] ? errorType : 'NOT_FOUND');
  }
}

/**
 * Content Policy Error
 */
export class ContentPolicyError extends AppError {
  constructor(reason = null) {
    super('CONTENT_POLICY_VIOLATION');
    if (reason) {
      this.details = { reason };
    }
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Async handler wrapper to catch errors automatically
 * Reduces try/catch boilerplate in route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validate request using express-validator results
 */
export const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
};

export default {
  ERROR_CODES,
  AppError,
  ValidationError,
  NotFoundError,
  ContentPolicyError,
  RateLimitError,
  asyncHandler,
  handleValidationErrors,
};
