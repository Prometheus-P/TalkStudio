# Research: TalkStudio Chat Editor MVP

**Date**: 2025-12-11
**Feature Branch**: `002-chat-editor-mvp`

## Overview

이 문서는 TalkStudio MVP 구현에 필요한 기술적 결정사항과 라이브러리 선택 근거를 정리합니다.

---

## 1. DOM to Image Library

### Decision: **html-to-image**

### Rationale
- **번들 크기**: html-to-image (3.8KB gzipped) vs html2canvas (40KB gzipped) - 10배 이상 가벼움
- **해상도 지원**: `pixelRatio` 옵션으로 1x/2x/3x 해상도 쉽게 지원
- **WebP 지원**: 네이티브 WebP export 지원 (`toBlob`의 type 파라미터)
- **유지보수**: 활발한 업데이트, TypeScript 타입 내장
- **성능**: SVG 기반 변환으로 복잡한 CSS도 정확하게 렌더링

### Alternatives Considered
| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| html2canvas | 널리 사용됨, 안정적 | 번들 크기 큼, 일부 CSS 미지원 | 거부 - 무거움 |
| dom-to-image | 가벼움 | 유지보수 중단, 버그 다수 | 거부 - 유지보수 없음 |
| html-to-image | 가벼움, 활발한 개발, TS 지원 | 상대적으로 신규 | **선택** |

### Usage Pattern
```typescript
import { toPng, toBlob } from 'html-to-image';

// PNG export (2x resolution)
const dataUrl = await toPng(element, { pixelRatio: 2 });

// WebP export
const blob = await toBlob(element, {
  pixelRatio: 2,
  type: 'image/webp',
  quality: 0.9
});
```

---

## 2. Drag and Drop Library

### Decision: **@dnd-kit/core**

### Rationale
- **React 친화적**: React 18/19의 concurrent features와 완벽 호환
- **접근성**: WAI-ARIA 가이드라인 준수, 키보드 내비게이션 내장
- **유연성**: sensors, modifiers, collision detection 커스터마이징 가능
- **번들 크기**: 모듈화되어 필요한 것만 import (@dnd-kit/core ~4KB)
- **TypeScript**: 완전한 타입 지원

### Alternatives Considered
| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| react-beautiful-dnd | 아름다운 애니메이션 | 유지보수 중단 (Atlassian 포기), React 18+ 호환 이슈 | 거부 |
| react-dnd | 유연성 | 러닝커브 높음, 설정 복잡 | 거부 |
| @dnd-kit | 모던, 접근성, React 친화적 | 상대적으로 신규 | **선택** |

### Usage Pattern
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// 메시지 순서 변경
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={messages} strategy={verticalListSortingStrategy}>
    {messages.map(msg => <SortableMessage key={msg.id} message={msg} />)}
  </SortableContext>
</DndContext>
```

---

## 3. Browser Storage Strategy

### Decision: **localStorage** (MVP), IndexedDB 고려 (v2)

### Rationale
- **단순성**: JSON.stringify/parse로 즉시 사용 가능
- **용량**: 5MB는 MVP 프로젝트 수십 개 저장에 충분
  - 프로젝트 1개 예상 크기: ~10-50KB (메시지 100개, 테마, 발화자 정보 포함)
  - 프로필 이미지는 Base64 대신 Blob URL 또는 별도 처리 권장
- **동기식**: 즉각적인 저장/불러오기, debounce만으로 성능 관리 가능
- **브라우저 지원**: 모든 모던 브라우저 100% 지원

### IndexedDB 마이그레이션 기준 (v2)
- 프로젝트 데이터가 localStorage 한계(5MB)에 근접할 때
- 이미지 첨부 기능 추가 시 (프로필 이미지 대용량 저장)
- 오프라인 동기화 기능 추가 시

### Usage Pattern
```typescript
// storage.ts
const STORAGE_KEY = 'talkstudio_projects';

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const loadProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
```

---

## 4. ID Generation Strategy

### Decision: **nanoid**

### Rationale
- **URL-safe**: A-Za-z0-9_- 문자만 사용, localStorage key로 안전
- **충돌 확률**: 21자 기본 길이로 1초에 1000개 ID 생성 시 40억 년에 1% 충돌 확률
- **번들 크기**: ~130 bytes (gzipped)
- **성능**: crypto.getRandomValues() 사용으로 빠르고 안전

### Alternatives Considered
| Strategy | Pros | Cons | Verdict |
|----------|------|------|---------|
| UUID v4 | 표준, 널리 사용됨 | 36자로 길다, 하이픈 포함 | 거부 |
| Date.now() | 단순 | 동시 생성 시 충돌 | 거부 |
| Math.random() | 내장 | 충돌 가능성, 예측 가능 | 거부 |
| nanoid | 짧고, 안전, 가벼움 | 추가 의존성 | **선택** |

### Usage Pattern
```typescript
import { nanoid } from 'nanoid';

