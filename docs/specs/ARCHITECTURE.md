---
title: TalkStudio - System Architecture
version: 2.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-28
reviewers: []
---

# TalkStudio 시스템 아키텍처

> TalkStudio의 시스템 아키텍처, 컴포넌트 구조, 데이터 흐름을 정의합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 2.0.0 | 2025-12-28 | @haseongpark | 실제 구현 기반 전면 개정 |
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [FRONTEND_SPEC.md](./FRONTEND_SPEC.md) - 프론트엔드 상세 스펙
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델
- [PRD.md](./PRD.md) - 제품 요구사항

---

## 1. 시스템 개요

TalkStudio는 **카카오톡, 텔레그램, 인스타그램, 디스코드** 스타일의 대화 스크린샷을 생성하는 **프론트엔드 전용 SPA(Single Page Application)**입니다.

### 1.1 핵심 특징

| 특징 | 설명 |
|------|------|
| **프론트엔드 전용** | 서버 없이 브라우저에서 모든 기능 동작 |
| **로컬 스토리지** | localStorage 기반 프로젝트 저장 |
| **멀티 플랫폼** | 4개 메신저 + 4개 Shorts 변형 지원 |
| **Claymorphism UI** | 현대적인 3D 스타일 디자인 |
| **반응형 디자인** | 데스크톱/모바일 레이아웃 지원 |

### 1.2 기술 스택

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React 19.2.0  │  Tailwind CSS 4.1  │  Lucide React Icons   │
├─────────────────────────────────────────────────────────────┤
│                     STATE MANAGEMENT                         │
├─────────────────────────────────────────────────────────────┤
│                      Zustand 5.0.9                          │
├─────────────────────────────────────────────────────────────┤
│                     UTILITY LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  html2canvas  │  html-to-image  │  @dnd-kit  │  ExcelJS    │
├─────────────────────────────────────────────────────────────┤
│                     BUILD & TEST                             │
├─────────────────────────────────────────────────────────────┤
│     Vite 7     │    Vitest 4     │  React Testing Library   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 고수준 아키텍처

### 2.1 시스템 다이어그램

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Client)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      React Application                       │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │                    App.jsx (Root)                     │   │   │
│  │  │  ┌────────┐  ┌──────────────┐  ┌────────────────┐   │   │   │
│  │  │  │Sidebar │  │  LeftPanel   │  │  ChatPreview   │   │   │   │
│  │  │  │ (80px) │  │ (420px)      │  │   (flex-1)     │   │   │   │
│  │  │  │        │  │              │  │                │   │   │   │
│  │  │  │Platform│  │ ┌──────────┐ │  │ ┌────────────┐ │   │   │   │
│  │  │  │Selector│  │ │MessageEd.│ │  │ │ StatusBar  │ │   │   │   │
│  │  │  │        │  │ │ProfileEd.│ │  │ │ ChatNav    │ │   │   │   │
│  │  │  │        │  │ │ThemeCtrls│ │  │ │ Messages   │ │   │   │   │
│  │  │  │        │  │ └──────────┘ │  │ │ InputBar   │ │   │   │   │
│  │  │  │        │  │ ┌──────────┐ │  │ └────────────┘ │   │   │   │
│  │  │  │        │  │ │ Export   │ │  │                │   │   │   │
│  │  │  │        │  │ │ Buttons  │ │  │                │   │   │   │
│  │  │  └────────┘  │ └──────────┘ │  └────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │                  Zustand Store                        │   │   │
│  │  │  conversation │ theme │ statusBar │ projects │ ui    │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │                   Utils Layer                         │   │   │
│  │  │  storage │ sanitize │ export │ circuitBreaker        │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    localStorage                              │   │
│  │              (프로젝트 데이터 영구 저장)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 3-Column 레이아웃

