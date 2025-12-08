---
title: TalkStudio - TDD Development Plan
version: 1.0.0
status: In Progress
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# TDD Development Plan

> 이 문서는 TalkStudio의 TDD 기반 개발 계획입니다.
> 각 태스크는 **Red → Green → Refactor** 사이클을 따릅니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 전체 맥락
- [docs/guides/TDD_GUIDE.md](./docs/guides/TDD_GUIDE.md) - TDD 상세 가이드
- [docs/guides/TEST_STRATEGY_GUIDE.md](./docs/guides/TEST_STRATEGY_GUIDE.md) - 테스트 전략

---

## TDD 사이클 개요

```
┌─────────┐     ┌─────────┐     ┌───────────┐
│   RED   │ ──▶ │  GREEN  │ ──▶ │ REFACTOR  │
│ (실패)   │     │ (통과)   │     │ (개선)     │
└─────────┘     └─────────┘     └───────────┘
     │                               │
     └───────────────────────────────┘
              반복 (Cycle)
```

---

## 진행 상태 범례

| 상태 | 의미 |
|------|------|
| `[ ]` | 미시작 |
| `[~]` | 진행 중 |
| `[x]` | 완료 |
| `[!]` | 블로킹 이슈 |

---

## Phase 1: Foundation (기반 구축)

### Epic 1.1: 테스트 환경 구성

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-1.1.1 | Vitest 설치 및 설정 | `[ ]` | `vitest.config.js` |
| T-1.1.2 | React Testing Library 설정 | `[ ]` | `src/setupTests.js` |
| T-1.1.3 | 테스트 스크립트 추가 | `[ ]` | `package.json` |
| T-1.1.4 | 커버리지 리포트 설정 | `[ ]` | `vitest.config.js` |

**완료 기준:**
- `npm run test` 명령어 실행 가능
- 샘플 테스트 통과
- 커버리지 리포트 생성

---

### Epic 1.2: 상태 관리 테스트

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-1.2.1 | useChatStore 초기 상태 테스트 | `[ ]` | `tests/unit/store/useChatStore.test.js` |
| T-1.2.2 | setTheme 액션 테스트 | `[ ]` | `tests/unit/store/useChatStore.test.js` |
| T-1.2.3 | addMessage 액션 테스트 | `[ ]` | `tests/unit/store/useChatStore.test.js` |
| T-1.2.4 | removeMessage 액션 테스트 | `[ ]` | `tests/unit/store/useChatStore.test.js` |
| T-1.2.5 | updateConfig 액션 테스트 | `[ ]` | `tests/unit/store/useChatStore.test.js` |

**테스트 케이스 예시:**
```javascript
describe('useChatStore', () => {
  describe('setTheme', () => {
    it('should change theme to kakao', () => {
      const { setTheme, config } = useChatStore.getState();
      setTheme('kakao');
      expect(useChatStore.getState().config.theme).toBe('kakao');
    });

    it('should change theme to telegram', () => {
      const { setTheme } = useChatStore.getState();
      setTheme('telegram');
      expect(useChatStore.getState().config.theme).toBe('telegram');
    });
  });
});
```

---

## Phase 2: Core Components (핵심 컴포넌트)

### Epic 2.1: 메시지 에디터 구현

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-2.1.1 | MessageEditor 컴포넌트 생성 | `[ ]` | `tests/unit/components/MessageEditor.test.jsx` |
| T-2.1.2 | 발신자 선택 기능 (me/other) | `[ ]` | `tests/unit/components/MessageEditor.test.jsx` |
| T-2.1.3 | 메시지 입력 필드 | `[ ]` | `tests/unit/components/MessageEditor.test.jsx` |
| T-2.1.4 | 메시지 추가 버튼 | `[ ]` | `tests/unit/components/MessageEditor.test.jsx` |
| T-2.1.5 | 시간 입력 필드 | `[ ]` | `tests/unit/components/MessageEditor.test.jsx` |

**테스트 케이스 예시:**
```javascript
describe('MessageEditor', () => {
  it('should add message when form is submitted', async () => {
    render(<MessageEditor />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    const submitButton = screen.getByRole('button', { name: '추가' });

    await userEvent.type(input, 'Hello, World!');
    await userEvent.click(submitButton);

    expect(useChatStore.getState().messages).toHaveLength(initialLength + 1);
  });
});
```

---

### Epic 2.2: 메시지 리스트 구현

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-2.2.1 | MessageList 컴포넌트 생성 | `[ ]` | `tests/unit/components/MessageList.test.jsx` |
| T-2.2.2 | 메시지 렌더링 | `[ ]` | `tests/unit/components/MessageList.test.jsx` |
| T-2.2.3 | 메시지 삭제 기능 | `[ ]` | `tests/unit/components/MessageList.test.jsx` |
| T-2.2.4 | 메시지 순서 변경 (드래그 앤 드롭) | `[ ]` | `tests/unit/components/MessageList.test.jsx` |
| T-2.2.5 | 빈 상태 UI | `[ ]` | `tests/unit/components/MessageList.test.jsx` |

---

