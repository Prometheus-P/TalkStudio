---
title: TalkStudio - Frontend Specification
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# Frontend Specification

> 이 문서는 TalkStudio 프론트엔드의 상세 스펙을 정의합니다.
> 컴포넌트 명세, UI/UX 가이드, 스타일링 규칙을 포함합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델
- [PRD.md](./PRD.md) - 제품 요구사항

---

## 1. 기술 스택

### 1.1 핵심 기술

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 라이브러리 |
| Vite | 7.2.5 | 빌드 도구 |
| Zustand | 5.0.9 | 상태 관리 |
| Tailwind CSS | 4.1.17 | 스타일링 |
| Lucide React | 0.556.0 | 아이콘 |
| html2canvas | 1.4.1 | 이미지 캡처 |

### 1.2 개발 도구

| 도구 | 버전 | 용도 |
|------|------|------|
| ESLint | 9.39.1 | 코드 품질 |
| Vitest | (예정) | 유닛 테스트 |
| Playwright | (예정) | E2E 테스트 |

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
src/
├── main.jsx                    # 엔트리 포인트
├── App.jsx                     # 루트 컴포넌트
├── index.css                   # 글로벌 스타일
│
├── components/                 # UI 컴포넌트
│   ├── common/                 # 공통 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Avatar.jsx
│   │   └── Icon.jsx
│   │
│   ├── layout/                 # 레이아웃 컴포넌트
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Panel.jsx
│   │
│   ├── editor/                 # 에디터 컴포넌트
│   │   ├── Editor.jsx
│   │   ├── ProfileEditor.jsx
│   │   ├── MessageEditor.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageItem.jsx
│   │   └── StatusBarEditor.jsx
│   │
│   └── preview/                # 프리뷰 컴포넌트
│       ├── Preview.jsx
│       ├── PhoneFrame.jsx
│       ├── StatusBar.jsx
│       ├── ChatHeader.jsx
│       ├── ChatView.jsx
│       ├── MessageBubble.jsx
│       └── ExportButton.jsx
│
├── themes/                     # 테마 설정
│   ├── index.js
│   ├── themeConfig.js
│   ├── kakao/
│   ├── telegram/
│   ├── instagram/
│   └── discord/
│
├── store/                      # 상태 관리
│   ├── useChatStore.js
│   └── initialState.js
│
├── services/                   # 서비스 레이어
│   ├── captureService.js
│   ├── downloadService.js
│   ├── storageService.js
│   └── avatarService.js
│
├── hooks/                      # 커스텀 훅
│   ├── useTheme.js
│   ├── useCapture.js
│   └── useDebounce.js
│
├── utils/                      # 유틸리티
│   ├── validators.js
│   ├── formatters.js
│   └── helpers.js
│
├── constants/                  # 상수
│   └── index.js
│
└── types/                      # 타입 정의 (JSDoc)
    └── index.js
```

### 2.2 파일 네이밍 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `MessageEditor.jsx` |
| 훅 | camelCase + use 접두어 | `useTheme.js` |
| 서비스 | camelCase + Service 접미어 | `captureService.js` |
| 유틸리티 | camelCase | `validators.js` |
| 상수 | SCREAMING_SNAKE | `THEME_COLORS.js` |
| 스타일 | camelCase | `messageStyles.js` |

---

## 3. 컴포넌트 명세

### 3.1 App (루트 컴포넌트)

```jsx
/**
 * 애플리케이션 루트 컴포넌트
 * 3-column 레이아웃 관리
 */
function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 좌측: 테마 선택 */}
      <Sidebar />

      {/* 중앙: 에디터 */}
      <Editor />

      {/* 우측: 프리뷰 */}
      <Preview />
    </div>
  );
}
```

**Props**: 없음

**상태**: 없음 (자식 컴포넌트에 위임)

---

### 3.2 Sidebar

```jsx
/**
 * 테마 선택 사이드바
 * @component
 */
