/**
 * ChatPreview - 채팅 미리보기 캔버스
 * html2canvas로 캡처될 대상 DOM
 * 플랫폼별 미리보기 컴포넌트를 라우팅
 */
import React from 'react';
import { ChevronLeft, Search, MoreVertical, Phone } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import StatusBar from './StatusBar';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';

// Platform Previews
import { DiscordPreview } from './platforms/discord';
import { KakaoPreview } from './platforms/kakao';
import { TelegramPreview } from './platforms/telegram';
import { InstaPreview } from './platforms/insta';

const ChatPreview = () => {
  const conversation = useChatStore((s) => s.conversation);
  const theme = useChatStore((s) => s.theme);
  const statusBar = useChatStore((s) => s.statusBar);
  const getAuthor = useChatStore((s) => s.getAuthor);

  const { messages, title, authors } = conversation;
  const otherAuthor = authors.find((a) => a.id === 'other');

  // Platform base ID (remove -shorts suffix)
  const platformBase = theme.id.replace('-shorts', '');

  // Route to platform-specific preview
  switch (platformBase) {
    case 'discord':
      return <DiscordPreview />;
    case 'kakao':
      return <KakaoPreview />;
    case 'telegram':
      return <TelegramPreview />;
    case 'insta':
      return <InstaPreview />;
    default:
      // Fallback to default layout
      break;
  }

  // Message group info helper
  const getMessageGroupInfo = (index) => {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isFirstInGroup = !prev || prev.role !== current.role;
    const isLastInGroup = !next || next.role !== current.role;

    return { isFirstInGroup, isLastInGroup };
  };

  // Background style
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

  // Default layout (fallback)
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
      {/* Status Bar (iOS style) */}
      {theme.showStatusBar && <StatusBar statusBar={statusBar} theme={theme} />}

      {/* Chat Header */}
      {theme.showHeader && (
        <ChatHeader title={title} theme={theme} avatar={otherAuthor?.avatarUrl} />
      )}

      {/* Message List */}
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

      {/* Input Area (Decoration) */}
      <InputAreaDecoration />
    </div>
  );
};

// ============================================
// Fallback Components
// ============================================

const ChatHeader = ({ title, theme, avatar }) => {
  return (
    <div
      className="flex items-center"
      style={{
        backgroundColor: theme.headerBg,
        height: 48,
        padding: '0 16px',
      }}
    >
      <button className="p-2 -ml-2" style={{ color: theme.headerTitleColor }}>
        <ChevronLeft size={24} />
      </button>
      {avatar && <img src={avatar} alt="" className="w-8 h-8 rounded-lg mr-2" />}
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
    </div>
  );
};

const InputAreaDecoration = () => {
  return (
    <div
      className="h-14 px-3 flex items-center gap-2"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E5E5',
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
