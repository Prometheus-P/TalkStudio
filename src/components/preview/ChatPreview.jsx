/**
 * ChatPreview - 채팅 미리보기 캔버스
 * html2canvas로 캡처될 대상 DOM
 * Discord iOS Mobile UI 디자인 시스템 적용
 */
import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Search, Phone } from 'lucide-react';
import StatusBar from './StatusBar';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';
import useChatStore from '../../store/useChatStore';
import { discordColors, kakaoColors, telegramColors, instagramColors } from '../../themes/presets';

// ============================================
// Discord iOS Mobile SVG Icons (from Figma export)
// ============================================

// 뒤로가기 화살표 아이콘
const DiscordBackIcon = ({ color = '#C7C8CE', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 15" fill="none">
    <path d="M0.328 7.128C0.328 6.785 0.478 6.425 0.715 6.188L6.437 0.475C6.709 0.202 7.026 0.07 7.333 0.07C8.08 0.07 8.59 0.589 8.59 1.274C8.59 1.661 8.423 1.96 8.186 2.189L6.217 4.166L4.275 5.959L6.191 5.854H16.122C16.913 5.854 17.441 6.363 17.441 7.128C17.441 7.884 16.913 8.402 16.122 8.402H6.191L4.266 8.297L6.217 10.09L8.186 12.059C8.423 12.287 8.59 12.595 8.59 12.973C8.59 13.658 8.08 14.177 7.333 14.177C7.026 14.177 6.709 14.045 6.446 13.781L0.715 8.068C0.478 7.831 0.328 7.471 0.328 7.128Z" fill={color}/>
  </svg>
);

// 전화 아이콘 (Nav bar)
const DiscordPhoneIcon = ({ color = '#C7C8CE', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 15 15" fill="none">
    <path d="M4.307 9.728C3.603 9.029 2.971 8.297 2.41 7.53C1.853 6.759 1.414 5.99 1.091 5.223C0.769 4.457 0.608 3.729 0.608 3.04C0.608 2.582 0.688 2.149 0.85 1.744C1.011 1.339 1.269 0.97 1.626 0.638C2.051 0.238 2.507 0.038 2.996 0.038C3.206 0.038 3.403 0.082 3.589 0.169C3.779 0.252 3.943 0.389 4.08 0.58L5.588 2.704C5.71 2.875 5.801 3.036 5.859 3.187C5.918 3.334 5.947 3.468 5.947 3.59C5.947 3.761 5.901 3.924 5.808 4.081C5.72 4.232 5.596 4.388 5.435 4.549L4.929 5.069C4.856 5.138 4.819 5.226 4.819 5.333C4.819 5.387 4.827 5.44 4.841 5.494C4.861 5.543 4.883 5.587 4.907 5.626C5.024 5.851 5.232 6.139 5.53 6.49C5.828 6.837 6.152 7.186 6.504 7.538C6.855 7.889 7.205 8.214 7.551 8.512C7.903 8.805 8.191 9.015 8.415 9.142C8.45 9.161 8.491 9.181 8.54 9.2C8.594 9.215 8.65 9.222 8.708 9.222C8.816 9.222 8.906 9.186 8.979 9.112L9.492 8.607C9.653 8.446 9.81 8.321 9.961 8.233C10.117 8.141 10.278 8.094 10.444 8.094C10.571 8.094 10.708 8.124 10.854 8.182C11.001 8.236 11.16 8.326 11.331 8.453L13.477 9.977C13.662 10.104 13.796 10.26 13.879 10.445C13.967 10.631 14.011 10.824 14.011 11.024C14.011 11.263 13.957 11.5 13.85 11.734C13.743 11.969 13.596 12.193 13.411 12.408C13.083 12.77 12.717 13.033 12.312 13.199C11.912 13.365 11.479 13.448 11.016 13.448C10.327 13.448 9.597 13.285 8.826 12.958C8.059 12.635 7.288 12.191 6.511 11.625C5.74 11.063 5.005 10.431 4.307 9.728Z" fill={color}/>
  </svg>
);

// 비디오 아이콘 (Nav bar)
const DiscordVideoIcon = ({ color = '#C7C8CE', size = 17 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 17 13" fill="none">
    <path d="M1.699 11.806C0.894 11.806 0.273 11.608 -0.161 11.212C-0.596 10.822 -0.813 10.238 -0.813 9.462V2.628C-0.813 1.852 -0.593 1.252 -0.154 0.827C0.291 0.402 0.908 0.19 1.699 0.19H8.848C9.648 0.19 10.259 0.402 10.679 0.827C11.099 1.252 11.309 1.85 11.309 2.621V9.367C11.309 10.143 11.091 10.744 10.657 11.169C10.222 11.593 9.604 11.806 8.804 11.806H1.699ZM12.407 8.437V3.632L14.604 1.75C14.78 1.603 14.951 1.486 15.117 1.398C15.283 1.31 15.452 1.266 15.623 1.266C15.916 1.266 16.157 1.364 16.348 1.559C16.538 1.75 16.633 2.006 16.633 2.328V9.74C16.633 10.063 16.538 10.321 16.348 10.517C16.157 10.707 15.916 10.802 15.623 10.802C15.452 10.802 15.283 10.758 15.117 10.67C14.951 10.583 14.78 10.468 14.604 10.326L12.407 8.437Z" transform="translate(0.813 0)" fill={color}/>
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

  // Discord iOS 모바일 레이아웃 - 폰 크기로 스케일 (쇼츠 포함)
  if (theme.id === 'discord' || theme.id === 'discord-shorts') {
    const scale = 0.7; // 적절한 크기로 스케일
    const scaledHeight = theme.canvasHeight * scale;
    const scaledWidth = theme.canvasWidth * scale;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
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

        {/* iOS 상태바 (47px) - 노치 포함 */}
        <DiscordIOSStatusBar statusBar={statusBar} />

        {/* 네비게이션 헤더 (55px) */}
        <DiscordMobileNav title={title} avatar={otherAuthor?.avatarUrl} unreadCount={conversation.unreadCount} />

        {/* 메시지 영역 */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ padding: '10px' }}
        >
          {/* 메시지 리스트 */}
          <div className="flex-1 flex flex-col gap-0">
            {messages.map((message, index) => {
              // 날짜 구분선 메시지 처리
              if (message.type === 'dateDivider') {
                return (
                  <DateDivider
                    key={message.id}
                    date={message.text}
                    themeId={theme.id}
                    theme={theme}
                  />
                );
              }

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
        </div>
      </div>
    );
  }

  // KakaoTalk iOS 모바일 레이아웃 (쇼츠 포함)
  if (theme.id === 'kakao' || theme.id === 'kakao-shorts') {
    const scale = 0.75;
    const scaledHeight = theme.canvasHeight * scale;
    const scaledWidth = theme.canvasWidth * scale;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <div
            id="chat-canvas"
            className="overflow-hidden flex flex-col"
            style={{
              width: theme.canvasWidth,
              height: theme.canvasHeight,
              fontFamily: theme.fontFamily,
              backgroundColor: kakaoColors.backgroundPrimary,
            }}
          >
            {/* iOS 상태바 */}
            <KakaoIOSStatusBar statusBar={statusBar} />

            {/* 카카오톡 헤더 */}
            <KakaoMobileNav title={title} avatar={otherAuthor?.avatarUrl} />

            {/* 메시지 영역 */}
            <div
              className="flex-1 flex flex-col overflow-hidden justify-end"
              style={{ padding: '8px 0' }}
            >
              {messages.map((message, index) => {
                // 날짜 구분선 메시지 처리
                if (message.type === 'dateDivider') {
                  return (
                    <DateDivider
                      key={message.id}
                      date={message.text}
                      themeId={theme.id}
                      theme={theme}
                    />
                  );
                }

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

            {/* 카카오톡 입력창 */}
            <KakaoInputBar />
          </div>
        </div>
      </div>
    );
  }

  // Telegram iOS 모바일 레이아웃 (쇼츠 포함)
  if (theme.id === 'telegram' || theme.id === 'telegram-shorts') {
    const scale = 0.75;
    const scaledHeight = theme.canvasHeight * scale;
    const scaledWidth = theme.canvasWidth * scale;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <div
            id="chat-canvas"
            className="overflow-hidden flex flex-col"
            style={{
              width: theme.canvasWidth,
              height: theme.canvasHeight,
              fontFamily: theme.fontFamily,
              background: `linear-gradient(180deg, ${telegramColors.backgroundGradientStart} 0%, ${telegramColors.backgroundGradientEnd} 100%)`,
            }}
          >
            {/* iOS 상태바 */}
            <TelegramIOSStatusBar statusBar={statusBar} />

            {/* 텔레그램 헤더 */}
            <TelegramMobileNav title={title} avatar={otherAuthor?.avatarUrl} />

            {/* 메시지 영역 */}
            <div
              className="flex-1 flex flex-col overflow-hidden justify-end"
              style={{ padding: '8px 0' }}
            >
              {messages.map((message, index) => {
                // 날짜 구분선 메시지 처리
                if (message.type === 'dateDivider') {
                  return (
                    <DateDivider
                      key={message.id}
                      date={message.text}
                      themeId={theme.id}
                      theme={theme}
                    />
                  );
                }

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

            {/* 텔레그램 입력창 */}
            <TelegramInputBar />
          </div>
        </div>
      </div>
    );
  }

  // Instagram iOS 모바일 레이아웃 (쇼츠 포함)
  if (theme.id === 'insta' || theme.id === 'insta-shorts') {
    const scale = 0.75;
    const scaledHeight = theme.canvasHeight * scale;
    const scaledWidth = theme.canvasWidth * scale;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <div
            id="chat-canvas"
            className="overflow-hidden flex flex-col"
            style={{
              width: theme.canvasWidth,
              height: theme.canvasHeight,
              fontFamily: theme.fontFamily,
              backgroundColor: instagramColors.backgroundPrimary,
            }}
          >
            {/* iOS 상태바 */}
            <InstagramIOSStatusBar statusBar={statusBar} />

            {/* 인스타그램 헤더 */}
            <InstagramMobileNav title={title} avatar={otherAuthor?.avatarUrl} />

            {/* 메시지 영역 */}
            <div
              className="flex-1 flex flex-col overflow-hidden justify-end"
              style={{ padding: '8px 0' }}
            >
              {messages.map((message, index) => {
                // 날짜 구분선 메시지 처리
                if (message.type === 'dateDivider') {
                  return (
                    <DateDivider
                      key={message.id}
                      date={message.text}
                      themeId={theme.id}
                      theme={theme}
                    />
                  );
                }

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

            {/* 인스타그램 입력창 */}
            <InstagramInputBar />
          </div>
        </div>
      </div>
    );
  }

  // 기본 레이아웃 (fallback)
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

      {/* 메시지 리스트 - 성능 최적화 */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-end"
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          contain: 'layout style',
          willChange: 'scroll-position',
        }}
      >
        {messages.map((message, index) => {
          // 날짜 구분선 메시지 처리
          if (message.type === 'dateDivider') {
            return (
              <DateDivider
                key={message.id}
                date={message.text}
                themeId={theme.id}
                theme={theme}
              />
            );
          }

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

// Discord 모바일 네비게이션 헤더 (55px)
const DiscordMobileNav = ({ title, avatar, unreadCount = 0 }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 55,
        padding: '11px 10px 11px 13px',
        backgroundColor: discordColors.backgroundPrimary,
        borderBottom: `1px solid ${discordColors.borderPrimary}`,
      }}
    >
      {/* 왼쪽: 뒤로가기 + 프로필 + 이름 */}
      <div className="flex items-center" style={{ gap: 10 }}>
        {/* 뒤로가기 버튼 (알림 뱃지 포함) */}
        <div className="relative">
          <div
            className="flex items-center justify-center"
            style={{
              width: 33,
              height: 33,
              borderRadius: 23,
            }}
          >
            <DiscordBackIcon color={discordColors.headerSecondary} size={18} />
          </div>
          {/* 알림 뱃지 - unreadCount가 0보다 클 때만 표시 */}
          {unreadCount > 0 && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: unreadCount > 99 ? 28 : 21,
                height: 16,
                left: 15,
                top: 22,
                backgroundColor: discordColors.notificationRed,
                border: `3px solid ${discordColors.borderNotification}`,
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'gg sans', sans-serif",
                  fontWeight: 700,
                  fontSize: unreadCount > 99 ? 10 : 12,
                  color: '#FFFFFF',
                  letterSpacing: '0.03em',
                }}
              >
                {unreadCount > 999 ? '999+' : unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* 프로필 사진 */}
        <div className="relative">
          <img
            src={avatar}
            alt={title}
            style={{
              width: 33,
              height: 33,
              borderRadius: 22,
            }}
          />
          {/* 온라인 상태 점 */}
          <div
            className="absolute"
            style={{
              width: 10,
              height: 10,
              right: 0,
              bottom: 0,
              backgroundColor: discordColors.statusOnline,
              border: `3px solid ${discordColors.backgroundPrimary}`,
              borderRadius: '50%',
            }}
          />
        </div>

        {/* 유저네임 + 화살표 */}
        <div className="flex items-center" style={{ gap: 1 }}>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: discordColors.headerPrimary,
              letterSpacing: '-0.408px',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 9,
              color: '#FFFFFF',
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* 오른쪽: 통화, 영상 버튼 */}
      <div className="flex items-center" style={{ gap: 12, paddingRight: 6 }}>
        {/* 통화 버튼 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 33,
            height: 33,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 23,
          }}
        >
          <DiscordPhoneIcon color={discordColors.headerSecondary} size={15} />
        </div>

        {/* 영상 버튼 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 33,
            height: 33,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 23,
          }}
        >
          <DiscordVideoIcon color={discordColors.headerSecondary} size={17} />
        </div>
      </div>
    </div>
  );
};

// Discord 날짜 구분선
const DiscordDateDivider = ({ date }) => (
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
        {date}
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

// Discord 모바일 하단 메시지 바 (92px)
const DiscordMobileBottomNav = ({ title: _title }) => {
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
            Send a message..
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
// KakaoTalk iOS 모바일 전용 컴포넌트
// ============================================

// KakaoTalk iOS 상태바 (44px)
const KakaoIOSStatusBar = ({ statusBar }) => {
  const formatTime = (time) => {
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
        height: 44,
        padding: '14px 16px 0',
        backgroundColor: kakaoColors.backgroundHeader,
      }}
    >
      {/* 노치 */}
      <div
        className="absolute"
        style={{
          width: 150,
          height: 30,
          left: 'calc(50% - 75px)',
          top: -2,
          backgroundColor: kakaoColors.notchBg,
          borderRadius: '0 0 18px 18px',
        }}
      />

      {/* 시간 (왼쪽) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: kakaoColors.statusBarText,
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* 우측 아이콘들 */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill="rgba(255,255,255,0.5)"/>
          <rect x="4" y="4" width="3" height="7" rx="0.5" fill="rgba(255,255,255,0.5)"/>
          <rect x="8" y="2" width="3" height="9" rx="0.5" fill="#FFFFFF"/>
          <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#FFFFFF"/>
        </svg>

        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C10.5 2 12.5 3 14 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 5C9.8 5 11.2 5.8 12 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="10" r="1.5" fill="#FFFFFF"/>
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            style={{
              width: 24,
              height: 12,
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 1,
                width: `${Math.min(statusBar.battery, 100) * 0.2}px`,
                height: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              width: 1.5,
              height: 4,
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

// KakaoTalk 모바일 네비게이션 헤더 (56px)
const KakaoMobileNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 56,
        padding: '8px 12px',
        backgroundColor: kakaoColors.backgroundHeader,
      }}
    >
      {/* 왼쪽: 뒤로가기 */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <ChevronLeft size={28} color={kakaoColors.iconColor} />
      </div>

      {/* 중앙: 프로필 + 이름 */}
      <div className="flex items-center" style={{ gap: 8 }}>
        {avatar && (
          <img
            src={avatar}
            alt={title}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
            }}
          />
        )}
        <span
          style={{
            fontFamily: "'Apple SD Gothic Neo', sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: kakaoColors.headerText,
          }}
        >
          {title}
        </span>
      </div>

      {/* 오른쪽: 검색, 메뉴 */}
      <div className="flex items-center" style={{ gap: 16 }}>
        <Search size={22} color={kakaoColors.iconColor} />
        <MoreVertical size={22} color={kakaoColors.iconColor} />
      </div>
    </div>
  );
};

// KakaoTalk 입력창 (56px)
const KakaoInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: kakaoColors.inputBg,
        borderTop: `1px solid ${kakaoColors.inputBorder}`,
      }}
    >
      {/* 입력 영역 */}
      <div
        className="flex items-center"
        style={{
          padding: '8px 12px',
          gap: 8,
        }}
      >
        {/* + 버튼 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#F5F5F5',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke={kakaoColors.inputIconColor} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 텍스트 입력 */}
        <div
          className="flex-1 flex items-center"
          style={{
            height: 36,
            backgroundColor: '#F5F5F5',
            borderRadius: 18,
            padding: '0 14px',
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: kakaoColors.inputPlaceholder,
            }}
          >
            메시지를 입력하세요
          </span>
        </div>

        {/* 이모티콘 */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={kakaoColors.inputIconColor} strokeWidth="1.5"/>
            <circle cx="8" cy="10" r="1.5" fill={kakaoColors.inputIconColor}/>
            <circle cx="16" cy="10" r="1.5" fill={kakaoColors.inputIconColor}/>
            <path d="M8 15C9 16.5 11 17 12 17C13 17 15 16.5 16 15" stroke={kakaoColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* # 버튼 */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 8H18M4 14H18M8 4V18M14 4V18" stroke={kakaoColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* 홈 인디케이터 */}
      <div
        className="flex items-center justify-center"
        style={{ height: 20, paddingBottom: 8 }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            backgroundColor: '#000000',
            borderRadius: 100,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// Telegram iOS 모바일 전용 컴포넌트
// ============================================

// Telegram iOS 상태바 (44px)
const TelegramIOSStatusBar = ({ statusBar }) => {
  const formatTime = (time) => {
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
        height: 44,
        padding: '14px 16px 0',
        backgroundColor: telegramColors.backgroundHeader,
      }}
    >
      {/* 노치 */}
      <div
        className="absolute"
        style={{
          width: 150,
          height: 30,
          left: 'calc(50% - 75px)',
          top: -2,
          backgroundColor: telegramColors.notchBg,
          borderRadius: '0 0 18px 18px',
        }}
      />

      {/* 시간 (왼쪽) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: telegramColors.statusBarText,
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* 우측 아이콘들 */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill="rgba(255,255,255,0.5)"/>
          <rect x="4" y="4" width="3" height="7" rx="0.5" fill="rgba(255,255,255,0.5)"/>
          <rect x="8" y="2" width="3" height="9" rx="0.5" fill="#FFFFFF"/>
          <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#FFFFFF"/>
        </svg>

        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C10.5 2 12.5 3 14 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 5C9.8 5 11.2 5.8 12 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="10" r="1.5" fill="#FFFFFF"/>
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            style={{
              width: 24,
              height: 12,
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 1,
                width: `${Math.min(statusBar.battery, 100) * 0.2}px`,
                height: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              width: 1.5,
              height: 4,
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

// Telegram 모바일 네비게이션 헤더 (56px) - iOS 스타일
const TelegramMobileNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center"
      style={{
        width: '100%',
        height: 56,
        padding: '0 8px',
        backgroundColor: telegramColors.backgroundHeader,
      }}
    >
      {/* 왼쪽: 뒤로가기 */}
      <div className="flex items-center" style={{ gap: 0 }}>
        <ChevronLeft size={26} color={telegramColors.headerText} strokeWidth={2} />
        <span style={{ fontSize: 17, color: telegramColors.headerText, marginLeft: -2 }}>Back</span>
      </div>

      {/* 중앙: 프로필 + 이름 + 상태 (가로 배치) */}
      <div className="flex-1 flex items-center justify-center" style={{ gap: 10 }}>
        {avatar && (
          <div className="relative">
            <img
              src={avatar}
              alt={title}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
              }}
            />
            {/* 온라인 상태 점 */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: telegramColors.onlineIndicator,
                borderRadius: '50%',
                border: `2px solid ${telegramColors.backgroundHeader}`,
              }}
            />
          </div>
        )}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: telegramColors.headerText,
              lineHeight: 1.2,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 13,
              color: telegramColors.subtitleText,
              lineHeight: 1.2,
            }}
          >
            online
          </span>
        </div>
      </div>

      {/* 오른쪽: 더보기 */}
      <div className="flex items-center">
        <MoreVertical size={22} color={telegramColors.headerText} />
      </div>
    </div>
  );
};

// Telegram 입력창 (52px)
const TelegramInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: telegramColors.inputBg,
      }}
    >
      {/* 입력 영역 */}
      <div
        className="flex items-center"
        style={{
          padding: '6px 8px',
          gap: 8,
        }}
      >
        {/* 클립 (첨부) */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
              stroke={telegramColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 텍스트 입력 */}
        <div
          className="flex-1 flex items-center"
          style={{
            height: 36,
            backgroundColor: '#F5F5F5',
            borderRadius: 18,
            padding: '0 14px',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: telegramColors.inputPlaceholder,
            }}
          >
            Message
          </span>
        </div>

        {/* 이모티콘 */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={telegramColors.inputIconColor} strokeWidth="1.5"/>
            <circle cx="8" cy="10" r="1.5" fill={telegramColors.inputIconColor}/>
            <circle cx="16" cy="10" r="1.5" fill={telegramColors.inputIconColor}/>
            <path d="M8 15C9 16.5 11 17 12 17C13 17 15 16.5 16 15" stroke={telegramColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 마이크 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            backgroundColor: '#64B5F6',
            borderRadius: '50%',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="#FFFFFF"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 홈 인디케이터 */}
      <div
        className="flex items-center justify-center"
        style={{ height: 20, paddingBottom: 8 }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            backgroundColor: '#000000',
            borderRadius: 100,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// Instagram iOS 모바일 전용 컴포넌트
// ============================================

// Instagram iOS 상태바 (44px)
const InstagramIOSStatusBar = ({ statusBar }) => {
  const formatTime = (time) => {
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
        height: 44,
        padding: '14px 16px 0',
        backgroundColor: instagramColors.backgroundHeader,
      }}
    >
      {/* 노치 */}
      <div
        className="absolute"
        style={{
          width: 150,
          height: 30,
          left: 'calc(50% - 75px)',
          top: -2,
          backgroundColor: instagramColors.notchBg,
          borderRadius: '0 0 18px 18px',
        }}
      />

      {/* 시간 (왼쪽) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: instagramColors.statusBarText,
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* 우측 아이콘들 */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
          <rect x="4" y="4" width="3" height="7" rx="0.5" fill="rgba(0,0,0,0.3)"/>
          <rect x="8" y="2" width="3" height="9" rx="0.5" fill="#000000"/>
          <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#000000"/>
        </svg>

        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C10.5 2 12.5 3 14 5" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 5C9.8 5 11.2 5.8 12 7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="10" r="1.5" fill="#000000"/>
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            style={{
              width: 24,
              height: 12,
              border: '1px solid rgba(0,0,0,0.35)',
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 1,
                width: `${Math.min(statusBar.battery, 100) * 0.2}px`,
                height: 8,
                backgroundColor: '#000000',
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              width: 1.5,
              height: 4,
              backgroundColor: 'rgba(0,0,0,0.4)',
              marginLeft: 1,
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Instagram 모바일 네비게이션 헤더 (60px)
const InstagramMobileNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 60,
        padding: '8px 16px',
        backgroundColor: instagramColors.backgroundHeader,
        borderBottom: `0.5px solid ${instagramColors.inputBorder}`,
      }}
    >
      {/* 왼쪽: 뒤로가기 */}
      <div className="flex items-center" style={{ width: 40 }}>
        <ChevronLeft size={28} color={instagramColors.iconColor} />
      </div>

      {/* 중앙: 프로필 + 이름 + 상태 */}
      <div className="flex items-center" style={{ gap: 12 }}>
        {avatar && (
          <div className="relative">
            <img
              src={avatar}
              alt={title}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
              }}
            />
            {/* 온라인 점 */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 10,
                height: 10,
                backgroundColor: '#44D62C',
                border: '2px solid #FFFFFF',
                borderRadius: '50%',
              }}
            />
          </div>
        )}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "'-apple-system', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: instagramColors.headerText,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: instagramColors.subtitleText,
            }}
          >
            Active now
          </span>
        </div>
      </div>

      {/* 오른쪽: 전화, 비디오 */}
      <div className="flex items-center" style={{ gap: 20 }}>
        <Phone size={24} color={instagramColors.iconColor} />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="14" height="14" rx="2" stroke={instagramColors.iconColor} strokeWidth="1.5"/>
          <path d="M16 10l4-3v10l-4-3v-4z" stroke={instagramColors.iconColor} strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

// Instagram 입력창 (56px)
const InstagramInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: instagramColors.inputBg,
        borderTop: `0.5px solid ${instagramColors.inputBorder}`,
      }}
    >
      {/* 입력 영역 */}
      <div
        className="flex items-center"
        style={{
          padding: '8px 12px',
          gap: 12,
        }}
      >
        {/* 카메라 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1.5px solid ${instagramColors.inputBorder}`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke={instagramColors.inputIconColor} strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke={instagramColors.inputIconColor} strokeWidth="1.5"/>
            <circle cx="18" cy="7" r="1" fill={instagramColors.inputIconColor}/>
          </svg>
        </div>

        {/* 텍스트 입력 */}
        <div
          className="flex-1 flex items-center"
          style={{
            height: 40,
            border: `1px solid ${instagramColors.inputBorder}`,
            borderRadius: 20,
            padding: '0 16px',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: instagramColors.inputPlaceholder,
            }}
          >
            Message...
          </span>
        </div>

        {/* 마이크 */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke={instagramColors.inputIconColor} strokeWidth="1.5"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke={instagramColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 이미지 */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke={instagramColors.inputIconColor} strokeWidth="1.5"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill={instagramColors.inputIconColor}/>
            <path d="M21 15l-5-5L5 21" stroke={instagramColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 하트/좋아요 */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              stroke={instagramColors.inputIconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 홈 인디케이터 */}
      <div
        className="flex items-center justify-center"
        style={{ height: 20, paddingBottom: 8 }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            backgroundColor: '#000000',
            borderRadius: 100,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// 기존 플랫폼용 컴포넌트 (fallback용)
// ============================================

// 채팅 헤더 컴포넌트
const ChatHeader = ({ title, theme, avatar }) => {
  // 플랫폼별 헤더 스타일
  const getHeaderContent = () => {
    switch (theme.id) {
      case 'kakao':
      case 'kakao-shorts':
        return <KakaoHeader title={title} theme={theme} avatar={avatar} />;
      case 'telegram':
      case 'telegram-shorts':
        return <TelegramHeader title={title} theme={theme} avatar={avatar} />;
      case 'insta':
      case 'insta-shorts':
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
      <span className="text-xs text-gray-600">Active now</span>
    </div>
    <div className="flex gap-4" style={{ color: theme.headerTitleColor }}>
      <Phone size={20} />
      <MoreVertical size={20} />
    </div>
  </>
);

// 기타 플랫폼 입력창 데코레이션
const InputAreaDecoration = ({ theme: _theme, title: _title }) => {
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
        <span className="text-gray-600 text-sm">메시지를 입력하세요</span>
      </div>
    </div>
  );
};

export default ChatPreview;
