/**
 * TelegramNav - Telegram Mobile Navigation Header (56px)
 */
import React from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { telegramColors } from '../../../../themes/presets';

const TelegramNav = ({ title, avatar }) => {
  return (
    <div
      className="flex items-center"
      style={{
        width: '100%',
        height: 56,
        padding: '0 8px',
        backgroundColor: telegramColors.backgroundHeader,
      }}
    >
      {/* Left: Back */}
      <div className="flex items-center" style={{ gap: 0 }}>
        <ChevronLeft size={26} color={telegramColors.headerText} strokeWidth={2} />
        <span style={{ fontSize: 17, color: telegramColors.headerText, marginLeft: -2 }}>Back</span>
      </div>

      {/* Center: Profile + Name + Status (horizontal) */}
      <div className="flex-1 flex items-center justify-center" style={{ gap: 10 }}>
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
            {/* Online status dot */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: telegramColors.onlineIndicator,
                borderRadius: '50%',
                border: `2px solid ${telegramColors.backgroundHeader}`,
              }}
            />
          </div>
        )}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: telegramColors.headerText,
              lineHeight: 1.2,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 13,
              color: telegramColors.subtitleText,
              lineHeight: 1.2,
            }}
          >
            online
          </span>
        </div>
      </div>

      {/* Right: More */}
      <div className="flex items-center">
        <MoreVertical size={22} color={telegramColors.headerText} />
      </div>
    </div>
  );
};

export default TelegramNav;
