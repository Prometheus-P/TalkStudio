# TalkStudio Architecture

> Last Updated: 2025-12-28

## Overview

TalkStudio는 카카오톡, 디스코드, 텔레그램, 인스타그램 스타일의 대화 스크린샷을 생성하는 **프론트엔드 전용 SPA**입니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                         TalkStudio                               │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + Vite 7 + Zustand 5 + Tailwind CSS 4                │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Sidebar │  │   Editor    │  │   Preview   │  ← 3-Column     │
│  │  80px   │  │   flex-1    │  │   flex-1.2  │                 │
│  └─────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **UI** | React | 19.2.0 | Component-based UI |
| **Bundler** | Vite (Rolldown) | 7.2.5 | Fast dev/build |
| **State** | Zustand | 5.0.9 | Simple state management |
| **Styling** | Tailwind CSS | 4.1.17 | Utility-first CSS |
| **DnD** | @dnd-kit | 6.3.1 | Message reordering |
| **Export** | html-to-image | 1.11.11 | PNG generation |
| **Storage** | IndexedDB | - | Project persistence |
| **Deploy** | Vercel | - | Edge hosting |

## Directory Structure

```
src/
├── components/
│   ├── editor/           # 메시지 편집 UI
│   │   ├── MessageEditor.jsx
│   │   ├── ProfileEditor.jsx
│   │   ├── ThemeControls.jsx
│   │   ├── LeftPanel.jsx
│   │   └── ExportButton.jsx
│   ├── preview/          # 채팅 미리보기
│   │   ├── ChatPreview.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── DateDivider.jsx
│   │   └── StatusBar.jsx
│   └── layout/           # 레이아웃
│       ├── Sidebar.jsx
│       └── MobileLayout.jsx
├── store/
│   └── useChatStore.js   # 핵심 상태 관리
├── themes/
│   └── presets.js        # 8개 플랫폼 테마
├── hooks/
│   ├── useAutoSave.js    # 자동 저장
│   └── useMediaQuery.js  # 반응형
├── utils/
│   ├── sanitize.js       # XSS 방지
│   ├── storage.js        # IndexedDB
│   └── imageExport.js    # 이미지 내보내기
└── App.jsx               # 루트 컴포넌트
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Editor    │────▶│ Zustand Store│────▶│   Preview    │
│  (User Input)│     │   (State)    │     │  (Render)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  IndexedDB   │
                     │ (Auto Save)  │
                     └──────────────┘
```

## State Management (Zustand)

### Store Structure

```javascript
useChatStore = {
  // Project
  currentProjectId: string | null,
  projects: Project[],

  // Conversation (Core)
  conversation: {
    platformSkin: 'kakao' | 'discord' | 'telegram' | 'insta',
    title: string,
    authors: Author[],      // max 10
    messages: Message[],
    unreadCount: number     // 0-999
  },

  // Theme
  theme: ThemePreset,

  // StatusBar
  statusBar: { time, battery, isWifi },

  // UI State
  ui: { selectedMessageId, isExporting },

  // Sequence Rendering
  sequence: { isRendering, progress, visibleMessageCount }
}
```

### Key Actions

| Category | Methods |
|----------|---------|
| Platform | `setPlatform()` |
| Theme | `updateTheme()`, `updateBubbleStyle()` |
| Messages | `addMessage()`, `removeMessage()`, `updateMessage()`, `reorderMessages()` |
| Authors | `addAuthor()`, `updateAuthor()`, `removeAuthor()` |
| Projects | `loadProject()`, `saveCurrentProject()`, `createNewProject()` |
| Export | `startSequenceRendering()`, `setSequenceProgress()` |

## Theme System

### Platform Presets (8)

| ID | Platform | Canvas | Scale |
|----|----------|--------|-------|
| `kakao` | KakaoTalk | 390x844 | 1x |
| `kakao-shorts` | KakaoTalk Shorts | 1080x1920 | 2.77x |
| `discord` | Discord | 390x844 | 1x |
| `discord-shorts` | Discord Shorts | 1080x1920 | 2.77x |
| `telegram` | Telegram | 390x844 | 1x |
| `telegram-shorts` | Telegram Shorts | 1080x1920 | 2.77x |
| `insta` | Instagram | 375x667 | 1x |
| `insta-shorts` | Instagram Shorts | 1080x1920 | 2.77x |

### Preset Properties