### Epic 2.3: 채팅 프리뷰 구현

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-2.3.1 | ChatPreview 컴포넌트 생성 | `[ ]` | `tests/unit/components/ChatPreview.test.jsx` |
| T-2.3.2 | 상태바 렌더링 | `[ ]` | `tests/unit/components/StatusBar.test.jsx` |
| T-2.3.3 | 메시지 버블 렌더링 | `[ ]` | `tests/unit/components/MessageBubble.test.jsx` |
| T-2.3.4 | 프로필 아바타 표시 | `[ ]` | `tests/unit/components/ChatPreview.test.jsx` |

---

## Phase 3: Theme Implementation (테마 구현)

### Epic 3.1: 카카오톡 테마

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-3.1.1 | KakaoTheme 스타일 정의 | `[ ]` | `tests/unit/themes/KakaoTheme.test.jsx` |
| T-3.1.2 | 카카오톡 말풍선 스타일 | `[ ]` | `tests/unit/themes/KakaoTheme.test.jsx` |
| T-3.1.3 | 카카오톡 상태바 스타일 | `[ ]` | `tests/unit/themes/KakaoTheme.test.jsx` |
| T-3.1.4 | 카카오톡 프로필 레이아웃 | `[ ]` | `tests/unit/themes/KakaoTheme.test.jsx` |

**완료 기준:**
- 카카오톡 실제 UI와 유사도 90% 이상
- 반응형 레이아웃 지원

---

### Epic 3.2: 텔레그램 테마

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-3.2.1 | TelegramTheme 스타일 정의 | `[ ]` | `tests/unit/themes/TelegramTheme.test.jsx` |
| T-3.2.2 | 텔레그램 말풍선 스타일 | `[ ]` | `tests/unit/themes/TelegramTheme.test.jsx` |
| T-3.2.3 | 읽음 체크 표시 | `[ ]` | `tests/unit/themes/TelegramTheme.test.jsx` |
| T-3.2.4 | 텔레그램 컬러 팔레트 | `[ ]` | `tests/unit/themes/TelegramTheme.test.jsx` |

---

### Epic 3.3: 인스타그램 테마

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-3.3.1 | InstagramTheme 스타일 정의 | `[ ]` | `tests/unit/themes/InstagramTheme.test.jsx` |
| T-3.3.2 | 인스타그램 말풍선 스타일 | `[ ]` | `tests/unit/themes/InstagramTheme.test.jsx` |
| T-3.3.3 | 그라데이션 배경 | `[ ]` | `tests/unit/themes/InstagramTheme.test.jsx` |
| T-3.3.4 | 반응 이모지 지원 | `[ ]` | `tests/unit/themes/InstagramTheme.test.jsx` |

---

### Epic 3.4: 디스코드 테마

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-3.4.1 | DiscordTheme 스타일 정의 | `[ ]` | `tests/unit/themes/DiscordTheme.test.jsx` |
| T-3.4.2 | 디스코드 메시지 그룹핑 | `[ ]` | `tests/unit/themes/DiscordTheme.test.jsx` |
| T-3.4.3 | 유저네임 색상 | `[ ]` | `tests/unit/themes/DiscordTheme.test.jsx` |
| T-3.4.4 | 다크 모드 기본 적용 | `[ ]` | `tests/unit/themes/DiscordTheme.test.jsx` |

---

## Phase 4: Export Feature (내보내기 기능)

### Epic 4.1: 이미지 캡처

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-4.1.1 | html2canvas 통합 | `[ ]` | `tests/unit/utils/capture.test.js` |
| T-4.1.2 | 캡처 영역 지정 | `[ ]` | `tests/unit/utils/capture.test.js` |
| T-4.1.3 | PNG 변환 | `[ ]` | `tests/unit/utils/capture.test.js` |
| T-4.1.4 | 다운로드 트리거 | `[ ]` | `tests/unit/utils/capture.test.js` |
| T-4.1.5 | 고해상도 옵션 (2x, 3x) | `[ ]` | `tests/unit/utils/capture.test.js` |

**테스트 케이스 예시:**
```javascript
describe('capturePreview', () => {
  it('should capture preview element as PNG', async () => {
    const element = document.createElement('div');
    element.id = 'chat-preview';
    document.body.appendChild(element);

    const result = await capturePreview(element);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });
});
```

---

### Epic 4.2: 내보내기 UI

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-4.2.1 | ExportButton 컴포넌트 | `[ ]` | `tests/unit/components/ExportButton.test.jsx` |
| T-4.2.2 | 내보내기 옵션 모달 | `[ ]` | `tests/unit/components/ExportModal.test.jsx` |
| T-4.2.3 | 해상도 선택 | `[ ]` | `tests/unit/components/ExportModal.test.jsx` |
| T-4.2.4 | 로딩 상태 표시 | `[ ]` | `tests/unit/components/ExportButton.test.jsx` |

---

## Phase 5: Enhancement (기능 확장)

