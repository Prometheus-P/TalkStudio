/**
 * ProfileEditor - 프로필 편집기
 * CLAYMORPHISM DESIGN STYLE
 */
import React from 'react';
import { User, UserCheck, RefreshCw, Bell, Upload, UserPlus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import useChatStore from '../../store/useChatStore';

const ProfileEditor = () => {
  const conversation = useChatStore((s) => s.conversation);
  const statusBar = useChatStore((s) => s.statusBar);
  const updateAuthor = useChatStore((s) => s.updateAuthor);
  const addAuthor = useChatStore((s) => s.addAuthor);
  const removeAuthor = useChatStore((s) => s.removeAuthor);
  const setTitle = useChatStore((s) => s.setTitle);
  const updateStatusBar = useChatStore((s) => s.updateStatusBar);
  const setUnreadCount = useChatStore((s) => s.setUnreadCount);

  const authors = conversation.authors;
  const meAuthor = authors.find((a) => a.id === 'me');
  const otherAuthors = authors.filter((a) => a.id !== 'me');
  const isDiscord = conversation.platformSkin === 'discord';
  const canAddMore = authors.length < 10;

  // 랜덤 아바타 생성
  const randomAvatar = (authorId) => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    updateAuthor(authorId, { avatarUrl: url });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 대화방 제목 - Clay Input */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '8px',
          }}
        >
          대화방 제목
        </label>
        <input
          type="text"
          value={conversation.title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.08)',
            outline: 'none',
            color: '#374151',
          }}
          placeholder="대화방 제목"
        />
      </div>

      {/* 상태바 시간 - Clay Input */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            marginBottom: '8px',
          }}
        >
          상태바 시간
        </label>
        <input
          type="text"
          value={statusBar.time}
          onChange={(e) => updateStatusBar({ time: e.target.value })}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.08)',
            outline: 'none',
            color: '#374151',
          }}
          placeholder="12:30"
        />
      </div>

      {/* Discord 안읽음 숫자 - Discord 플랫폼에서만 표시 */}
      {isDiscord && (
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '8px',
            }}
          >
            <Bell size={14} style={{ color: '#ED4245' }} />
            알림 뱃지 숫자
          </label>
          <input
            type="number"
            min="0"
            max="999"
            value={conversation.unreadCount || 0}
            onChange={(e) => setUnreadCount(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
              boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.08)',
              outline: 'none',
              color: '#374151',
            }}
            placeholder="20"
          />
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              color: '#9CA3AF',
              marginTop: '4px',
            }}
          >
            0으로 설정하면 뱃지가 숨겨집니다
          </span>
        </div>
      )}

      {/* 참여자 섹션 헤더 */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '12px 0 8px',
          borderTop: '2px solid rgba(168, 85, 247, 0.1)',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
          }}
        >
          참여자 ({authors.length}/10명)
        </span>
        {canAddMore && (
          <button
            onClick={addAuthor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
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
            <UserPlus size={12} />
            참여자 추가
          </button>
        )}
      </div>

      {/* 나 프로필 - Clay Card */}
      <ProfileCard
        author={meAuthor}
        label="내 프로필"
        icon={UserCheck}
        isMe={true}
        canDelete={false}
        onUpdate={(updates) => updateAuthor('me', updates)}
        onRandomAvatar={() => randomAvatar('me')}
      />

      {/* 다른 참여자 프로필들 - Clay Card */}
      {otherAuthors.map((author, index) => (
        <ProfileCard
          key={author.id}
          author={author}
          label={index === 0 ? '상대방 프로필' : `참여자 ${index + 1}`}
          icon={User}
          isMe={false}
          canDelete={otherAuthors.length > 1}
          onUpdate={(updates) => updateAuthor(author.id, updates)}
          onRandomAvatar={() => randomAvatar(author.id)}
          onDelete={() => removeAuthor(author.id)}
        />
      ))}
    </div>
  );
};

// 프로필 카드 컴포넌트 - Claymorphism
const ProfileCard = ({ author, label, icon: _Icon, isMe, canDelete, onUpdate, onRandomAvatar, onDelete }) => {
  const fileInputRef = useRef(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 이미지 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdate({ avatarUrl: event.target.result });
    };
    reader.readAsDataURL(file);

    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '20px',
        background: isMe
          ? 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)'
          : 'linear-gradient(145deg, #F9FAFB 0%, #F3F4F6 100%)',
        boxShadow: isMe
          ? '0px 4px 0px rgba(59, 130, 246, 0.2)'
          : '0px 4px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          style={{
            padding: '8px',
            borderRadius: '12px',
            background: isMe
              ? 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)'
              : 'linear-gradient(145deg, #E5E7EB 0%, #D1D5DB 100%)',
            boxShadow: isMe
              ? '0px 2px 0px rgba(37, 99, 235, 0.3)'
              : '0px 2px 0px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Icon size={14} style={{ color: isMe ? '#FFFFFF' : '#4B5563' }} />
        </div>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            flex: 1,
          }}
        >
          {label}
        </span>
        {/* 삭제 버튼 (삭제 가능한 경우만) */}
        {canDelete && onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: '6px',
              borderRadius: '10px',
              background: 'linear-gradient(145deg, #FEE2E2 0%, #FECACA 100%)',
              boxShadow: '0px 2px 0px rgba(239, 68, 68, 0.2)',
              border: 'none',
              cursor: 'pointer',
              color: '#EF4444',
            }}
            title="참여자 삭제"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        {/* 아바타 - Clay Style */}
        <div className="flex flex-col gap-2">
          <div className="relative group">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
                boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={author?.avatarUrl}
                alt={author?.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            {/* 호버 시 업로드/랜덤 버튼 표시 */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '20px',
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="이미지 업로드"
              >
                <Upload size={14} style={{ color: '#FFFFFF' }} />
              </button>
              <button
                onClick={onRandomAvatar}
                style={{
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="랜덤 아바타"
              >
                <RefreshCw size={14} style={{ color: '#FFFFFF' }} />
              </button>
            </div>
          </div>
          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* 이름 & 아바타 URL */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={author?.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
              outline: 'none',
              color: '#374151',
            }}
            placeholder="이름"
          />
          <input
            type="text"
            value={author?.avatarUrl || ''}
            onChange={(e) => onUpdate({ avatarUrl: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
              outline: 'none',
              color: '#6B7280',
            }}
            placeholder="아바타 URL"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
