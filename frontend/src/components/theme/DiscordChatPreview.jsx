/**
 * Discord Chat Preview Component
 * Pixel-perfect recreation of Discord mobile UI
 */

import { memo, useMemo, forwardRef } from 'react';
import ImageWithFallback from '../common/ImageWithFallback';

// Discord color palette for usernames
const DISCORD_NAME_COLORS = [
  '#f47b67', // Red
  '#f5a623', // Orange
  '#ffc107', // Yellow
  '#8bc34a', // Green
  '#00bcd4', // Cyan
  '#7289da', // Blurple
  '#9c84ef', // Purple
  '#e91e63', // Pink
  '#99aab5', // Gray
];

// Get consistent color for username
const getNameColor = (name) => {
  if (!name) return DISCORD_NAME_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DISCORD_NAME_COLORS[Math.abs(hash) % DISCORD_NAME_COLORS.length];
};

// Format timestamp for Discord style (2023.06.03. 오전 2:43)
const formatDiscordTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 || 12;

  // Real Discord format: 2023.06.03. 오전 2:43
  return `${year}.${month}.${day}. ${ampm} ${hour12}:${minutes}`;
};

// Format date for separator (Korean: 2023년 6월 26일)
const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * Discord Status Bar (iOS style)
 */
function DiscordStatusBar({ time = '10:30' }) {
  return (
    <div className="flex justify-between items-center px-6 py-2 bg-black text-white text-sm font-medium">
      <span>{time}</span>
      <div className="absolute left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl" />
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 22h20V2z"/>
        </svg>
        <svg className="w-6 h-4" viewBox="0 0 28 14">
          <rect x="0" y="0" width="24" height="14" rx="3" stroke="white" strokeWidth="1" fill="none" opacity="0.35"/>
          <rect x="2" y="2" width="18" height="10" rx="1.5" fill="white"/>
          <rect x="25" y="4" width="2" height="6" rx="1" fill="white" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

/**
 * Discord Header - DM style with notification badge
 */
function DiscordHeader({
  title = '상대방',
  avatar = null,
  notificationCount = 1
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#313338]">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Back button with notification badge */}
        <div className="relative">
          <button className="text-[#b5bac1]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {notificationCount > 0 && (
            <div className="absolute -top-1 -left-1 min-w-[16px] h-4 bg-[#ed4245] rounded-full flex items-center justify-center px-1">
              <span className="text-[10px] text-white font-bold">{notificationCount}</span>
            </div>
          )}
        </div>

        {/* Round avatar (Discord logo or user avatar) */}
        <div className="w-8 h-8 rounded-full bg-[#f9a825] flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
          )}
        </div>

        {/* Title with chevron */}
        <div className="flex items-center gap-1">
          <span className="text-white font-semibold text-base">{title}</span>
          <svg className="w-4 h-4 text-[#b5bac1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Right side - action buttons */}
      <div className="flex items-center gap-5">
        {/* Phone */}
        <button className="text-[#b5bac1]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </button>
        {/* Video */}
        <button className="text-[#b5bac1]">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </button>
        {/* Search */}
        <button className="text-[#b5bac1]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Date separator component with horizontal lines
 */
function DateSeparator({ date }) {
  return (
    <div className="flex items-center justify-center py-4 px-4">
      <div className="flex-1 h-[1px] bg-[#3f4147]" />
      <span className="px-4 text-[#949ba4] text-xs font-medium whitespace-nowrap">
        {date}
      </span>
      <div className="flex-1 h-[1px] bg-[#3f4147]" />
    </div>
  );
}

/**
 * Single Discord message
 */
const DiscordMessage = memo(function DiscordMessage({
  message,
  showAvatar = true,
}) {
  const { speaker_name, text, timestamp, avatar } = message;
  const nameColor = useMemo(() => getNameColor(speaker_name), [speaker_name]);
  const timeString = useMemo(() => formatDiscordTime(timestamp), [timestamp]);

  return (
    <div className="flex items-start gap-3 px-4 py-0.5 hover:bg-[#2e3035]">
      {/* Avatar - 36px */}
      {showAvatar && (
        <ImageWithFallback
          src={avatar}
          alt={speaker_name || ''}
          fallbackText={speaker_name}
          fallbackBgColor="#5865f2"
          className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden object-cover"
        />
      )}

      {/* Spacer for grouped messages - 36px */}
      {!showAvatar && <div className="w-9 flex-shrink-0" />}

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Name and timestamp row */}
        {showAvatar && (
          <div className="flex items-baseline gap-2">
            <span
              className="font-semibold text-[15px]"
              style={{ color: nameColor }}
            >
              {speaker_name || '알 수 없음'}
            </span>
            <span className="text-[#949ba4] text-[11px]">
              {timeString}
            </span>
          </div>
        )}

        {/* Message text */}
        <p className="text-[#dbdee1] text-[15px] leading-snug break-words whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
});