```javascript
ThemePreset = {
  // Canvas
  canvasWidth, canvasHeight,

  // Background
  backgroundType: 'solid' | 'gradient' | 'image',
  backgroundValue: string,

  // Header
  showHeader, headerBg, headerTitleColor,

  // Bubble Styles
  bubble: {
    me: { bg, textColor, radius, tail },
    other: { bg, textColor, radius, tail },
    system: { bg, textColor }
  },

  // Typography
  fontFamily, fontSize, lineHeight,

  // Meta
  showName, showTime, showReadStatus, showAvatar
}
```

## Component Architecture

### Layout Hierarchy

```
App.jsx
├── Sidebar (80px)
│   └── Platform buttons (Kakao, Discord, Telegram, Insta)
│
├── LeftPanel (420px)
│   ├── Tab Header (Messages / Profile / Style)
│   ├── Tab Content
│   │   ├── MessageEditor
│   │   ├── ProfileEditor
│   │   └── ThemeControls
│   └── Export Buttons (fixed bottom)
│
└── Preview Area (flex-1.2)
    └── ChatPreview
        ├── StatusBar
        ├── ChatHeader
        ├── MessageList
        │   ├── MessageBubble (x N)
        │   └── DateDivider
        └── InputBar (visual only)
```

### Key Components

| Component | Responsibility |
|-----------|----------------|
| `ChatPreview` | 4개 플랫폼 조건부 렌더링 |
| `MessageBubble` | 버블 스타일, 아바타, 시간 표시 |
| `MessageEditor` | CRUD + DnD 정렬 |
| `ProfileEditor` | 참여자 관리 (max 10) |
| `ThemeControls` | 색상/폰트 커스터마이징 |

## Security

### XSS Prevention

```javascript
// utils/sanitize.js
sanitizeMessage(message)  // text 길이 검증, 위험 문자 제거
sanitizeAuthor(author)    // name 검증, avatarUrl 유효성
sanitizeTitle(title)      // 길이 제한
```

### Input Validation

- Authors: max 10명 제한
- UnreadCount: 0-999 범위
- Messages: 자동 sanitize

## Performance Considerations

### Current Optimizations

- Zustand selector pattern (선택적 구독)
- Debounced auto-save (2초)
- Lazy loading for exports

### Future Improvements

| Issue | Solution |
|-------|----------|
| 1000+ 메시지 성능 | `@tanstack/react-virtual` 가상화 |
| 불필요한 리렌더링 | `React.memo` + shallow compare |
| 큰 스토어 | 슬라이스 패턴 분리 |

## Build & Deploy

### Development

```bash
npm run dev      # Vite dev server (HMR)
npm run lint     # ESLint check
npm run test     # Vitest
```

### Production

```bash
npm run build    # Vite production build
npm run preview  # Preview build locally
```

### Vercel Deployment

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## API Layer (Edge Functions)

```
api/
└── generate.ts   # AI 대화 생성 (OpenAI GPT-4o-mini)
```

Edge Function은 Vercel에서 실행되며, 프론트엔드와 독립적으로 동작합니다.

## FigJam Architecture Diagrams

| Diagram | Description | Link |
|---------|-------------|------|
| End-to-End Flow | 전체 시스템 플로우 | [View](https://www.figma.com/online-whiteboard/create-diagram/8cbf2964-7ab8-4cb1-adc8-fd27f89f9856) |
| App Architecture | UI + State + Data Flow | [View](https://www.figma.com/online-whiteboard/create-diagram/201dd821-bae7-4244-89bb-db4dc3a60c26) |
| User Flow | 사용자 여정 | [View](https://www.figma.com/online-whiteboard/create-diagram/7a4c5566-7848-43e5-9bde-107d24435ad2) |
| State Management | Zustand 상태 전이 | [View](https://www.figma.com/online-whiteboard/create-diagram/eb38a477-ba22-4bdb-91e5-e619b9a1821f) |
| Component Structure | React 컴포넌트 계층 | [View](https://www.figma.com/online-whiteboard/create-diagram/22ecf2d9-0e00-4878-8e46-23ac626a5dfb) |
| Backend Architecture | Clean Architecture | [View](https://www.figma.com/online-whiteboard/create-diagram/b06c9856-4326-4b26-93f9-7bce56900434) |

## Quality Constraints

| Metric | Target |
|--------|--------|
| Function length | ≤ 20 lines |
| Component length | ≤ 150 lines |
| Nesting depth | ≤ 3 levels |
| Props count | ≤ 5 |
| Test coverage | ≥ 80% |

## Changelog

- **2025-12-28**: Initial architecture documentation
- **2025-12-28**: Added FigJam diagram links
