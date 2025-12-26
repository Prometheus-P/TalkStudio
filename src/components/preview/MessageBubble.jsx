/**
 * MessageBubble - 플랫폼별 메시지 버블
 * kakao, discord, telegram, instagram 스타일 지원
 * Discord UI Kit 디자인 시스템 적용
 */
import React from 'react';
import { discordColors, telegramColors, kakaoColors } from '../../themes/presets';

// datetime에서 시간만 추출하는 헬퍼 함수
const extractTimeFromDatetime = (datetime) => {
  if (!datetime) return '';
  // "2024-12-10 오후 12:30" 형식에서 시간 부분만 추출
  const match = datetime.match(/(오전|오후)\s*(\d{1,2}:\d{2})$/);
  return match ? `${match[1]} ${match[2]}` : datetime;
};

const MessageBubble = ({ message, author, theme, isFirstInGroup, isLastInGroup }) => {
  const { role, text, datetime, time: legacyTime } = message;
  // datetime이 있으면 시간 추출, 없으면 기존 time 사용 (하위 호환성)
  const time = datetime ? extractTimeFromDatetime(datetime) : legacyTime;
  const bubbleStyle = theme.bubble[role] || theme.bubble.other;
  const isMe = role === 'me';
  const isSystem = role === 'system';

  // 시스템 메시지는 별도 처리
  if (isSystem) {
    return (
      <div className="flex justify-center my-2 px-4">
        <div
          className="px-4 py-2 text-xs"
          style={{
            backgroundColor: bubbleStyle.bg,
            color: bubbleStyle.textColor,
            borderRadius: bubbleStyle.radius,
            fontFamily: theme.fontFamily,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  // 디스코드 스타일 (라인 형식) - Discord UI Kit
  if (theme.id === 'discord') {
    return (
      <DiscordMessage
        author={author}
        text={text}
        time={time}
        isMe={isMe}
        isFirstInGroup={isFirstInGroup}
        theme={theme}
        bubbleStyle={bubbleStyle}
      />
    );
  }

  // 텔레그램 스타일 - Figma 스펙 기반
  if (theme.id === 'telegram') {
    return (
      <TelegramMessage
        author={author}
        text={text}
        time={time}
        isMe={isMe}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
        theme={theme}
        bubbleStyle={bubbleStyle}
      />
    );
  }

  // 카카오톡 스타일 - Figma 스펙 기반
  if (theme.id === 'kakao') {
    return (
      <KakaoMessage
        author={author}
        text={text}
        time={time}
        isMe={isMe}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
        theme={theme}
        bubbleStyle={bubbleStyle}
      />
    );
  }

  // 인스타그램 스타일 - Seen 읽음 표시 포함
  if (theme.id === 'insta') {
    return (
      <InstagramMessage
        author={author}
        text={text}
        time={time}
        isMe={isMe}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
        theme={theme}
        bubbleStyle={bubbleStyle}
      />
    );
  }

  // 기타 스타일 (버블 형식)
  const align = isMe ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${align} items-end gap-2 px-4 py-0.5`}>
      {/* 상대방 아바타 (왼쪽) */}
      {!isMe && theme.showAvatar && isFirstInGroup && (
        <img
          src={author?.avatarUrl}
          alt={author?.name}
          className="flex-shrink-0"
          style={{
            width: theme.avatarSize,
            height: theme.avatarSize,
            borderRadius: theme.avatarShape === 'circle' ? '50%' : '8px',
          }}
        />
      )}
      {!isMe && theme.showAvatar && !isFirstInGroup && (
        <div style={{ width: theme.avatarSize }} className="flex-shrink-0" />
      )}

      {/* 메시지 컨테이너 */}
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* 상대방 이름 */}
        {!isMe && theme.showName && isFirstInGroup && (
          <span
            className="text-xs mb-1 ml-1"
            style={{ color: theme.nameColor }}
          >
            {author?.name}
          </span>
        )}

        {/* 버블 + 시간 행 */}
        <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* 버블 */}
          <div
            className="relative"
            style={{
              backgroundColor: bubbleStyle.bg,
              color: bubbleStyle.textColor,
              borderRadius: getBorderRadius(bubbleStyle, isMe, isFirstInGroup, isLastInGroup),
              padding: `${bubbleStyle.paddingY}px ${bubbleStyle.paddingX}px`,
              fontSize: theme.fontSize,
              lineHeight: theme.lineHeight,
              fontFamily: theme.fontFamily,
              maxWidth: `${bubbleStyle.maxWidthPercent}%`,
            }}
          >
            {/* 말풍선 꼬리 (카카오/텔레그램) */}
            {bubbleStyle.tail !== 'none' && isLastInGroup && (
              <BubbleTail
                isMe={isMe}
                color={bubbleStyle.bg}
                size={bubbleStyle.tail}
                themeId={theme.id}
              />
            )}
            <span
              className="whitespace-pre-wrap break-words"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                hyphens: 'auto',
              }}
            >
              {text}
            </span>
          </div>

          {/* 시간 & 읽음 표시 */}
          {theme.showTime && isLastInGroup && (
            <div className={`flex flex-col text-xs ${isMe ? 'items-end' : 'items-start'}`}>
              {isMe && theme.showReadStatus && (
                <span className="text-[10px]" style={{ color: theme.timeColor }}>1</span>
              )}
              <span style={{ color: theme.timeColor }}>{time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Discord iOS Mobile DM 메시지 컴포넌트 - Figma 스펙 기반
// Avatar: 40px, Username: 17px (656 weight), Timestamp: 12px (#9597A3)
// Message text: 15px (#FFFFFF)
const DiscordMessage = ({ author, text, time, isMe, isFirstInGroup, theme, bubbleStyle: _bubbleStyle }) => {
  // 사용자 이름 색상 (역할에 따라 다름)
  const getUsernameColor = () => {
    if (isMe) return discordColors.blurpleText; // 자신의 메시지는 연보라색
    return discordColors.headerSecondary; // #C7C8CE
  };

  // Discord iOS 타임스탬프 형식으로 변환 (Today at HH:MM AM/PM)
  const formatDiscordTime = (timeStr) => {
    // 시간만 추출
    let timeOnly = timeStr;
    let isPM = timeStr.includes('오후');

    if (timeStr.includes('오전') || timeStr.includes('오후')) {
      timeOnly = timeStr.replace(/오[전후]\s?/, '');
    }

    // 12시간 형식으로 변환 (AM/PM)
    const [hours, minutes] = timeOnly.split(':');
    const hour12 = parseInt(hours);
    const ampm = isPM ? 'PM' : 'AM';

    return `Today at ${hour12}:${minutes} ${ampm}`;
  };

  // 연속 메시지: 50px 왼쪽 인덴트 (Avatar 40px + Gap 10px)
  const leftIndent = 50;

  return (
    <div
      className="flex items-start"
      style={{
        padding: '0 12px',
        marginTop: isFirstInGroup ? 8 : 0,
      }}
    >
      {/* 아바타 40x40 - 첫 메시지만 표시 */}
      {isFirstInGroup && (
        <div className="relative flex-shrink-0">
          <img
            src={author?.avatarUrl}
            alt={author?.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: 26.67,
            }}
          />
        </div>
      )}

      {/* 메시지 콘텐츠 */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{
          marginLeft: isFirstInGroup ? 10 : leftIndent,
          padding: '2px 0 6px',
          gap: 10,
        }}
      >
        {/* 유저 정보와 시간 (첫 메시지만) */}
        {isFirstInGroup && (
          <div
            className="flex items-center"
            style={{ gap: 11 }}
          >
            {/* 유저네임 */}
            <span
              style={{
                fontFamily: "'SF Compact', -apple-system, sans-serif",
                fontWeight: 656,
                fontSize: 17,
                lineHeight: '20px',
                color: getUsernameColor(),
                letterSpacing: '0.01em',
              }}
            >
              {author?.name}
            </span>

            {/* 날짜와 시간 */}
            {theme.showTime && (
              <div className="flex items-center" style={{ paddingLeft: 10 }}>
                <span
                  style={{
                    fontFamily: "'SF Compact', -apple-system, sans-serif",
                    fontWeight: 457,
                    fontSize: 12,
                    lineHeight: '14px',
                    color: discordColors.textMuted,
                  }}
                >
                  {formatDiscordTime(time)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 메시지 텍스트 - 15px */}
        <p
          className="break-words whitespace-pre-wrap"
          style={{
            fontFamily: "'SF Compact', -apple-system, sans-serif",
            fontWeight: 457,
            fontSize: 15,
            lineHeight: '18px',
            color: discordColors.textNormal,
            margin: 0,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

// Telegram iOS 모바일 메시지 컴포넌트 - Figma 스펙 기반
// 시간과 체크마크가 버블 내부에 표시됨
const TelegramMessage = ({
  author: _author,
  text,
  time,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  theme,
  bubbleStyle,
}) => {
  const align = isMe ? 'justify-end' : 'justify-start';

  // 시간 포맷 (오전/오후 제거, HH:MM만 표시)
  const formatTime = (t) => {
    if (!t) return '';
    return t.replace(/오[전후]\s?/, '');
  };

  // 텔레그램 스타일 border-radius 계산
  const getTelegramRadius = () => {
    const r = 17;
    const small = 4;

    if (isMe) {
      // 오른쪽 정렬 메시지
      if (isFirstInGroup && isLastInGroup) {
        return `${r}px ${r}px ${small}px ${r}px`; // 우하단만 작게
      }
      if (isFirstInGroup) return `${r}px ${r}px ${small}px ${r}px`;
      if (isLastInGroup) return `${r}px ${small}px ${small}px ${r}px`;
      return `${r}px ${small}px ${small}px ${r}px`;
    } else {
      // 왼쪽 정렬 메시지
      if (isFirstInGroup && isLastInGroup) {
        return `${r}px ${r}px ${r}px ${small}px`; // 좌하단만 작게
      }
      if (isFirstInGroup) return `${r}px ${r}px ${r}px ${small}px`;
      if (isLastInGroup) return `${small}px ${r}px ${r}px ${small}px`;
      return `${small}px ${r}px ${r}px ${small}px`;
    }
  };

  return (
    <div
      className={`flex ${align} px-2`}
      style={{
        marginBottom: isLastInGroup ? 8 : 2,
      }}
    >
      <div
        className="relative"
        style={{
          backgroundColor: bubbleStyle.bg,
          borderRadius: getTelegramRadius(),
          padding: '6px 10px',
          maxWidth: '75%',
          boxShadow: '0 1px 0.5px rgba(0,0,0,0.08)',
        }}
      >
        {/* 텔레그램 꼬리 (SVG) */}
        {isLastInGroup && (
          <TelegramBubbleTail isMe={isMe} color={bubbleStyle.bg} />
        )}

        {/* 메시지 텍스트 + 시간/체크마크 */}
        <div className="flex flex-wrap items-end gap-1">
          <span
            className="whitespace-pre-wrap break-words"
            style={{
              fontFamily: theme.fontFamily,
              fontSize: 17,
              lineHeight: 1.29,
              color: bubbleStyle.textColor,
              wordBreak: 'break-word',
            }}
          >
            {text}
          </span>

          {/* 시간 + 체크마크 (버블 내부) */}
          <span
            className="flex items-center gap-0.5 ml-1"
            style={{
              fontSize: 11,
              color: isMe ? telegramColors.timeTextMe : telegramColors.timeTextOther,
              whiteSpace: 'nowrap',
              alignSelf: 'flex-end',
              marginBottom: -2,
            }}
          >
            {formatTime(time)}
            {/* 읽음 체크마크 (내 메시지만) */}
            {isMe && theme.showReadStatus && (
              <TelegramCheckmark read={true} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

// 텔레그램 버블 꼬리 (SVG)
const TelegramBubbleTail = ({ isMe, color }) => {
  if (isMe) {
    return (
      <svg
        className="absolute bottom-0"
        style={{ right: -6 }}
        width="9"
        height="17"
        viewBox="0 0 9 17"
        fill="none"
      >
        <path
          d="M0 17C0 17 0.5 10 2 6C3.5 2 8.5 0 8.5 0C8.5 0 3 2 1 6C-1 10 0 17 0 17Z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      className="absolute bottom-0"
      style={{ left: -6 }}
      width="9"
      height="17"
      viewBox="0 0 9 17"
      fill="none"
    >
      <path
        d="M9 17C9 17 8.5 10 7 6C5.5 2 0.5 0 0.5 0C0.5 0 6 2 8 6C10 10 9 17 9 17Z"
        fill={color}
      />
    </svg>
  );
};

// 텔레그램 체크마크 (읽음/안읽음)
const TelegramCheckmark = ({ read }) => {
  const color = read ? telegramColors.checkRead : telegramColors.checkUnread;

  // 더블 체크마크 (읽음)
  if (read) {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <path
          d="M1 5.5L4.5 9L11 2"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5.5L8.5 9L15 2"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 싱글 체크마크 (전송됨)
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
      <path
        d="M1 4L4.5 7.5L11 1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// 카카오톡 iOS 모바일 메시지 컴포넌트 - Figma 스펙 기반
// Avatar: 38x38, borderRadius: 13
// Name: Pretendard, 12px (kt/chatBaloonName)
// Message: 15px, lineHeight: 1.2
// Time: Pretendard 10px (kt/smallest)
// ReadCount: 11px, yellow (#FFD700)
const KakaoMessage = ({
  author,
  text,
  time,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  theme,
  bubbleStyle,
}) => {
  const align = isMe ? 'justify-end' : 'justify-start';

  // 시간 포맷 (오전/오후 HH:MM 형식 유지)
  const formatTime = (t) => {
    if (!t) return '';
    return t;
  };

  // 카카오톡 스타일 border-radius 계산
  const getKakaoRadius = () => {
    const r = kakaoColors.bubbleRadius; // 13.5px
    const small = 4;

    if (isMe) {
      // 오른쪽 정렬 메시지 (꼬리가 오른쪽 하단)
      if (isFirstInGroup && isLastInGroup) {
        return `${r}px ${r}px ${small}px ${r}px`;
      }
      if (isFirstInGroup) return `${r}px ${r}px ${small}px ${r}px`;
      if (isLastInGroup) return `${r}px ${small}px ${small}px ${r}px`;
      return `${r}px ${small}px ${small}px ${r}px`;
    } else {
      // 왼쪽 정렬 메시지 (꼬리가 왼쪽 하단)
      if (isFirstInGroup && isLastInGroup) {
        return `${r}px ${r}px ${r}px ${small}px`;
      }
      if (isFirstInGroup) return `${r}px ${r}px ${r}px ${small}px`;
      if (isLastInGroup) return `${small}px ${r}px ${r}px ${small}px`;
      return `${small}px ${r}px ${r}px ${small}px`;
    }
  };

  return (
    <div
      className={`flex ${align} items-end`}
      style={{
        padding: '0 12px',
        marginBottom: isLastInGroup ? 8 : 2,
      }}
    >
      {/* 상대방 아바타 (왼쪽) - 첫 메시지만 표시 */}
      {!isMe && isFirstInGroup && (
        <img
          src={author?.avatarUrl}
          alt={author?.name}
          style={{
            width: 38,
            height: 38,
            borderRadius: 13,
            marginRight: 8,
            flexShrink: 0,
          }}
        />
      )}
      {/* 아바타 없을 때 간격 유지 */}
      {!isMe && !isFirstInGroup && (
        <div style={{ width: 38, marginRight: 8, flexShrink: 0 }} />
      )}

      {/* 메시지 컨테이너 */}
      <div
        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
        style={{ maxWidth: '70%' }}
      >
        {/* 상대방 이름 (첫 메시지만) */}
        {!isMe && isFirstInGroup && (
          <span
            style={{
              fontFamily: `'${kakaoColors.fontFamily}', 'Apple SD Gothic Neo', sans-serif`,
              fontSize: kakaoColors.fontSizeName,
              fontWeight: 400,
              color: kakaoColors.nameText,
              marginBottom: 4,
              marginLeft: 2,
            }}
          >
            {author?.name}
          </span>
        )}

        {/* 버블 + 시간/읽음 행 */}
        <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* 메시지 버블 */}
          <div
            className="relative"
            style={{
              backgroundColor: bubbleStyle.bg,
              borderRadius: getKakaoRadius(),
              padding: `${bubbleStyle.paddingY}px ${bubbleStyle.paddingX}px`,
              boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
            }}
          >
            {/* 카카오톡 버블 꼬리 */}
            {isLastInGroup && (
              <KakaoBubbleTail isMe={isMe} color={bubbleStyle.bg} />
            )}

            {/* 메시지 텍스트 */}
            <span
              className="whitespace-pre-wrap break-words"
              style={{
                fontFamily: `'${kakaoColors.fontFamily}', 'Apple SD Gothic Neo', sans-serif`,
                fontSize: kakaoColors.fontSizeMessage,
                lineHeight: 1.2,
                color: bubbleStyle.textColor,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {text}
            </span>
          </div>

          {/* 시간 & 읽음 수 (마지막 메시지만) */}
          {isLastInGroup && theme.showTime && (
            <div
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              style={{ gap: 1 }}
            >
              {/* 읽음 수 (내 메시지만) */}
              {isMe && theme.showReadStatus && (
                <span
                  style={{
                    fontFamily: `'${kakaoColors.fontFamily}', sans-serif`,
                    fontSize: kakaoColors.fontSizeReadCount,
                    fontWeight: 500,
                    color: kakaoColors.readCountText,
                  }}
                >
                  1
                </span>
              )}
              {/* 시간 */}
              <span
                style={{
                  fontFamily: `'${kakaoColors.fontFamily}', sans-serif`,
                  fontSize: kakaoColors.fontSizeTime,
                  fontWeight: 300,
                  color: kakaoColors.timeText,
                }}
              >
                {formatTime(time)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Instagram iOS 모바일 메시지 컴포넌트 - Seen 읽음 표시 포함
const InstagramMessage = ({
  author,
  text,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  theme,
  bubbleStyle,
}) => {
  const align = isMe ? 'justify-end' : 'justify-start';

  // 인스타그램 스타일 border-radius 계산
  const getInstagramRadius = () => {
    const r = 22;
    const small = 4;

    if (isMe) {
      if (isFirstInGroup && isLastInGroup) return `${r}px ${r}px ${small}px ${r}px`;
      if (isFirstInGroup) return `${r}px ${r}px ${small}px ${r}px`;
      if (isLastInGroup) return `${r}px ${small}px ${small}px ${r}px`;
      return `${r}px ${small}px ${small}px ${r}px`;
    } else {
      if (isFirstInGroup && isLastInGroup) return `${r}px ${r}px ${r}px ${small}px`;
      if (isFirstInGroup) return `${r}px ${r}px ${r}px ${small}px`;
      if (isLastInGroup) return `${small}px ${r}px ${r}px ${small}px`;
      return `${small}px ${r}px ${r}px ${small}px`;
    }
  };

  return (
    <div
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
      style={{
        padding: '0 16px',
        marginBottom: isLastInGroup ? 8 : 2,
      }}
    >
      {/* 상대방 아바타 + 메시지 행 */}
      <div className={`flex ${align} items-end gap-2`}>
        {/* 상대방 아바타 (왼쪽) */}
        {!isMe && isFirstInGroup && (
          <img
            src={author?.avatarUrl}
            alt={author?.name}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        )}
        {!isMe && !isFirstInGroup && (
          <div style={{ width: 28, flexShrink: 0 }} />
        )}

        {/* 메시지 버블 */}
        <div
          style={{
            backgroundColor: bubbleStyle.bg,
            borderRadius: getInstagramRadius(),
            padding: '8px 12px',
            maxWidth: '70%',
          }}
        >
          <span
            className="whitespace-pre-wrap break-words"
            style={{
              fontFamily: theme.fontFamily,
              fontSize: 15,
              lineHeight: 1.33,
              color: bubbleStyle.textColor,
              wordBreak: 'break-word',
            }}
          >
            {text}
          </span>
        </div>
      </div>

      {/* Seen 읽음 표시 (내 메시지의 마지막 메시지만) */}
      {isMe && isLastInGroup && theme.showReadStatus && (
        <span
          style={{
            fontFamily: theme.fontFamily,
            fontSize: 11,
            color: '#8E8E8E',
            marginTop: 4,
            marginRight: 4,
          }}
        >
          Seen
        </span>
      )}
    </div>
  );
};

// 카카오톡 버블 꼬리 (SVG) - 작은 삼각형 스타일
const KakaoBubbleTail = ({ isMe, color }) => {
  if (isMe) {
    // 오른쪽 하단 꼬리
    return (
      <svg
        className="absolute"
        style={{ right: -5, bottom: 0 }}
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
      >
        <path
          d="M0 12C0 12 0 6 4 2C6 0 8 0 8 0L8 12L0 12Z"
          fill={color}
        />
      </svg>
    );
  }

  // 왼쪽 하단 꼬리
  return (
    <svg
      className="absolute"
      style={{ left: -5, bottom: 0 }}
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
    >
      <path
        d="M8 12C8 12 8 6 4 2C2 0 0 0 0 0L0 12L8 12Z"
        fill={color}
      />
    </svg>
  );
};

// 버블 꼬리 컴포넌트
const BubbleTail = ({ isMe, color, size, themeId }) => {
  const tailSize = size === 'big' ? 10 : 6;

  // 텔레그램 스타일 꼬리
  if (themeId === 'telegram') {
    return (
      <div
        className="absolute bottom-0"
        style={{
          [isMe ? 'right' : 'left']: -6,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: isMe ? '0 0 12px 8px' : '0 8px 12px 0',
          borderColor: isMe
            ? `transparent transparent ${color} transparent`
            : `transparent ${color} transparent transparent`,
        }}
      />
    );
  }

  // 카카오 스타일 꼬리 (작은 삼각형)
  return (
    <div
      className="absolute bottom-2"
      style={{
        [isMe ? 'right' : 'left']: -tailSize + 2,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: tailSize,
        borderColor: isMe
          ? `transparent transparent transparent ${color}`
          : `transparent ${color} transparent transparent`,
      }}
    />
  );
};

// 버블 border-radius 계산 (연속 메시지 처리)
const getBorderRadius = (style, isMe, isFirst, isLast) => {
  const r = style.radius;
  const small = Math.max(4, r / 3);

  // 단일 메시지
  if (isFirst && isLast) return r;

  // 연속 메시지
  if (isMe) {
    if (isFirst) return `${r}px ${r}px ${small}px ${r}px`;
    if (isLast) return `${r}px ${small}px ${r}px ${r}px`;
    return `${r}px ${small}px ${small}px ${r}px`;
  } else {
    if (isFirst) return `${r}px ${r}px ${r}px ${small}px`;
    if (isLast) return `${small}px ${r}px ${r}px ${r}px`;
    return `${small}px ${r}px ${r}px ${small}px`;
  }
};

export default MessageBubble;
