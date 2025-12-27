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

// 쇼츠용 버블 스타일 (1080x1920, ~2.77x 스케일)
const shortsBubble = {
  paddingX: 33,
  paddingY: 22,
  maxWidthPercent: 70,
};

// 쇼츠 해상도 설정
const SHORTS_WIDTH = 1080;
const SHORTS_HEIGHT = 1920;

// KakaoTalk iOS Mobile 앱 UI 색상 - Figma 스펙 기반
export const kakaoColors = {
  // 배경
  backgroundPrimary: '#B2C7D9',           // 채팅 배경 (하늘색)
  backgroundHeader: '#404D5B',            // 헤더 배경 (다크 그레이)
  backgroundInput: '#FFFFFF',             // 입력창 배경
  backgroundInputBar: '#F7F7F7',          // 입력창 바 배경
  backgroundStatusBar: '#404D5B',         // 상태바 배경

  // 버블 - Figma kt/chatBaloonYellowBG, kt/chatBaloonBGWhite
  bubbleMe: '#FEE500',                    // 내 메시지 (카카오 노란색)
  bubbleOther: '#FFFFFF',                 // 상대 메시지 (흰색)
  bubbleText: '#1A1A1A',                  // kt/chatMessage
  bubbleRadius: 13.5,                     // borderRadius: 13.5px

  // 텍스트 - Figma 스펙
  headerText: '#FFFFFF',
  timeText: '#999999',                    // kt/baloonTime
  nameText: '#666666',                    // kt/msgName
  readCountText: '#A0A0A0',               // 읽음 수 (회색 - 실제 카톡과 동일)
  statusBarText: '#FFFFFF',

  // 시스템 메시지
  systemBg: 'rgba(0, 0, 0, 0.25)',        // fill_4N5ASQ 계열
  systemText: '#FFFFFF',
  systemRadius: 34,                       // borderRadius: 34px

  // 입력창
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5E5',
  inputPlaceholder: '#999999',
  inputIconColor: '#999999',
  inputText: '#1A1A1A',

  // 아이콘
  iconColor: '#FFFFFF',
  iconSecondary: '#8E8E93',
  addButtonColor: '#999999',

  // iOS 상태바
  notchBg: '#000000',

  // 타이포그래피 - Pretendard Variable (한글 최적화)
  fontFamily: "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  fontSizeName: 12,                       // kt/chatBaloonName
  fontSizeMessage: 15,                    // 메시지 본문
  fontSizeReadCount: 11,                  // kt/readCount
  fontSizeTime: 10,                       // kt/smallest
};

