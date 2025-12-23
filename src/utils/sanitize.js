/**
 * TalkStudio - Sanitization Utilities
 * XSS 방지 및 입력 검증
 */

/** 입력 제한값 */
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_AUTHOR_NAME_LENGTH: 50,
  MAX_TITLE_LENGTH: 100,
};

/** 허용된 URL 도메인 (avatar용) */
const ALLOWED_DOMAINS = [
  'api.dicebear.com',
  'avatars.dicebear.com',
];

/**
 * HTML entity 이스케이프 맵
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * 텍스트 sanitize - XSS 방지
 * @param {string} text - 입력 텍스트
 * @param {number} [maxLength] - 최대 길이
 * @returns {string} 정제된 텍스트
 */
export function sanitizeText(text, maxLength = LIMITS.MAX_MESSAGE_LENGTH) {
  if (text == null) return '';

  let result = String(text).trim();

  // HTML entity escape
  result = result.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);

  // 길이 제한
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/** 위험한 프로토콜 목록 */
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
];

/**
 * URL 디코딩 (다중 인코딩 처리)
 * @param {string} url - URL
 * @returns {string} 디코딩된 URL
 */
function decodeUrlSafe(url) {
  let decoded = url;
  let prev = '';
  // 최대 3번까지 디코딩 (다중 인코딩 방지)
  for (let i = 0; i < 3 && decoded !== prev; i++) {
    prev = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }
  return decoded;
}

/**
 * URL sanitize - 안전한 URL만 허용
 * @param {string} url - 입력 URL
 * @returns {string} 검증된 URL 또는 빈 문자열
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';

  // 공백 및 제어 문자 제거
  const trimmed = url.trim().replace(/[\t\n\r]/g, '');

  // URL 디코딩 후 검사 (인코딩된 프로토콜 우회 방지)
  const decoded = decodeUrlSafe(trimmed).toLowerCase();

  // 위험한 프로토콜 차단
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (decoded.startsWith(protocol)) {
      return '';
    }
  }

  // HTTPS만 허용
  const lowerUrl = trimmed.toLowerCase();
  if (!lowerUrl.startsWith('https://')) {
    return '';
  }

  // URL 파싱 검증
  try {
    const parsed = new URL(trimmed);

    // 프로토콜 재확인 (파싱 후)
    if (parsed.protocol !== 'https:') {
      return '';
    }

    // 도메인 화이트리스트 검사 (선택적)
    const isAllowedDomain = ALLOWED_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );

    // 화이트리스트 도메인이거나 일반 HTTPS URL 허용
    if (isAllowedDomain || parsed.protocol === 'https:') {
      return trimmed;
    }

    return '';
  } catch {
    return '';
  }
}

/**
 * 메시지 객체 sanitize
 * @param {object} message - 메시지 객체
 * @returns {object} 정제된 메시지
 */
export function sanitizeMessage(message) {
  if (!message || typeof message !== 'object') {
    return { text: '' };
  }

  return {
    ...message,
    text: sanitizeText(message.text, LIMITS.MAX_MESSAGE_LENGTH),
  };
}

/**
 * Author 객체 sanitize
 * @param {object} author - Author 객체
 * @returns {object} 정제된 Author
 */
export function sanitizeAuthor(author) {
  if (!author || typeof author !== 'object') {
    return { name: '', avatarUrl: '' };
  }

  return {
    ...author,
    name: sanitizeText(author.name, LIMITS.MAX_AUTHOR_NAME_LENGTH),
    avatarUrl: sanitizeUrl(author.avatarUrl),
  };
}

/**
 * 대화 제목 sanitize
 * @param {string} title - 제목
 * @returns {string} 정제된 제목
 */
export function sanitizeTitle(title) {
  return sanitizeText(title, LIMITS.MAX_TITLE_LENGTH);
}

export default {
  sanitizeText,
  sanitizeUrl,
  sanitizeMessage,
  sanitizeAuthor,
  sanitizeTitle,
  LIMITS,
};
