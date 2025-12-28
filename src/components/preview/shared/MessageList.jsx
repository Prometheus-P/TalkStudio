/**
 * MessageList - 메시지 렌더링 루프 (통합 컴포넌트)
 * 모든 플랫폼에서 공유하는 메시지 리스트 렌더링
 */
import React from 'react';
import MessageBubble from '../MessageBubble';
import DateDivider from '../DateDivider';

const MessageList = ({
  messages,
  theme,
  getAuthor,
  getMessageGroupInfo,
  className = '',
  style = {},
}) => {
  return (
    <div className={`flex-1 flex flex-col ${className}`} style={style}>
      {messages.map((message, index) => {
        // Date divider handling
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
  );
};

export default MessageList;