### Epic 5.1: 프로필 커스터마이징

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-5.1.1 | ProfileEditor 컴포넌트 | `[ ]` | `tests/unit/components/ProfileEditor.test.jsx` |
| T-5.1.2 | 이름 변경 | `[ ]` | `tests/unit/components/ProfileEditor.test.jsx` |
| T-5.1.3 | 아바타 URL 입력 | `[ ]` | `tests/unit/components/ProfileEditor.test.jsx` |
| T-5.1.4 | 아바타 미리보기 | `[ ]` | `tests/unit/components/ProfileEditor.test.jsx` |

---

### Epic 5.2: 상태바 커스터마이징

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-5.2.1 | StatusBarEditor 컴포넌트 | `[ ]` | `tests/unit/components/StatusBarEditor.test.jsx` |
| T-5.2.2 | 시간 변경 | `[ ]` | `tests/unit/components/StatusBarEditor.test.jsx` |
| T-5.2.3 | 배터리 레벨 변경 | `[ ]` | `tests/unit/components/StatusBarEditor.test.jsx` |
| T-5.2.4 | WiFi/셀룰러 토글 | `[ ]` | `tests/unit/components/StatusBarEditor.test.jsx` |

---

### Epic 5.3: 저장/불러오기

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-5.3.1 | LocalStorage 유틸리티 | `[ ]` | `tests/unit/utils/storage.test.js` |
| T-5.3.2 | 대화 저장 기능 | `[ ]` | `tests/unit/utils/storage.test.js` |
| T-5.3.3 | 대화 불러오기 기능 | `[ ]` | `tests/unit/utils/storage.test.js` |
| T-5.3.4 | 저장 목록 관리 | `[ ]` | `tests/unit/components/SavedList.test.jsx` |

---

## Phase 6: Quality Assurance (품질 보증)

### Epic 6.1: E2E 테스트

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-6.1.1 | Playwright 설정 | `[ ]` | `playwright.config.js` |
| T-6.1.2 | 기본 플로우 테스트 | `[ ]` | `tests/e2e/basic-flow.spec.js` |
| T-6.1.3 | 테마 전환 테스트 | `[ ]` | `tests/e2e/theme-switch.spec.js` |
| T-6.1.4 | 내보내기 테스트 | `[ ]` | `tests/e2e/export.spec.js` |

**E2E 테스트 시나리오:**
```javascript
test('complete user flow', async ({ page }) => {
  await page.goto('/');

  // 1. 테마 선택
  await page.click('[data-testid="theme-kakao"]');

  // 2. 메시지 추가
  await page.fill('[data-testid="message-input"]', 'Hello!');
  await page.click('[data-testid="add-message"]');

  // 3. 미리보기 확인
  await expect(page.locator('[data-testid="chat-preview"]')).toContainText('Hello!');

  // 4. 내보내기
  await page.click('[data-testid="export-button"]');
  // ... 다운로드 확인
});
```

---

### Epic 6.2: 접근성 (A11y)

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-6.2.1 | 키보드 네비게이션 | `[ ]` | `tests/a11y/keyboard.test.jsx` |
| T-6.2.2 | 스크린 리더 호환성 | `[ ]` | `tests/a11y/screenreader.test.jsx` |
| T-6.2.3 | 색상 대비 검사 | `[ ]` | `tests/a11y/contrast.test.jsx` |
| T-6.2.4 | ARIA 레이블 적용 | `[ ]` | `tests/a11y/aria.test.jsx` |

---

### Epic 6.3: 성능 최적화

| ID | 태스크 | 상태 | 테스트 파일 |
|----|--------|------|------------|
| T-6.3.1 | React.memo 적용 | `[ ]` | - |
| T-6.3.2 | 불필요한 리렌더링 제거 | `[ ]` | - |
| T-6.3.3 | 번들 사이즈 최적화 | `[ ]` | - |
| T-6.3.4 | 이미지 최적화 | `[ ]` | - |

---

## 테스트 커버리지 목표

| 테스트 유형 | 현재 | 목표 |
|------------|------|------|
| Unit Test | 0% | 80% |
| Integration Test | 0% | 60% |
| E2E Test | 0% | Critical Path 100% |

---

## 주간 목표 템플릿

```markdown
### Week N (YYYY-MM-DD ~ YYYY-MM-DD)

**목표:**
- [ ] Epic X.Y 완료

**완료:**
- [x] T-X.Y.Z 완료

**블로커:**
- T-X.Y.Z: [이유]

**다음 주 계획:**
- Epic X.Y 시작
```

---

## 진행 기록

### Week 1 (2025-12-08 ~)

**목표:**
- [ ] Epic 1.1: 테스트 환경 구성

**완료:**
- [x] 프로젝트 문서화 (CONTEXT.md, README.md, ENVIRONMENT.md, plan.md)

**다음 주 계획:**
- Epic 1.1 완료
- Epic 1.2 시작

---

## 명령어 참조

| 명령어 | 설명 |
|--------|------|
| `npm run test` | 전체 테스트 실행 |
| `npm run test:watch` | 감시 모드로 테스트 실행 |
| `npm run test:coverage` | 커버리지 리포트 생성 |
| `npm run test:e2e` | E2E 테스트 실행 |

---

> **Note**: 이 문서는 개발 진행에 따라 실시간으로 업데이트됩니다.
> `go` 명령어로 다음 TDD 사이클을 시작할 수 있습니다.