function Sidebar() {
  const theme = useChatStore(state => state.config.theme);
  const setTheme = useChatStore(state => state.setTheme);

  return (
    <nav className="w-20 bg-gray-900 flex flex-col items-center py-4 gap-4">
      {THEME_LIST.map(({ id, icon, color }) => (
        <ThemeButton
          key={id}
          id={id}
          icon={icon}
          color={color}
          isActive={theme === id}
          onClick={() => setTheme(id)}
        />
      ))}
    </nav>
  );
}
```

**크기**: `w-20` (80px)

**테마 버튼 스펙**:

| 테마 | 아이콘 | 색상 |
|------|--------|------|
| Kakao | MessageCircle | `#FEE500` |
| Telegram | Send | `#2AABEE` |
| Instagram | Instagram | gradient |
| Discord | Hash | `#5865F2` |

---

### 3.3 Editor

```jsx
/**
 * 메인 에디터 패널
 * @component
 */
function Editor() {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileEditor />
        <MessageEditor />
        <MessageList />
      </div>
    </main>
  );
}
```

**하위 컴포넌트**:
- `ProfileEditor`: 프로필 설정
- `MessageEditor`: 메시지 입력
- `MessageList`: 메시지 목록

---

### 3.4 ProfileEditor

```jsx
/**
 * 프로필 편집기
 * @component
 */
function ProfileEditor() {
  const profiles = useChatStore(state => state.profiles);
  const updateProfile = useChatStore(state => state.updateProfile);

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">프로필 설정</h2>
      <div className="grid grid-cols-2 gap-4">
        <ProfileCard
          type="me"
          profile={profiles.me}
          onChange={(data) => updateProfile('me', data)}
        />
        <ProfileCard
          type="other"
          profile={profiles.other}
          onChange={(data) => updateProfile('other', data)}
        />
      </div>
    </section>
  );
}
```

**ProfileCard Props**:

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'me' \| 'other'` | 프로필 타입 |
| `profile` | `Profile` | 프로필 데이터 |
| `onChange` | `(data: Partial<Profile>) => void` | 변경 콜백 |

---

### 3.5 MessageEditor

```jsx
/**
 * 메시지 입력 에디터
 * @component
 */
function MessageEditor() {
  const [sender, setSender] = useState('me');
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const addMessage = useChatStore(state => state.addMessage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    addMessage({
      sender,
      type: 'text',
      text: text.trim(),
      time: time || getCurrentTime(),
    });

    setText('');
  };

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">메시지 입력</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 발신자 선택 */}
        <SenderToggle value={sender} onChange={setSender} />

        {/* 메시지 입력 */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="w-full p-3 border rounded-lg resize-none"
          rows={3}
        />

        {/* 시간 입력 */}
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="시간 (예: 오후 2:30)"
          className="w-full p-2 border rounded"
        />

        {/* 추가 버튼 */}
        <Button type="submit" disabled={!text.trim()}>
          메시지 추가
        </Button>
      </form>
    </section>
  );
}
```

**인터랙션**:
1. 발신자 토글 (나/상대방)
2. 메시지 텍스트 입력
3. 시간 입력 (선택)
4. 추가 버튼 클릭
5. 입력 필드 초기화

---

### 3.6 MessageList

```jsx
/**
 * 메시지 목록
 * @component
 */
function MessageList() {
  const messages = useChatStore(state => state.messages);
  const removeMessage = useChatStore(state => state.removeMessage);

  if (messages.length === 0) {
    return (
      <section className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-gray-500 text-center">
          메시지가 없습니다. 위에서 메시지를 추가해보세요.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">
        메시지 목록 ({messages.length})
      </h2>
      <ul className="space-y-2">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            onDelete={() => removeMessage(message.id)}
          />
        ))}
      </ul>
    </section>
  );
}
```

**빈 상태**: 안내 메시지 표시

---

### 3.7 Preview

```jsx
/**
 * 프리뷰 패널
 * @component
 */