```
┌────────────────────────────────────────────────────────────────────┐
│                         DESKTOP LAYOUT                              │
├────────┬─────────────────────────┬─────────────────────────────────┤
│        │                         │                                  │
│  Side  │      Editor Panel       │        Preview Panel            │
│  bar   │                         │                                  │
│        │   ┌─────────────────┐   │   ┌─────────────────────────┐   │
│  ┌──┐  │   │ Tab: 메시지     │   │   │    Preview Label        │   │
│  │K │  │   │ Tab: 프로필     │   │   ├─────────────────────────┤   │
│  ├──┤  │   │ Tab: 스타일     │   │   │                         │   │
│  │D │  │   └─────────────────┘   │   │   ┌─────────────────┐   │   │
│  ├──┤  │                         │   │   │                 │   │   │
│  │T │  │   ┌─────────────────┐   │   │   │   Chat Preview  │   │   │
│  ├──┤  │   │ Content Area    │   │   │   │   (Platform     │   │   │
│  │I │  │   │                 │   │   │   │    specific)    │   │   │
│  └──┘  │   │                 │   │   │   │                 │   │   │
│        │   └─────────────────┘   │   │   └─────────────────┘   │   │
│ 80px   │                         │   │                         │   │
│        │   ┌─────────────────┐   │   └─────────────────────────┘   │
│        │   │ Export Buttons  │   │                                  │
│        │   └─────────────────┘   │                                  │
│        │        420px            │           flex-1                 │
└────────┴─────────────────────────┴─────────────────────────────────┘
```

---

## 3. 컴포넌트 아키텍처

### 3.1 디렉토리 구조

```
src/
├── main.jsx                      # 엔트리 포인트
├── App.jsx                       # 루트 컴포넌트 (3-column 레이아웃)
├── index.css                     # 글로벌 스타일 + Tailwind
│
├── components/
│   ├── common/                   # 공통 컴포넌트
│   │   └── ErrorBoundary.jsx     # 에러 경계
│   │
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Sidebar.jsx           # 플랫폼 선택 (80px)
│   │   ├── MobileLayout.jsx      # 모바일 레이아웃
│   │   └── BottomTabBar.jsx      # 모바일 탭 바
│   │
│   ├── editor/                   # 에디터 컴포넌트
│   │   ├── LeftPanel.jsx         # 에디터 패널 (탭 컨테이너)
│   │   ├── MessageEditor.jsx     # 메시지 CRUD
│   │   ├── ProfileEditor.jsx     # 프로필 관리
│   │   ├── ThemeControls.jsx     # 테마 커스터마이징
│   │   ├── ExportButton.jsx      # PNG 내보내기
│   │   ├── SequenceExportButton.jsx  # 시퀀스 내보내기
│   │   ├── VideoExportButton.jsx     # 영상 내보내기
│   │   ├── ProjectListModal.jsx      # 프로젝트 관리
│   │   └── TemplateListModal.jsx     # 템플릿 관리
│   │
│   ├── preview/                  # 미리보기 컴포넌트
│   │   ├── ChatPreview.jsx       # 메인 미리보기 (1800+ lines)
│   │   ├── MessageBubble.jsx     # 메시지 버블
│   │   ├── StatusBar.jsx         # iOS 상태바
│   │   └── DateDivider.jsx       # 날짜 구분선
│   │
│   ├── BulkGeneration/           # 대량 생성
│   │   └── ExcelUploader.jsx
│   │
│   └── ConversationGenerator/    # AI 대화 생성
│       └── GeneratorPanel.jsx
│
├── store/
│   └── useChatStore.js           # Zustand 스토어 (485 lines)
│
├── hooks/
│   ├── useAutoSave.js            # 자동 저장
│   └── useMediaQuery.js          # 반응형 감지
│
├── themes/
│   └── presets.js                # 플랫폼별 테마 (900+ lines)
│
├── utils/
│   ├── storage.js                # localStorage 관리
│   ├── sanitize.js               # XSS 방지
│   ├── exportUtils.js            # 이미지 내보내기
│   ├── dateUtils.js              # 날짜 유틸
│   ├── timeValidation.js         # 시간 검증
│   ├── errorHandler.js           # 에러 처리
│   ├── circuitBreaker.js         # 서킷 브레이커
│   ├── durationCalculator.js     # 지속시간 계산
│   ├── sequenceRenderer.js       # 시퀀스 렌더링
│   ├── videoEncoder.js           # 비디오 인코딩
│   └── zipExporter.js            # ZIP 압축
│
└── test/
    └── setup.js                  # Vitest 설정
```

### 3.2 컴포넌트 계층