const newMessage: Message = {
  id: nanoid(), // "V1StGXR8_Z5jdHi6B-myT"
  speakerId: currentSpeaker.id,
  text: inputText,
  type: 'normal',
  order: messages.length,
};
```

---

## 5. Auto-Save Implementation

### Decision: **Debounced save on state change**

### Rationale
- **UX**: 사용자가 타이핑 중일 때 불필요한 저장 방지
- **성능**: localStorage 쓰기 횟수 최소화
- **안정성**: 변경 후 일정 시간(500ms) 대기 후 저장으로 데이터 일관성 보장

### Implementation Pattern
```typescript
// useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { saveProject } from '../utils/storage';

export const useAutoSave = (delay = 500) => {
  const project = useEditorStore((s) => s.currentProject);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!project) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced save
    timeoutRef.current = setTimeout(() => {
      saveProject(project);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [project, delay]);
};
```

### Save Triggers
- 메시지 추가/수정/삭제
- 메시지 순서 변경
- 발화자 정보 변경
- 테마/스타일 변경
- 프로젝트 제목 변경

---

## 6. Theme Architecture

### Decision: **Theme object with CSS variables mapping**

### Rationale
- **일관성**: 테마 변경 시 모든 스타일이 동시에 변경됨
- **확장성**: 새 테마 추가 시 객체만 추가
- **커스터마이징**: 테마 기반 + 개별 속성 오버라이드 가능

### Theme Object Structure
```typescript
interface Theme {
  id: string;
  name: string;
  preview: string; // 썸네일 이미지 경로

  // 캔버스 스타일
  canvas: {
    backgroundColor: string;
    backgroundImage?: string;
  };

  // 상단 바 스타일
  statusBar: {
    backgroundColor: string;
    textColor: string;
    style: 'ios' | 'android' | 'minimal';
  };

  // 말풍선 스타일
  bubble: {
    sent: {
      backgroundColor: string;
      textColor: string;
      borderRadius: string;
    };
    received: {
      backgroundColor: string;
      textColor: string;
      borderRadius: string;
    };
    system: {
      backgroundColor: string;
      textColor: string;
    };
  };

  // 폰트 스타일
  font: {
    family: string;
    size: {
      message: string;
      name: string;
      time: string;
    };
  };
}
```

---

## 7. Zustand Store Architecture

### Decision: **Single store with slices pattern**

### Rationale
- **단순성**: MVP에서는 단일 스토어로 충분
- **셀렉터**: Zustand의 셀렉터로 불필요한 리렌더링 방지
- **DevTools**: Zustand devtools로 상태 디버깅

### Store Structure
```typescript
interface EditorState {
  // Project state
  currentProject: Project | null;
  projects: Project[];

  // UI state
  selectedMessageId: string | null;
  selectedSpeakerId: string | null;

  // Actions
  createProject: () => void;
  loadProject: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'order'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  reorderMessages: (activeId: string, overId: string) => void;
  setTheme: (themeId: string) => void;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => void;
}
```

---

## 8. Image Export Resolution Implementation

### Decision: **pixelRatio option with user selection**

### Rationale
- **유연성**: 사용자가 용도에 맞게 해상도 선택
- **품질**: SNS 공유용 2x 기본, 고품질 필요 시 3x
- **파일 크기**: 1x는 빠른 공유용

### Resolution Options
| Option | pixelRatio | 용도 | 예상 파일 크기 |
|--------|------------|------|---------------|
| 1x | 1 | 빠른 공유, 낮은 데이터 사용 | ~50-100KB |
| 2x | 2 | SNS 공유 (권장), Retina 디스플레이 | ~150-300KB |
| 3x | 3 | 고품질 인쇄, 줌 시에도 선명 | ~300-600KB |

### Implementation
```typescript
export const exportCanvas = async (
  element: HTMLElement,
  options: {
    format: 'png' | 'webp';
    resolution: '1x' | '2x' | '3x';
  }
) => {
  const pixelRatio = { '1x': 1, '2x': 2, '3x': 3 }[options.resolution];

  const blob = await toBlob(element, {
    pixelRatio,
    type: options.format === 'webp' ? 'image/webp' : 'image/png',
    quality: options.format === 'webp' ? 0.9 : undefined,
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `talkstudio-${Date.now()}.${options.format}`;
  link.click();
  URL.revokeObjectURL(url);
};
```

---

## Summary of Dependencies

### Production Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "zustand": "^5.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.0.0",
  "html-to-image": "^1.11.0",
  "nanoid": "^5.0.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.0.0",
  "vite": "^7.0.0",
  "tailwindcss": "^4.0.0",
  "vitest": "^2.0.0",
  "@testing-library/react": "^16.0.0"
}
```

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| 최대 발화자 수? | 10명 (clarification에서 결정) |
| 이미지 해상도 옵션? | 1x/2x/3x 선택 가능 (clarification에서 결정) |
| 자동 저장 동작? | 변경 시 debounce 저장 (clarification에서 결정) |
| localStorage vs IndexedDB? | MVP는 localStorage, v2에서 필요시 IndexedDB |
| DOM to image 라이브러리? | html-to-image 선택 |
| DnD 라이브러리? | @dnd-kit 선택 |