function Preview() {
  const previewRef = useRef(null);

  return (
    <aside className="w-96 bg-gray-200 p-6 flex flex-col items-center">
      <PhoneFrame ref={previewRef}>
        <StatusBar />
        <ChatHeader />
        <ChatView />
      </PhoneFrame>
      <ExportButton targetRef={previewRef} />
    </aside>
  );
}
```

**크기**: `w-96` (384px)

---

### 3.8 PhoneFrame

```jsx
/**
 * 스마트폰 프레임
 * @component
 */
const PhoneFrame = forwardRef(function PhoneFrame({ children }, ref) {
  return (
    <div
      ref={ref}
      className="
        w-[375px] h-[812px]
        bg-black rounded-[50px]
        overflow-hidden
        relative
        shadow-2xl
      "
    >
      {/* 노치 */}
      <div className="
        absolute top-0 left-1/2 -translate-x-1/2
        w-[150px] h-[35px]
        bg-black rounded-b-3xl
        z-50
      " />

      {/* 콘텐츠 */}
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );
});
```

**크기**: 375x812px (iPhone 표준)

---

### 3.9 StatusBar

```jsx
/**
 * 상태바 (시간, 배터리, WiFi)
 * @component
 */
function StatusBar() {
  const { time, battery, wifi } = useChatStore(state => state.statusBar);
  const theme = useChatStore(state => state.config.theme);
  const themeConfig = THEMES[theme];

  return (
    <div
      className="h-12 px-6 flex items-center justify-between"
      style={{ background: themeConfig.statusBar.background }}
    >
      <span className="text-sm font-medium">{time}</span>
      <div className="flex items-center gap-2">
        {wifi && <WifiIcon size={16} />}
        <BatteryIcon level={battery} />
      </div>
    </div>
  );
}
```

---

### 3.10 ChatView

```jsx
/**
 * 채팅 뷰 (메시지 버블 렌더링)
 * @component
 */
