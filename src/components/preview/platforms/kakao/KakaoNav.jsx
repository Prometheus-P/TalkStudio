/**
 * KakaoNav - KakaoTalk 네비게이션 헤더
 */
import React from 'react';
import { ChevronLeft, Search, MoreVertical } from 'lucide-react';
import { kakaoColors } from '../../../../themes/presets';

const KakaoNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 56,
        padding: '8px 12px',
        backgroundColor: kakaoColors.backgroundHeader,
      }}
    >
      {/* Left: Back */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <ChevronLeft size={28} color={kakaoColors.iconColor} />
      </div>

      {/* Center: Profile + Name */}
      <div className="flex items-center" style={{ gap: 8 }}>
        {avatar && (
          <img
            src={avatar}
            alt={title}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
            }}
          />
        )}
        <span
          style={{
            fontFamily: "'Apple SD Gothic Neo', sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: kakaoColors.headerText,
          }}
        >
          {title}
        </span>
      </div>

      {/* Right: Search, Menu */}
      <div className="flex items-center" style={{ gap: 16 }}>
        <Search size={22} color={kakaoColors.iconColor} />
        <MoreVertical size={22} color={kakaoColors.iconColor} />
      </div>
    </div>
  );
};

export default KakaoNav;
