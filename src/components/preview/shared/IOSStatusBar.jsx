/**
 * IOSStatusBar - iOS 스타일 상태바 (통합 컴포넌트)
 * 모든 플랫폼에서 공유하며 색상만 props로 조정
 */
import React from 'react';

const formatTime = (time) => {
  if (time.includes('오전') || time.includes('오후')) {
    return time.replace(/오[전후]\s?/, '');
  }
  return time;
};

const IOSStatusBar = ({
  statusBar,
  bgColor = '#1E1F22',
  textColor = '#FFFFFF',
  notchColor = '#000000',
  height = 44,
  isDarkMode = true,
}) => {
  const iconColor = isDarkMode ? '#FFFFFF' : '#000000';
  const iconFadedColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';

  return (
    <div
      className="relative flex items-center justify-between"
      style={{
        width: '100%',
        height,
        padding: '14px 16px 0',
        backgroundColor: bgColor,
      }}
    >
      {/* Notch */}
      <div
        className="absolute"
        style={{
          width: 150,
          height: 30,
          left: 'calc(50% - 75px)',
          top: -2,
          backgroundColor: notchColor,
          borderRadius: '0 0 18px 18px',
        }}
      />

      {/* Time (Left) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: textColor,
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* Right Icons (Signal, WiFi, Battery) */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill={iconFadedColor} />
          <rect x="4" y="4" width="3" height="7" rx="0.5" fill={iconFadedColor} />
          <rect x="8" y="2" width="3" height="9" rx="0.5" fill={iconColor} />
          <rect x="12" y="0" width="3" height="11" rx="0.5" fill={iconColor} />
        </svg>

        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 2C10.5 2 12.5 3 14 5"
            stroke={iconFadedColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 5C9.8 5 11.2 5.8 12 7"
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="10" r="1.5" fill={iconColor} />
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            style={{
              width: 24,
              height: 12,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}`,
              borderRadius: 3,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 1,
                width: `${Math.min(statusBar.battery, 100) * 0.2}px`,
                height: 8,
                backgroundColor: iconColor,
                borderRadius: 2,
              }}
            />
          </div>
          <div
            style={{
              width: 1.5,
              height: 4,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              marginLeft: 1,
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default IOSStatusBar;
