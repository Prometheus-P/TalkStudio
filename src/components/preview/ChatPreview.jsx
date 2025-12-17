/**
 * ChatPreview - 채팅 미리보기 캔버스
 * html2canvas로 캡처될 대상 DOM
 * Discord iOS Mobile UI 디자인 시스템 적용
 */
import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Search, Phone } from 'lucide-react';
import StatusBar from './StatusBar';
import MessageBubble from './MessageBubble';
import useChatStore from '../../store/useChatStore';
import { discordColors } from '../../themes/presets';

// ============================================
// Discord iOS Mobile SVG Icons (from Figma export)
// ============================================

// 뒤로가기 화살표 아이콘 - 실제 디스코드 iOS 스타일 (얇은 chevron)
const DiscordBackIcon = ({ color = '#C7C8CE', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 19l-7-7 7-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 전화 아이콘 (Nav bar) - outline 스타일
const DiscordPhoneIcon = ({ color = '#C7C8CE', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 비디오 아이콘 (Nav bar) - outline 스타일
const DiscordVideoIcon = ({ color = '#C7C8CE', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 7l-7 5 7 5V7z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Plus 아이콘 (Message bar)
const DiscordPlusIcon = ({ color = '#C7C8CE', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M0 10.357C0 9.642 0.598 9.045 1.313 9.045H8.496V1.861C8.496 1.146 9.094 0.549 9.809 0.549C10.524 0.549 11.121 1.146 11.121 1.861V9.045H18.305C19.02 9.045 19.617 9.642 19.617 10.357C19.617 11.084 19.02 11.67 18.305 11.67H11.121V18.853C11.121 19.568 10.524 20.166 9.809 20.166C9.094 20.166 8.496 19.568 8.496 18.853V11.67H1.313C0.598 11.67 0 11.084 0 10.357Z" fill={color}/>
  </svg>
);

// Activity 아이콘 (Video camera style)
const DiscordActivityIcon = ({ color = '#C7C8CE', size = 22 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 22 15" fill="none">
    <path d="M3.121 14.432C2.12 14.432 1.35 14.186 0.81 13.695C0.27 13.209 0 12.484 0 11.52V3.03C0 2.065 0.273 1.319 0.819 0.791C1.371 0.263 2.139 0 3.121 0H11.003C11.998 0 12.756 0.263 13.278 0.791C13.8 1.319 14.06 2.062 14.06 3.021V11.402C14.06 12.366 13.79 13.112 13.25 13.64C12.71 14.168 11.943 14.432 10.948 14.432H3.121ZM16.425 10.246V4.276L19.155 1.938C19.374 1.756 19.586 1.61 19.792 1.501C19.999 1.392 20.208 1.337 20.42 1.337C20.784 1.337 21.085 1.459 21.321 1.701C21.558 1.938 21.676 2.256 21.676 2.657V11.866C21.676 12.266 21.558 12.588 21.321 12.83C21.085 13.067 20.784 13.185 20.42 13.185C20.208 13.185 19.999 13.131 19.792 13.021C19.586 12.912 19.374 12.77 19.155 12.594L16.425 10.246Z" fill={color}/>
  </svg>
);

// Gift/Rocket 아이콘 (Gamepad area)
const DiscordGiftIcon = ({ color = '#C7C8CE', size = 20 }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 20 21" fill="none">
    <path d="M0 9.969V8.113C0 6.638 0.859 5.887 2.275 5.887H3.662C3.106 5.32 2.764 4.558 2.764 3.689C2.764 1.658 4.404 0.193 6.426 0.193C7.988 0.193 9.346 1.111 9.805 2.742C10.264 1.111 11.621 0.193 13.184 0.193C15.205 0.193 16.836 1.658 16.836 3.689C16.836 4.558 16.494 5.32 15.938 5.887H17.334C18.779 5.887 19.609 6.638 19.609 8.113V9.969C19.609 11.121 18.916 11.736 17.783 11.736H10.938V5.887H8.672V4.597C8.672 3.328 7.793 2.4 6.719 2.4C5.693 2.4 5.049 3.045 5.049 4.031C5.049 5.066 5.869 5.887 7.295 5.887H8.672V11.736H1.816C0.693 11.736 0 11.121 0 9.969ZM12.891 2.4C11.816 2.4 10.938 3.328 10.938 4.597V5.887H12.314C13.74 5.887 14.551 5.066 14.551 4.031C14.551 3.045 13.916 2.4 12.891 2.4ZM1.27 18.709V13.162H8.672V21.404H4.043C2.295 21.404 1.27 20.437 1.27 18.709ZM10.938 21.404V13.162H18.33V18.709C18.33 20.437 17.305 21.404 15.566 21.404H10.938Z" fill={color}/>
  </svg>
);

// Emoji 아이콘
const DiscordEmojiIcon = ({ color = '#C7C8CE', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <path d="M11 0C17.075 0.003 22 4.925 22 11C22 16.939 17.433 21.727 11.5 22C5.425 22.279 0.273 17.575 0 11.5C-0.279 5.292 4.785 -0.003 11 0ZM15.5 14.5C16.053 13.875 15 12.5 14.5 13C14.403 13.097 14.286 13.226 14.155 13.372C13.611 13.977 12.805 14.872 12 15C11.244 15.12 10.755 15.123 10 15C9.406 14.903 8.808 14.251 8.318 13.717C7.983 13.352 7.698 13.041 7.5 13C6.571 12.808 5.839 13.77 6.5 14.5C7.449 15.548 8.999 17 9.5 17C9.575 17 9.732 17.008 9.932 17.019C10.571 17.052 11.658 17.11 12 17C13.413 16.486 14.185 15.986 15.5 14.5ZM5.5 9C4.671 9 4 9.672 4 10.5C4 11.328 4.671 12 5.5 12C6.328 12 7 11.329 7 10.5C7 9.672 6.328 9 5.5 9ZM16.5 9C15.671 9 15 9.672 15 10.5C15 11.328 15.671 12 16.5 12C17.328 12 18 11.329 18 10.5C18 9.672 17.328 9 16.5 9Z" fill={color}/>
  </svg>
);

// Search 아이콘 (돋보기) - outline 스타일
const DiscordSearchIcon = ({ color = '#C7C8CE', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Mic 아이콘
const DiscordMicIcon = ({ color = '#C7C8CE', size = 15 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 15 21" fill="none">
    <path d="M7.396 13.826C5.443 13.826 4.135 12.371 4.135 10.291V3.758C4.135 1.668 5.443 0.222 7.396 0.222C9.34 0.222 10.648 1.668 10.648 3.758V10.291C10.648 12.371 9.34 13.826 7.396 13.826ZM0.404 10.447V8.465C0.404 8.055 0.727 7.732 1.137 7.732C1.557 7.732 1.879 8.055 1.879 8.465V10.388C1.879 13.719 4.047 15.926 7.396 15.926C10.736 15.926 12.904 13.719 12.904 10.388V8.465C12.904 8.055 13.236 7.732 13.646 7.732C14.057 7.732 14.379 8.055 14.379 8.465V10.447C14.379 14.275 11.859 16.961 8.129 17.273V19.549H11.752C12.162 19.549 12.494 19.881 12.494 20.291C12.494 20.701 12.162 21.023 11.752 21.023H3.031C2.621 21.023 2.289 20.701 2.289 20.291C2.289 19.881 2.621 19.549 3.031 19.549H6.654V17.273C2.934 16.961 0.404 14.275 0.404 10.447Z" fill={color}/>
  </svg>
);

const ChatPreview = () => {
  const conversation = useChatStore((s) => s.conversation);
  const theme = useChatStore((s) => s.theme);
  const statusBar = useChatStore((s) => s.statusBar);
  const getAuthor = useChatStore((s) => s.getAuthor);

  const { messages, title, authors } = conversation;
  const otherAuthor = authors.find((a) => a.id === 'other');

  // 연속 메시지 그룹 판별
  const getMessageGroupInfo = (index) => {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isFirstInGroup = !prev || prev.role !== current.role;
    const isLastInGroup = !next || next.role !== current.role;

    return { isFirstInGroup, isLastInGroup };
  };

  // 배경 스타일 계산
  const getBackgroundStyle = () => {
    if (theme.backgroundType === 'solid') {
      return { backgroundColor: theme.backgroundValue };
    }
    if (theme.backgroundType === 'gradient') {
      return { background: theme.backgroundValue };
    }
    return {
      backgroundImage: `url(${theme.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  // Discord iOS 모바일 레이아웃 - 실제 캡처본처럼 직사각형
  if (theme.id === 'discord') {
    return (
      <div
        id="chat-canvas"
        className="overflow-hidden flex flex-col"
        style={{
          width: theme.canvasWidth,
          height: theme.canvasHeight,
          fontFamily: theme.fontFamily,
          backgroundColor: discordColors.backgroundPrimary,
        }}
      >
        {/* iOS 상태바 (47px) - 토글 가능 */}
        {theme.showStatusBar && <DiscordIOSStatusBar statusBar={statusBar} />}

        {/* 네비게이션 헤더 (55px) */}
        <DiscordMobileNav title={title} avatar={otherAuthor?.avatarUrl} unreadCount={conversation.unreadCount} />

        {/* 메시지 영역 */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ padding: '10px' }}
        >
          {/* 날짜 구분선 - 한국어 형식 */}
          <DiscordDateDivider />

          {/* 메시지 리스트 */}
          <div className="flex-1 flex flex-col gap-0">
            {messages.map((message, index) => {
              const { isFirstInGroup, isLastInGroup } = getMessageGroupInfo(index);
              const author = getAuthor(message.authorId);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  author={author}
                  theme={theme}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        </div>

        {/* 하단 메시지 바 (92px) */}
        <DiscordMobileBottomNav title={title} />
      </div>
    );
  }

  // 기존 플랫폼 레이아웃 (카카오, 텔레그램, 인스타)
  return (
    <div
      id="chat-canvas"
      className="overflow-hidden flex flex-col"
      style={{
        width: theme.canvasWidth,
        height: theme.canvasHeight,
        fontFamily: theme.fontFamily,
        ...getBackgroundStyle(),
      }}
    >
      {/* 상태바 (iOS 스타일) */}
      {theme.showStatusBar && (
        <StatusBar statusBar={statusBar} theme={theme} />
      )}

      {/* 채팅 헤더 */}
      {theme.showHeader && (
        <ChatHeader
          title={title}
          theme={theme}
          avatar={otherAuthor?.avatarUrl}
        />
      )}

      {/* 메시지 리스트 */}
      <div
        className="flex-1 overflow-hidden flex flex-col justify-end"
        style={{ paddingTop: 8, paddingBottom: 8 }}
      >
        {messages.map((message, index) => {
          const { isFirstInGroup, isLastInGroup } = getMessageGroupInfo(index);
          const author = getAuthor(message.authorId);

          return (
            <MessageBubble
              key={message.id}
              message={message}
              author={author}
              theme={theme}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
            />
          );
        })}
      </div>

      {/* 입력창 (데코용) */}
      <InputAreaDecoration theme={theme} title={title} />
    </div>
  );
};

// ============================================
// Discord iOS 모바일 전용 컴포넌트
// ============================================

// iOS 상태바 (47px) - 노치 포함
const DiscordIOSStatusBar = ({ statusBar }) => {
  const formatTime = (time) => {
    // "12:30" 형식 또는 "오후 12:30" 형식을 "12:30"으로 변환
    if (time.includes('오전') || time.includes('오후')) {
      return time.replace(/오[전후]\s?/, '');
    }
    return time;
  };

  return (
    <div
      className="relative flex items-center justify-between"
      style={{
        width: '100%',
        height: 47,
        padding: '14px 27px 0',
        backgroundColor: discordColors.backgroundPrimary,
      }}
    >
      {/* 노치 */}
      <div
        className="absolute"
        style={{
          width: 156,
          height: 33,
          left: 'calc(50% - 78px)',
          top: -2,
          backgroundColor: discordColors.notchBg,
          borderRadius: '0 0 20px 20px',
        }}
      />

      {/* 시간 (왼쪽) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 17,
          lineHeight: '22px',
          color: discordColors.statusBarText,
          letterSpacing: '-0.408px',
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* 우측 아이콘들 (Signal, WiFi, Battery) */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="6" width="3" height="6" rx="0.5" fill="#DADADA"/>
          <rect x="4" y="4" width="3" height="8" rx="0.5" fill="#DADADA"/>
          <rect x="8" y="2" width="3" height="10" rx="0.5" fill="#DADADA"/>
          <rect x="12" y="0" width="3" height="12" rx="0.5" fill="white"/>
        </svg>

        {/* WiFi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path d="M8.5 2.5C11.5 2.5 14 4 15.5 6" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8.5 5C10.5 5 12 6 13 7.5" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8.5 7.5C9.5 7.5 10.5 8 11 9" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8.5" cy="10.5" r="1.5" fill="white"/>
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            className="relative"
            style={{
              width: 25,
              height: 13,
              border: '1.05px solid rgba(255,255,255,0.35)',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 2,
                width: `${Math.min(statusBar.battery, 100) * 0.21}px`,
                height: 9,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Battery cap */}
          <div
            style={{
              width: 1.4,
              height: 4.2,
              backgroundColor: 'rgba(255,255,255,0.4)',
              marginLeft: 1,
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Discord 모바일 네비게이션 헤더 - 실제 디스코드와 동일
const DiscordMobileNav = ({ title, avatar, unreadCount = 0 }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 52,
        padding: '8px 16px',
        backgroundColor: discordColors.backgroundPrimary,
      }}
    >
      {/* 왼쪽: 뒤로가기 + 프로필 + 이름 */}
      <div className="flex items-center" style={{ gap: 10 }}>
        {/* 뒤로가기 버튼 (알림 뱃지 포함) */}
        <div className="relative" style={{ width: 24, height: 24 }}>
          <DiscordBackIcon color={discordColors.headerSecondary} size={24} />
          {/* 알림 뱃지 */}
          {unreadCount > 0 && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                minWidth: 18,
                height: 18,
                left: -4,
                bottom: -6,
                backgroundColor: '#ED4245',
                borderRadius: 9,
                padding: '0 5px',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#FFFFFF',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* 프로필 사진 - 원형 */}
        <div className="relative">
          <img
            src={avatar}
            alt={title}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          {/* 온라인 상태 점 */}
          <div
            className="absolute"
            style={{
              width: 12,
              height: 12,
              right: -2,
              bottom: -2,
              backgroundColor: '#23A55A',
              border: `3px solid ${discordColors.backgroundPrimary}`,
              borderRadius: '50%',
            }}
          />
        </div>

        {/* 유저네임 + 화살표 */}
        <div className="flex items-center" style={{ gap: 4 }}>
          <span
            style={{
              fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 17,
              color: '#FFFFFF',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 14,
              color: '#B5BAC1',
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* 오른쪽: 통화, 영상, 검색 버튼 (배경 없이 아이콘만) */}
      <div className="flex items-center" style={{ gap: 18 }}>
        <DiscordPhoneIcon color={discordColors.headerSecondary} size={24} />
        <DiscordVideoIcon color={discordColors.headerSecondary} size={26} />
        <DiscordSearchIcon color={discordColors.headerSecondary} size={24} />
      </div>
    </div>
  );
};

// Discord 날짜 구분선 - 한국어 형식 (YYYY년 M월 D일)
const DiscordDateDivider = () => {
  // 오늘 날짜를 한국어 형식으로 변환
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const formattedDate = `${year}년 ${month}월 ${day}일`;

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: '100%',
        height: 32,
        padding: '12px 10px',
      }}
    >
      <div
        className="flex items-center"
        style={{ width: '100%', gap: 8 }}
      >
        {/* 왼쪽 선 */}
        <div
          style={{
            flex: 1,
            height: 1,
            backgroundColor: discordColors.backgroundDivider,
          }}
        />
        {/* 날짜 텍스트 */}
        <span
          style={{
            fontFamily: "'SF Compact', -apple-system, sans-serif",
            fontWeight: 457,
            fontSize: 12,
            color: discordColors.textPlaceholder,
            letterSpacing: '-0.02em',
          }}
        >
          {formattedDate}
        </span>
        {/* 오른쪽 선 */}
        <div
          style={{
            flex: 1,
            height: 1,
            backgroundColor: discordColors.backgroundDivider,
          }}
        />
      </div>
    </div>
  );
};

// Discord 모바일 하단 메시지 바 (92px)
const DiscordMobileBottomNav = ({ title }) => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        height: 92,
        backgroundColor: discordColors.backgroundPrimary,
        borderTop: `1px solid ${discordColors.borderPrimary}`,
      }}
    >
      {/* 메시지 입력 영역 (79px) */}
      <div
        className="flex items-center"
        style={{
          flex: 1,
          padding: '0 13px',
          gap: 7,
        }}
      >
        {/* + 버튼 */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordPlusIcon color={discordColors.headerSecondary} size={20} />
        </div>

        {/* 활동 아이콘 (Video camera) */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordActivityIcon color={discordColors.headerSecondary} size={22} />
        </div>

        {/* Gift 아이콘 */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordGiftIcon color={discordColors.headerSecondary} size={20} />
        </div>

        {/* 메시지 입력 필드 */}
        <div
          className="flex items-center flex-1"
          style={{
            height: 42,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 22,
            padding: '10px',
            gap: 6,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: discordColors.textPlaceholder,
              letterSpacing: '-0.507px',
            }}
          >
            @{title}에 메시지...
          </span>
          {/* 이모지 버튼 */}
          <DiscordEmojiIcon color={discordColors.headerSecondary} size={22} />
        </div>

        {/* 마이크 버튼 */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordMicIcon color={discordColors.headerSecondary} size={15} />
        </div>
      </div>

      {/* 홈 인디케이터 (13px) */}
      <div
        className="flex items-start justify-center"
        style={{
          width: '100%',
          height: 13,
          padding: '0 125px 8px',
        }}
      >
        <div
          style={{
            width: 139,
            height: 5,
            backgroundColor: discordColors.homeIndicator,
            borderRadius: 100,
          }}
        />
      </div>
    </div>
  );
};


// ============================================
// 기존 플랫폼용 컴포넌트 (카카오, 텔레그램, 인스타)
// ============================================

// 채팅 헤더 컴포넌트
const ChatHeader = ({ title, theme, avatar }) => {
  // 플랫폼별 헤더 스타일
  const getHeaderContent = () => {
    switch (theme.id) {
      case 'kakao':
        return <KakaoHeader title={title} theme={theme} avatar={avatar} />;
      case 'telegram':
        return <TelegramHeader title={title} theme={theme} avatar={avatar} />;
      case 'insta':
        return <InstaHeader title={title} theme={theme} avatar={avatar} />;
      default:
        return <KakaoHeader title={title} theme={theme} avatar={avatar} />;
    }
  };

  return (
    <div
      className="flex items-center"
      style={{
        backgroundColor: theme.headerBg,
        height: 48,
        padding: '0 16px',
      }}
    >
      {getHeaderContent()}
    </div>
  );
};

// 카카오톡 헤더
const KakaoHeader = ({ title, theme, avatar }) => (
  <>
    <button className="p-2 -ml-2" style={{ color: theme.headerTitleColor }}>
      <ChevronLeft size={24} />
    </button>
    {avatar && (
      <img src={avatar} alt="" className="w-8 h-8 rounded-lg mr-2" />
    )}
    <span
      className="flex-1 font-semibold truncate"
      style={{
        color: theme.headerTitleColor,
        fontSize: theme.headerTitleSize,
        textAlign: theme.headerTitleAlign,
      }}
    >
      {title}
    </span>
    <div className="flex gap-2" style={{ color: theme.headerTitleColor }}>
      <Search size={20} />
      <MoreVertical size={20} />
    </div>
  </>
);

// 텔레그램 헤더
const TelegramHeader = ({ title, theme, avatar }) => (
  <>
    <button className="p-2 -ml-2" style={{ color: theme.headerTitleColor }}>
      <ChevronLeft size={24} />
    </button>
    <div className="flex-1 text-center">
      {avatar && (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full mx-auto mb-0.5" />
      )}
      <span
        className="font-semibold block"
        style={{ color: theme.headerTitleColor, fontSize: theme.headerTitleSize }}
      >
        {title}
      </span>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
        last seen recently
      </span>
    </div>
    <div className="w-8" />
  </>
);

// 인스타그램 헤더
const InstaHeader = ({ title, theme, avatar }) => (
  <>
    <button className="p-2 -ml-2" style={{ color: theme.headerTitleColor }}>
      <ChevronLeft size={24} />
    </button>
    {avatar && (
      <img src={avatar} alt="" className="w-7 h-7 rounded-full mr-2" />
    )}
    <div className="flex-1">
      <span
        className="font-semibold block"
        style={{ color: theme.headerTitleColor, fontSize: theme.headerTitleSize }}
      >
        {title}
      </span>
      <span className="text-xs text-gray-500">Active now</span>
    </div>
    <div className="flex gap-4" style={{ color: theme.headerTitleColor }}>
      <Phone size={20} />
      <MoreVertical size={20} />
    </div>
  </>
);

// 기타 플랫폼 입력창 데코레이션
const InputAreaDecoration = ({ theme, title }) => {
  const bgColor = '#FFFFFF';
  const borderColor = '#E5E5E5';

  return (
    <div
      className="h-14 px-3 flex items-center gap-2"
      style={{
        backgroundColor: bgColor,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      <div
        className="flex-1 h-9 rounded-full px-4 flex items-center"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        <span className="text-gray-400 text-sm">메시지를 입력하세요</span>
      </div>
    </div>
  );
};

export default ChatPreview;
