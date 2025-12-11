/**
 * MessageEditor - 메시지 목록 편집기
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, AlertTriangle, UserPlus } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import { validateTimeOrder, getCurrentDateTime, extractDate, extractTime, combineDateTime } from '../../utils/timeValidation';

const MessageEditor = () => {
  const messages = useChatStore((s) => s.conversation.messages);
  const authors = useChatStore((s) => s.conversation.authors);
  const addMessage = useChatStore((s) => s.addMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const duplicateMessage = useChatStore((s) => s.duplicateMessage);
  const insertMessageAt = useChatStore((s) => s.insertMessageAt);
  const moveMessageUp = useChatStore((s) => s.moveMessageUp);
  const moveMessageDown = useChatStore((s) => s.moveMessageDown);

  // 시간 순서 경고 계산
  const timeWarnings = useMemo(() => validateTimeOrder(messages), [messages]);

  const handleAddMessage = (authorId, insertIndex = null) => {
    const author = authors.find((a) => a.id === authorId);
    const newMessage = {
      role: authorId === 'me' ? 'me' : 'other',
      authorId,
      text: '',
      datetime: getCurrentDateTime(),
    };

    if (insertIndex !== null) {
      insertMessageAt(insertIndex, newMessage);
    } else {
      addMessage(newMessage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 - Clay Style */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '2px solid rgba(168, 85, 247, 0.1)',
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: '#374151',
          }}
        >
          메시지 편집
        </h3>
        {/* 참여자 수 표시 */}
        <span
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            fontWeight: 500,
          }}
        >
          {authors.length}/10명
        </span>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {messages.length === 0 && (
          <div
            className="text-center py-10"
            style={{
              color: '#9CA3AF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            메시지가 없습니다.<br />
            아래 버튼으로 추가하세요.
          </div>
        )}

        {/* 첫 번째 메시지 추가 버튼 */}
        <InlineAddButton
          authors={authors}
          onAdd={(authorId) => handleAddMessage(authorId, 0)}
        />

        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <MessageItem
              message={message}
              index={index}
              totalCount={messages.length}
              authors={authors}
              hasTimeWarning={timeWarnings.includes(message.id)}
              onUpdate={updateMessage}
              onRemove={removeMessage}
              onDuplicate={duplicateMessage}
              onMoveUp={moveMessageUp}
              onMoveDown={moveMessageDown}
            />
            {/* 메시지 사이 추가 버튼 */}
            <InlineAddButton
              authors={authors}
              onAdd={(authorId) => handleAddMessage(authorId, index + 1)}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 인라인 메시지 추가 버튼
const InlineAddButton = ({ authors, onAdd }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative flex justify-center py-1 group">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="opacity-30 group-hover:opacity-100 transition-opacity"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'linear-gradient(145deg, #F3E8FF 0%, #E9D5FF 100%)',
          color: '#7C3AED',
          boxShadow: '0px 2px 0px rgba(124, 58, 237, 0.2)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Plus size={12} />
        메시지 추가
      </button>

      {/* 발신자 선택 드롭다운 */}
      {showDropdown && (
        <div
          className="absolute top-full mt-1 z-20"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
            padding: '8px',
            minWidth: '140px',
          }}
        >
          {authors.map((author) => (
            <button
              key={author.id}
              onClick={() => {
                onAdd(author.id);
                setShowDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#374151',
              }}
              className="hover:bg-gray-100"
            >
              <img
                src={author.avatarUrl}
                alt={author.name}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                }}
              />
              {author.name}
            </button>
          ))}
        </div>
      )}

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

