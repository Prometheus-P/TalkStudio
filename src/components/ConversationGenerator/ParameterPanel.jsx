/**
 * ParameterPanel - 파라미터 설정 패널
 * 대화 생성 파라미터 (참여자 수, 메시지 수, 톤, 플랫폼) 설정 UI
 */
import React from 'react';
import { Users, MessageCircle, Smile, Monitor } from 'lucide-react';

const TONE_OPTIONS = [
  { value: 'casual', label: '캐주얼', emoji: '😊', description: '친근하고 편안한' },
  { value: 'formal', label: '포멀', emoji: '🤵', description: '정중하고 예의 바른' },
  { value: 'humorous', label: '유머', emoji: '😂', description: '재치 있고 가벼운' },
];

const PLATFORM_OPTIONS = [
  { value: 'kakaotalk', label: '카카오톡', emoji: '💬', color: '#FEE500' },
  { value: 'discord', label: '디스코드', emoji: '🎮', color: '#5865F2' },
  { value: 'telegram', label: '텔레그램', emoji: '✈️', color: '#0088CC' },
  { value: 'instagram', label: '인스타그램', emoji: '📸', color: '#E1306C' },
];

const ParameterPanel = ({
  participants,
  onParticipantsChange,
  messageCount,
  onMessageCountChange,
  tone,
  onToneChange,
  platform,
  onPlatformChange,
  disabled = false,
  showOnlyPlatform = false,
}) => {
  // When showOnlyPlatform is true, only render platform selector
  if (showOnlyPlatform) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Monitor size={16} />
          출력 플랫폼
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onPlatformChange(option.value)}
              disabled={disabled}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: platform === option.value ? `2px solid ${option.color}` : '2px solid #E5E7EB',
                background: platform === option.value
                  ? `linear-gradient(145deg, ${option.color}20 0%, ${option.color}10 100%)`
                  : '#FFFFFF',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div className="flex items-center gap-2 justify-center">
                <span className="text-lg">{option.emoji}</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: platform === option.value ? 700 : 500,
                    color: platform === option.value ? option.color : '#374151',
                  }}
                >
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 참여자 수 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users size={16} />
          참여자 수
        </label>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onParticipantsChange(num)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: participants === num ? '2px solid #A855F7' : '2px solid #E5E7EB',
                background: participants === num
                  ? 'linear-gradient(145deg, #F3E8FF 0%, #EDE9FE 100%)'
                  : '#FFFFFF',
                color: participants === num ? '#7C3AED' : '#374151',
                fontWeight: participants === num ? 700 : 500,
                fontSize: '14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {num}명
            </button>
          ))}
        </div>
      </div>

      {/* 메시지 수 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MessageCircle size={16} />
          메시지 수: <span className="text-purple-600">{messageCount}개</span>
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={messageCount}
          onChange={(e) => onMessageCountChange(Number(e.target.value))}
          disabled={disabled}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            appearance: 'none',
            background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${((messageCount - 5) / 45) * 100}%, #E5E7EB ${((messageCount - 5) / 45) * 100}%, #E5E7EB 100%)`,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>5개</span>
          <span>50개</span>
        </div>
      </div>

      {/* 톤 선택 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Smile size={16} />
          대화 톤
        </label>
        <div className="flex gap-2">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onToneChange(option.value)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '12px',
                border: tone === option.value ? '2px solid #A855F7' : '2px solid #E5E7EB',
                background: tone === option.value
                  ? 'linear-gradient(145deg, #F3E8FF 0%, #EDE9FE 100%)'
                  : '#FFFFFF',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div className="text-center">
                <span className="text-xl">{option.emoji}</span>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: tone === option.value ? 700 : 500,
                    color: tone === option.value ? '#7C3AED' : '#374151',
                    marginTop: '4px',
                  }}
                >
                  {option.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 플랫폼 선택 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Monitor size={16} />
          출력 플랫폼
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onPlatformChange(option.value)}
              disabled={disabled}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: platform === option.value ? `2px solid ${option.color}` : '2px solid #E5E7EB',
                background: platform === option.value
                  ? `linear-gradient(145deg, ${option.color}20 0%, ${option.color}10 100%)`
                  : '#FFFFFF',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div className="flex items-center gap-2 justify-center">
                <span className="text-lg">{option.emoji}</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: platform === option.value ? 700 : 500,
                    color: platform === option.value ? option.color : '#374151',
                  }}
                >
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParameterPanel;
