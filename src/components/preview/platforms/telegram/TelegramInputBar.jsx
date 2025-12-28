/**
 * TelegramInputBar - Telegram Input Bar (52px)
 */
import React from 'react';
import { telegramColors } from '../../../../themes/presets';
import { HomeIndicator } from '../../shared';

const TelegramInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: telegramColors.inputBg,
      }}
    >
      {/* Input Area */}
      <div
        className="flex items-center"
        style={{
          padding: '6px 8px',
          gap: 8,
        }}
      >
        {/* Clip (Attach) */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
              stroke={telegramColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text Input */}
        <div
          className="flex-1 flex items-center"
          style={{
            height: 36,
            backgroundColor: '#F5F5F5',
            borderRadius: 18,
            padding: '0 14px',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: telegramColors.inputPlaceholder,
            }}
          >
            Message
          </span>
        </div>

        {/* Emoticon */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={telegramColors.inputIconColor} strokeWidth="1.5" />
            <circle cx="8" cy="10" r="1.5" fill={telegramColors.inputIconColor} />
            <circle cx="16" cy="10" r="1.5" fill={telegramColors.inputIconColor} />
            <path
              d="M8 15C9 16.5 11 17 12 17C13 17 15 16.5 16 15"
              stroke={telegramColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Mic */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            backgroundColor: '#64B5F6',
            borderRadius: '50%',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="#FFFFFF" />
            <path
              d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Home Indicator */}
      <HomeIndicator color="#000000" />
    </div>
  );
};

export default TelegramInputBar;
