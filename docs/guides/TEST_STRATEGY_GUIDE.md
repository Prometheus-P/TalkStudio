---
title: TalkStudio - Test Strategy Guide
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# Test Strategy Guide

> 이 문서는 TalkStudio 프로젝트의 테스트 전략을 정의합니다.
> 테스트 피라미드, 테스트 유형별 가이드, 커버리지 목표를 포함합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [TDD_GUIDE.md](./TDD_GUIDE.md) - TDD 가이드
- [plan.md](../../plan.md) - TDD 개발 계획
- [FRONTEND_SPEC.md](../specs/FRONTEND_SPEC.md) - 프론트엔드 스펙

---

## 1. 테스트 전략 개요

### 1.1 테스트 피라미드

```
                    ┌─────────────┐
                    │    E2E     │  5%
                    │  (느림)    │
                   ─┴─────────────┴─
                  ┌─────────────────┐
                  │  Integration   │  15%
                  │   (중간)       │
                 ─┴─────────────────┴─
                ┌───────────────────────┐
                │        Unit          │  80%
                │       (빠름)         │
                └───────────────────────┘
```

### 1.2 테스트 유형별 목표

| 테스트 유형 | 커버리지 목표 | 실행 시간 | 비율 |
|------------|-------------|----------|------|
| Unit Test | 80% | < 5초 | 80% |
| Integration Test | 60% | < 30초 | 15% |
| E2E Test | Critical Path 100% | < 2분 | 5% |

### 1.3 테스트 도구

| 도구 | 용도 | 버전 |
|------|------|------|
| Vitest | Unit/Integration 테스트 | 1.x |
| React Testing Library | 컴포넌트 테스트 | 14.x |
| Playwright | E2E 테스트 | 1.x |
| MSW | API 모킹 | 2.x |

---

## 2. Unit Test

### 2.1 대상

| 대상 | 예시 |
|------|------|
| 유틸리티 함수 | validators, formatters, helpers |
| Zustand 스토어 | actions, selectors |
| 커스텀 훅 | useTheme, useDebounce |
| 순수 함수 | calculateTotal, parseMessage |

### 2.2 작성 원칙

```javascript
// ✅ 좋은 유닛 테스트
describe('validateMessage', () => {
  // 1. 명확한 테스트 이름
  it('should return valid when message has text and sender', () => {
    // 2. AAA 패턴
    // Arrange
    const message = {
      sender: 'me',
      text: 'Hello',
      time: '12:30',
    };

    // Act
    const result = validateMessage(message);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // 3. 엣지 케이스 테스트
  it('should return invalid when text is empty string', () => {
    const message = { sender: 'me', text: '', time: '12:30' };
    const result = validateMessage(message);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('text is required');
  });

  it('should return invalid when text is only whitespace', () => {
    const message = { sender: 'me', text: '   ', time: '12:30' };
    const result = validateMessage(message);

    expect(result.isValid).toBe(false);
  });
});
```

### 2.3 Zustand 스토어 테스트

```javascript
// tests/unit/store/useChatStore.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../../../src/store/useChatStore';

describe('useChatStore', () => {
  // 각 테스트 전 스토어 초기화
  beforeEach(() => {
    useChatStore.setState({
      config: { theme: 'kakao', capturedImage: null },
      messages: [],
      profiles: {
        me: { name: '나', avatar: '' },
        other: { name: '상대방', avatar: '' },
      },
      statusBar: { time: '12:30', battery: 85, wifi: true },
    });
  });

  describe('setTheme', () => {
    it('should update theme in config', () => {
      // Act
      useChatStore.getState().setTheme('telegram');

      // Assert
      expect(useChatStore.getState().config.theme).toBe('telegram');
    });

    it.each(['kakao', 'telegram', 'instagram', 'discord'])(
      'should accept valid theme: %s',
      (theme) => {
        useChatStore.getState().setTheme(theme);
        expect(useChatStore.getState().config.theme).toBe(theme);
      }
    );
  });

  describe('addMessage', () => {
    it('should add message with generated id', () => {
      const message = {
        sender: 'me',
        type: 'text',
        text: 'Hello!',
        time: '12:30',
      };

      useChatStore.getState().addMessage(message);

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBeDefined();
      expect(messages[0].text).toBe('Hello!');
    });

    it('should append message to existing messages', () => {
      // 기존 메시지 설정
      useChatStore.setState({
        messages: [{ id: '1', sender: 'other', text: 'Hi', time: '12:29' }],
      });

      useChatStore.getState().addMessage({
        sender: 'me',
        text: 'Hello!',
        time: '12:30',
      });

      expect(useChatStore.getState().messages).toHaveLength(2);
    });
  });

  describe('removeMessage', () => {
    it('should remove message by id', () => {
      useChatStore.setState({
        messages: [
          { id: 'msg-1', sender: 'me', text: 'Hello', time: '12:30' },
          { id: 'msg-2', sender: 'other', text: 'Hi', time: '12:31' },
        ],
      });

      useChatStore.getState().removeMessage('msg-1');

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-2');
    });

    it('should do nothing when id does not exist', () => {
      useChatStore.setState({
        messages: [{ id: 'msg-1', sender: 'me', text: 'Hello', time: '12:30' }],
      });

      useChatStore.getState().removeMessage('non-existent');

      expect(useChatStore.getState().messages).toHaveLength(1);
    });
  });
});
```

