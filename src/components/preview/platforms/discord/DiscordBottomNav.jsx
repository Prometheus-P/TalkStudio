/**
 * DiscordBottomNav - Discord Mobile Bottom Message Bar (92px)
 */
import React from 'react';
import { discordColors } from '../../../../themes/presets';
import {
  DiscordPlusIcon,
  DiscordActivityIcon,
  DiscordGiftIcon,
  DiscordEmojiIcon,
  DiscordMicIcon,
} from './DiscordIcons';

const DiscordBottomNav = () => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: '100%',
        height: 92,
        backgroundColor: discordColors.backgroundPrimary,
        borderTop: `1px solid ${discordColors.borderPrimary}`,
      }}
    >
      {/* Message input area (79px) */}
      <div
        className="flex items-center"
        style={{
          flex: 1,
          padding: '0 13px',
          gap: 7,
        }}
      >
        {/* + button */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordPlusIcon color={discordColors.headerSecondary} size={20} />
        </div>

        {/* Activity icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordActivityIcon color={discordColors.headerSecondary} size={22} />
        </div>

        {/* Gift icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordGiftIcon color={discordColors.headerSecondary} size={20} />
        </div>

        {/* Message input field */}
        <div
          className="flex items-center flex-1"
          style={{
            height: 42,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 22,
            padding: '10px',
            gap: 6,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: discordColors.textPlaceholder,
              letterSpacing: '-0.507px',
            }}
          >
            Send a message..
          </span>
          {/* Emoji button */}
          <DiscordEmojiIcon color={discordColors.headerSecondary} size={22} />
        </div>

        {/* Mic button */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 41,
            height: 41,
            backgroundColor: discordColors.backgroundTertiary,
            borderRadius: 28.58,
          }}
        >
          <DiscordMicIcon color={discordColors.headerSecondary} size={15} />
        </div>
      </div>

      {/* Home indicator (13px) */}
      <div
        className="flex items-start justify-center"
        style={{
          width: '100%',
          height: 13,
          padding: '0 125px 8px',
        }}
      >
        <div
          style={{
            width: 139,
            height: 5,
            backgroundColor: discordColors.homeIndicator,
            borderRadius: 100,
          }}
        />
      </div>
    </div>
  );
};

export default DiscordBottomNav;