// Telegram iOS Mobile 앱 UI 색상 - Figma 스펙 기반
export const telegramColors = {
  // Primary Brand Colors
  primary: '#2AABEE',                 // 텔레그램 메인 블루
  primaryDark: '#229ED9',             // 진한 블루

  // 배경 - iOS 채팅 화면
  backgroundPrimary: '#FFFFFF',       // 메인 배경 (채팅 영역)
  backgroundGradientStart: '#C9DDEA', // 채팅 배경 그라디언트 시작
  backgroundGradientEnd: '#D4E4F0',   // 채팅 배경 그라디언트 끝
  backgroundHeader: '#527DA3',        // 헤더 배경 (iOS 네비게이션 바)
  backgroundInput: '#FFFFFF',         // 입력창 배경
  backgroundInputBar: '#F6F6F6',      // 입력창 바 배경

  // 버블 - Figma 스펙 정확히 반영
  bubbleMe: '#EEFFDE',                // 내 메시지 (연두색)
  bubbleOther: '#FFFFFF',             // 상대 메시지 (흰색)
  bubbleMeText: '#000000',
  bubbleOtherText: '#000000',
  bubbleShadow: 'rgba(0,0,0,0.08)',   // 버블 그림자

  // 텍스트 Colors
  headerText: '#FFFFFF',
  headerTitleText: '#FFFFFF',
  subtitleText: 'rgba(255,255,255,0.7)', // "last seen recently"
  onlineText: '#FFFFFF',

  // 시간/메타 텍스트 - 버블 내부
  timeTextMe: '#4FAE4E',              // 내 버블 시간 (녹색)
  timeTextOther: '#999999',           // 상대 버블 시간 (회색)

  // 이름 색상 (그룹 채팅용)
  nameColors: [
    '#FF5252', '#FF793F', '#FFB400', '#62D347',
    '#2AABEE', '#468EE5', '#8E85EE', '#E570B0',
  ],

  // 체크마크 - 읽음/안읽음 (실제 텔레그램 iOS와 동일)
  checkRead: '#34C759',               // 읽음 (밝은 녹색 더블체크 - iOS 스타일)
  checkUnread: '#8E8E93',             // 전송됨 (회색 싱글체크)
  checkSending: '#8E8E93',            // 전송중

  // 입력창
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5EA',
  inputPlaceholder: '#8E8E93',
  inputText: '#000000',
  inputIconColor: '#0088CC',          // 첨부파일 아이콘

  // 버튼/아이콘
  iconPrimary: '#FFFFFF',             // 헤더 아이콘
  iconSecondary: '#8E8E93',           // 입력창 아이콘
  sendButton: '#0088CC',              // 전송 버튼
  attachButton: '#8E8E93',            // 첨부 버튼
  voiceButton: '#0088CC',             // 음성 녹음 버튼

  // 날짜 구분선
  dateDividerBg: 'rgba(0,0,0,0.1)',
  dateDividerText: '#FFFFFF',

  // iOS 상태바
  statusBarStyle: 'light',            // 밝은 상태바 아이콘
  statusBarText: '#FFFFFF',
  notchBg: '#527DA3',                 // 노치 배경 = 헤더 색상

  // 온라인 상태
  onlineIndicator: '#4FAE4E',
  lastSeen: 'rgba(255,255,255,0.7)',
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

    // iOS 14 Pro 캔버스 크기 - Figma 스펙 기반
    canvasWidth: 390,
    canvasHeight: 844,

    // 배경
    backgroundType: 'solid',
    backgroundValue: kakaoColors.backgroundPrimary,

    // 헤더
    showHeader: true,
    headerBg: kakaoColors.backgroundHeader,
    headerTitleAlign: 'center',
    headerTitleColor: kakaoColors.headerText,
    headerTitleSize: 17,
    showStatusBar: true,

    // iOS 모바일 레이아웃 설정
    statusBarHeight: 47,
    navHeight: 56,
    inputBarHeight: 52,
    homeIndicatorHeight: 34,

    // 버블 - Figma 스펙 (borderRadius: 13.5px)
    bubble: {
      me: {
        ...baseBubble,
        bg: kakaoColors.bubbleMe,
        textColor: kakaoColors.bubbleText,
        radius: 13.5,
        radiusTopLeft: 13.5,
        radiusTopRight: 13.5,
        radiusBottomLeft: 13.5,
        radiusBottomRight: 4,       // 꼬리 부분
        tail: 'kakao',              // 카카오톡 스타일 꼬리
        align: 'right',
        paddingX: 10,
        paddingY: 8,
      },
      other: {
        ...baseBubble,
        bg: kakaoColors.bubbleOther,
        textColor: kakaoColors.bubbleText,
        radius: 13.5,
        radiusTopLeft: 13.5,
        radiusTopRight: 13.5,
        radiusBottomLeft: 4,        // 꼬리 부분
        radiusBottomRight: 13.5,
        tail: 'kakao',
        align: 'left',
        paddingX: 10,
        paddingY: 8,
      },
      system: {
        ...baseBubble,
        bg: kakaoColors.systemBg,
        textColor: kakaoColors.systemText,
        radius: 17,
        tail: 'none',
        align: 'center',
        maxWidthPercent: 80,
        paddingX: 12,
        paddingY: 6,
      },
    },

    // 타이포 - Pretendard Variable (한글 최적화)
    fontFamily: "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    fontSize: 15,                     // kt/chatMessage
    lineHeight: 1.2,

    // 메타
    showName: true,
    showTime: true,
    showReadStatus: true,
    timeColor: kakaoColors.timeText,
    nameColor: kakaoColors.nameText,
    readCountColor: kakaoColors.readCountText,

    // 아바타
    showAvatar: true,
    avatarSize: 40,
    avatarShape: 'rounded',           // 카카오톡 특유의 둥근 사각형

    // 입력창 설정
    inputBarBg: kakaoColors.backgroundInputBar,
    inputBg: kakaoColors.inputBg,
    inputBorder: kakaoColors.inputBorder,
    inputPlaceholder: kakaoColors.inputPlaceholder,
    inputIconColor: kakaoColors.inputIconColor,

    // 폰트 크기 세부 설정
    fontSizeName: kakaoColors.fontSizeName,
    fontSizeTime: kakaoColors.fontSizeTime,
    fontSizeReadCount: kakaoColors.fontSizeReadCount,
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

    // 타이포 - Inter (gg sans 대안, Discord 스타일)
    fontFamily: "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
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

    // iOS 14 Pro 캔버스 크기
    canvasWidth: 390,
    canvasHeight: 844,

    // 배경 - 텔레그램 기본 채팅 배경
    backgroundType: 'gradient',
    backgroundValue: `linear-gradient(180deg, ${telegramColors.backgroundGradientStart} 0%, ${telegramColors.backgroundGradientEnd} 100%)`,

    // 헤더 - iOS 스타일
    showHeader: true,
    headerBg: telegramColors.backgroundHeader,
    headerTitleAlign: 'center',
    headerTitleColor: telegramColors.headerTitleText,
    headerTitleSize: 17,
    showStatusBar: true,

    // iOS 모바일 레이아웃 설정
    statusBarHeight: 47,
    navHeight: 44,
    inputBarHeight: 52,
    homeIndicatorHeight: 34,

    // 버블 스타일 - Figma 정확히 반영
    bubble: {
      me: {
        ...baseBubble,
        bg: telegramColors.bubbleMe,
        textColor: telegramColors.bubbleMeText,
        radius: 17,               // 텔레그램 특유의 라운드
        radiusTopRight: 17,
        radiusBottomRight: 4,     // 꼬리 부분
        radiusTopLeft: 17,
        radiusBottomLeft: 17,
        tail: 'telegram',         // 텔레그램 스타일 꼬리
        align: 'right',
        paddingX: 10,
        paddingY: 6,
        shadow: telegramColors.bubbleShadow,
      },
      other: {
        ...baseBubble,
        bg: telegramColors.bubbleOther,
        textColor: telegramColors.bubbleOtherText,
        radius: 17,
        radiusTopLeft: 17,
        radiusBottomLeft: 4,      // 꼬리 부분
        radiusTopRight: 17,
        radiusBottomRight: 17,
        tail: 'telegram',
        align: 'left',
        paddingX: 10,
        paddingY: 6,
        shadow: telegramColors.bubbleShadow,
      },
      system: {
        ...baseBubble,
        bg: telegramColors.dateDividerBg,
        textColor: telegramColors.dateDividerText,
        radius: 10,
        tail: 'none',
        align: 'center',
        paddingX: 8,
        paddingY: 4,
      },
    },

    // 타이포그래피 - iOS SF Pro
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 17,                 // iOS 기본 텍스트 크기
    lineHeight: 1.29,             // 22/17

    // 메타 정보
    showName: false,              // 1:1 채팅에서는 이름 미표시
    showTime: true,
    showReadStatus: true,
    timeColor: telegramColors.timeTextOther,
    timeColorMe: telegramColors.timeTextMe,
    nameColor: telegramColors.nameColors[4], // 기본 파란색

    // 체크마크 설정
    checkReadColor: telegramColors.checkRead,
    checkUnreadColor: telegramColors.checkUnread,

    // 아바타 - 그룹에서만 표시
    showAvatar: false,
    avatarSize: 34,
    avatarShape: 'circle',

    // 입력창 설정
    inputBarBg: telegramColors.backgroundInputBar,
    inputBg: telegramColors.inputBg,
    inputBorder: telegramColors.inputBorder,
    inputPlaceholder: telegramColors.inputPlaceholder,
    inputIconColor: telegramColors.inputIconColor,
    sendButtonColor: telegramColors.sendButton,

    // 날짜 구분선
    dateDividerBg: telegramColors.dateDividerBg,
    dateDividerText: telegramColors.dateDividerText,

    // 온라인 상태
    onlineIndicator: telegramColors.onlineIndicator,
    lastSeenColor: telegramColors.lastSeen,
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

    // 타이포 - DM Sans (Instagram Sans / Proxima Nova 대안)
    fontFamily: "'DM Sans', -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,

    showName: false,
    showTime: false,
    showReadStatus: true,   // Seen 읽음 표시 활성화
    timeColor: '#8E8E8E',
    nameColor: '#262626',

    showAvatar: true,
    avatarSize: 28,
    avatarShape: 'circle',
  },

  // ===== 쇼츠/릴스용 프리셋 (1080x1920) =====

  'kakao-shorts': {
    id: 'kakao-shorts',
    name: '카카오톡 (쇼츠)',

    canvasWidth: SHORTS_WIDTH,
    canvasHeight: SHORTS_HEIGHT,

    backgroundType: 'solid',
    backgroundValue: '#B2C7D9',

    showHeader: true,
    headerBg: '#3E4A59',
    headerTitleAlign: 'center',
    headerTitleColor: '#FFFFFF',
    headerTitleSize: 44,
    showStatusBar: true,

    statusBarHeight: 130,
    navHeight: 152,
    bottomNavHeight: 255,
    homeIndicatorHeight: 36,

    bubble: {
      me: {
        ...shortsBubble,
        bg: '#FEE500',
        textColor: '#1A1A1A',
        radius: 44,
        tail: 'small',
        align: 'right',
      },
      other: {
        ...shortsBubble,
        bg: '#FFFFFF',
        textColor: '#1A1A1A',
        radius: 44,
        tail: 'small',
        align: 'left',
      },
      system: {
        ...shortsBubble,
        bg: 'rgba(0,0,0,0.3)',
        textColor: '#FFFFFF',
        radius: 55,
        tail: 'none',
        align: 'center',
        maxWidthPercent: 80,
      },
    },

    // 타이포 - Pretendard Variable (한글 최적화)
    fontFamily: "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    fontSize: 39,
    lineHeight: 1.4,

    showName: true,
    showTime: true,
    showReadStatus: true,
    timeColor: '#666666',
    nameColor: '#666666',

    showAvatar: true,
    avatarSize: 111,
    avatarShape: 'rounded',
  },

  'discord-shorts': {
    id: 'discord-shorts',
    name: '디스코드 (쇼츠)',

    canvasWidth: SHORTS_WIDTH,
    canvasHeight: SHORTS_HEIGHT,

    backgroundType: 'solid',
    backgroundValue: discordColors.backgroundPrimary,

    showHeader: true,
    headerBg: discordColors.backgroundPrimary,
    headerTitleAlign: 'left',
    headerTitleColor: discordColors.headerPrimary,
    headerTitleSize: 50,
    showStatusBar: true,

    statusBarHeight: 130,
    navHeight: 152,
    bottomNavHeight: 255,
    homeIndicatorHeight: 36,

    bubble: {
      me: {
        ...shortsBubble,
        bg: 'transparent',
        textColor: discordColors.textNormal,
        radius: 0,
        tail: 'none',
        align: 'left',
      },
      other: {
        ...shortsBubble,
        bg: 'transparent',
        textColor: discordColors.textNormal,
        radius: 0,
        tail: 'none',
        align: 'left',
      },
      system: {
        ...shortsBubble,
        bg: 'rgba(88, 101, 242, 0.1)',
        textColor: discordColors.textMuted,
        radius: 11,
        tail: 'none',
        align: 'center',
      },
    },

    // 타이포 - Inter (gg sans 대안, Discord 스타일)
    fontFamily: "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 42,
    lineHeight: 1.2,

    showName: true,
    showTime: true,
    showReadStatus: false,
    timeColor: discordColors.textMuted,
    nameColor: discordColors.headerSecondary,

    showAvatar: true,
    avatarSize: 111,
    avatarShape: 'circle',

    messageHoverBg: discordColors.backgroundModifierHover,
    usernameColors: {
      default: discordColors.headerSecondary,
      bot: discordColors.blurple,
      owner: '#F47FFF',
      admin: '#FF7373',
      moderator: '#57F287',
    },
  },

  'telegram-shorts': {
    id: 'telegram-shorts',
    name: '텔레그램 (쇼츠)',

    canvasWidth: SHORTS_WIDTH,
    canvasHeight: SHORTS_HEIGHT,

    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(180deg, #7BA9C9 0%, #A8C4D4 100%)',

    showHeader: true,
    headerBg: '#517DA2',
    headerTitleAlign: 'center',
    headerTitleColor: '#FFFFFF',
    headerTitleSize: 47,
    showStatusBar: true,

    statusBarHeight: 130,
    navHeight: 152,
    bottomNavHeight: 255,
    homeIndicatorHeight: 36,

    bubble: {
      me: {
        ...shortsBubble,
        bg: '#EEFFDE',
        textColor: '#000000',
        radius: 50,
        tail: 'big',
        align: 'right',
      },
      other: {
        ...shortsBubble,
        bg: '#FFFFFF',
        textColor: '#000000',
        radius: 50,
        tail: 'big',
        align: 'left',
      },
      system: {
        ...shortsBubble,
        bg: 'rgba(0,0,0,0.15)',
        textColor: '#FFFFFF',
        radius: 44,
        tail: 'none',
        align: 'center',
      },
    },

    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    fontSize: 44,
    lineHeight: 1.35,

    showName: false,
    showTime: true,
    showReadStatus: true,
    timeColor: '#8FAF9F',
    nameColor: '#3390EC',

    showAvatar: false,
    avatarSize: 100,
    avatarShape: 'circle',
  },

  'insta-shorts': {
    id: 'insta-shorts',
    name: '인스타그램 (쇼츠)',

    canvasWidth: SHORTS_WIDTH,
    canvasHeight: SHORTS_HEIGHT,

    backgroundType: 'solid',
    backgroundValue: '#FFFFFF',

    showHeader: true,
    headerBg: '#FFFFFF',
    headerTitleAlign: 'center',
    headerTitleColor: '#262626',
    headerTitleSize: 44,
    showStatusBar: true,

    statusBarHeight: 130,
    navHeight: 152,
    bottomNavHeight: 255,
    homeIndicatorHeight: 36,

    bubble: {
      me: {
        ...shortsBubble,
        bg: '#3797F0',
        textColor: '#FFFFFF',
        radius: 61,
        tail: 'none',
        align: 'right',
      },
      other: {
        ...shortsBubble,
        bg: '#EFEFEF',
        textColor: '#262626',
        radius: 61,
        tail: 'none',
        align: 'left',
      },
      system: {
        ...shortsBubble,
        bg: '#FAFAFA',
        textColor: '#8E8E8E',
        radius: 33,
        tail: 'none',
        align: 'center',
      },
    },

    // 타이포 - DM Sans (Instagram Sans / Proxima Nova 대안)
    fontFamily: "'DM Sans', -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
    fontSize: 39,
    lineHeight: 1.4,

    showName: false,
    showTime: false,
    showReadStatus: true,   // Seen 읽음 표시 활성화
    timeColor: '#8E8E8E',
    nameColor: '#262626',

    showAvatar: true,
    avatarSize: 78,
    avatarShape: 'circle',
  },
};

export const getPreset = (themeId) => {
  return themePresets[themeId] || themePresets.kakao;
};

export default themePresets;