### 2.4 유틸리티 함수 테스트

```javascript
// tests/unit/utils/formatters.test.js
import { describe, it, expect } from 'vitest';
import { formatTime, formatBattery } from '../../../src/utils/formatters';

describe('formatTime', () => {
  it('should format timestamp to HH:mm', () => {
    const timestamp = new Date('2025-12-08T14:30:00').getTime();
    expect(formatTime(timestamp)).toBe('14:30');
  });

  it('should handle midnight correctly', () => {
    const timestamp = new Date('2025-12-08T00:00:00').getTime();
    expect(formatTime(timestamp)).toBe('00:00');
  });

  it('should return empty string for invalid input', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime(undefined)).toBe('');
    expect(formatTime('invalid')).toBe('');
  });
});

describe('formatBattery', () => {
  it.each([
    [100, '100%'],
    [50, '50%'],
    [0, '0%'],
  ])('should format %i as %s', (input, expected) => {
    expect(formatBattery(input)).toBe(expected);
  });

  it('should clamp values to 0-100', () => {
    expect(formatBattery(-10)).toBe('0%');
    expect(formatBattery(150)).toBe('100%');
  });
});
```

---

## 3. Component Test

### 3.1 대상

| 대상 | 테스트 내용 |
|------|-----------|
| UI 컴포넌트 | 렌더링, 스타일 |
| 인터랙티브 컴포넌트 | 사용자 이벤트, 상태 변경 |
| 폼 컴포넌트 | 입력, 검증, 제출 |

### 3.2 렌더링 테스트

```jsx
// tests/components/MessageBubble.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../../src/components/preview/MessageBubble';
import { THEMES } from '../../src/themes/themeConfig';

describe('MessageBubble', () => {
  const defaultProps = {
    message: {
      id: '1',
      sender: 'me',
      type: 'text',
      text: 'Hello, World!',
      time: '12:30',
    },
    theme: THEMES.kakao,
  };

  it('should render message text', () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should render time', () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText('12:30')).toBeInTheDocument();
  });

  it('should apply different styles for sender "me"', () => {
    const { container } = render(<MessageBubble {...defaultProps} />);

    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('should apply different styles for sender "other"', () => {
    const props = {
      ...defaultProps,
      message: { ...defaultProps.message, sender: 'other' },
    };
    const { container } = render(<MessageBubble {...props} />);

    expect(container.firstChild).toHaveClass('justify-start');
  });
});
```

### 3.3 인터랙션 테스트

```jsx
// tests/components/MessageEditor.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageEditor } from '../../src/components/editor/MessageEditor';
import { useChatStore } from '../../src/store/useChatStore';

describe('MessageEditor', () => {
  beforeEach(() => {
    useChatStore.setState({ messages: [] });
  });

  it('should add message when form is submitted', async () => {
    const user = userEvent.setup();
    render(<MessageEditor />);

    // 메시지 입력
    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await user.type(input, 'Test message');

    // 제출
    const submitButton = screen.getByRole('button', { name: '메시지 추가' });
    await user.click(submitButton);

    // 검증
    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Test message');
  });

  it('should toggle sender between "me" and "other"', async () => {
    const user = userEvent.setup();
    render(<MessageEditor />);

    // "상대방" 버튼 클릭
    const otherButton = screen.getByRole('button', { name: '상대방' });
    await user.click(otherButton);

    // 메시지 입력 및 제출
    await user.type(screen.getByPlaceholderText('메시지를 입력하세요'), 'Hi');
    await user.click(screen.getByRole('button', { name: '메시지 추가' }));

    // 검증
    const messages = useChatStore.getState().messages;
    expect(messages[0].sender).toBe('other');
  });

  it('should disable submit button when input is empty', () => {
    render(<MessageEditor />);

    const submitButton = screen.getByRole('button', { name: '메시지 추가' });
    expect(submitButton).toBeDisabled();
  });

  it('should clear input after submission', async () => {
    const user = userEvent.setup();
    render(<MessageEditor />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: '메시지 추가' }));

    expect(input).toHaveValue('');
  });
});
```

