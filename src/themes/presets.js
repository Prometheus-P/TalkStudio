/**
 * TalkStudio Theme Presets
 * 각 플랫폼별 기본 스타일 정의
 * Discord UI Kit 디자인 시스템 적용
 */

// 공통 버블 스타일 기본값
const baseBubble = {
  paddingX: 12,
  paddingY: 8,
  maxWidthPercent: 70,
};

// KakaoTalk iOS Mobile 앱 UI 색상
export const kakaoColors = {
  // 배경
  backgroundPrimary: '#B2C7D9',      // 채팅 배경 (하늘색)
  backgroundHeader: '#3E4A59',       // 헤더 배경 (다크 그레이)
  backgroundInput: '#FFFFFF',        // 입력창 배경

  // 버블
  bubbleMe: '#FEE500',               // 내 메시지 (카카오 노란색)
  bubbleOther: '#FFFFFF',            // 상대 메시지 (흰색)
  bubbleText: '#1A1A1A',             // 메시지 텍스트

  // 텍스트
  headerText: '#FFFFFF',
  timeText: '#666666',
  nameText: '#666666',
  statusBarText: '#FFFFFF',

  // 입력창
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5E5',
  inputPlaceholder: '#999999',
  inputIconColor: '#999999',

  // 아이콘
  iconColor: '#FFFFFF',
  iconSecondary: '#A0A0A0',

  // iOS 상태바
  notchBg: '#000000',
};

// Telegram iOS Mobile 앱 UI 색상
export const telegramColors = {
  // 배경
  backgroundGradientStart: '#7BA9C9',
  backgroundGradientEnd: '#A8C4D4',
  backgroundHeader: '#517DA2',       // 헤더 배경 (파란색)
  backgroundInput: '#FFFFFF',

  // 버블
  bubbleMe: '#EEFFDE',               // 내 메시지 (연두색)
  bubbleOther: '#FFFFFF',            // 상대 메시지 (흰색)
  bubbleMeText: '#000000',
  bubbleOtherText: '#000000',

  // 텍스트
  headerText: '#FFFFFF',
  subtitleText: 'rgba(255,255,255,0.7)',
  timeTextMe: '#6AAF5C',             // 내 버블 시간 (녹색)
  timeTextOther: '#A1AAB3',          // 상대 버블 시간

  // 체크마크
  checkRead: '#6AAF5C',
  checkUnread: '#A1AAB3',

  // 입력창
  inputBg: '#FFFFFF',
  inputPlaceholder: '#999999',
  inputIconColor: '#8E8E93',

  // iOS 상태바
  statusBarText: '#FFFFFF',
  notchBg: '#000000',
};

// Instagram DM iOS Mobile 앱 UI 색상
export const instagramColors = {
  // 배경
  backgroundPrimary: '#FFFFFF',
  backgroundHeader: '#FFFFFF',

  // 버블
  bubbleMe: '#3797F0',               // 내 메시지 (인스타 파란색)
  bubbleOther: '#EFEFEF',            // 상대 메시지 (회색)
  bubbleMeText: '#FFFFFF',
  bubbleOtherText: '#262626',

  // 텍스트
  headerText: '#262626',
  subtitleText: '#8E8E8E',           // "Active now"
  statusBarText: '#000000',

  // 입력창
  inputBg: '#FFFFFF',
  inputBorder: '#DBDBDB',
  inputPlaceholder: '#999999',
  inputIconColor: '#262626',

  // 아이콘
  iconColor: '#262626',

  // iOS 상태바
  notchBg: '#000000',
};

