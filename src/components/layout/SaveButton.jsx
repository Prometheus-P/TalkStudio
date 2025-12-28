/**
 * SaveButton - 모바일 저장 버튼
 * 상태 표시 (idle/saving/saved/error) 및 롱프레스 지원
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useRef, useCallback } from 'react';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';

const LONG_PRESS_DURATION = 500; // ms

const SaveButton = ({
  status = 'idle',
  onTap,
  onLongPress,
  disabled = false,
}) => {
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      // 햅틱 피드백 (지원 시)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // 롱프레스가 아니면 탭으로 처리
    if (!isLongPress.current) {
      onTap?.();
    }
  }, [onTap]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 상태별 아이콘 및 색상
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          color: '#10B981',
          animate: true,
          label: '저장중',
        };
      case 'saved':
        return {
          icon: Check,
          color: '#10B981',
          animate: false,
          label: '완료',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          animate: false,
          label: '오류',
        };
      default:
        return {
          icon: Download,
          color: '#10B981',
          animate: false,
          label: '저장',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const isActive = status === 'idle';

  return (
    <button
      className="flex flex-col items-center gap-1 transition-all duration-200"
      style={{
        transform: isActive ? 'scale(1)' : 'scale(1.05)',
        opacity: disabled ? 0.5 : 1,
      }}
      onTouchStart={!disabled ? handleTouchStart : undefined}
      onTouchEnd={!disabled ? handleTouchEnd : undefined}
      onTouchCancel={handleTouchCancel}
      onClick={!disabled ? onTap : undefined}
      disabled={disabled || status === 'saving'}
      aria-label={config.label}
    >
      <div
        className="p-3 rounded-2xl transition-all duration-200"
        style={{
          background: isActive
            ? 'transparent'
            : `linear-gradient(145deg, ${config.color} 0%, ${config.color}dd 100%)`,
          boxShadow: isActive
            ? 'none'
            : `0px 4px 0px ${config.color}50`,
        }}
      >
        <IconComponent
          size={22}
          className={config.animate ? 'animate-spin' : ''}
          style={{
            color: isActive ? '#9CA3AF' : '#FFFFFF',
          }}
        />
      </div>
      <span
        className="text-xs font-semibold"
        style={{
          color: isActive ? '#9CA3AF' : config.color,
        }}
      >
        {config.label}
      </span>
    </button>
  );
};

export default SaveButton;
