/**
 * DiscordStatusBar - Discord iOS Status Bar (47px with notch)
 */
import React from 'react';
import { discordColors } from '../../../../themes/presets';

const formatTime = (time) => {
  if (time.includes('오전') || time.includes('오후')) {
    return time.replace(/오[전후]\s?/, '');
  }
  return time;
};

const DiscordStatusBar = ({ statusBar }) => {
  return (
    <div
      className="relative flex items-center justify-between"
      style={{
        width: '100%',
        height: 47,
        padding: '14px 27px 0',
        backgroundColor: discordColors.backgroundPrimary,
      }}
    >
      {/* Notch */}
      <div
        className="absolute"
        style={{
          width: 156,
          height: 33,
          left: 'calc(50% - 78px)',
          top: -2,
          backgroundColor: discordColors.notchBg,
          borderRadius: '0 0 20px 20px',
        }}
      />

      {/* Time (Left) */}
      <div
        style={{
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 17,
          lineHeight: '22px',
          color: discordColors.statusBarText,
          letterSpacing: '-0.408px',
        }}
      >
        {formatTime(statusBar.time)}
      </div>

      {/* Right Icons (Signal, WiFi, Battery) */}
      <div className="flex items-center gap-1">
        {/* Mobile Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="6" width="3" height="6" rx="0.5" fill="#DADADA" />
          <rect x="4" y="4" width="3" height="8" rx="0.5" fill="#DADADA" />
          <rect x="8" y="2" width="3" height="10" rx="0.5" fill="#DADADA" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" fill="white" />
        </svg>

        {/* WiFi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path d="M8.5 2.5C11.5 2.5 14 4 15.5 6" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.5 5C10.5 5 12 6 13 7.5" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.5 7.5C9.5 7.5 10.5 8 11 9" stroke="#DADADA" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8.5" cy="10.5" r="1.5" fill="white" />
        </svg>

        {/* Battery */}
        <div className="flex items-center">
          <div
            className="relative"
            style={{
              width: 25,
              height: 13,
              border: '1.05px solid rgba(255,255,255,0.35)',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: 2,
                width: `${Math.min(statusBar.battery, 100) * 0.21}px`,
                height: 9,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Battery cap */}
          <div
            style={{
              width: 1.4,
              height: 4.2,
              backgroundColor: 'rgba(255,255,255,0.4)',
              marginLeft: 1,
              borderRadius: '0 1px 1px 0',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscordStatusBar;