```
App.jsx
├── DesktopLayout (≥768px)
│   ├── Sidebar
│   │   └── PlatformButton × 4 (Kakao, Discord, Telegram, Insta)
│   │
│   ├── LeftPanel
│   │   ├── TabHeader (메시지, 프로필, 스타일)
│   │   ├── TabContent
│   │   │   ├── MessageEditor
│   │   │   │   ├── AddMessageForm
│   │   │   │   └── MessageList (DnD sortable)
│   │   │   ├── ProfileEditor
│   │   │   │   └── AuthorCard × N (max 10)
│   │   │   └── ThemeControls
│   │   │       ├── CanvasSizeControl
│   │   │       ├── BubbleStyleControl
│   │   │       └── ColorPickers
│   │   └── ExportSection
│   │       ├── ExportButton
│   │       ├── SequenceExportButton
│   │       └── VideoExportButton
│   │
│   └── PreviewPanel
│       ├── PreviewLabel
│       └── ChatPreview
│           ├── Platform-specific StatusBar
│           ├── Platform-specific NavBar
│           ├── MessageBubble × N
│           │   └── DateDivider (조건부)
│           └── Platform-specific InputBar
│
└── MobileLayout (<768px)
    ├── ContentArea
    │   ├── ChatPreview (preview 모드)
    │   └── Sidebar + LeftPanel (editor 모드)
    └── BottomTabBar
```

---

## 4. 상태 관리 (Zustand)

### 4.1 스토어 구조

```javascript
useChatStore = {
  // ═══════════════════════════════════════════
  // 프로젝트 관리
  // ═══════════════════════════════════════════
  currentProjectId: string | null,
  projects: Project[],

  // ═══════════════════════════════════════════
  // 대화 데이터
  // ═══════════════════════════════════════════
  conversation: {
    platformSkin: 'kakao' | 'discord' | 'telegram' | 'insta' |
                  'kakao-shorts' | 'discord-shorts' | 'telegram-shorts' | 'insta-shorts',
    title: string,
    authors: Author[],      // max 10
    messages: Message[],
    unreadCount: number,
  },

  // ═══════════════════════════════════════════
  // 테마 설정
  // ═══════════════════════════════════════════
  theme: {
    canvas: { width, height, scale },
    bubble: {
      me: { bg, textColor, radius },
      other: { bg, textColor, radius },
      system: { bg, textColor, radius },
    },
    // ...기타 테마 속성
  },

  // ═══════════════════════════════════════════
  // 상태바
  // ═══════════════════════════════════════════
  statusBar: {
    time: string,
    battery: number,
    isWifi: boolean,
  },

  // ═══════════════════════════════════════════
  // UI 상태
  // ═══════════════════════════════════════════
  selectedMessageId: string | null,
  isExporting: boolean,

  // ═══════════════════════════════════════════
  // 시퀀스 렌더링
  // ═══════════════════════════════════════════
  isRendering: boolean,
  renderProgress: number,
  visibleMessageCount: number,
}
```

### 4.2 액션 카테고리

| 카테고리 | 액션 | 설명 |
|----------|------|------|
| **플랫폼** | `setPlatform(skin)` | 플랫폼 테마 변경 |
| **테마** | `updateTheme(path, value)` | 테마 속성 업데이트 |
| | `updateBubbleStyle(role, style)` | 버블 스타일 변경 |
| **메시지** | `addMessage(msg)` | 메시지 추가 |
| | `updateMessage(id, data)` | 메시지 수정 |
| | `removeMessage(id)` | 메시지 삭제 |
| | `reorderMessages(from, to)` | 메시지 순서 변경 |
| | `duplicateMessage(id)` | 메시지 복제 |
| **프로필** | `updateAuthor(id, data)` | 프로필 수정 |
| | `addAuthor()` | 프로필 추가 (max 10) |
| | `removeAuthor(id)` | 프로필 삭제 |
| **프로젝트** | `loadProjects()` | 프로젝트 목록 로드 |
| | `loadProject(id)` | 프로젝트 로드 |
| | `saveCurrentProject()` | 현재 프로젝트 저장 |
| | `createNewProject()` | 새 프로젝트 생성 |
| | `deleteProject(id)` | 프로젝트 삭제 |
| **내보내기** | `setExporting(bool)` | 내보내기 상태 |
| | `setRenderProgress(n)` | 렌더링 진행률 |

