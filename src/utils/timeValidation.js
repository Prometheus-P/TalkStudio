/**
 * TalkStudio - Time Validation Utility
 * 날짜/시간 검증 및 포맷팅 유틸리티
 */

/**
 * datetime 문자열을 Date 객체로 파싱
 * @param {string} datetime - "2024-12-10 오후 12:30" 형식
 * @returns {Date|null}
 */
export const parseDateTime = (datetime) => {
  if (!datetime) return null;

  try {
    // "2024-12-10 오후 12:30" 또는 "2024-12-10 오전 09:00" 형식 파싱
    const match = datetime.match(/^(\d{4})-(\d{2})-(\d{2})\s+(오전|오후)\s*(\d{1,2}):(\d{2})$/);
    if (!match) {
      // 기존 time 형식 ("오후 12:30")과의 호환성
      const timeMatch = datetime.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        const today = new Date();
        const [, period, hours, minutes] = timeMatch;
        let hour = parseInt(hours, 10);
        if (period === '오후' && hour !== 12) hour += 12;
        if (period === '오전' && hour === 12) hour = 0;
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, parseInt(minutes, 10));
      }
      return null;
    }

    const [, year, month, day, period, hours, minutes] = match;
    let hour = parseInt(hours, 10);

    // 오전/오후 변환
    if (period === '오후' && hour !== 12) hour += 12;
    if (period === '오전' && hour === 12) hour = 0;

    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Month is 0-indexed
      parseInt(day, 10),
      hour,
      parseInt(minutes, 10)
    );
  } catch {
    return null;
  }
};

/**
 * 메시지 배열의 시간 순서 검증
 * @param {Array} messages - 메시지 배열 (datetime 필드 포함)
 * @returns {Array<string>} - 시간 순서가 잘못된 메시지 ID 배열
 */
export const validateTimeOrder = (messages) => {
  const warnings = [];

  for (let i = 1; i < messages.length; i++) {
    const prevDatetime = messages[i - 1].datetime || messages[i - 1].time;
    const currDatetime = messages[i].datetime || messages[i].time;

    const prevDate = parseDateTime(prevDatetime);
    const currDate = parseDateTime(currDatetime);

    if (prevDate && currDate && currDate < prevDate) {
      warnings.push(messages[i].id);
    }
  }

  return warnings;
};

/**
 * 현재 날짜/시간을 datetime 형식으로 포맷
 * @returns {string} - "2024-12-10 오후 12:30" 형식
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return formatDateTime(now);
};

/**
 * Date 객체를 datetime 문자열로 포맷
 * @param {Date} date
 * @returns {string} - "2024-12-10 오후 12:30" 형식
 */
export const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${year}-${month}-${day} ${period} ${hours}:${minutes}`;
};

/**
 * datetime 문자열에서 날짜 부분만 추출
 * @param {string} datetime - "2024-12-10 오후 12:30" 형식
 * @returns {string} - "2024-12-10" 형식
 */
export const extractDate = (datetime) => {
  if (!datetime) return '';
  const match = datetime.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

/**
 * datetime 문자열에서 시간 부분만 추출
 * @param {string} datetime - "2024-12-10 오후 12:30" 형식
 * @returns {string} - "오후 12:30" 형식
 */
export const extractTime = (datetime) => {
  if (!datetime) return '';
  const match = datetime.match(/(오전|오후)\s*(\d{1,2}:\d{2})$/);
  return match ? `${match[1]} ${match[2]}` : datetime;
};

/**
 * 날짜와 시간을 합쳐서 datetime 형식으로 반환
 * @param {string} date - "2024-12-10" 형식
 * @param {string} time - "오후 12:30" 형식
 * @returns {string} - "2024-12-10 오후 12:30" 형식
 */
export const combineDateTime = (date, time) => {
  if (!date || !time) return '';
  return `${date} ${time}`;
};
