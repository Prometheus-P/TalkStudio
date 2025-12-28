/**
 * Duration Calculator Tests
 */
import { describe, it, expect } from 'vitest';
import {
  calculateDuration,
  calculateTotalDuration,
  formatDuration,
} from './durationCalculator';

describe('Duration Calculator', () => {
  // ============================================
  // calculateDuration
  // ============================================
  describe('calculateDuration', () => {
    it('should return base duration for empty text', () => {
      expect(calculateDuration('')).toBe(0.8);
      expect(calculateDuration(null)).toBe(0.8);
      expect(calculateDuration(undefined)).toBe(0.8);
    });

    it('should calculate duration based on character count', () => {
      // 2 characters: 0.8 + 2 * 0.04 = 0.88
      expect(calculateDuration('ㅇㅇ')).toBeCloseTo(0.88, 2);
    });

    it('should calculate duration for longer text', () => {
      // text '형 그 메소 아직 있어?' has 11 characters (including spaces)
      // 0.8 + 11 * 0.04 = 1.24
      const text = '형 그 메소 아직 있어?';
      expect(calculateDuration(text)).toBeCloseTo(0.8 + text.length * 0.04, 2);
    });

    it('should cap at max 3 seconds', () => {
      // Very long text should be capped at 3 seconds
      const longText = 'a'.repeat(100);
      expect(calculateDuration(longText)).toBe(3.0);
    });

    it('should handle Korean text correctly', () => {
      const koreanText = '안녕하세요'; // 5 characters
      expect(calculateDuration(koreanText)).toBeCloseTo(0.8 + 5 * 0.04, 2);
    });

    it('should handle emoji', () => {
      // Emoji may count as 2 chars depending on encoding
      const emojiText = '😀😀';
      expect(calculateDuration(emojiText)).toBeGreaterThan(0.8);
    });
  });

  // ============================================
  // calculateTotalDuration
  // ============================================
  describe('calculateTotalDuration', () => {
    it('should return 0 for empty array', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });

    it('should return 0 for null', () => {
      expect(calculateTotalDuration(null)).toBe(0);
    });

    it('should sum durations of all messages', () => {
      const messages = [
        { text: 'aa' },  // 0.8 + 2*0.04 = 0.88
        { text: 'bbb' }, // 0.8 + 3*0.04 = 0.92
      ];
      expect(calculateTotalDuration(messages)).toBeCloseTo(1.8, 2);
    });

    it('should handle messages with empty text', () => {
      const messages = [
        { text: '' },
        { text: 'aa' },
      ];
      expect(calculateTotalDuration(messages)).toBeCloseTo(1.68, 2);
    });
  });

  // ============================================
  // formatDuration
  // ============================================
  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(5)).toBe('5.0초');
      expect(formatDuration(30.5)).toBe('30.5초');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1분 30초');
      expect(formatDuration(125)).toBe('2분 5초');
    });

    it('should format minutes only when no remainder', () => {
      expect(formatDuration(60)).toBe('1분');
      expect(formatDuration(120)).toBe('2분');
    });

    it('should handle zero seconds', () => {
      expect(formatDuration(0)).toBe('0.0초');
    });

    it('should handle decimal seconds under 60', () => {
      expect(formatDuration(1.5)).toBe('1.5초');
    });
  });
});
