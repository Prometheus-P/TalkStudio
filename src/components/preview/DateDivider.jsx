/**
 * DateDivider - 채팅 내 날짜 구분선 컴포넌트
 * 카카오톡 스타일: 중앙 정렬, 반투명 배경
 * 형식: "2024년 12월 25일 수요일"
 */
import React from 'react';
import { kakaoColors } from '../../themes/presets';
import { formatKoreanDate } from '../../utils/dateUtils';

/**
 * DateDivider 컴포넌트
 * @param {Object} props
 * @param {string|Date} props.date - 표시할 날짜
 * @param {Object} props.theme - 테마 프리셋 (optional)
 * @param {number} props.scale - 스케일 팩터 (쇼츠용, default: 1)
 */
const DateDivider = ({ date, theme, scale = 1 }) => {
  const formattedDate = formatKoreanDate(date);

  // 쇼츠 프리셋인 경우 스케일 자동 감지
  const isShorts = theme?.id?.includes('shorts');
  const effectiveScale = isShorts ? 2.77 : scale;

  // 기본 스타일 (카카오톡 기준)
  const baseStyles = {
    fontSize: 12,
    paddingX: 16,
    paddingY: 6,
    borderRadius: 34,
  };

  // 스케일 적용된 스타일
  const scaledStyles = {
    fontSize: Math.round(baseStyles.fontSize * effectiveScale),
    paddingX: Math.round(baseStyles.paddingX * effectiveScale),
    paddingY: Math.round(baseStyles.paddingY * effectiveScale),
    borderRadius: Math.round(baseStyles.borderRadius * effectiveScale),
  };

  return (
    <div
      className="flex justify-center py-3"
      style={{
        padding: `${Math.round(12 * effectiveScale)}px 0`,
      }}
    >
      <div
        style={{
          backgroundColor: kakaoColors.systemBg,
          color: kakaoColors.systemText,
          fontSize: `${scaledStyles.fontSize}px`,
          fontFamily: theme?.fontFamily || "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
          fontWeight: 400,
          padding: `${scaledStyles.paddingY}px ${scaledStyles.paddingX}px`,
          borderRadius: `${scaledStyles.borderRadius}px`,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {formattedDate}
      </div>
    </div>
  );
};

export default DateDivider;
