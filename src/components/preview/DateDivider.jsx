/**
 * DateDivider - 날짜 구분선 컴포넌트
 * 카카오톡, 디스코드, 텔레그램, 인스타그램 스타일 지원
 */
import React from 'react';
import { discordColors, instagramColors } from '../../themes/presets';

/**
 * 날짜 구분선 컴포넌트
 * @param {string} date - 표시할 날짜 텍스트
 * @param {string} themeId - 테마 ID (kakao, discord, telegram, insta, *-shorts)
 * @param {object} _theme - 테마 설정 (향후 확장용)
 */
const DateDivider = ({ date, themeId, _theme }) => {
  // 쇼츠 버전인지 확인
  const isShorts = themeId?.includes('-shorts');
  const baseThemeId = isShorts ? themeId.replace('-shorts', '') : themeId;

  // 쇼츠용 스케일 팩터
  const scale = isShorts ? 2.77 : 1;

  switch (baseThemeId) {
    case 'discord':
      return <DiscordDateDivider date={date} scale={scale} />;
    case 'kakao':
      return <KakaoDateDivider date={date} scale={scale} />;
    case 'telegram':
      return <TelegramDateDivider date={date} scale={scale} />;
    case 'insta':
      return <InstagramDateDivider date={date} scale={scale} />;
    default:
      return <KakaoDateDivider date={date} scale={scale} />;
  }
};

/**
 * Discord 스타일 날짜 구분선
 * 양쪽에 선 + 중앙에 날짜 텍스트
 */
const DiscordDateDivider = ({ date, scale = 1 }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: '100%',
      height: 32 * scale,
      padding: `${12 * scale}px ${10 * scale}px`,
    }}
  >
    <div
      className="flex items-center"
      style={{ width: '100%', gap: 8 * scale }}
    >
      {/* 왼쪽 선 */}
      <div
        style={{
          flex: 1,
          height: 1 * scale,
          backgroundColor: discordColors.backgroundDivider,
        }}
      />
      {/* 날짜 텍스트 */}
      <span
        style={{
          fontFamily: "'SF Compact', -apple-system, sans-serif",
          fontWeight: 457,
          fontSize: 12 * scale,
          color: discordColors.textPlaceholder,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {date}
      </span>
      {/* 오른쪽 선 */}
      <div
        style={{
          flex: 1,
          height: 1 * scale,
          backgroundColor: discordColors.backgroundDivider,
        }}
      />
    </div>
  </div>
);

/**
 * KakaoTalk 스타일 날짜 구분선
 * 필 형태의 둥근 배경 + 중앙 정렬
 */
const KakaoDateDivider = ({ date, scale = 1 }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: '100%',
      padding: `${8 * scale}px 0`,
    }}
  >
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 34 * scale,
        padding: `${4 * scale}px ${12 * scale}px`,
      }}
    >
      <span
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          fontWeight: 400,
          fontSize: 12 * scale,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
        }}
      >
        {date}
      </span>
    </div>
  </div>
);

/**
 * Telegram 스타일 날짜 구분선
 * 반투명 배경의 둥근 필
 */
const TelegramDateDivider = ({ date, scale = 1 }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: '100%',
      padding: `${8 * scale}px 0`,
    }}
  >
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 16 * scale,
        padding: `${4 * scale}px ${10 * scale}px`,
      }}
    >
      <span
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 13 * scale,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
        }}
      >
        {date}
      </span>
    </div>
  </div>
);

/**
 * Instagram 스타일 날짜 구분선
 * 미니멀한 텍스트 스타일
 */
const InstagramDateDivider = ({ date, scale = 1 }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: '100%',
      padding: `${12 * scale}px 0`,
    }}
  >
    <span
      style={{
        fontFamily: "'-apple-system', 'Segoe UI', sans-serif",
        fontWeight: 400,
        fontSize: 12 * scale,
        color: instagramColors.subtitleText,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      {date}
    </span>
  </div>
);

export default DateDivider;
export { DiscordDateDivider, KakaoDateDivider, TelegramDateDivider, InstagramDateDivider };
