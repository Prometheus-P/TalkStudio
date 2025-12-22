/**
 * Frontend Error Handler Utilities
 * 사용자 친화적 에러 메시지 및 재시도 로직
 */

// 에러 코드별 한국어 메시지 매핑
const ERROR_MESSAGES = {
  // Validation
  VALIDATION_ERROR: '입력 값을 확인해 주세요.',
  INVALID_SCENARIO: '시나리오는 10-500자 사이여야 합니다.',
  INVALID_PARTICIPANTS: '참여자 수는 2-5명 사이여야 합니다.',
  INVALID_MESSAGE_COUNT: '메시지 수는 5-50개 사이여야 합니다.',
  INVALID_FILE_FORMAT: 'Excel 파일(.xlsx) 형식만 지원합니다.',
  EMPTY_FILE: '파일에 처리할 데이터가 없습니다.',

  // Not Found
  NOT_FOUND: '요청한 내용을 찾을 수 없습니다.',
  CONVERSATION_NOT_FOUND: '대화를 찾을 수 없습니다.',
  TEMPLATE_NOT_FOUND: '템플릿을 찾을 수 없습니다.',
  JOB_NOT_FOUND: '작업을 찾을 수 없습니다.',
  ROUTE_NOT_FOUND: '요청한 경로를 찾을 수 없습니다.',

  // Content Policy
  CONTENT_POLICY_VIOLATION: '부적절한 콘텐츠가 감지되었습니다. 시나리오를 수정해 주세요.',
  CONTENT_FILTER_BLOCKED: '안전하지 않은 내용이 포함되어 있습니다.',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',

  // Server Errors
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  GENERATION_FAILED: '대화 생성에 실패했습니다. 다시 시도해 주세요.',
  AI_SERVICE_UNAVAILABLE: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
  DATABASE_ERROR: '데이터 처리 중 오류가 발생했습니다.',

  // Bulk
  BULK_LIMIT_EXCEEDED: '한 번에 최대 100개까지 처리할 수 있습니다.',
  BULK_JOB_FAILED: '대량 생성 작업이 실패했습니다.',
  BULK_JOB_NOT_COMPLETED: '작업이 아직 완료되지 않았습니다.',

  // Network
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해 주세요.',
};

// 재시도 가능한 에러 코드
const RETRYABLE_ERRORS = [
  'INTERNAL_SERVER_ERROR',
  'AI_SERVICE_UNAVAILABLE',
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'DATABASE_ERROR',
];

/**
 * API 에러 응답을 파싱하여 사용자 친화적 메시지 반환
 */
export const parseApiError = (error) => {
  // Fetch 네트워크 에러
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return {
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      isRetryable: true,
    };
  }

  // 타임아웃 에러
  if (error.name === 'AbortError') {
    return {
      code: 'TIMEOUT_ERROR',
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      isRetryable: true,
    };
  }

  // API 에러 응답 (JSON)
  if (error.code) {
    return {
      code: error.code,
      message: ERROR_MESSAGES[error.code] || error.message || '알 수 없는 오류가 발생했습니다.',
      isRetryable: RETRYABLE_ERRORS.includes(error.code),
      details: error.details,
      retryAfter: error.retryAfter,
    };
  }

  // 일반 Error 객체
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    isRetryable: false,
  };
};

/**
 * 에러 코드로 메시지 가져오기
 */
export const getErrorMessage = (code) => {
  return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
};

/**
 * 재시도 가능 여부 확인
 */
export const isRetryableError = (code) => {
  return RETRYABLE_ERRORS.includes(code);
};

/**
 * 재시도 함수 (지수 백오프)
 */
export const withRetry = async (fn, options = {}) => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const parsedError = parseApiError(error);

      // 재시도 불가능한 에러는 즉시 throw
      if (!parsedError.isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Rate limit인 경우 retryAfter 사용
      const delay = parsedError.retryAfter
        ? parsedError.retryAfter * 1000
        : Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * 유효성 검증 에러 포맷팅
 */
export const formatValidationErrors = (details) => {
  if (!details || !Array.isArray(details)) {
    return null;
  }

  return details.map((err) => ({
    field: err.field,
    message: err.message,
  }));
};

export default {
  parseApiError,
  getErrorMessage,
  isRetryableError,
  withRetry,
  formatValidationErrors,
};
