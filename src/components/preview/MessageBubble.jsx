/**
 * MessageBubble - 플랫폼별 메시지 버블
 * kakao, discord, telegram, instagram 스타일 지원
 * Discord UI Kit 디자인 시스템 적용
 */
import React from 'react';
import { discordColors } from '../../themes/presets';

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

  // 카카오/텔레그램/인스타 스타일 (버블 형식)
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
            <span className="whitespace-pre-wrap break-words">{text}</span>
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
const DiscordMessage = ({ author, text, time, isMe, isFirstInGroup, theme, bubbleStyle }) => {
  // 사용자 이름 색상 (역할에 따라 다름)
  const getUsernameColor = () => {
    if (isMe) return discordColors.blurpleText; // 자신의 메시지는 연보라색
    return discordColors.headerSecondary; // #C7C8CE
  };

  // Discord iOS 타임스탬프 형식으로 변환 (MM/DD/YY, HH:MM)
  const formatDiscordTime = (timeStr) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);

    // 시간만 추출 (오전/오후 제거)
    let timeOnly = timeStr;
    if (timeStr.includes('오전') || timeStr.includes('오후')) {
      timeOnly = timeStr.replace(/오[전후]\s?/, '');
    }

    return `${month}/${day}/${year}, ${timeOnly}`;
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
          }}
        >
          {text}
        </p>
      </div>
    </div>
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
