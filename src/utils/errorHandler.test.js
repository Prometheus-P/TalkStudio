/**
 * Error Handler Utilities Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseApiError,
  getErrorMessage,
  isRetryableError,
  withRetry,
  formatValidationErrors,
} from './errorHandler';

describe('Error Handler Utilities', () => {
  // ============================================
  // parseApiError
  // ============================================
  describe('parseApiError', () => {
    it('should parse network error', () => {
      const error = new TypeError('Failed to fetch');
      const result = parseApiError(error);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.isRetryable).toBe(true);
    });

    it('should parse timeout error', () => {
      const error = new Error('Timeout');
      error.name = 'AbortError';
      const result = parseApiError(error);
      expect(result.code).toBe('TIMEOUT_ERROR');
      expect(result.isRetryable).toBe(true);
    });

    it('should parse API error with code', () => {
      const error = { code: 'VALIDATION_ERROR', message: 'Invalid input' };
      const result = parseApiError(error);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('입력 값을 확인해 주세요.');
      expect(result.isRetryable).toBe(false);
    });

    it('should parse retryable API error', () => {
      const error = { code: 'INTERNAL_SERVER_ERROR' };
      const result = parseApiError(error);
      expect(result.isRetryable).toBe(true);
    });

    it('should handle unknown error', () => {
      const error = new Error('Something went wrong');
      const result = parseApiError(error);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Something went wrong');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle error with retryAfter', () => {
      const error = { code: 'RATE_LIMIT_EXCEEDED', retryAfter: 60 };
      const result = parseApiError(error);
      expect(result.retryAfter).toBe(60);
    });

    it('should handle error with details', () => {
      const error = { code: 'VALIDATION_ERROR', details: [{ field: 'name' }] };
      const result = parseApiError(error);
      expect(result.details).toEqual([{ field: 'name' }]);
    });
  });

  // ============================================
  // getErrorMessage
  // ============================================
  describe('getErrorMessage', () => {
    it('should return correct message for known codes', () => {
      expect(getErrorMessage('NETWORK_ERROR')).toBe('네트워크 연결을 확인해 주세요.');
      expect(getErrorMessage('TIMEOUT_ERROR')).toBe('요청 시간이 초과되었습니다. 다시 시도해 주세요.');
      expect(getErrorMessage('VALIDATION_ERROR')).toBe('입력 값을 확인해 주세요.');
    });

    it('should return default message for unknown codes', () => {
      expect(getErrorMessage('UNKNOWN_CODE')).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('should return message for content policy error', () => {
      expect(getErrorMessage('CONTENT_POLICY_VIOLATION')).toContain('부적절한 콘텐츠');
    });
  });

  // ============================================
  // isRetryableError
  // ============================================
  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      expect(isRetryableError('INTERNAL_SERVER_ERROR')).toBe(true);
      expect(isRetryableError('AI_SERVICE_UNAVAILABLE')).toBe(true);
      expect(isRetryableError('NETWORK_ERROR')).toBe(true);
      expect(isRetryableError('TIMEOUT_ERROR')).toBe(true);
      expect(isRetryableError('DATABASE_ERROR')).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError('VALIDATION_ERROR')).toBe(false);
      expect(isRetryableError('NOT_FOUND')).toBe(false);
      expect(isRetryableError('CONTENT_POLICY_VIOLATION')).toBe(false);
    });
  });

  // ============================================
  // withRetry
  // ============================================
  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw non-retryable error immediately', async () => {
      const error = { code: 'VALIDATION_ERROR', message: 'Invalid' };
      const fn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(fn)).rejects.toEqual(error);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const error = { code: 'INTERNAL_SERVER_ERROR', message: 'Server error' };
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, { maxRetries: 2, baseDelay: 100 });

      // Advance through retries
      for (let i = 0; i < 2; i++) {
        await vi.advanceTimersByTimeAsync(1000);
      }

      await expect(promise).rejects.toEqual(error);
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================
  // formatValidationErrors
  // ============================================
  describe('formatValidationErrors', () => {
    it('should format validation errors array', () => {
      const details = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
      ];
      const result = formatValidationErrors(details);
      expect(result).toEqual([
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
      ]);
    });

    it('should return null for null details', () => {
      expect(formatValidationErrors(null)).toBe(null);
    });

    it('should return null for non-array details', () => {
      expect(formatValidationErrors('not an array')).toBe(null);
      expect(formatValidationErrors({})).toBe(null);
    });
  });
});