// Discord iOS Mobile 앱 UI 색상 - Figma 스펙 기반
export const discordColors = {
  // CTA Colors (Call-to-Action)
  blurple: '#5865F2',           // Primary buttons, links
  blurpleHover: '#4752C4',      // Primary button hover state
  blurpleText: '#949CF7',       // Blurple text on dark bg
  green: '#3BA55C',             // Success states, online status
  red: '#ED4245',               // Destructive actions, DND status (Discord Red)
  secondary: '#4F545C',         // Secondary buttons
  link: '#00AFF4',              // Hyperlinks
  orange: '#FAA61A',            // Warnings, idle status

  // iOS Mobile Dark Mode Palette - Figma 스펙 기준
  backgroundPrimary: '#1C1D23',       // 메인 배경 (Private Chat View)
  backgroundSecondary: '#26272F',     // DM Bubbles, 버튼 배경
  backgroundTertiary: '#25272E',      // nav 버튼, 입력창 배경
  backgroundTooltip: '#18191C',       // 툴팁
  backgroundProfile: '#232428',       // 프로필 섹션
  backgroundInput: '#25272E',         // 입력창 래퍼 배경
  backgroundInputInner: '#25272E',    // 입력창 내부
  backgroundDivider: '#303139',       // 날짜 구분선
  backgroundBadge: '#4F545C',         // 뱃지 배경
  backgroundModifierHover: '#32353B', // 메시지 호버

  // Border Colors
  borderPrimary: '#22232A',           // nav border
  borderNotification: '#1E1E1E',      // 알림 뱃지 border

  // Text Colors - iOS Mobile 기준
  textNormal: '#FFFFFF',        // 메시지 본문 (Insert Text Here)
  textMuted: '#9597A3',         // 타임스탬프, 서브텍스트 (3 hours - Yesterday)
  textPlaceholder: '#818491',   // 입력창 플레이스홀더, 날짜
  headerPrimary: '#E4E5E8',     // 유저네임 (Username)
  headerSecondary: '#C7C8CE',   // 아이콘 텍스트, Call Info 제목
  channelIcon: '#80848e',       // 채널 아이콘
  voiceCounter: '#8E9297',      // 음성 카운터

  // Interactive Colors
  interactiveNormal: '#C7C8CE',
  interactiveHover: '#dbdee1',
  interactiveActive: '#FFFFFF',
  interactiveMuted: '#4e5058',

  // Divider/Accent
  backgroundAccent: '#22232A',  // 보더 색상

  // Status Colors
  statusOnline: '#3BA55B',      // 온라인 상태 (status dot)
  statusIdle: '#f0b232',
  statusDnd: '#f23f43',
  statusOffline: '#80848e',

  // Notification Badge
  notificationRed: '#ED4245',   // Discord Red

  // iOS Specific
  statusBarText: '#FFFFFF',     // 상태바 텍스트
  homeIndicator: '#FFFFFF',     // 홈 인디케이터
  notchBg: '#000000',           // 노치 배경

  // Mobile Message Bar Colors
  messageBarBg: '#25272E',           // 메시지 바 배경
  messageBarIcons: '#C7C8CE',        // 아이콘 색상
  messageBarText: '#818491',         // 플레이스홀더 텍스트
  messageBarSeparator: '#303139',    // 구분선
  sendButtonColor: '#C7C8CE',        // Send 버튼
};

