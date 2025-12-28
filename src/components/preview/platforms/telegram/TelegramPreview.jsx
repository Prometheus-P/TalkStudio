/**
 * TelegramPreview - Telegram iOS Mobile Preview
 */
import React from 'react';
import useChatStore from '../../../../store/useChatStore';
import { telegramColors } from '../../../../themes/presets';
import { IOSStatusBar, MessageList, PhoneFrame } from '../../shared';
import TelegramNav from './TelegramNav';
import TelegramInputBar from './TelegramInputBar';

const TelegramPreview = () => {
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
      scale={0.75}
      fontFamily={theme.fontFamily}
      bgStyle={{
        background: `linear-gradient(180deg, ${telegramColors.backgroundGradientStart} 0%, ${telegramColors.backgroundGradientEnd} 100%)`,
      }}
    >
      {/* iOS Status Bar */}
      <IOSStatusBar
        statusBar={statusBar}
        bgColor={telegramColors.backgroundHeader}
        textColor={telegramColors.statusBarText}
        notchColor={telegramColors.notchBg}
        isDarkMode={true}
      />

      {/* Telegram Header */}
      <TelegramNav title={title} avatar={otherAuthor?.avatarUrl} />

      {/* Message Area */}
      <MessageList
        messages={messages}
        theme={theme}
        getAuthor={getAuthor}
        getMessageGroupInfo={getMessageGroupInfo}
        className="overflow-hidden justify-end"
        style={{ padding: '8px 0' }}
      />

      {/* Telegram Input Bar */}
      <TelegramInputBar />
    </PhoneFrame>
  );
};

export default TelegramPreview;
