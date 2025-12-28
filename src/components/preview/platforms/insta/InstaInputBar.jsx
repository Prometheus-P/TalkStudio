/**
 * InstaInputBar - Instagram Input Bar (56px)
 */
import React from 'react';
import { instagramColors } from '../../../../themes/presets';
import { HomeIndicator } from '../../shared';

const InstaInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: instagramColors.inputBg,
        borderTop: `0.5px solid ${instagramColors.inputBorder}`,
      }}
    >
      {/* Input Area */}
      <div
        className="flex items-center"
        style={{
          padding: '8px 12px',
          gap: 12,
        }}
      >
        {/* Camera */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: `1.5px solid ${instagramColors.inputBorder}`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="3"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="4" stroke={instagramColors.inputIconColor} strokeWidth="1.5" />
            <circle cx="18" cy="7" r="1" fill={instagramColors.inputIconColor} />
          </svg>
        </div>

        {/* Text Input */}
        <div
          className="flex-1 flex items-center"
          style={{
            height: 40,
            border: `1px solid ${instagramColors.inputBorder}`,
            borderRadius: 20,
            padding: '0 16px',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: instagramColors.inputPlaceholder,
            }}
          >
            Message...
          </span>
        </div>

        {/* Mic */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
            />
            <path
              d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill={instagramColors.inputIconColor} />
            <path
              d="M21 15l-5-5L5 21"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heart/Like */}
        <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              stroke={instagramColors.inputIconColor}
              strokeWidth="1.5"
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

export default InstaInputBar;