### 3.4 스냅샷 테스트

```jsx
// tests/components/Sidebar.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sidebar } from '../../src/components/layout/Sidebar';

describe('Sidebar', () => {
  it('should match snapshot', () => {
    const { container } = render(<Sidebar />);
    expect(container).toMatchSnapshot();
  });

  it.each(['kakao', 'telegram', 'instagram', 'discord'])(
    'should match snapshot when %s theme is active',
    (theme) => {
      useChatStore.setState({ config: { theme } });
      const { container } = render(<Sidebar />);
      expect(container).toMatchSnapshot();
    }
  );
});
```

---

## 4. Integration Test

### 4.1 대상

| 대상 | 테스트 내용 |
|------|-----------|
| 컴포넌트 조합 | 부모-자식 상호작용 |
| 스토어 연동 | 컴포넌트-스토어 통신 |
| 서비스 연동 | 컴포넌트-서비스 통신 |

### 4.2 컴포넌트 통합 테스트

```jsx
// tests/integration/MessageFlow.test.jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '../../src/components/editor/Editor';
import { Preview } from '../../src/components/preview/Preview';
import { useChatStore } from '../../src/store/useChatStore';

describe('Message Flow Integration', () => {
  beforeEach(() => {
    useChatStore.setState({
      config: { theme: 'kakao' },
      messages: [],
      profiles: {
        me: { name: '나', avatar: '' },
        other: { name: '상대방', avatar: '' },
      },
    });
  });

  it('should show message in preview after adding in editor', async () => {
    const user = userEvent.setup();

    // 에디터와 프리뷰 렌더링
    const { rerender } = render(
      <>
        <Editor />
        <Preview />
      </>
    );

    // 에디터에서 메시지 추가
    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await user.type(input, '안녕하세요!');
    await user.click(screen.getByRole('button', { name: '메시지 추가' }));

    // 프리뷰에서 메시지 확인
    const preview = screen.getByTestId('chat-preview');
    expect(within(preview).getByText('안녕하세요!')).toBeInTheDocument();
  });

  it('should remove message from preview after deletion', async () => {
    const user = userEvent.setup();

    // 초기 메시지 설정
    useChatStore.setState({
      messages: [
        { id: 'msg-1', sender: 'me', text: '삭제할 메시지', time: '12:30' },
      ],
    });

    render(
      <>
        <Editor />
        <Preview />
      </>
    );

    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: '삭제' });
    await user.click(deleteButton);

    // 프리뷰에서 메시지 사라짐 확인
    expect(screen.queryByText('삭제할 메시지')).not.toBeInTheDocument();
  });
});
```

### 4.3 테마 전환 통합 테스트

```jsx
// tests/integration/ThemeSwitch.test.jsx
describe('Theme Switch Integration', () => {
  it('should update preview style when theme changes', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Sidebar />
        <Preview />
      </>
    );

    // 카카오 테마 확인
    const preview = screen.getByTestId('chat-preview');
    expect(preview).toHaveStyle({ backgroundColor: '#B2C7D9' });

    // 텔레그램 테마로 전환
    await user.click(screen.getByRole('button', { name: '텔레그램' }));

    // 스타일 변경 확인
    expect(preview).toHaveStyle({ backgroundColor: '#0E1621' });
  });
});
```

---

## 5. E2E Test

### 5.1 대상

| 시나리오 | 중요도 |
|---------|--------|
| 기본 대화 생성 플로우 | Critical |
| 테마 전환 | High |
| 이미지 내보내기 | Critical |
| 대화 저장/불러오기 | High |

### 5.2 Playwright 설정

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.3 기본 플로우 E2E 테스트

```javascript
// tests/e2e/basic-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Basic Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full chat creation flow', async ({ page }) => {
    // 1. 테마 선택
    await page.click('[data-testid="theme-kakao"]');

    // 2. "나" 메시지 추가
    await page.fill('[data-testid="message-input"]', '안녕하세요!');
    await page.click('[data-testid="add-message"]');

    // 3. "상대방" 메시지 추가
    await page.click('[data-testid="sender-other"]');
    await page.fill('[data-testid="message-input"]', '네, 안녕하세요!');
    await page.click('[data-testid="add-message"]');

    // 4. 프리뷰 확인
    const preview = page.locator('[data-testid="chat-preview"]');
    await expect(preview).toContainText('안녕하세요!');
    await expect(preview).toContainText('네, 안녕하세요!');

    // 5. 메시지 개수 확인
    const messages = preview.locator('[data-testid="message-bubble"]');
    await expect(messages).toHaveCount(2);
  });

  test('should export image successfully', async ({ page }) => {
    // 메시지 추가
    await page.fill('[data-testid="message-input"]', 'Test message');
    await page.click('[data-testid="add-message"]');

    // 다운로드 이벤트 대기
    const downloadPromise = page.waitForEvent('download');

    // 내보내기 클릭
    await page.click('[data-testid="export-button"]');

    // 다운로드 확인
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.png');
  });
});
```

