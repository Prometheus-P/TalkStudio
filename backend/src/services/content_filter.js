/**
 * Content Filter - 콘텐츠 안전 필터링 서비스
 * Pre-filter: 입력 프롬프트 검사
 * Post-filter: 생성된 콘텐츠 검사
 */
import logger from '../utils/logger.js';

// 차단할 키워드 목록 (한국어 + 영어)
const BLOCKED_KEYWORDS = [
  // 폭력 관련
  '살인', '자살', '폭행', '테러', '학대', 'murder', 'suicide', 'terrorism',
  // 불법 관련
  '마약', '불법', '해킹', '사기', 'drugs', 'illegal', 'hacking', 'scam',
  // 성인/부적절
  '성인', '음란', '포르노', 'adult', 'porn', 'explicit',
  // 차별/혐오
  '혐오', '차별', '인종', 'hate', 'discrimination', 'racist',
];

// 민감한 주제 (경고만, 차단하지 않음)
const SENSITIVE_TOPICS = [
  '정치', '종교', '도박', 'politics', 'religion', 'gambling',
];

/**
 * Pre-filter: 입력 시나리오 검사
 * @param {string} scenario - 사용자 입력 시나리오
 * @returns {{safe: boolean, reason?: string, warnings?: string[]}}
 */
export const preFilter = (scenario) => {
  if (!scenario || typeof scenario !== 'string') {
    return { safe: false, reason: '시나리오가 비어있습니다.' };
  }

  const lowerScenario = scenario.toLowerCase();
  const warnings = [];

  // Check blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerScenario.includes(keyword.toLowerCase())) {
      logger.warn('Blocked keyword detected in scenario', { keyword });
      return {
        safe: false,
        reason: `부적절한 내용이 포함되어 있습니다. 다른 시나리오를 입력해 주세요.`,
      };
    }
  }

  // Check sensitive topics (warning only)
  for (const topic of SENSITIVE_TOPICS) {
    if (lowerScenario.includes(topic.toLowerCase())) {
      warnings.push(`민감한 주제(${topic})가 포함되어 있습니다.`);
    }
  }

  // Length validation
  if (scenario.length < 10) {
    return { safe: false, reason: '시나리오가 너무 짧습니다. 최소 10자 이상 입력해 주세요.' };
  }

  if (scenario.length > 500) {
    return { safe: false, reason: '시나리오가 너무 깁니다. 500자 이하로 입력해 주세요.' };
  }

  return { safe: true, warnings: warnings.length > 0 ? warnings : undefined };
};

/**
 * Post-filter: 생성된 대화 콘텐츠 검사
 * @param {Array<{sender: string, text: string}>} messages - 생성된 메시지 배열
 * @returns {{safe: boolean, reason?: string, flaggedMessages?: number[]}}
 */
export const postFilter = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { safe: false, reason: '유효한 메시지가 없습니다.' };
  }

  const flaggedMessages = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const text = message?.text?.toLowerCase() || '';

    for (const keyword of BLOCKED_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        flaggedMessages.push(i);
        break;
      }
    }
  }

  if (flaggedMessages.length > 0) {
    logger.warn('Blocked content detected in generated messages', {
      count: flaggedMessages.length,
      indices: flaggedMessages,
    });
    return {
      safe: false,
      reason: '생성된 대화에 부적절한 내용이 포함되어 있습니다.',
      flaggedMessages,
    };
  }

  return { safe: true };
};

/**
 * Sanitize text: 특수문자 이스케이프 및 정리
 * @param {string} text - 입력 텍스트
 * @returns {string} - 정리된 텍스트
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate participant names
 * @param {string[]} participants - 참여자 이름 배열
 * @returns {{valid: boolean, reason?: string}}
 */
export const validateParticipants = (participants) => {
  if (!Array.isArray(participants)) {
    return { valid: false, reason: '참여자 목록이 유효하지 않습니다.' };
  }

  if (participants.length < 2) {
    return { valid: false, reason: '최소 2명의 참여자가 필요합니다.' };
  }

  if (participants.length > 5) {
    return { valid: false, reason: '최대 5명까지 참여할 수 있습니다.' };
  }

  for (const name of participants) {
    if (!name || typeof name !== 'string') {
      return { valid: false, reason: '참여자 이름이 유효하지 않습니다.' };
    }

    if (name.length < 1 || name.length > 20) {
      return { valid: false, reason: '참여자 이름은 1-20자 사이여야 합니다.' };
    }

    // Check for blocked keywords in names
    const lowerName = name.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return { valid: false, reason: '참여자 이름에 부적절한 내용이 포함되어 있습니다.' };
      }
    }
  }

  return { valid: true };
};

export default {
  preFilter,
  postFilter,
  sanitizeText,
  validateParticipants,
};