function ChatView() {
  const messages = useChatStore(state => state.messages);
  const theme = useChatStore(state => state.config.theme);
  const themeConfig = THEMES[theme];

  return (
    <div
      className="flex-1 overflow-auto p-4"
      style={{ background: themeConfig.colors.background }}
    >
      <div className="flex flex-col gap-2">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            theme={themeConfig}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### 3.11 MessageBubble

```jsx
/**
 * 메시지 말풍선
 * @component
 * @param {Object} props
 * @param {Message} props.message - 메시지 데이터
 * @param {ThemeConfig} props.theme - 테마 설정
 */
function MessageBubble({ message, theme }) {
  const isMe = message.sender === 'me';

  const bubbleStyle = {
    backgroundColor: isMe ? theme.colors.myBubble : theme.colors.otherBubble,
    color: isMe ? theme.colors.myText : theme.colors.otherText,
    borderRadius: theme.bubble.borderRadius,
    padding: theme.bubble.padding,
    maxWidth: theme.bubble.maxWidth,
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && theme.layout.avatarPosition === 'left' && (
        <Avatar src={profiles.other.avatar} size={theme.layout.avatarSize} />
      )}
      <div style={bubbleStyle}>
        <p>{message.text}</p>
        {theme.layout.timePosition === 'inside' && (
          <span className="text-xs opacity-70">{message.time}</span>
        )}
      </div>
      {theme.layout.timePosition === 'outside' && (
        <span className="text-xs text-gray-500 self-end ml-1">
          {message.time}
        </span>
      )}
    </div>
  );
}
```

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `message` | `Message` | Yes | 메시지 데이터 |
| `theme` | `ThemeConfig` | Yes | 테마 설정 |

---

### 3.12 ExportButton

```jsx
/**
 * 내보내기 버튼
 * @component
 * @param {Object} props
 * @param {React.RefObject} props.targetRef - 캡처 대상 ref
 */
function ExportButton({ targetRef }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current) return;

    setIsExporting(true);
    try {
      const blob = await captureService.capture(targetRef.current, { scale: 2 });
      downloadService.downloadPng(blob);
    } catch (error) {
      console.error('Export failed:', error);
      alert('이미지 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="
        mt-4 px-6 py-3
        bg-blue-500 text-white
        rounded-lg font-medium
        hover:bg-blue-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      "
    >
      {isExporting ? '내보내는 중...' : '이미지 내보내기'}
    </button>
  );
}
```

**상태**:
- `isExporting`: 내보내기 진행 중 여부

---

## 4. UI/UX 가이드라인

### 4.1 색상 팔레트

```css
/* 기본 색상 */
--color-primary: #3B82F6;     /* Blue 500 */
--color-secondary: #6B7280;   /* Gray 500 */
--color-success: #10B981;     /* Green 500 */
--color-warning: #F59E0B;     /* Amber 500 */
--color-danger: #EF4444;      /* Red 500 */

/* 배경 색상 */
--bg-primary: #FFFFFF;
--bg-secondary: #F3F4F6;      /* Gray 100 */
--bg-tertiary: #E5E7EB;       /* Gray 200 */

/* 텍스트 색상 */
--text-primary: #111827;      /* Gray 900 */
--text-secondary: #6B7280;    /* Gray 500 */
--text-tertiary: #9CA3AF;     /* Gray 400 */
```

### 4.2 타이포그래피

| 요소 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| Heading 1 | 24px | 700 | 페이지 제목 |
| Heading 2 | 18px | 600 | 섹션 제목 |
| Body | 14px | 400 | 본문 |
| Caption | 12px | 400 | 보조 텍스트 |

### 4.3 간격 시스템

| 크기 | 값 | 용도 |
|------|-----|------|
| xs | 4px | 아이콘 간격 |
| sm | 8px | 요소 내부 |
| md | 16px | 요소 사이 |
| lg | 24px | 섹션 사이 |
| xl | 32px | 대형 간격 |

### 4.4 반응형 브레이크포인트

| 이름 | 너비 | 대상 |
|------|------|------|
| sm | 640px | 모바일 |
| md | 768px | 태블릿 |
| lg | 1024px | 노트북 |
| xl | 1280px | 데스크톱 |

> **Note**: MVP는 데스크톱 우선 (1280px+)

---

## 5. 상태 관리 패턴

### 5.1 컴포넌트-스토어 연결

```jsx
// ✅ 권장: 선택적 구독
function ThemeSelector() {
  const theme = useChatStore(state => state.config.theme);
  const setTheme = useChatStore(state => state.setTheme);

  return (/* ... */);
}

// ❌ 비권장: 전체 구독
function ThemeSelector() {
  const { config, setTheme } = useChatStore();

  return (/* ... */);
}
```

### 5.2 파생 상태

```jsx
// 컴포넌트 내 계산
function MessageStats() {
  const messages = useChatStore(state => state.messages);

  const stats = useMemo(() => ({
    total: messages.length,
    myMessages: messages.filter(m => m.sender === 'me').length,
    otherMessages: messages.filter(m => m.sender === 'other').length,
  }), [messages]);

  return (/* ... */);
}
```

### 5.3 비동기 액션

```jsx
// 서비스 레이어와 분리
function ExportButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await captureService.capture(/* ... */);
    } finally {
      setIsLoading(false);
    }
  };
}
```

---

## 6. 성능 최적화

### 6.1 메모이제이션

```jsx
// React.memo로 불필요한 리렌더링 방지
const MessageItem = memo(function MessageItem({ message, onDelete }) {
  return (/* ... */);
});

// useMemo로 계산 결과 캐싱
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.createdAt - b.createdAt),
  [messages]
);

// useCallback으로 함수 참조 유지
const handleDelete = useCallback((id) => {
  removeMessage(id);
}, [removeMessage]);
```

### 6.2 리스트 최적화

```jsx
// key는 고유하고 안정적인 값 사용
{messages.map(message => (
  <MessageItem key={message.id} message={message} />
))}

// 인덱스를 key로 사용 금지 (순서 변경 시 문제)
{messages.map((message, index) => (
  <MessageItem key={index} message={message} /> // ❌
))}
```

### 6.3 코드 스플리팅

```jsx
// 테마 컴포넌트 lazy loading
const KakaoTheme = lazy(() => import('./themes/kakao/KakaoTheme'));
const TelegramTheme = lazy(() => import('./themes/telegram/TelegramTheme'));

function ChatView() {
  const theme = useChatStore(state => state.config.theme);

  return (
    <Suspense fallback={<Loading />}>
      {theme === 'kakao' && <KakaoTheme />}
      {theme === 'telegram' && <TelegramTheme />}
    </Suspense>
  );
}
```

---

## 7. 접근성 (A11y)

### 7.1 키보드 내비게이션

```jsx
// 테마 버튼에 키보드 접근성 추가
function ThemeButton({ id, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-pressed={isActive}
      aria-label={`${id} 테마 선택`}
      className={/* ... */}
    >
      {/* ... */}
    </button>
  );
}
```

### 7.2 ARIA 레이블

```jsx
// 스크린 리더 지원
<section aria-labelledby="profile-heading">
  <h2 id="profile-heading">프로필 설정</h2>
  {/* ... */}
</section>

<input
  aria-label="메시지 입력"
  aria-describedby="message-hint"
  placeholder="메시지를 입력하세요"
/>
<span id="message-hint" className="sr-only">
  최대 1000자까지 입력 가능합니다
</span>
```

### 7.3 포커스 관리

```jsx
// 메시지 추가 후 입력 필드로 포커스 복귀
function MessageEditor() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    addMessage(/* ... */);
    inputRef.current?.focus();
  };

  return (
    <textarea ref={inputRef} /* ... */ />
  );
}
```

---

## 8. 테스트 전략

### 8.1 컴포넌트 테스트

```jsx
// tests/components/MessageEditor.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageEditor } from '../components/editor/MessageEditor';

describe('MessageEditor', () => {
  it('should render message input', () => {
    render(<MessageEditor />);
    expect(screen.getByPlaceholderText('메시지를 입력하세요')).toBeInTheDocument();
  });

  it('should add message on submit', async () => {
    render(<MessageEditor />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    const button = screen.getByRole('button', { name: '메시지 추가' });

    fireEvent.change(input, { target: { value: 'Hello!' } });
    fireEvent.click(button);

    // Zustand 스토어 확인
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('should not add empty message', () => {
    render(<MessageEditor />);

    const button = screen.getByRole('button', { name: '메시지 추가' });
    fireEvent.click(button);

    expect(useChatStore.getState().messages).toHaveLength(0);
  });
});
```

### 8.2 스냅샷 테스트

```jsx
// tests/components/MessageBubble.test.jsx
import { render } from '@testing-library/react';
import { MessageBubble } from '../components/preview/MessageBubble';
import { THEMES } from '../themes/themeConfig';

describe('MessageBubble', () => {
  const message = {
    id: '1',
    sender: 'me',
    type: 'text',
    text: 'Hello!',
    time: '12:30',
  };

  it.each(['kakao', 'telegram', 'instagram', 'discord'])(
    'should match snapshot for %s theme',
    (themeName) => {
      const { container } = render(
        <MessageBubble message={message} theme={THEMES[themeName]} />
      );
      expect(container).toMatchSnapshot();
    }
  );
});
```

---

## 9. 에러 처리

### 9.1 에러 바운더리

```jsx
// components/common/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          <h2>문제가 발생했습니다</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.2 폼 에러 처리

```jsx
function MessageEditor() {
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    const validation = validateMessage({ text, sender, time });

    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setError(null);
    addMessage(/* ... */);
  };

  return (
    <form>
      {error && (
        <div className="text-red-500 text-sm mb-2" role="alert">
          {error}
        </div>
      )}
      {/* ... */}
    </form>
  );
}
```

---

## 10. 빌드 및 배포

### 10.1 빌드 설정

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
```

### 10.2 환경 변수

```bash
# .env.example
VITE_APP_TITLE=TalkStudio
VITE_DICEBEAR_URL=https://api.dicebear.com/7.x
```

```javascript
// 사용
const title = import.meta.env.VITE_APP_TITLE;
```

---

> **Note for Developers**: 새 컴포넌트 추가 시 이 문서의 컴포넌트 명세 섹션을 업데이트하세요.
