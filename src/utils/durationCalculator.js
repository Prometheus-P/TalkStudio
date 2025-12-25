/**
 * Duration Calculator - 메시지 표시 시간 계산
 * PRD 스펙 기반: BASE 0.8초 + 글자당 0.04초, 최대 3초
 */

/**
 * 메시지 표시 시간 계산 (PRD 스펙)
 * @param {string} text - 메시지 텍스트
 * @returns {number} 초 단위 duration
 *
 * @example
 * calculateDuration("ㅇㅇ")           // 0.88초 (2글자)
 * calculateDuration("형 그 메소 아직 있어?") // 1.28초 (12글자)
 * calculateDuration("아 진짜 개빡치네...")   // 최대 3초로 제한
 */
export function calculateDuration(text) {
  if (!text) return 0.8;

  const BASE = 0.8;      // 최소 0.8초
  const PER_CHAR = 0.04; // 글자당 0.04초
  const MAX = 3.0;       // 최대 3초

  const charCount = text.length;
  const duration = BASE + charCount * PER_CHAR;

  return Math.min(duration, MAX);
}

/**
 * 전체 시퀀스의 총 duration 계산
 * @param {Array<{text: string}>} messages - 메시지 배열
 * @returns {number} 총 시간 (초)
 */
export function calculateTotalDuration(messages) {
  if (!messages || messages.length === 0) return 0;

  return messages.reduce((total, msg) => {
    return total + calculateDuration(msg.text);
  }, 0);
}

/**
 * Duration을 사람이 읽기 쉬운 형태로 변환
 * @param {number} seconds - 초 단위
 * @returns {string} "1분 23초" 형식
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}초`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }

  return `${minutes}분 ${remainingSeconds}초`;
}

export default calculateDuration;