### 4.3 Selector 패턴

```javascript
// ✅ 권장: 선택적 구독 (성능 최적화)
const platformSkin = useChatStore((s) => s.conversation.platformSkin);
const messages = useChatStore((s) => s.conversation.messages);
const setPlatform = useChatStore((s) => s.setPlatform);

// ❌ 비권장: 전체 구독 (불필요한 리렌더링)
const store = useChatStore();
```

---

## 5. 데이터 흐름

### 5.1 단방향 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                          │
│    (메시지 추가, 프로필 편집, 테마 변경, 플랫폼 선택)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EDITOR COMPONENTS                          │
│         MessageEditor │ ProfileEditor │ ThemeControls            │
└────────────────────────────┬────────────────────────────────────┘
                             │ dispatch action
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STORE                             │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  conversation │ theme │ statusBar │ projects │ ui   │     │
│    └──────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │ subscribe & re-render
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PREVIEW COMPONENTS                          │
│              ChatPreview │ MessageBubble │ StatusBar             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VISUAL OUTPUT                            │
│              (플랫폼별 스타일로 렌더링된 미리보기)                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 프로젝트 저장 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Edit   │────▶│  useAutoSave │────▶│ localStorage │
│  (2s 디바운스)│     │   (Hook)     │     │  (5MB limit) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ saveProject  │
                     │ (storage.js) │
                     └──────────────┘
```

---

## 6. 플랫폼 추상화

### 6.1 지원 플랫폼

| 플랫폼 | ID | 테마 색상 | Shorts 변형 |
|--------|-----|----------|-------------|
| 카카오톡 | `kakao` | `#FEE500` | `kakao-shorts` |
| 디스코드 | `discord` | `#5865F2` | `discord-shorts` |
| 텔레그램 | `telegram` | `#2AABEE` | `telegram-shorts` |
| 인스타그램 | `insta` | Gradient | `insta-shorts` |

### 6.2 플랫폼별 컴포넌트 구조

```javascript
// ChatPreview.jsx 내부 구조
switch (platformSkin) {
  case 'kakao':
  case 'kakao-shorts':
    return <KakaoIOSPreview {...props} />;

  case 'discord':
  case 'discord-shorts':
    return <DiscordIOSPreview {...props} />;

  case 'telegram':
  case 'telegram-shorts':
    return <TelegramIOSPreview {...props} />;

  case 'insta':
  case 'insta-shorts':
    return <InstagramIOSPreview {...props} />;
}
```

### 6.3 캔버스 크기

| 형식 | 너비 | 높이 | 비율 |
|------|------|------|------|
| 일반 | 375px | 812px | 9:19.5 |
| Shorts | 1080px | 1920px | 9:16 |

---

## 7. 디자인 패턴

### 7.1 Claymorphism UI

모든 UI 요소에 적용된 현대적인 3D 스타일:

```javascript
// 버튼 스타일 예시
style={{
  background: isActive
    ? `linear-gradient(145deg, ${color} 0%, ${color}dd 100%)`
    : 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
  boxShadow: isActive
    ? `0px 4px 0px ${color}80`
    : '0px 3px 0px rgba(0, 0, 0, 0.08)',
  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
}}
```

### 7.2 Component Composition

```jsx
// 작은 단위 컴포넌트 조합
<LeftPanel>
  <TabHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  <TabContent>
    {activeTab === 'messages' && <MessageEditor />}
    {activeTab === 'profile' && <ProfileEditor />}
    {activeTab === 'theme' && <ThemeControls />}
  </TabContent>
  <ExportSection>
    <ExportButton />
    <SequenceExportButton />
    <VideoExportButton />
  </ExportSection>
</LeftPanel>
```

### 7.3 Custom Hooks

| Hook | 용도 | 주요 기능 |
|------|------|----------|
| `useAutoSave` | 자동 저장 | 디바운스, 상태 추적, 에러 핸들링 |
| `useMediaQuery` | 반응형 | 브레이크포인트 감지 |

### 7.4 Circuit Breaker 패턴

