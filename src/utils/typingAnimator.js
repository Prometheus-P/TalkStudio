/**
 * Typing Animator - 타이핑 애니메이션 프레임 생성
 * 메시지가 한 글자씩 타이핑되는 효과를 위한 프레임 상태 생성
 */

/**
 * 타이핑 속도 프리셋 (ms/글자)
 */
export const TYPING_SPEEDS = {
  slow: 150,
  normal: 80,
  fast: 40,
  instant: 0,
};

/**
 * 타이핑 애니메이션 프레임 생성
 * @param {string} text - 원본 텍스트
 * @param {Object} options - 옵션
 * @param {number} options.speed - 글자당 ms (기본: 80)
 * @param {number} options.fps - 초당 프레임 수 (기본: 30)
 * @returns {Array<{text: string, timestamp: number}>} 프레임 배열
 */
export function generateTypingFrames(text, options = {}) {
  const { speed = TYPING_SPEEDS.normal } = options;

  if (!text || speed === 0) {
    return [{ text, timestamp: 0 }];
  }

  const frames = [];
  const chars = Array.from(text); // Unicode 지원
  // fps는 향후 프레임 보간에 사용될 수 있음

  let currentTime = 0;
  let currentText = '';

  for (let i = 0; i < chars.length; i++) {
    currentText += chars[i];
    frames.push({
      text: currentText,
      timestamp: currentTime,
      charIndex: i,
      progress: (i + 1) / chars.length,
    });
    currentTime += speed;
  }

  return frames;
}

/**
 * "입력 중..." 표시 애니메이션 프레임 생성
 * @param {number} duration - 총 표시 시간 (ms)
 * @param {Object} options - 옵션
 * @returns {Array<{dots: string, timestamp: number}>}
 */
export function generateTypingIndicatorFrames(duration = 2000, options = {}) {
  const { fps = 30, dotInterval = 400 } = options;

  const frames = [];
  const frameInterval = 1000 / fps;
  let currentTime = 0;

  while (currentTime < duration) {
    const dotPhase = Math.floor(currentTime / dotInterval) % 4;
    const dots = '.'.repeat(dotPhase);

    frames.push({
      dots,
      isTyping: true,
      timestamp: currentTime,
    });

    currentTime += frameInterval;
  }

  return frames;
}

/**
 * 메시지 시퀀스에 타이핑 애니메이션 적용
 * @param {Array} messages - 메시지 배열
 * @param {Object} options - 옵션
 * @returns {Array} 확장된 프레임 배열
 */
export function applyTypingAnimation(messages, options = {}) {
  const {
    speed = TYPING_SPEEDS.normal,
    showTypingIndicator = true,
    typingIndicatorDuration = 1000,
  } = options;

  const animatedFrames = [];
  let cumulativeTime = 0;

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // 1. 입력 중 표시 (선택적)
    if (showTypingIndicator && message.role !== 'me') {
      const indicatorFrames = generateTypingIndicatorFrames(typingIndicatorDuration);
      for (const frame of indicatorFrames) {
        animatedFrames.push({
          messageIndex: i,
          type: 'typing_indicator',
          ...frame,
          timestamp: cumulativeTime + frame.timestamp,
        });
      }
      cumulativeTime += typingIndicatorDuration;
    }

    // 2. 타이핑 애니메이션
    if (message.text) {
      const typingFrames = generateTypingFrames(message.text, { speed });
      for (const frame of typingFrames) {
        animatedFrames.push({
          messageIndex: i,
          type: 'typing',
          messageId: message.id,
          ...frame,
          timestamp: cumulativeTime + frame.timestamp,
        });
      }
      cumulativeTime += typingFrames.length * speed;
    }

    // 3. 완료 상태 유지
    animatedFrames.push({
      messageIndex: i,
      type: 'complete',
      text: message.text,
      timestamp: cumulativeTime,
    });

    // 메시지 간 간격
    cumulativeTime += 500;
  }

  return animatedFrames;
}

/**
 * 타이핑 상태 훅을 위한 헬퍼
 * @param {string} text - 전체 텍스트
 * @param {boolean} isActive - 애니메이션 활성화 여부
 * @param {number} progress - 진행률 (0-1)
 * @returns {string} 현재 표시할 텍스트
 */
export function getTypingText(text, isActive, progress = 1) {
  if (!isActive || progress >= 1) {
    return text;
  }

  const chars = Array.from(text);
  const visibleCount = Math.floor(chars.length * progress);
  return chars.slice(0, visibleCount).join('');
}

/**
 * 커서 깜빡임 상태 계산
 * @param {number} timestamp - 현재 타임스탬프 (ms)
 * @param {number} blinkInterval - 깜빡임 간격 (ms, 기본: 530)
 * @returns {boolean} 커서 표시 여부
 */
export function getCursorVisible(timestamp, blinkInterval = 530) {
  return Math.floor(timestamp / blinkInterval) % 2 === 0;
}

export default {
  TYPING_SPEEDS,
  generateTypingFrames,
  generateTypingIndicatorFrames,
  applyTypingAnimation,
  getTypingText,
  getCursorVisible,
};
