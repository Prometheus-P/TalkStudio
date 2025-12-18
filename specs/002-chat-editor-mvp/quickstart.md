# Quickstart: TalkStudio Chat Editor MVP

**Date**: 2025-12-11
**Feature Branch**: `002-chat-editor-mvp`

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+ 또는 pnpm 9+
- 모던 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)

## Quick Setup

```bash
# 1. 레포지토리 클론 (이미 있으면 생략)
git clone https://github.com/Prometheus-P/TalkStudio.git
cd TalkStudio

# 2. feature 브랜치 체크아웃
git checkout 002-chat-editor-mvp

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## Project Structure Overview

```text
src/
├── components/          # UI 컴포넌트
│   ├── editor/          # 에디터 영역 (메시지 편집)
│   ├── preview/         # 미리보기 영역 (캔버스)
│   ├── layout/          # 레이아웃 (3-column)
│   └── common/          # 공통 컴포넌트
├── store/               # Zustand 상태 관리
├── themes/              # 테마 프리셋 (카톡, 디스코드, 인스타)
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── hooks/               # 커스텀 훅
```

---

## Development Workflow

### 1. 새 컴포넌트 추가

```bash
# 컴포넌트 파일 생성
touch src/components/editor/NewComponent.tsx
```

컴포넌트 템플릿:
```tsx
interface NewComponentProps {
  // props 정의
}

export const NewComponent = ({ ...props }: NewComponentProps) => {
  return (
    <div className="...">
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

### 2. 스토어 액션 추가

`src/store/useEditorStore.ts`:
```typescript
import { create } from 'zustand';

interface EditorState {
  // 기존 상태...
  newAction: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // 기존 상태...
  newAction: () => set((state) => ({
    // 상태 업데이트
  })),
}));
```

### 3. 테마 추가

`src/themes/newTheme.ts`:
```typescript
import { Theme } from '../types/theme';

export const newTheme: Theme = {
  id: 'newTheme',
  name: '새 테마',
  preview: '/themes/new-preview.png',
  styles: {
    canvas: { backgroundColor: '#FFFFFF' },
    // ... 나머지 스타일
  },
};
```

`src/themes/index.ts`에 export 추가.

---

## Key Commands

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint

# 테스트 실행
npm run test

# 테스트 (watch 모드)
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

---

## Testing Guide

### 단위 테스트 작성

`tests/unit/store/useEditorStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../../../src/store/useEditorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    useEditorStore.setState({ messages: [] });
  });

  it('should add a message', () => {
    const { addMessage } = useEditorStore.getState();

    addMessage({
      speakerId: 'speaker1',
      text: 'Hello',
      type: 'normal',
    });

    const { messages } = useEditorStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Hello');
  });
});
```

### 통합 테스트 작성

`tests/integration/editor/MessageList.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageList } from '../../../src/components/editor/MessageList';

describe('MessageList', () => {
  it('should render messages', () => {
    render(<MessageList />);
    // 테스트 로직
  });
});
```

---

## Debugging Tips

### 1. Zustand DevTools

브라우저 콘솔에서 스토어 상태 확인:
```javascript
// Chrome DevTools Console
useEditorStore.getState()
```

### 2. React DevTools

- React DevTools 확장 프로그램 설치
- Components 탭에서 컴포넌트 트리 확인
- Props, State 실시간 모니터링

### 3. localStorage 확인

브라우저 DevTools > Application > Local Storage:
- `talkstudio_projects`: 저장된 프로젝트 확인
- 데이터 수동 편집/삭제 가능

### 4. 이미지 Export 디버깅

```typescript
// export.ts에 로그 추가
export const exportCanvas = async (element: HTMLElement) => {
  console.log('Export element:', element);
  console.log('Element size:', element.offsetWidth, element.offsetHeight);
  // ...
};
```

---

## Common Issues

### 1. 이미지 Export 실패

**증상**: 이미지가 빈 화면으로 저장됨

**원인**:
- Cross-origin 이미지 (외부 URL 프로필 이미지)
- CSS `background-image` URL 문제

**해결**:
```typescript
// html-to-image 옵션에 추가
await toPng(element, {
  cacheBust: true,
  includeQueryParams: true,
});
```

### 2. 드래그 앤 드롭 작동 안 함

**증상**: 메시지 드래그가 안 됨

**원인**: DndContext가 올바르게 래핑되지 않음

**해결**:
- `DndContext`가 드래그 가능한 요소들을 감싸는지 확인
- `SortableContext`의 `items` prop이 올바른 ID 배열인지 확인

### 3. localStorage 용량 초과

**증상**: 저장 시 에러 발생

**원인**: 프로필 이미지가 너무 크거나 프로젝트가 너무 많음

**해결**:
```typescript
try {
  localStorage.setItem(key, data);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // 오래된 프로젝트 삭제 안내
  }
}
```

---

## Environment Variables

이 MVP는 환경 변수가 필요 없습니다. 모든 설정은 코드 내 상수로 관리됩니다.

향후 필요 시 `.env.example`:
```bash
# v2에서 추가될 수 있는 환경 변수
# VITE_API_URL=http://localhost:3000
# VITE_ANALYTICS_ID=
```

---

## Deployment

### Vercel (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Netlify

```bash
# 빌드
npm run build

# dist/ 폴더를 Netlify에 드래그 앤 드롭
# 또는 netlify.toml 설정 후 CI/CD
```

### GitHub Pages

```bash
# vite.config.ts에 base 설정
export default defineConfig({
  base: '/TalkStudio/',
});

# 빌드 후 dist/ 폴더를 gh-pages 브랜치로 배포
```

---

## Next Steps

1. **개발 시작**: `npm run dev`
2. **스펙 확인**: [spec.md](./spec.md)
3. **데이터 모델 확인**: [data-model.md](./data-model.md)
4. **기술 결정 확인**: [research.md](./research.md)
5. **태스크 생성**: `/speckit.tasks` 실행
