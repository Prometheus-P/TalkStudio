/**
 * ScenarioInput - 시나리오 입력 컴포넌트
 * AI 대화 생성을 위한 시나리오 입력 UI
 */
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

const ScenarioInput = ({
  value,
  onChange,
  placeholder = '어떤 대화를 생성할까요? 예: 게임 아이템 거래 협상, 친구와 약속 잡기...',
  disabled = false,
  error,
  maxLength = 500,
}) => {
  const charCount = value?.length || 0;
  const isNearLimit = charCount > maxLength * 0.8;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <MessageSquare size={16} />
        시나리오 설명
        <Sparkles size={14} className="text-purple-500" />
      </label>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: error ? '2px solid #EF4444' : '2px solid #E5E7EB',
            background: disabled ? '#F3F4F6' : '#FFFFFF',
            fontSize: '15px',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = '#A855F7';
              e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }
          }}
        />

        {/* Character count */}
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '12px',
            color: isNearLimit ? '#EF4444' : '#9CA3AF',
          }}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Tips */}
      <div
        style={{
          padding: '12px',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #F3E8FF 0%, #EDE9FE 100%)',
          fontSize: '13px',
          color: '#6B21A8',
        }}
      >
        <strong>💡 Tip:</strong> 상황, 참여자의 관계, 대화 목적을 구체적으로 설명하면 더 자연스러운 대화가 생성됩니다.
      </div>
    </div>
  );
};

export default ScenarioInput;
