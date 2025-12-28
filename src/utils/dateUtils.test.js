/**
 * Date Utilities Tests
 */
import { describe, it, expect } from 'vitest';
import { isSameDay, parseDatetime, formatKoreanDate } from './dateUtils';

describe('Date Utilities', () => {
  // ============================================
  // isSameDay
  // ============================================
  describe('isSameDay', () => {
    it('should return true for same day', () => {
      expect(isSameDay('2024-12-10 오후 3:42', '2024-12-10 오전 9:00')).toBe(true);
    });

    it('should return false for different days', () => {
      expect(isSameDay('2024-12-10 오후 3:42', '2024-12-11 오전 9:00')).toBe(false);
    });

    it('should return false for null dates', () => {
      expect(isSameDay(null, '2024-12-10 오후 3:42')).toBe(false);
      expect(isSameDay('2024-12-10 오후 3:42', null)).toBe(false);
      expect(isSameDay(null, null)).toBe(false);
    });

    it('should return false for empty dates', () => {
      expect(isSameDay('', '2024-12-10 오후 3:42')).toBe(false);
      expect(isSameDay('2024-12-10 오후 3:42', '')).toBe(false);
    });

    it('should return false for invalid date format', () => {
      expect(isSameDay('invalid', '2024-12-10 오후 3:42')).toBe(false);
    });
  });

  // ============================================
  // parseDatetime
  // ============================================
  describe('parseDatetime', () => {
    it('should parse datetime string to Date object', () => {
      const result = parseDatetime('2024-12-10 오후 3:42');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(10);
    });

    it('should return current date for empty input', () => {
      const result = parseDatetime('');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return current date for null input', () => {
      const result = parseDatetime(null);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle date-only string', () => {
      const result = parseDatetime('2024-12-25');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(25);
    });
  });

  // ============================================
  // formatKoreanDate
  // ============================================
  describe('formatKoreanDate', () => {
    it('should format date as Korean string', () => {
      const date = new Date(2024, 11, 25); // December 25, 2024
      const result = formatKoreanDate(date);
      expect(result).toMatch(/2024년 12월 25일/);
      expect(result).toMatch(/요일/);
    });

    it('should format string date', () => {
      const result = formatKoreanDate('2024-12-25');
      expect(result).toMatch(/2024년 12월 25일/);
    });

    it('should return original for invalid date', () => {
      const result = formatKoreanDate('invalid');
      expect(result).toBe('invalid');
    });

    it('should include correct weekday', () => {
      // January 1, 2024 is Monday
      const result = formatKoreanDate(new Date(2024, 0, 1));
      expect(result).toBe('2024년 1월 1일 월요일');
    });

    it('should handle Sunday', () => {
      // December 29, 2024 is Sunday
      const result = formatKoreanDate(new Date(2024, 11, 29));
      expect(result).toBe('2024년 12월 29일 일요일');
    });
  });
});
