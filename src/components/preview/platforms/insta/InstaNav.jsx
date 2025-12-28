/**
 * InstaNav - Instagram Mobile Navigation Header (60px)
 */
import React from 'react';
import { ChevronLeft, Phone } from 'lucide-react';
import { instagramColors } from '../../../../themes/presets';

const InstaNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 60,
        padding: '8px 16px',
        backgroundColor: instagramColors.backgroundHeader,
        borderBottom: `0.5px solid ${instagramColors.inputBorder}`,
      }}
    >
      {/* Left: Back */}
      <div className="flex items-center" style={{ width: 40 }}>
        <ChevronLeft size={28} color={instagramColors.iconColor} />
      </div>

      {/* Center: Profile + Name + Status */}
      <div className="flex items-center" style={{ gap: 12 }}>
        {avatar && (
          <div className="relative">
            <img
              src={avatar}
              alt={title}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
              }}
            />
            {/* Online dot */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 10,
                height: 10,
                backgroundColor: '#44D62C',
                border: '2px solid #FFFFFF',
                borderRadius: '50%',
              }}
            />
          </div>
        )}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "'-apple-system', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: instagramColors.headerText,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: instagramColors.subtitleText,
            }}
          >
            Active now
          </span>
        </div>
      </div>

      {/* Right: Phone, Video */}
      <div className="flex items-center" style={{ gap: 20 }}>
        <Phone size={24} color={instagramColors.iconColor} />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="5"
            width="14"
            height="14"
            rx="2"
            stroke={instagramColors.iconColor}
            strokeWidth="1.5"
          />
          <path
            d="M16 10l4-3v10l-4-3v-4z"
            stroke={instagramColors.iconColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default InstaNav;
