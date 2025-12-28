/**
 * DiscordNav - Discord Mobile Navigation Header (55px)
 */
import React from 'react';
import { discordColors } from '../../../../themes/presets';
import { DiscordBackIcon, DiscordPhoneIcon, DiscordVideoIcon } from './DiscordIcons';

const DiscordNav = ({ title, avatar, unreadCount = 0 }) => {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        width: '100%',
        height: 55,
        padding: '11px 10px 11px 13px',
        backgroundColor: discordColors.backgroundPrimary,
        borderBottom: `1px solid ${discordColors.borderPrimary}`,
      }}
    >
      {/* Left: Back + Profile + Name */}
      <div className="flex items-center" style={{ gap: 10 }}>
        {/* Back button with notification badge */}
        <div className="relative">
          <div
            className="flex items-center justify-center"
            style={{
              width: 33,
              height: 33,
              borderRadius: 23,
            }}
          >
            <DiscordBackIcon color={discordColors.headerSecondary} size={18} />
          </div>
          {/* Notification badge */}
          {unreadCount > 0 && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: unreadCount > 99 ? 28 : 21,
                height: 16,
                left: 15,
                top: 22,
                backgroundColor: discordColors.notificationRed,
                border: `3px solid ${discordColors.borderNotification}`,
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'gg sans', sans-serif",
                  fontWeight: 700,
                  fontSize: unreadCount > 99 ? 10 : 12,
                  color: '#FFFFFF',
                  letterSpacing: '0.03em',
                }}
              >
                {unreadCount > 999 ? '999+' : unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Profile photo */}
        <div className="relative">
          <img
            src={avatar}
            alt={title}
            style={{
              width: 33,
              height: 33,
              borderRadius: 22,
            }}
          />
          {/* Online status dot */}
          <div
            className="absolute"
            style={{
              width: 10,
              height: 10,
              right: 0,
              bottom: 0,
              backgroundColor: discordColors.statusOnline,
              border: `3px solid ${discordColors.backgroundPrimary}`,
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Username + arrow */}
        <div className="flex items-center" style={{ gap: 1 }}>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: discordColors.headerPrimary,
              letterSpacing: '-0.408px',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 9,
              color: '#FFFFFF',
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* Right: Call, Video buttons */}
      <div className="flex items-center" style={{ gap: 12, paddingRight: 6 }}>
        {/* Call button */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 33,
            height: 33,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 23,
          }}
        >
          <DiscordPhoneIcon color={discordColors.headerSecondary} size={15} />
        </div>

        {/* Video button */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 33,
            height: 33,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 23,
          }}
        >
          <DiscordVideoIcon color={discordColors.headerSecondary} size={17} />
        </div>
      </div>
    </div>
  );
};

export default DiscordNav;