외부 서비스 호출 시 장애 전파 방지:

```javascript
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  onStateChange: (from, to) => console.log(`[Circuit] ${from} -> ${to}`),
});

await breaker.call(() => fetch('/api/...'));
```

---

## 8. 보안 아키텍처

### 8.1 XSS 방지

```javascript
// sanitize.js - 모든 사용자 입력 새니타이징
export const sanitizeMessage = (text) => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};
```

### 8.2 입력 검증

| 항목 | 제한 |
|------|------|
| 메시지 텍스트 | 최대 1000자 |
| 프로필 이름 | 최대 20자 |
| 프로필 수 | 최대 10명 |
| 메시지 수 | 최대 100개 |
| 프로젝트 수 | localStorage 용량 내 |

### 8.3 데이터 저장

- **localStorage 사용** (5MB 제한)
- **민감 정보 없음** (인증/결제 기능 없음)
- **로컬 전용** (서버 전송 없음)

---

## 9. 성능 최적화

### 9.1 현재 적용된 최적화

| 기법 | 적용 위치 | 효과 |
|------|----------|------|
| Zustand Selector | 모든 컴포넌트 | 선택적 리렌더링 |
| Debounce | useAutoSave | 저장 호출 최소화 |
| Lazy Loading | 대형 모달 | 초기 로드 감소 |

### 9.2 개선 권장 사항

| 기법 | 적용 대상 | 우선순위 |
|------|----------|----------|
| React.memo | MessageBubble | 높음 |
| 가상화 (react-window) | 메시지 리스트 | 중간 |
| 코드 스플리팅 | 플랫폼별 프리뷰 | 중간 |
| Web Worker | 이미지 인코딩 | 낮음 |

---

## 10. 테스트 아키텍처

### 10.1 테스트 피라미드

```
                    ┌────────────┐
                    │    E2E     │  (예정)
                    │ Playwright │
                   ─┴────────────┴─
                  ┌────────────────┐
                  │  Integration   │  (일부 구현)
                  │    Tests       │
                 ─┴────────────────┴─
                ┌────────────────────┐
                │     Unit Tests     │  326개 ✅
                │ Vitest + RTL       │  커버리지 83.54%
                └────────────────────┘
```

### 10.2 테스트 범위

| 영역 | 테스트 파일 | 커버리지 |
|------|------------|----------|
| Utils | 11개 | 92.92% |
| Hooks | 1개 | 97.77% |
| Store | 1개 | 84.49% |
| Components | 7개 | 57-100% |

---

## 11. 확장성 고려사항

### 11.1 단기 개선 (High Priority)

1. **ChatPreview.jsx 리팩토링**
   - 1800+ 라인 → 플랫폼별 분리
   - 각 플랫폼 컴포넌트 독립 파일화

2. **TypeScript 마이그레이션**
   - JSX → TSX 점진적 전환
   - 타입 정의 추가

3. **Store 슬라이스화**
   - 단일 스토어 → 도메인별 슬라이스

### 11.2 중기 개선 (Medium Priority)

1. **가상 스크롤링** - 대량 메시지 성능
2. **E2E 테스트** - Playwright 통합
3. **접근성 강화** - WCAG 2.1 AA 준수

### 11.3 장기 로드맵 (Lower Priority)

1. **백엔드 통합** - 클라우드 저장, 공유 기능
2. **실시간 협업** - WebSocket 기반
3. **AI 기능** - 대화 생성, 번역

---

## 12. 의사결정 기록 (ADR 요약)

| ID | 결정 | 이유 | 날짜 |
|----|------|------|------|
| ADR-001 | Zustand 채택 | Redux 대비 간결함, 보일러플레이트 최소화 | 2025-12 |
| ADR-002 | 프론트엔드 전용 | MVP 빠른 출시, 서버 비용 절감 | 2025-12 |
| ADR-003 | Claymorphism UI | 차별화된 UX, 현대적 느낌 | 2025-12 |
| ADR-004 | 멀티 플랫폼 지원 | 시장 커버리지 확대 | 2025-12 |

---

> **Note**: 이 문서는 실제 구현 상태를 반영하여 정기적으로 업데이트됩니다.
> 마지막 업데이트: 2025-12-28
