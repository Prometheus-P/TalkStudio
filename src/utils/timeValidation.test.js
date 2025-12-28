/**
 * Time Validation Utility Tests
 */
import { describe, it, expect } from 'vitest';
import {
  parseDateTime,
  validateTimeOrder,
  getCurrentDateTime,
  formatDateTime,
  extractDate,
  extractTime,
  combineDateTime,
} from './timeValidation';

describe('Time Validation Utilities', () => {
  // ============================================
  // parseDateTime
  // ============================================
  describe('parseDateTime', () => {
    it('should parse full datetime string', () => {
      const result = parseDateTime('2024-12-10 오후 12:30');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December (0-indexed)
      expect(result.getDate()).toBe(10);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse 오전 time correctly', () => {
      const result = parseDateTime('2024-12-10 오전 09:00');
      expect(result.getHours()).toBe(9);
    });

    it('should parse 오후 time correctly', () => {
      const result = parseDateTime('2024-12-10 오후 03:30');
      expect(result.getHours()).toBe(15);
    });

    it('should handle 오전 12시 (midnight)', () => {
      const result = parseDateTime('2024-12-10 오전 12:00');
      expect(result.getHours()).toBe(0);
    });

    it('should handle 오후 12시 (noon)', () => {
      const result = parseDateTime('2024-12-10 오후 12:00');
      expect(result.getHours()).toBe(12);
    });

    it('should parse time-only format', () => {
      const result = parseDateTime('오후 12:30');
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse time-only 오전 format', () => {
      const result = parseDateTime('오전 09:00');
      expect(result.getHours()).toBe(9);
    });

    it('should return null for empty input', () => {
      expect(parseDateTime('')).toBe(null);
      expect(parseDateTime(null)).toBe(null);
      expect(parseDateTime(undefined)).toBe(null);
    });

    it('should return null for invalid format', () => {
      expect(parseDateTime('invalid')).toBe(null);
      expect(parseDateTime('2024-12-10')).toBe(null);
      expect(parseDateTime('12:30')).toBe(null);
    });
  });

  // ============================================
  // validateTimeOrder
  // ============================================
  describe('validateTimeOrder', () => {
    it('should return empty array for correctly ordered messages', () => {
      const messages = [
        { id: '1', datetime: '2024-12-10 오전 10:00' },
        { id: '2', datetime: '2024-12-10 오전 11:00' },
        { id: '3', datetime: '2024-12-10 오후 12:00' },
      ];
      expect(validateTimeOrder(messages)).toEqual([]);
    });

    it('should return ids of out-of-order messages', () => {
      const messages = [
        { id: '1', datetime: '2024-12-10 오후 12:00' },
        { id: '2', datetime: '2024-12-10 오전 10:00' }, // This is earlier
        { id: '3', datetime: '2024-12-10 오후 01:00' },
      ];
      const warnings = validateTimeOrder(messages);
      expect(warnings).toContain('2');
    });

    it('should handle empty messages array', () => {
      expect(validateTimeOrder([])).toEqual([]);
    });

    it('should handle single message', () => {
      const messages = [{ id: '1', datetime: '2024-12-10 오후 12:00' }];
      expect(validateTimeOrder(messages)).toEqual([]);
    });

    it('should handle messages with time field instead of datetime', () => {
      const messages = [
        { id: '1', time: '오후 12:00' },
        { id: '2', time: '오후 01:00' },
      ];
      expect(validateTimeOrder(messages)).toEqual([]);
    });

    it('should handle mixed datetime and time fields', () => {
      const messages = [
        { id: '1', datetime: '2024-12-10 오전 10:00' },
        { id: '2', time: '오전 09:00' }, // Earlier time
      ];
      // Since time-only uses today's date, this may or may not be out of order
      // depending on the implementation, we just verify it doesn't crash
      const warnings = validateTimeOrder(messages);
      expect(Array.isArray(warnings)).toBe(true);
    });
  });

  // ============================================
  // getCurrentDateTime
  // ============================================
  describe('getCurrentDateTime', () => {
    it('should return current datetime in correct format', () => {
      const result = getCurrentDateTime();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} (오전|오후) \d{1,2}:\d{2}$/);
    });
  });

  // ============================================
  // formatDateTime
  // ============================================
  describe('formatDateTime', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 11, 10, 14, 30); // December 10, 2024, 2:30 PM
      const result = formatDateTime(date);
      expect(result).toBe('2024-12-10 오후 2:30');
    });

    it('should format morning time with 오전', () => {
      const date = new Date(2024, 11, 10, 9, 0);
      const result = formatDateTime(date);
      expect(result).toBe('2024-12-10 오전 9:00');
    });

    it('should format noon correctly', () => {
      const date = new Date(2024, 11, 10, 12, 0);
      const result = formatDateTime(date);
      expect(result).toBe('2024-12-10 오후 12:00');
    });

    it('should format midnight correctly', () => {
      const date = new Date(2024, 11, 10, 0, 0);
      const result = formatDateTime(date);
      expect(result).toBe('2024-12-10 오전 12:00');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2024, 0, 5, 10, 0); // January 5
      const result = formatDateTime(date);
      expect(result).toBe('2024-01-05 오전 10:00');
    });
  });

  // ============================================
  // extractDate
  // ============================================
  describe('extractDate', () => {
    it('should extract date from datetime string', () => {
      const result = extractDate('2024-12-10 오후 12:30');
      expect(result).toBe('2024-12-10');
    });

    it('should return empty string for empty input', () => {
      expect(extractDate('')).toBe('');
      expect(extractDate(null)).toBe('');
      expect(extractDate(undefined)).toBe('');
    });

    it('should return empty string for invalid format', () => {
      expect(extractDate('오후 12:30')).toBe('');
      expect(extractDate('invalid')).toBe('');
    });
  });

  // ============================================
  // extractTime
  // ============================================
  describe('extractTime', () => {
    it('should extract time from datetime string', () => {
      const result = extractTime('2024-12-10 오후 12:30');
      expect(result).toBe('오후 12:30');
    });

    it('should return empty string for empty input', () => {
      expect(extractTime('')).toBe('');
      expect(extractTime(null)).toBe('');
      expect(extractTime(undefined)).toBe('');
    });

    it('should return original string if time not found', () => {
      expect(extractTime('invalid')).toBe('invalid');
    });

    it('should handle time-only input', () => {
      const result = extractTime('오전 09:00');
      expect(result).toBe('오전 09:00');
    });
  });

  // ============================================
  // combineDateTime
  // ============================================
  describe('combineDateTime', () => {
    it('should combine date and time', () => {
      const result = combineDateTime('2024-12-10', '오후 12:30');
      expect(result).toBe('2024-12-10 오후 12:30');
    });

    it('should return empty string if date is missing', () => {
      expect(combineDateTime('', '오후 12:30')).toBe('');
      expect(combineDateTime(null, '오후 12:30')).toBe('');
    });

    it('should return empty string if time is missing', () => {
      expect(combineDateTime('2024-12-10', '')).toBe('');
      expect(combineDateTime('2024-12-10', null)).toBe('');
    });
  });
});
