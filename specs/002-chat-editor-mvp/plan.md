# Implementation Plan: TalkStudio Chat Editor MVP

**Branch**: `002-chat-editor-mvp` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-chat-editor-mvp/spec.md`

## Summary

TalkStudio MVP는 브라우저에서 카카오톡/디스코드/인스타그램 DM 스타일의 가상 대화 UI를 편집하고 이미지로 저장하는 **프론트엔드 전용 SPA**입니다. React + Zustand를 사용하여 상태 관리하고, html2canvas로 DOM을 이미지로 변환하며, localStorage에 프로젝트를 자동 저장합니다.

## Technical Context

**Language/Version**: JavaScript (JSX) + React 19 (TypeScript config present for future migration)
**Primary Dependencies**: React, Zustand 5, Tailwind CSS 4, html2canvas, @dnd-kit/core
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
│   │   ├── LeftPanel.jsx        # 에디터 메인 패널 (탭 구조)
│   │   ├── MessageEditor.jsx    # 메시지 입력/편집/목록
│   │   ├── ProfileEditor.jsx    # 발화자 프로필 설정
│   │   ├── ThemeControls.jsx    # 테마/상단바 설정
│   │   ├── ExportButton.jsx     # PNG 내보내기 버튼 (html2canvas)
│   │   └── ProjectListModal.jsx # 프로젝트 목록 모달
│   ├── preview/         # 프리뷰 영역 컴포넌트
│   │   ├── ChatPreview.jsx      # 메인 프리뷰 (플랫폼별 렌더링)
│   │   ├── StatusBar.jsx        # 상단 바 (시간, 배터리, Wi-Fi)
│   │   └── MessageBubble.jsx    # 말풍선 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
│       └── Sidebar.jsx          # 좌측 테마 선택 사이드바
├── store/
│   └── useChatStore.js          # 통합 상태 관리 (프로젝트, 메시지, 테마, UI)
├── themes/
│   └── presets.js               # 테마 프리셋 (kakao, discord, instagram, telegram)
├── utils/
│   ├── storage.js               # localStorage 유틸 (프로젝트 CRUD)
│   └── timeValidation.js        # 시간 형식 검증 유틸
├── hooks/
│   └── useAutoSave.js           # 자동 저장 훅 (debounce 적용)
├── App.jsx                      # 3-column 레이아웃 루트 (PhoneFrame 포함)
└── main.jsx                     # 엔트리 포인트

tests/
├── unit/
│   ├── store/                   # 스토어 단위 테스트
│   └── utils/                   # 유틸 단위 테스트
└── integration/
    └── editor/                  # 에디터 통합 테스트
```

**Structure Decision**: Single SPA 구조 선택. 백엔드 없이 프론트엔드만으로 MVP 완성. JSX 기반으로 구현 (TypeScript 설정은 향후 마이그레이션용으로 유지). `backend/`, `ai_agent_system/` 등 기존 Python 관련 코드는 `legacy/`로 이동 완료.

## Complexity Tracking

> 현재 Constitution Check에 위반 사항 없음. 추가 정당화 불필요.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
