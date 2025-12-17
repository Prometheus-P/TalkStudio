/**
 * ChatPreview Component
 * Renders chat messages using CSS variable-based theming
 */

import { memo, useMemo } from 'react';

// Default avatar placeholder
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2RkZCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiNhYWEiLz48cGF0aCBkPSJNMjAgMjVjLTggMC0xNCA2LTE0IDEydjNoMjh2LTNjMC02LTYtMTItMTQtMTJ6IiBmaWxsPSIjYWFhIi8+PC9zdmc+';

/**
 * Status bar component (time, battery, etc.)
 */
function StatusBar({ time = '10:30', battery = 85, isWifi = true }) {
  return (
    <div className="status-bar flex justify-between items-center px-6 py-1 text-xs font-medium">
      <span>{time}</span>
      <div className="flex items-center gap-1">
        {isWifi ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm6-6c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 1.4.5 2.7 1.3 3.7l1.4-1.4c-.5-.7-.7-1.5-.7-2.3 0-2.2 1.8-4 4-4s4 1.8 4 4c0 .8-.2 1.6-.7 2.3l1.4 1.4c.8-1 1.3-2.3 1.3-3.7zm4-4c0-5.5-4.5-10-10-10S2 2.5 2 8c0 2.3.8 4.5 2.1 6.2l1.4-1.4C4.6 11.5 4 9.8 4 8c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.8-.6 3.5-1.5 4.8l1.4 1.4C21.2 12.5 22 10.3 22 8z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 18h2v-8h-2v8zm0 4h2v-2h-2v2zM2 18h2v-2H2v2zm0-4h2v-2H2v2zm0-4h2V8H2v2zm0-4h2V4H2v2zm4 8h2v-2H6v2zm0-4h2V8H6v2zm0-4h2V4H6v2zm4 8h2v-2h-2v2zm0-4h2V8h-2v2zm0-4h2V4h-2v2zm4 8h2v-2h-2v2zm0-4h2V8h-2v2zm0-4h2V4h-2v2zm4 4h2v-2h-2v2zm0-4h2V4h-2v2z"/>
          </svg>
        )}
        <span>{battery}%</span>
        <svg className="w-5 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="4" y="9" width={Math.round(14 * battery / 100)} height="6" rx="1" fill="currentColor"/>
          <rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

/**
 * Chat header with profile info
 */
function ChatHeader({ title, subtitle, avatar }) {
  return (
    <div className="chat-header flex items-center gap-3 py-3 px-4">
      <button className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {avatar && (
        <img
          src={avatar || DEFAULT_AVATAR}
          alt=""
          className="chat-avatar"
        />
      )}

      <div className="flex-1 min-w-0">
        <h1 className="font-semibold truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs opacity-70 truncate">{subtitle}</p>
        )}
      </div>

      <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Single message bubble
 */
const MessageBubble = memo(function MessageBubble({
  message,
  showAvatar = true,
  showName = true,
  showTime = true,
  isGrouped = false,
}) {
  const { speaker, speaker_name, text, type, timestamp, read } = message;
  const isMe = speaker === 'me';
  const isSystem = speaker === 'system' || type === 'system';

  // Format time
  const timeString = useMemo(() => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [timestamp]);

  // System message
  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="bubble-system">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`message-row flex gap-2 px-3 py-0.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar (for other's messages) */}
      {!isMe && showAvatar && !isGrouped && (
        <img
          src={message.avatar || DEFAULT_AVATAR}
          alt={speaker_name || ''}
          className="chat-avatar flex-shrink-0 mt-1"
        />
      )}

      {/* Spacer when avatar is hidden */}
      {!isMe && showAvatar && isGrouped && (
        <div className="flex-shrink-0" style={{ width: 'var(--avatar-size)' }} />
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Speaker name */}
        {!isMe && showName && !isGrouped && speaker_name && (
          <span className="speaker-name mb-1">{speaker_name}</span>
        )}

        {/* Bubble with time */}
        <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
            {type === 'emoji' ? (
              <span className="text-3xl">{text}</span>
            ) : (
              <p className="whitespace-pre-wrap break-words">{text}</p>
            )}
          </div>

          {/* Time and read status */}
          {showTime && (
            <div className={`flex flex-col items-${isMe ? 'end' : 'start'} gap-0.5`}>
              {isMe && read !== undefined && (
                <span className="read-indicator">
                  {read ? '읽음' : '1'}
                </span>
              )}
              <span className="message-time">{timeString}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * Main ChatPreview component
 */
export default function ChatPreview({
  messages = [],
  profiles = {
    me: { name: '나', avatar: null },
    other: { name: '상대방', avatar: null },
  },
  statusBar = { time: '10:30', battery: 85, isWifi: true },
  header = { title: '대화', subtitle: null },
  className = '',
}) {
  // Enhance messages with profile data
  const enhancedMessages = useMemo(() => {
    return messages.map((msg, index) => ({
      ...msg,
      speaker_name: msg.speaker_name || profiles[msg.speaker]?.name,
      avatar: msg.avatar || profiles[msg.speaker]?.avatar,
      // Check if this message should be grouped with previous
      isGrouped: index > 0 &&
        messages[index - 1].speaker === msg.speaker &&
        messages[index - 1].type !== 'system' &&
        msg.type !== 'system',
    }));
  }, [messages, profiles]);

  return (
    <div className={`chat-container flex flex-col h-full ${className}`}>
      {/* Status Bar */}
      <StatusBar {...statusBar} />

      {/* Header */}
      <ChatHeader
        title={header.title || profiles.other?.name || '대화'}
        subtitle={header.subtitle}
        avatar={profiles.other?.avatar}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {enhancedMessages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            showAvatar={message.speaker !== 'me'}
            showName={message.speaker !== 'me'}
            showTime={true}
            isGrouped={message.isGrouped}
          />
        ))}
      </div>

      {/* Input Area (decorative) */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-black/5 bg-white/50">
        <button className="p-2 rounded-full hover:bg-black/5">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500 text-sm">
          메시지 입력...
        </div>
        <button className="p-2 rounded-full hover:bg-black/5">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