/**
 * Discord Input Bar - Korean style with circular icon backgrounds
 */
function DiscordInputBar({ recipientName = 'na4' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#313338]">
      {/* Plus button with dark circular background */}
      <button className="w-10 h-10 rounded-full bg-[#383a40] flex items-center justify-center text-[#b5bac1]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Users icon (group) with dark circular background */}
      <button className="w-10 h-10 rounded-full bg-[#383a40] flex items-center justify-center text-[#b5bac1]">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      </button>

      {/* Gift icon with dark circular background */}
      <button className="w-10 h-10 rounded-full bg-[#383a40] flex items-center justify-center text-[#b5bac1]">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
        </svg>
      </button>

      {/* Input field with Korean placeholder */}
      <div className="flex-1 flex items-center bg-[#383a40] rounded-full px-4 py-2">
        <input
          type="text"
          placeholder={`@${recipientName}에 메시지...`}
          className="flex-1 bg-transparent text-[#dbdee1] text-sm placeholder-[#6d6f78] outline-none"
          readOnly
        />

        {/* Emoji */}
        <button className="p-1 text-[#b5bac1]">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </button>
      </div>

      {/* Mic */}
      <button className="w-10 h-10 rounded-full bg-[#383a40] flex items-center justify-center text-[#b5bac1]">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>
    </div>
  );
}

/**
 * Main Discord Chat Preview Component
 */
const DiscordChatPreview = forwardRef(function DiscordChatPreview({
  messages = [],
  profiles = {},
  header = { title: '상대방', avatar: null, notificationCount: 1 },
  statusBar = { time: '10:30' },
  recipientName = 'na4',
  className = '',
}, ref) {
  // Process messages to add avatars and determine grouping
  const processedMessages = useMemo(() => {
    const result = [];
    let lastSpeaker = null;
    let lastDate = null;

    messages.forEach((msg, index) => {
      const msgDate = msg.timestamp ? formatDateSeparator(msg.timestamp) : null;

      // Add date separator if date changed
      if (msgDate && msgDate !== lastDate) {
        result.push({ type: 'date_separator', date: msgDate, id: `date_${index}` });
        lastDate = msgDate;
        lastSpeaker = null; // Reset grouping on new date
      }

      // Determine if we should show avatar (first message or different speaker)
      const showAvatar = lastSpeaker !== msg.speaker || lastSpeaker === null;

      result.push({
        ...msg,
        type: 'message',
        showAvatar,
        avatar: msg.avatar || profiles[msg.speaker]?.avatar,
        speaker_name: msg.speaker_name || profiles[msg.speaker]?.name || msg.speaker,
      });

      lastSpeaker = msg.speaker;
    });

    return result;
  }, [messages, profiles]);

  return (
    <div
      ref={ref}
      className={`discord-chat-preview flex flex-col h-full bg-[#313338] ${className}`}
      data-theme="discord"
      style={{ fontFamily: "'Noto Sans KR', 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Status Bar */}
      <DiscordStatusBar time={statusBar.time} />

      {/* Header */}
      <DiscordHeader
        title={header.title}
        avatar={header.avatar}
        notificationCount={header.notificationCount}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {processedMessages.map((item) => {
          if (item.type === 'date_separator') {
            return <DateSeparator key={item.id} date={item.date} />;
          }
          return (
            <DiscordMessage
              key={item.id}
              message={item}
              showAvatar={item.showAvatar}
            />
          );
        })}
      </div>

      {/* Input Bar */}
      <DiscordInputBar recipientName={recipientName} />

      {/* iOS Home Indicator */}
      <div className="flex justify-center py-2 bg-[#313338]">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
});

export default DiscordChatPreview;