// 개별 메시지 아이템 - Claymorphism
const MessageItem = ({
  message,
  index,
  totalCount,
  authors,
  hasTimeWarning,
  onUpdate,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [text, setText] = useState(message.text);
  const isMe = message.authorId === 'me';

  // datetime에서 date와 time 분리
  const dateValue = extractDate(message.datetime);
  const timeValue = extractTime(message.datetime);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onUpdate(message.id, { text: newText });
  };

  const handleAuthorChange = (authorId) => {
    onUpdate(message.id, {
      authorId,
      role: authorId === 'me' ? 'me' : 'other',
    });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const newDatetime = combineDateTime(newDate, timeValue);
    onUpdate(message.id, { datetime: newDatetime });
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    const newDatetime = combineDateTime(dateValue, newTime);
    onUpdate(message.id, { datetime: newDatetime });
  };

  const currentAuthor = authors.find((a) => a.id === message.authorId) || authors[0];
  const isAuthorMe = message.authorId === 'me';

  return (
    <div
      className="group relative"
      style={{
        borderRadius: '20px',
        background: isAuthorMe
          ? 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)'
          : 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
        boxShadow: isAuthorMe
          ? '0px 4px 0px rgba(59, 130, 246, 0.2)'
          : '0px 4px 0px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* 상단 바 */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          borderBottom: `2px solid ${isAuthorMe ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        {/* 발신자 선택 드롭다운 */}
        <div className="relative">
          <select
            value={message.authorId}
            onChange={(e) => handleAuthorChange(e.target.value)}
            style={{
              appearance: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 28px 6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              background: isAuthorMe
                ? 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)'
                : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
              color: isAuthorMe ? '#FFFFFF' : '#4B5563',
              boxShadow: isAuthorMe
                ? '0px 3px 0px rgba(37, 99, 235, 0.4)'
                : '0px 2px 0px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {/* 드롭다운 화살표 */}
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              color: isAuthorMe ? '#FFFFFF' : '#6B7280',
              fontSize: '10px',
            }}
          >
            ▼
          </span>
        </div>

        {/* 날짜 입력 */}
        <input
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          style={{
            width: '110px',
            padding: '6px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 500,
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            border: 'none',
            boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
            color: '#4B5563',
            outline: 'none',
          }}
        />

        {/* 시간 입력 */}
        <input
          type="text"
          value={timeValue}
          onChange={handleTimeChange}
          style={{
            width: '80px',
            padding: '6px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 500,
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            border: hasTimeWarning ? '2px solid #F59E0B' : 'none',
            boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
            color: '#4B5563',
            outline: 'none',
          }}
          placeholder="오후 12:30"
        />

        {/* 시간 순서 경고 */}
        {hasTimeWarning && (
          <div title="이전 메시지보다 시간이 이릅니다">
            <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 위로 이동 */}
          <button
            onClick={() => onMoveUp(message.id)}
            disabled={index === 0}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
              border: 'none',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              color: index === 0 ? '#D1D5DB' : '#9CA3AF',
              opacity: index === 0 ? 0.5 : 1,
            }}
            title="위로 이동"
          >
            <ChevronUp size={14} />
          </button>
          {/* 아래로 이동 */}
          <button
            onClick={() => onMoveDown(message.id)}
            disabled={index === totalCount - 1}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
              border: 'none',
              cursor: index === totalCount - 1 ? 'not-allowed' : 'pointer',
              color: index === totalCount - 1 ? '#D1D5DB' : '#9CA3AF',
              opacity: index === totalCount - 1 ? 0.5 : 1,
            }}
            title="아래로 이동"
          >
            <ChevronDown size={14} />
          </button>
          {/* 복제 */}
          <button
            onClick={() => onDuplicate(message.id)}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
            }}
            title="복제"
          >
            <Copy size={14} />
          </button>
          {/* 삭제 */}
          <button
            onClick={() => onRemove(message.id)}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #FEE2E2 0%, #FECACA 100%)',
              boxShadow: '0px 2px 0px rgba(239, 68, 68, 0.2)',
              border: 'none',
              cursor: 'pointer',
              color: '#EF4444',
            }}
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 텍스트 입력 */}
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="메시지 내용을 입력하세요..."
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          background: 'transparent',
          border: 'none',
          resize: 'none',
          outline: 'none',
          color: '#374151',
        }}
        rows={2}
      />
    </div>
  );
};

export default MessageEditor;