### 5.4 테마 전환 E2E 테스트

```javascript
// tests/e2e/theme-switch.spec.js
test.describe('Theme Switch', () => {
  const themes = [
    { id: 'kakao', color: 'rgb(254, 229, 0)' },
    { id: 'telegram', color: 'rgb(42, 171, 238)' },
    { id: 'instagram', name: 'instagram' },
    { id: 'discord', color: 'rgb(88, 101, 242)' },
  ];

  for (const theme of themes) {
    test(`should switch to ${theme.id} theme`, async ({ page }) => {
      await page.goto('/');

      // 테마 버튼 클릭
      await page.click(`[data-testid="theme-${theme.id}"]`);

      // 활성화 상태 확인
      const button = page.locator(`[data-testid="theme-${theme.id}"]`);
      await expect(button).toHaveAttribute('aria-pressed', 'true');

      // 프리뷰 스타일 변경 확인
      const preview = page.locator('[data-testid="phone-frame"]');
      await expect(preview).toBeVisible();
    });
  }
});
```

---

## 6. 테스트 커버리지

### 6.1 커버리지 목표

| 영역 | 목표 | 측정 |
|------|------|------|
| Statements | 80% | 전체 문장 |
| Branches | 75% | 조건문 분기 |
| Functions | 80% | 함수 |
| Lines | 80% | 코드 라인 |

### 6.2 커버리지 리포트

```bash
# 커버리지 실행
npm run test:coverage

# 출력 예시
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   85.32 |    78.45 |   82.15 |   85.32 |
 src/store/            |   92.00 |    85.00 |   90.00 |   92.00 |
  useChatStore.js      |   92.00 |    85.00 |   90.00 |   92.00 |
 src/components/       |   82.00 |    75.00 |   80.00 |   82.00 |
  MessageEditor.jsx    |   85.00 |    80.00 |   85.00 |   85.00 |
  ...                  |         |          |         |         |
-----------------------|---------|----------|---------|---------|
```

### 6.3 커버리지 예외

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{js,jsx}',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/constants/**',
      ],
    },
  },
});
```

---

## 7. 테스트 모범 사례

### 7.1 테스트 격리

```javascript
// ✅ 각 테스트는 독립적
describe('MessageStore', () => {
  beforeEach(() => {
    // 매 테스트 전 초기화
    resetStore();
  });

  afterEach(() => {
    // 정리 (필요시)
    vi.clearAllMocks();
  });
});
```

### 7.2 비동기 테스트

```javascript
// ✅ async/await 사용
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// ✅ waitFor 사용 (상태 변경 대기)
it('should update UI after data load', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 7.3 테스트 데이터

```javascript
// tests/fixtures/messages.js
export const sampleMessages = [
  {
    id: 'msg-1',
    sender: 'me',
    type: 'text',
    text: '안녕하세요!',
    time: '12:30',
  },
  {
    id: 'msg-2',
    sender: 'other',
    type: 'text',
    text: '네, 반갑습니다!',
    time: '12:31',
  },
];

export const createMessage = (overrides = {}) => ({
  id: `msg-${Date.now()}`,
  sender: 'me',
  type: 'text',
  text: 'Test message',
  time: '12:30',
  ...overrides,
});
```

---

## 8. CI/CD 테스트

### 8.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 9. 체크리스트

### 9.1 테스트 작성 체크리스트

```markdown
- [ ] 테스트 이름이 의도를 설명하는가?
- [ ] AAA 패턴을 따르는가?
- [ ] 하나의 동작만 테스트하는가?
- [ ] 엣지 케이스를 포함하는가?
- [ ] 테스트가 격리되어 있는가?
```

### 9.2 PR 테스트 체크리스트

```markdown
- [ ] 모든 기존 테스트가 통과하는가?
- [ ] 새 기능에 테스트를 추가했는가?
- [ ] 커버리지가 감소하지 않았는가?
- [ ] E2E 테스트가 필요한 경우 추가했는가?
```

---

> **Remember**: 테스트는 코드의 품질을 보장하는 안전망입니다.
> 테스트 없이 리팩토링하는 것은 안전망 없이 곡예하는 것과 같습니다.