export const themePresets = {
  kakao: {
    id: 'kakao',
    name: '카카오톡',

    // 캔버스
    canvasWidth: 375,
    canvasHeight: 667,

    // 배경
    backgroundType: 'solid',
    backgroundValue: '#B2C7D9',

    // 헤더
    showHeader: true,
    headerBg: '#3E4A59',
    headerTitleAlign: 'center',
    headerTitleColor: '#FFFFFF',
    headerTitleSize: 16,
    showStatusBar: true,

    // 버블
    bubble: {
      me: {
        ...baseBubble,
        bg: '#FEE500',
        textColor: '#1A1A1A',
        radius: 16,
        tail: 'small',
        align: 'right',
      },
      other: {
        ...baseBubble,
        bg: '#FFFFFF',
        textColor: '#1A1A1A',
        radius: 16,
        tail: 'small',
        align: 'left',
      },
      system: {
        ...baseBubble,
        bg: 'rgba(0,0,0,0.3)',
        textColor: '#FFFFFF',
        radius: 20,
        tail: 'none',
        align: 'center',
        maxWidthPercent: 80,
      },
    },

    // 타이포
    fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,

    // 메타
    showName: true,
    showTime: true,
    showReadStatus: true,
    timeColor: '#666666',
    nameColor: '#666666',

    // 아바타
    showAvatar: true,
    avatarSize: 40,
    avatarShape: 'rounded',
  },

  discord: {
    id: 'discord',
    name: '디스코드',

    // iOS 14 Pro 캔버스 크기
    canvasWidth: 390,
    canvasHeight: 844,

    // 배경 - Discord iOS Dark Theme
    backgroundType: 'solid',
    backgroundValue: discordColors.backgroundPrimary,

    // 헤더
    showHeader: true,
    headerBg: discordColors.backgroundPrimary,
    headerTitleAlign: 'left',
    headerTitleColor: discordColors.headerPrimary,
    headerTitleSize: 18,
    showStatusBar: true,  // iOS 상태바 표시

    // iOS 모바일 레이아웃 설정
    statusBarHeight: 47,
    navHeight: 55,
    bottomNavHeight: 92,
    homeIndicatorHeight: 13,

    // Discord는 버블 형식이 아닌 라인 형식
    bubble: {
      me: {
        ...baseBubble,
        bg: 'transparent',
        textColor: discordColors.textNormal,
        radius: 0,
        tail: 'none',
        align: 'left',
      },
      other: {
        ...baseBubble,
        bg: 'transparent',
        textColor: discordColors.textNormal,
        radius: 0,
        tail: 'none',
        align: 'left',
      },
      system: {
        ...baseBubble,
        bg: 'rgba(88, 101, 242, 0.1)',
        textColor: discordColors.textMuted,
        radius: 4,
        tail: 'none',
        align: 'center',
      },
    },

    // 타이포 - SF Compact (iOS) 폰트 시스템
    fontFamily: "'SF Compact', 'SF Pro Text', -apple-system, sans-serif",
    fontSize: 15,
    lineHeight: 1.2,

    // 메타
    showName: true,
    showTime: true,
    showReadStatus: false,
    timeColor: discordColors.textMuted,
    nameColor: discordColors.headerSecondary,

    // 아바타
    showAvatar: true,
    avatarSize: 40,
    avatarShape: 'circle',

    // Discord 특화 설정
    messageHoverBg: discordColors.backgroundModifierHover,
    usernameColors: {
      default: discordColors.headerSecondary,
      bot: discordColors.blurple,
      owner: '#F47FFF',
      admin: '#FF7373',
      moderator: '#57F287',
    },
  },

  telegram: {
    id: 'telegram',
    name: '텔레그램',

    canvasWidth: 375,
    canvasHeight: 667,

    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(180deg, #7BA9C9 0%, #A8C4D4 100%)',

    showHeader: true,
    headerBg: '#517DA2',
    headerTitleAlign: 'center',
    headerTitleColor: '#FFFFFF',
    headerTitleSize: 17,
    showStatusBar: true,

    bubble: {
      me: {
        ...baseBubble,
        bg: '#EEFFDE',
        textColor: '#000000',
        radius: 18,
        tail: 'big',
        align: 'right',
      },
      other: {
        ...baseBubble,
        bg: '#FFFFFF',
        textColor: '#000000',
        radius: 18,
        tail: 'big',
        align: 'left',
      },
      system: {
        ...baseBubble,
        bg: 'rgba(0,0,0,0.15)',
        textColor: '#FFFFFF',
        radius: 16,
        tail: 'none',
        align: 'center',
      },
    },

    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    fontSize: 16,
    lineHeight: 1.35,

    showName: false,
    showTime: true,
    showReadStatus: true,
    timeColor: '#8FAF9F',
    nameColor: '#3390EC',

    showAvatar: false,
    avatarSize: 36,
    avatarShape: 'circle',
  },

  insta: {
    id: 'insta',
    name: '인스타그램',

    canvasWidth: 375,
    canvasHeight: 667,

    backgroundType: 'solid',
    backgroundValue: '#FFFFFF',

    showHeader: true,
    headerBg: '#FFFFFF',
    headerTitleAlign: 'center',
    headerTitleColor: '#262626',
    headerTitleSize: 16,
    showStatusBar: true,

    bubble: {
      me: {
        ...baseBubble,
        bg: '#3797F0',
        textColor: '#FFFFFF',
        radius: 22,
        tail: 'none',
        align: 'right',
      },
      other: {
        ...baseBubble,
        bg: '#EFEFEF',
        textColor: '#262626',
        radius: 22,
        tail: 'none',
        align: 'left',
      },
      system: {
        ...baseBubble,
        bg: '#FAFAFA',
        textColor: '#8E8E8E',
        radius: 12,
        tail: 'none',
        align: 'center',
      },
    },

    fontFamily: "'-apple-system', 'Segoe UI', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,

    showName: false,
    showTime: false,
    showReadStatus: false,
    timeColor: '#8E8E8E',
    nameColor: '#262626',

    showAvatar: true,
    avatarSize: 28,
    avatarShape: 'circle',
  },
};

export const getPreset = (themeId) => {
  return themePresets[themeId] || themePresets.kakao;
};

export default themePresets;
