# Changelog

All notable changes to TalkStudio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-27

### Added
- iOS status bar to all themes (KakaoTalk, Discord, Telegram, Instagram)
- Discord @mention highlight support with proper styling
- Instagram "Seen" read receipt display
- Instagram timestamp display above messages
- Telegram online status indicator (green dot on avatar)
- Shorts version support for all themes (1080x1920 resolution)
- Sample screenshots for all themes in `scripts/captures/improved/`

### Changed
- KakaoTalk read receipt color from yellow to gray (matches real app)
- KakaoTalk read count position to horizontal layout (matches real app)
- Discord timestamp format to "Today at HH:MM AM/PM"
- Telegram checkmark color to iOS green (#34C759)
- Telegram status text to "online" with indicator

### Fixed
- Theme improvements now apply to both regular and shorts versions
- Consistent iOS mobile UI across all platform themes
