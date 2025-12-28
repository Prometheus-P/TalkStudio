/**
 * ThemeControls - 테마 스타일 컨트롤
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import useChatStore from '../../store/useChatStore';

const ThemeControls = () => {
  const theme = useChatStore((s) => s.theme);
  const updateTheme = useChatStore((s) => s.updateTheme);
  const updateBubbleStyle = useChatStore((s) => s.updateBubbleStyle);
  const resetThemeToPreset = useChatStore((s) => s.resetThemeToPreset);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="p-4 space-y-3">
      {/* 리셋 버튼 - Clay */}
      <button
        onClick={resetThemeToPreset}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
          boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.1)',
          color: '#4B5563',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
      >
        <RotateCcw size={14} />
        기본 테마로 초기화
      </button>

      {/* 캔버스 설정 */}
      <CollapsibleSection title="캔버스 크기" defaultOpen color="#22D3EE">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="너비"
            value={theme.canvasWidth}
            onChange={(v) => updateTheme({ canvasWidth: v })}
            min={300}
            max={500}
            suffix="px"
          />
          <NumberInput
            label="높이"
            value={theme.canvasHeight}
            onChange={(v) => updateTheme({ canvasHeight: v })}
            min={500}
            max={900}
            suffix="px"
          />
        </div>
      </CollapsibleSection>

      {/* 배경 설정 */}
      <CollapsibleSection title="배경" color="#A855F7">
        <SelectInput
          label="타입"
          value={theme.backgroundType}
          onChange={(v) => updateTheme({ backgroundType: v })}
          options={[
            { value: 'solid', label: '단색' },
            { value: 'gradient', label: '그라디언트' },
            { value: 'image', label: '이미지' },
          ]}
        />
        {theme.backgroundType === 'solid' && (
          <ColorInput
            label="배경색"
            value={theme.backgroundValue}
            onChange={(v) => updateTheme({ backgroundValue: v })}
          />
        )}
        {theme.backgroundType === 'gradient' && (
          <TextInput
            label="그라디언트"
            value={theme.backgroundValue}
            onChange={(v) => updateTheme({ backgroundValue: v })}
            placeholder="linear-gradient(180deg, #fff, #eee)"
          />
        )}
        {theme.backgroundType === 'image' && (
          <TextInput
            label="이미지 URL"
            value={theme.backgroundImageUrl || ''}
            onChange={(v) => updateTheme({ backgroundImageUrl: v })}
            placeholder="https://..."
          />
        )}
      </CollapsibleSection>

      {/* 고급 설정 토글 */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '16px',
          border: 'none',
          background: showAdvanced
            ? 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)'
            : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
          boxShadow: showAdvanced
            ? '0px 3px 0px rgba(124, 58, 237, 0.3)'
            : '0px 3px 0px rgba(0, 0, 0, 0.1)',
          color: showAdvanced ? '#FFFFFF' : '#6B7280',
          cursor: 'pointer',
        }}
      >
        {showAdvanced ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
        고급 설정 {showAdvanced ? '숨기기' : '보기'}
      </button>

      {/* 고급 설정 영역 */}
      {showAdvanced && (
        <>
          {/* 헤더 설정 */}
          <CollapsibleSection title="헤더" color="#FB923C">
            <ToggleInput
              label="헤더 표시"
              value={theme.showHeader}
              onChange={(v) => updateTheme({ showHeader: v })}
            />
            <ToggleInput
              label="상태바 표시"
              value={theme.showStatusBar}
              onChange={(v) => updateTheme({ showStatusBar: v })}
            />
            <ColorInput
              label="헤더 배경색"
              value={theme.headerBg}
              onChange={(v) => updateTheme({ headerBg: v })}
            />
            <ColorInput
              label="헤더 글자색"
              value={theme.headerTitleColor}
              onChange={(v) => updateTheme({ headerTitleColor: v })}
            />
          </CollapsibleSection>

          {/* 내 버블 설정 */}
          <CollapsibleSection title="내 버블" color="#3B82F6">
            <BubbleStyleEditor
              style={theme.bubble.me}
              onChange={(updates) => updateBubbleStyle('me', updates)}
            />
          </CollapsibleSection>

          {/* 상대방 버블 설정 */}
          <CollapsibleSection title="상대방 버블" color="#6B7280">
            <BubbleStyleEditor
              style={theme.bubble.other}
              onChange={(updates) => updateBubbleStyle('other', updates)}
            />
          </CollapsibleSection>

          {/* 메타 정보 설정 */}
          <CollapsibleSection title="메타 정보" color="#4ADE80">
            <ToggleInput
              label="이름 표시"
              value={theme.showName}
              onChange={(v) => updateTheme({ showName: v })}
            />
            <ToggleInput
              label="시간 표시"
              value={theme.showTime}
              onChange={(v) => updateTheme({ showTime: v })}
            />
            <ToggleInput
              label="읽음 표시"
              value={theme.showReadStatus}
              onChange={(v) => updateTheme({ showReadStatus: v })}
            />
            <ToggleInput
              label="아바타 표시"
              value={theme.showAvatar}
              onChange={(v) => updateTheme({ showAvatar: v })}
            />
            <NumberInput
              label="아바타 크기"
              value={theme.avatarSize}
              onChange={(v) => updateTheme({ avatarSize: v })}
              min={20}
              max={60}
              suffix="px"
            />
          </CollapsibleSection>

          {/* 타이포그래피 */}
          <CollapsibleSection title="타이포그래피" color="#FF6B9D">
            <NumberInput
              label="글자 크기"
              value={theme.fontSize}
              onChange={(v) => updateTheme({ fontSize: v })}
              min={12}
              max={20}
              suffix="px"
            />
            <NumberInput
              label="줄 높이"
              value={theme.lineHeight}
              onChange={(v) => updateTheme({ lineHeight: v })}
              min={1}
              max={2}
              step={0.1}
            />
          </CollapsibleSection>
        </>
      )}
    </div>
  );
};

