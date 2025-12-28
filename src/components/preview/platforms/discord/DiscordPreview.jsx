/**
 * DiscordPreview - Discord iOS Mobile Preview
 */
import React from 'react';
import useChatStore from '../../../../store/useChatStore';
import { discordColors } from '../../../../themes/presets';
import { MessageList, PhoneFrame } from '../../shared';
import DiscordStatusBar from './DiscordStatusBar';
import DiscordNav from './DiscordNav';
import DiscordBottomNav from './DiscordBottomNav';

const DiscordPreview = () => {
  const conversation = useChatStore((s) => s.conversation);
  const theme = useChatStore((s) => s.theme);
  const statusBar = useChatStore((s) => s.statusBar);
  const getAuthor = useChatStore((s) => s.getAuthor);

  const { messages, title, authors } = conversation;
  const otherAuthor = authors.find((a) => a.id === 'other');

  const getMessageGroupInfo = (index) => {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isFirstInGroup = !prev || prev.role !== current.role;
    const isLastInGroup = !next || next.role !== current.role;

    return { isFirstInGroup, isLastInGroup };
  };

  return (
    <PhoneFrame
      width={theme.canvasWidth}
      height={theme.canvasHeight}
      scale={0.7}
      fontFamily={theme.fontFamily}
      bgStyle={{ backgroundColor: discordColors.backgroundPrimary }}
    >
      {/* iOS Status Bar (47px) - with notch */}
      <DiscordStatusBar statusBar={statusBar} />

      {/* Navigation Header (55px) */}
      <DiscordNav
        title={title}
        avatar={otherAuthor?.avatarUrl}
        unreadCount={conversation.unreadCount}
      />

      {/* Message Area */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ padding: '10px' }}
      >
        <MessageList
          messages={messages}
          theme={theme}
          getAuthor={getAuthor}
          getMessageGroupInfo={getMessageGroupInfo}
          className="gap-0"
        />
      </div>

      {/* Bottom Message Bar (92px) */}
      <DiscordBottomNav />
    </PhoneFrame>
  );
};

export default DiscordPreview;
