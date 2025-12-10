# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalkStudio는 카카오톡, 텔레그램, 인스타그램, 디스코드 스타일의 대화 스크린샷을 생성하는 프론트엔드 전용 SPA입니다.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run test     # Vitest 테스트 실행
npm run preview  # 빌드 결과물 미리보기
```

## Speckit + TDD

이 프로젝트는 **Speckit** 방법론과 **TDD**를 준수하여 개발합니다:

**Speckit:**
1. **Spec-Driven Development**: 코드 작성 전 스펙 문서 먼저 정의
2. **CONTEXT.md**: 프로젝트의 Single Source of Truth
3. **AI Agent Workflow**: `/pm` → `/architect` → `/dev` → `/qa` 순서로 스펙 기반 개발

**TDD Cycle:**
```
1. RED    - 실패하는 테스트 먼저 작성
2. GREEN  - 테스트 통과하는 최소 구현
3. REFACTOR - 코드 품질 개선 (테스트 유지)
```

**테스트 작성 원칙:**
- 새 기능 구현 시 테스트 먼저 작성
- 보안 테스트 케이스 필수 (XSS, 입력 검증)
- 핵심 비즈니스 로직 coverage ≥80%

## Architecture

**3-Column Layout:**
- Sidebar (좌측 80px): 테마 선택 버튼
- Editor (중앙 flex-1): 메시지 입력/편집 영역
- Preview (우측 flex-1.2): iPhone 프레임 미리보기

**State Management (Zustand):**
```
useChatStore.js
├── config: { theme, capturedImage }
├── statusBar: { time, battery, isWifi }
├── profiles: { me, other }
├── messages: [{ id, sender, type, text, time }]
└── actions: setTheme, addMessage, removeMessage, updateConfig
```

**Data Flow:** Editor → Zustand Store → Preview 구독 → 리렌더링

## Conventions

- 컴포넌트: PascalCase (`MessageInput.jsx`)
- 유틸리티: camelCase (`formatTime.js`)
- 스토어: `use` 접두어 (`useChatStore.js`)
- 설명/주석: 한국어 허용, 코드/변수: 영어
- Zustand 셀렉터 패턴 사용: `useChatStore((s) => s.config.theme)`

## Quality Constraints

- 함수 ≤20줄, 컴포넌트 ≤150줄, 중첩 ≤3단계, Props ≤5개
- Test coverage 목표: 80% (Vitest + React Testing Library)

## AI Agent Commands

`.claude/commands/` 디렉토리에 AI Software Factory 에이전트 정의:

| Command | Agent | 용도 |
|---------|-------|------|
| `/pm` | Product Manager | PRD 작성 |
| `/designer` | UX/UI Designer | 디자인 스펙 |
| `/architect` | System Architect | 아키텍처 + STRIDE 위협 모델링 |
| `/dev` | Developer | TDD 기반 구현 |
| `/qa` | QA Auditor | OWASP 보안 감사 |
| `/devops` | DevOps/SRE | CI/CD 설정 |

**워크플로우:** `/pm` → `/designer` → `/architect` → `/dev` → `/qa` → `/devops`

## Key Files

- `CONTEXT.md`: 프로젝트 Single Source of Truth (상세 스펙, 아키텍처 다이어그램)
- `src/store/useChatStore.js`: 전역 상태 관리
- `src/App.jsx`: 3-column 레이아웃 루트 컴포넌트

## Tech Stack

React 19 + Zustand 5 + Tailwind CSS 4 + Vite 7 (Rolldown) + html2canvas
