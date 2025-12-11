# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalkStudio는 카카오톡, 텔레그램, 인스타그램, 디스코드 스타일의 대화 스크린샷을 생성하는 프론트엔드 전용 SPA입니다.

## Git Workflow

- **main/dev 직접 push 금지** – 항상 feature 브랜치 생성 후 PR을 통해 병합
- 브랜치 네이밍: `feature/xxx`, `fix/xxx`, `refactor/xxx`
- PR 머지 전 코드 리뷰 필수

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

**Spec-First Development:**
- **모든 기능은 스펙 문서가 Source of Truth** – 코드 작성 전 스펙 문서 먼저 정의
- `specs/` 디렉토리에 기능별 스펙 문서 관리
- `CONTEXT.md`: 프로젝트의 Single Source of Truth
- AI Agent Workflow: `/pm` → `/architect` → `/dev` → `/qa` 순서로 스펙 기반 개발

**TDD Cycle:**
```
1. RED    - 실패하는 테스트 먼저 작성
2. GREEN  - 테스트 통과하는 최소 구현
3. REFACTOR - 코드 품질 개선 (테스트 유지)
```

**테스트 작성 원칙:**
- 새 기능 구현 시 테스트 먼저 작성
- **커밋 전 테스트 필수** – 테스트 통과하지 않으면 커밋 금지
- 보안 테스트 케이스 필수 (XSS, 입력 검증)
- 핵심 비즈니스 로직 coverage ≥80%

## Architecture

### 역할별 디렉토리 구조

**역할별 담당자 고정:** AI Worker / BE / FE

```
/
├── frontend/          # 프론트엔드 (React)
├── backend/           # 백엔드 API 서버
└── worker/            # AI Worker 서비스
```

### Frontend (React)

**디렉토리 구조:**
```
frontend/
├── pages/app/         # 페이지 컴포넌트
├── components/        # 재사용 UI 컴포넌트
├── hooks/             # 커스텀 훅
├── lib/api/           # API 클라이언트
└── types/             # TypeScript 타입 정의
```

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

### Backend (Clean Architecture)

```
backend/
├── router/            # HTTP 라우터 (엔드포인트 정의)
├── service/           # 비즈니스 로직
└── repo/              # 데이터 접근 계층
```

**흐름:** Router → Service → Repository

### Worker (Parser/Strategy 패턴)

```
worker/
├── parsers/           # 파일 타입별 파서 (파일 타입별 분리)
├── strategies/        # 처리 전략
└── handlers/          # 작업 핸들러
```

**패턴:** 파일 타입별 Parser 분리 + Strategy 패턴으로 처리 로직 캡슐화

## Conventions

- 컴포넌트: PascalCase (`MessageInput.jsx`)
- 유틸리티: camelCase (`formatTime.js`)
- 스토어: `use` 접두어 (`useChatStore.js`)
- 설명/주석: 한국어 허용, 코드/변수: 영어
- Zustand 셀렉터 패턴 사용: `useChatStore((s) => s.config.theme)`

## Environment Configuration

- **단일 `.env` + `.env.example` 제공** – 서비스별 symlink로 공유
- `.env.example`에 모든 환경 변수 키와 설명 문서화
- 비밀 값은 절대 커밋 금지

## AI Policy

- **AI 결과는 항상 Preview-only** – 사람이 최종 검토 및 승인 책임
- AI 생성 코드/콘텐츠는 반드시 리뷰 후 적용
- 자동화된 AI 작업도 사람의 최종 확인 필수

## Security & Data Governance

- **Audit log 필수** – 모든 주요 작업 기록
- **해시 검증** – 데이터 무결성 확인
- **케이스 단위 데이터 격리** – 프로젝트/케이스별 데이터 분리

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
