/**
 * TalkStudio - Sanitization Utility Tests
 * XSS 방지 및 입력 검증 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeMessage,
  sanitizeAuthor,
  LIMITS,
} from './sanitize';

describe('sanitizeText', () => {
  it('should escape HTML entities', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeText(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should escape quotes', () => {
    const input = 'test "quoted" and \'single\'';
    const result = sanitizeText(input);
    expect(result).toContain('&quot;');
    expect(result).toContain('&#x27;');
  });

  it('should escape ampersands', () => {
    const input = 'a & b';
    const result = sanitizeText(input);
    expect(result).toBe('a &amp; b');
  });

  it('should handle empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('should truncate long text', () => {
    const longText = 'a'.repeat(LIMITS.MAX_MESSAGE_LENGTH + 100);
    const result = sanitizeText(longText, LIMITS.MAX_MESSAGE_LENGTH);
    expect(result.length).toBe(LIMITS.MAX_MESSAGE_LENGTH);
  });

  it('should preserve Korean characters', () => {
    const input = '안녕하세요 TalkStudio입니다';
    expect(sanitizeText(input)).toBe(input);
  });

  it('should preserve emojis', () => {
    const input = 'Hello 👋 World 🌍';
    expect(sanitizeText(input)).toBe(input);
  });
});

describe('sanitizeUrl', () => {
  it('should allow dicebear.com URLs', () => {
    const url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('should reject javascript: URLs', () => {
    const url = 'javascript:alert(1)';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('should reject data: URLs', () => {
    const url = 'data:text/html,<script>alert(1)</script>';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('should allow https URLs', () => {
    const url = 'https://example.com/avatar.png';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('should reject non-https URLs', () => {
    const url = 'http://example.com/avatar.png';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('should handle empty/invalid URLs', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl('not-a-url')).toBe('');
  });
});

describe('sanitizeMessage', () => {
  it('should sanitize message text', () => {
    const message = {
      id: 'msg-1',
      role: 'me',
      authorId: 'me',
      text: '<script>xss</script>Hello',
      datetime: '2024-12-10 12:30',
    };
    const result = sanitizeMessage(message);
    expect(result.text).not.toContain('<script>');
    expect(result.text).toContain('Hello');
  });

  it('should preserve valid fields', () => {
    const message = {
      id: 'msg-1',
      role: 'me',
      authorId: 'me',
      text: 'Hello',
      datetime: '2024-12-10 12:30',
    };
    const result = sanitizeMessage(message);
    expect(result.id).toBe('msg-1');
    expect(result.role).toBe('me');
    expect(result.authorId).toBe('me');
  });

  it('should enforce text length limit', () => {
    const longText = 'a'.repeat(2000);
    const message = { text: longText };
    const result = sanitizeMessage(message);
    expect(result.text.length).toBeLessThanOrEqual(LIMITS.MAX_MESSAGE_LENGTH);
  });
});

describe('sanitizeText - Security Edge Cases', () => {
  it('should handle unicode escape sequences', () => {
    // \u003c = <, \u003e = >
    const input = '\u003cscript\u003ealert(1)\u003c/script\u003e';
    const result = sanitizeText(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('&lt;');
  });

  it('should handle HTML entities in input', () => {
    const input = '&lt;script&gt;alert(1)&lt;/script&gt;';
    const result = sanitizeText(input);
    // Double-encoding prevention: & becomes &amp;
    expect(result).toContain('&amp;lt;');
  });

  it('should handle null bytes', () => {
    const input = '<scr\x00ipt>alert(1)</script>';
    const result = sanitizeText(input);
    expect(result).not.toContain('<');
  });
});

describe('sanitizeUrl - Security Edge Cases', () => {
  it('should handle mixed case protocol', () => {
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
  });

  it('should handle URL encoded protocols', () => {
    expect(sanitizeUrl('javascript%3Aalert(1)')).toBe('');
    expect(sanitizeUrl('javascript%3aalert(1)')).toBe('');
  });

  it('should reject vbscript protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    expect(sanitizeUrl('VBSCRIPT:msgbox(1)')).toBe('');
  });

  it('should handle double-encoded URLs', () => {
    expect(sanitizeUrl('javascript%253Aalert(1)')).toBe('');
  });

  it('should handle whitespace in protocol', () => {
    expect(sanitizeUrl('java\tscript:alert(1)')).toBe('');
    expect(sanitizeUrl('java\nscript:alert(1)')).toBe('');
    expect(sanitizeUrl('  javascript:alert(1)')).toBe('');
  });

  it('should handle file protocol', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });
});

describe('sanitizeAuthor', () => {
  it('should sanitize author name', () => {
    const author = {
      id: 'me',
      name: '<img onerror="xss">User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
    };
    const result = sanitizeAuthor(author);
    expect(result.name).not.toContain('<img');
    expect(result.name).toContain('User');
  });

  it('should validate avatar URL', () => {
    const author = {
      id: 'me',
      name: 'User',
      avatarUrl: 'javascript:alert(1)',
    };
    const result = sanitizeAuthor(author);
    expect(result.avatarUrl).toBe('');
  });

  it('should enforce name length limit', () => {
    const longName = 'a'.repeat(100);
    const author = { name: longName };
    const result = sanitizeAuthor(author);
    expect(result.name.length).toBeLessThanOrEqual(LIMITS.MAX_AUTHOR_NAME_LENGTH);
  });
});
