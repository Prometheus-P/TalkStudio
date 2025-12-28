/**
 * KakaoPreview - KakaoTalk iOS 미리보기
 */
import React from 'react';
import useChatStore from '../../../../store/useChatStore';
import { kakaoColors } from '../../../../themes/presets';
import { IOSStatusBar, MessageList, PhoneFrame } from '../../shared';
import KakaoNav from './KakaoNav';
import KakaoInputBar from './KakaoInputBar';

const KakaoPreview = () => {
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
      bgStyle={{ backgroundColor: kakaoColors.backgroundPrimary }}
    >
      {/* iOS Status Bar */}
      <IOSStatusBar
        statusBar={statusBar}
        bgColor={kakaoColors.backgroundHeader}
        textColor={kakaoColors.statusBarText}
        notchColor={kakaoColors.notchBg}
        isDarkMode={true}
      />

      {/* KakaoTalk Header */}
      <KakaoNav title={title} avatar={otherAuthor?.avatarUrl} />

      {/* Message Area */}
      <MessageList
        messages={messages}
        theme={theme}
        getAuthor={getAuthor}
        getMessageGroupInfo={getMessageGroupInfo}
        className="overflow-hidden justify-end"
        style={{ padding: '8px 0' }}
      />

      {/* KakaoTalk Input Bar */}
      <KakaoInputBar />
    </PhoneFrame>
  );
};

export default KakaoPreview;