// 버블 스타일 에디터
const BubbleStyleEditor = ({ style, onChange }) => (
  <div className="space-y-3">
    <ColorInput
      label="배경색"
      value={style.bg}
      onChange={(v) => onChange({ bg: v })}
    />
    <ColorInput
      label="글자색"
      value={style.textColor}
      onChange={(v) => onChange({ textColor: v })}
    />
    <NumberInput
      label="둥글기"
      value={style.radius}
      onChange={(v) => onChange({ radius: v })}
      min={0}
      max={30}
      suffix="px"
    />
    <NumberInput
      label="패딩 X"
      value={style.paddingX}
      onChange={(v) => onChange({ paddingX: v })}
      min={4}
      max={20}
      suffix="px"
    />
    <NumberInput
      label="패딩 Y"
      value={style.paddingY}
      onChange={(v) => onChange({ paddingY: v })}
      min={4}
      max={16}
      suffix="px"
    />
    <SelectInput
      label="꼬리"
      value={style.tail}
      onChange={(v) => onChange({ tail: v })}
      options={[
        { value: 'none', label: '없음' },
        { value: 'small', label: '작게' },
        { value: 'big', label: '크게' },
      ]}
    />
  </div>
);

// 접을 수 있는 섹션 - Claymorphism
const CollapsibleSection = ({ title, children, defaultOpen = false, color = '#A855F7' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
        boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#374151',
          background: isOpen
            ? `linear-gradient(145deg, ${color}15 0%, ${color}10 100%)`
            : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '4px',
              background: color,
              boxShadow: `0px 2px 0px ${color}60`,
            }}
          />
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} style={{ color: '#9CA3AF' }} />
        ) : (
          <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
        )}
      </button>
      {isOpen && (
        <div
          className="space-y-3"
          style={{
            padding: '12px 16px 16px',
            borderTop: '2px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// 입력 컴포넌트들 - Claymorphism
const NumberInput = ({ label, value, onChange, min, max, step = 1, suffix = '' }) => (
  <div className="flex items-center justify-between gap-2">
    <label
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          width: '64px',
          padding: '8px 10px',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'right',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
          outline: 'none',
          color: '#374151',
        }}
      />
      {suffix && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#9CA3AF',
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <label
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
      }}
    >
      {label}
    </label>
    <div className="flex items-center gap-2">
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '48px',
            height: '48px',
            marginTop: '-8px',
            marginLeft: '-8px',
            cursor: 'pointer',
            border: 'none',
          }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '80px',
          padding: '8px 10px',
          fontSize: '11px',
          fontWeight: 600,
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
          outline: 'none',
          color: '#374151',
        }}
      />
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label
      style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
      }}
    >
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '14px',
        border: 'none',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
        boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
        outline: 'none',
        color: '#374151',
      }}
    />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div className="flex items-center justify-between gap-2">
    <label
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
      }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 28px 8px 12px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
        boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.06)',
        outline: 'none',
        color: '#374151',
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const ToggleInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
      }}
    >
      {label}
    </label>
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: '44px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        background: value
          ? 'linear-gradient(145deg, #4ADE80 0%, #22C55E 100%)'
          : 'linear-gradient(145deg, #E5E7EB 0%, #D1D5DB 100%)',
        boxShadow: value
          ? '0px 3px 0px rgba(34, 197, 94, 0.3)'
          : '0px 2px 0px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: value ? '21px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  </div>
);

export default ThemeControls;
