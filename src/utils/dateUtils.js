/**
 * 날짜 관련 유틸리티 함수
 * DateDivider 컴포넌트 및 시퀀스 렌더링에서 사용
 */

/**
 * 두 날짜가 같은 날인지 비교
 * @param {string} date1 - datetime 문자열 (예: "2024-12-25 오후 3:42")
 * @param {string} date2 - datetime 문자열
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;

  // datetime에서 날짜 부분만 추출 (YYYY-MM-DD)
  const extractDate = (datetime) => {
    if (!datetime) return '';
    const match = datetime.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : '';
  };

  return extractDate(date1) === extractDate(date2);
};

/**
 * datetime에서 Date 객체 생성
 * @param {string} datetime - "2024-12-25 오후 3:42" 형식
 * @returns {Date}
 */
export const parseDatetime = (datetime) => {
  if (!datetime) return new Date();

  const match = datetime.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]);
  }

  return new Date(datetime);
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} "2024년 12월 25일 수요일" 형식
 */
export const formatKoreanDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return date; // 파싱 실패 시 원본 반환
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[dateObj.getDay()];

  return `${year}년 ${month}월 ${day}일 ${weekday}`;
};
