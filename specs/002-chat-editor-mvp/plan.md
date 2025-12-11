# Implementation Plan: TalkStudio Chat Editor MVP

**Branch**: `002-chat-editor-mvp` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-chat-editor-mvp/spec.md`

## Summary

TalkStudio MVP는 브라우저에서 카카오톡/디스코드/인스타그램 DM 스타일의 가상 대화 UI를 편집하고 이미지로 저장하는 **프론트엔드 전용 SPA**입니다. React + TypeScript + Zustand를 사용하여 상태 관리하고, html-to-image로 DOM을 이미지로 변환하며, localStorage에 프로젝트를 자동 저장합니다.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19
**Primary Dependencies**: React, Zustand 5, Tailwind CSS 4, html-to-image, @dnd-kit/core
**Storage**: Browser localStorage (IndexedDB는 v2에서 대용량 프로젝트 지원 시 고려)
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - 데스크톱 우선)
**Project Type**: Single SPA (프론트엔드 전용, 백엔드 없음)
**Performance Goals**: 테마 변경 <1초, 이미지 Export <5초, 100개 메시지 버벅임 없음
**Constraints**: 브라우저 스토리지 5MB 제한, Python 코드 금지, 단일 JS/TS 스택
**Scale/Scope**: 프로젝트당 최대 10명 발화자, 100개 이상 메시지, 3개 테마 프리셋

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Modularity and Reusability | PASS | 컴포넌트 기반 설계 (Canvas, MessageList, ThemeSelector 등 독립 모듈) |
| II. User-Centric Design | PASS | 직관적 3-column 레이아웃, 실시간 미리보기, 드래그앤드롭 지원 |
| III. Robustness and Error Handling | PASS | Edge cases 정의됨 (스토리지 초과, 데이터 손상, 지원하지 않는 브라우저) |
| IV. Performance Optimization | PASS | SC-001~SC-005 성능 목표 명시, debounce 자동저장 |
| V. Maintainability and Readability | PASS | TypeScript 타입 정의, Zustand 상태 관리 패턴 |

**Technology Stack Compliance**:
- Frontend: React + Tailwind CSS ✓
- Backend: N/A (MVP는 프론트엔드 전용)
- Python: 금지됨 (스펙 Hard Constraint) ✓

**Constitution Gate**: PASSED

## Project Structure

### Documentation (this feature)

```text
specs/002-chat-editor-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API for MVP)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── editor/          # 에디터 영역 컴포넌트
│   │   ├── Canvas.tsx           # 대화 캔버스 (미리보기)
│   │   ├── MessageList.tsx      # 메시지 목록 (편집)
│   │   ├── MessageItem.tsx      # 개별 메시지 아이템
│   │   ├── MessageInput.tsx     # 메시지 입력 폼
│   │   └── SpeakerPanel.tsx     # 발화자 설정 패널
│   ├── preview/         # 프리뷰 영역 컴포넌트
│   │   ├── PhoneFrame.tsx       # iPhone 프레임
│   │   ├── StatusBar.tsx        # 상단 바 (시간, 배터리, Wi-Fi)
│   │   └── ChatBubble.tsx       # 말풍선 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx          # 좌측 테마 선택 사이드바
│   │   ├── EditorPanel.tsx      # 중앙 에디터 패널
│   │   └── PreviewPanel.tsx     # 우측 미리보기 패널
│   └── common/          # 공통 UI 컴포넌트
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── store/
│   ├── useEditorStore.ts        # 에디터 상태 (프로젝트, 메시지, 테마)
│   └── useUIStore.ts            # UI 상태 (모달, 토스트, 로딩)
├── themes/
│   ├── index.ts                 # 테마 프리셋 export
│   ├── kakao.ts                 # 카카오톡 테마
│   ├── discord.ts               # 디스코드 테마
│   └── instagram.ts             # 인스타그램 DM 테마
├── types/
│   ├── project.ts               # Project, Message, Speaker 타입
│   └── theme.ts                 # Theme 타입
├── utils/
│   ├── export.ts                # 이미지 export 유틸
│   ├── storage.ts               # localStorage 유틸
│   ├── id.ts                    # ID 생성 유틸
│   └── debounce.ts              # debounce 유틸
├── hooks/
│   ├── useAutoSave.ts           # 자동 저장 훅
│   └── useExport.ts             # 이미지 export 훅
├── App.tsx                      # 3-column 레이아웃 루트
└── main.tsx                     # 엔트리 포인트

tests/
├── unit/
│   ├── store/                   # 스토어 단위 테스트
│   └── utils/                   # 유틸 단위 테스트
└── integration/
    └── editor/                  # 에디터 통합 테스트
```

**Structure Decision**: Single SPA 구조 선택. 백엔드 없이 프론트엔드만으로 MVP 완성. 기존 `src/` 구조를 에디터 중심으로 재구성하며, `backend/`, `ai_agent_system/` 등 기존 Python 관련 코드는 `legacy/`로 이동.

## Complexity Tracking

> 현재 Constitution Check에 위반 사항 없음. 추가 정당화 불필요.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
