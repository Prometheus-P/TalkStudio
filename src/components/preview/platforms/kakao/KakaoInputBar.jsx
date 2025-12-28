/**
 * KakaoInputBar - KakaoTalk 입력창
 */
import React from 'react';
import { kakaoColors } from '../../../../themes/presets';
import { HomeIndicator } from '../../shared';

const KakaoInputBar = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        backgroundColor: kakaoColors.inputBg,
        borderTop: `1px solid ${kakaoColors.inputBorder}`,
      }}
    >
      {/* Input Area */}
      <div
        className="flex items-center"
        style={{
          padding: '8px 12px',
          gap: 8,
        }}
      >
        {/* + Button */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#F5F5F5',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke={kakaoColors.inputIconColor}
              strokeWidth="2"
              strokeLinecap="round"
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
              fontSize: 14,
              color: kakaoColors.inputPlaceholder,
            }}
          >
            메시지를 입력하세요
          </span>
        </div>

        {/* Emoticon */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={kakaoColors.inputIconColor} strokeWidth="1.5" />
            <circle cx="8" cy="10" r="1.5" fill={kakaoColors.inputIconColor} />
            <circle cx="16" cy="10" r="1.5" fill={kakaoColors.inputIconColor} />
            <path
              d="M8 15C9 16.5 11 17 12 17C13 17 15 16.5 16 15"
              stroke={kakaoColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* # Button */}
        <div className="flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M4 8H18M4 14H18M8 4V18M14 4V18"
              stroke={kakaoColors.inputIconColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Home Indicator */}
      <HomeIndicator color="#000000" />
    </div>
  );
};

export default KakaoInputBar;
