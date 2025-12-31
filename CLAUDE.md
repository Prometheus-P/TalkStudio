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

### 프로젝트 구조 (Monorepo)

```
/
├── src/                    # 메인 앱 (대화 스크린샷 생성기)
│   ├── components/         # UI 컴포넌트
│   │   ├── editor/         # 에디터 관련
│   │   ├── preview/        # 미리보기 관련
│   │   └── layout/         # 레이아웃
│   ├── store/              # Zustand 상태 관리
│   ├── themes/             # 테마 프리셋
│   └── utils/              # 유틸리티 함수
├── backend/                # Express API (Discord 연동)
├── ai_agent_system/        # Python AI 에이전트
├── specs/                  # 기능별 스펙 문서
└── docs/                   # 문서
```

### UI 레이아웃 (3-Column)

- Sidebar (좌측 80px): 테마 선택 버튼
- Editor (중앙 flex-1): 메시지 입력/편집 영역
- Preview (우측 flex-1.2): iPhone 프레임 미리보기

### State Management (Zustand)

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

## Active Technologies
- TypeScript 5.x + React 19 + React, Zustand 5, Tailwind CSS 4, html-to-image, @dnd-kit/core (002-chat-editor-mvp)
- Browser localStorage (IndexedDB는 v2에서 대용량 프로젝트 지원 시 고려) (002-chat-editor-mvp)

## Recent Changes
- 002-chat-editor-mvp: Added TypeScript 5.x + React 19 + React, Zustand 5, Tailwind CSS 4, html-to-image, @dnd-kit/core

---

## Core Principles

| 섹션 | 핵심 원칙 |
|------|-----------|
| 1. TDD | 테스트 먼저 → Red/Green/Refactor 사이클 |
| 2. 외부 설정 | 수동 설정 필요 시 GitHub Issue 등록 필수 |
| 3. 디자인 시스템 | Clean Architecture, DI, Event-Driven |
| 4. 커밋 메시지 | Conventional Commits, AI 언급 금지 |
| 5. 코드 스타일 | gofmt, golangci-lint, 단일 책임 원칙 |
| 6. 응답 원칙 | CTO 관점, 객관적, 근거 필수 |
| 7. PR 체크리스트 | 7개 항목 체크 후 머지 |

## Response Principles (응답 원칙)

### CTO 관점
- **결정 중심** – 옵션 나열 X, 최선의 선택 제시
- **트레이드오프/리스크/ROI 명시**
- **P0/P1/P2 우선순위** 부여
- **간결함** 유지

### 객관성
- 감정 배제
- 사실 기반
- 정량적 표현

### 근거 확보
- 공식 문서 참조
- 코드 라인 명시 (예: `file.go:123`)
- 테스트 결과 포함
- 벤치마크 데이터

### 금지 표현
- ❌ "아마도...", "~일 것 같습니다"
- ❌ "보통은...", "일반적으로..."
- ❌ 출처 없는 주장

## Consumer-Centric Thinking (소비자 중심 사고)

| 항목 | 내용 |
|------|------|
| 소비자 중심 사고 | 리서치/피드백은 최종 사용자 관점 |
| 비즈니스 임팩트 | 수익/비용/시장 영향 고려 |
| 가치 전달 | 기술 ≠ 비즈니스 구분 |
| 시장 현실 | 이상 < 실용 |

**B2C/B2B/B2G 전 영역 적용**

## PR Checklist

PR 머지 전 반드시 확인:

- [ ] 테스트 통과 (coverage ≥80%)
- [ ] 린트 오류 없음
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 (필요 시)
- [ ] 보안 검토 (OWASP Top 10)
- [ ] 성능 영향 분석
- [ ] 롤백 계획 수립

---

## Vibe Coding: Effective AI Collaboration

### Philosophy

**"AI is a Pair Programming Partner, Not Just a Tool"**

Collaboration with Claude is not mere code generation—it's a process of sharing thought processes and solving problems together.

### 1. Context Provision Principles

**Provide Sufficient Background:**
```markdown
# BAD: No context
"Create a login feature"

# GOOD: Rich context
"Our project uses Next.js 14 + Supabase.
Auth-related code is in /app/auth folder.
Following existing patterns, add OAuth login.
Reference: src/app/auth/login/page.tsx"
```

**Context Checklist:**
- [ ] Specify project tech stack
- [ ] Provide relevant file paths
- [ ] Mention existing patterns/conventions
- [ ] Describe expected output format
- [ ] State constraints and considerations

### 2. Iterative Refinement Cycle

```
VIBE CODING CYCLE

1. SPECIFY    → Describe desired functionality specifically
2. GENERATE   → Claude generates initial code
3. REVIEW     → Review generated code yourself
4. REFINE     → Provide feedback for modifications
5. VERIFY     → Run tests and verify edge cases

Repeat 2-5 as needed
```

### 3. Effective Prompt Patterns

**Pattern 1: Role Assignment**
```
"You are a senior React developer with 10 years experience.
Review this component and suggest improvements."
```

**Pattern 2: Step-by-Step Requests**
```
"Proceed in this order:
1. Analyze current code problems
2. Present 3 improvement options
3. Refactor using the most suitable option
4. Explain the changes"
```

**Pattern 3: Constraint Specification**
```
"Implement with these constraints:
- Maintain existing API contract
- No new dependencies
- Test coverage >= 80%"
```

**Pattern 4: Example-Based Requests**
```
"Create OrderService.ts following the same pattern as
UserService.ts. Especially follow the error handling approach."
```

### 4. Boundaries

**DO NOT delegate to Claude:**
- Security credential generation/management
- Direct production DB manipulation
- Code deployment without verification
- Sensitive business logic full delegation

**Human verification REQUIRED:**
- Security-related code (auth, permissions)
- Financial transaction logic
- Personal data processing code
- Irreversible operations
- External API integration code

### 5. Vibe Coding Checklist

```
Before Starting:
- [ ] Shared CLAUDE.md file with Claude?
- [ ] Explained project structure and conventions?
- [ ] Clearly defined task objectives?

During Coding:
- [ ] Providing sufficient context?
- [ ] Understanding generated code?
- [ ] Giving specific feedback?

After Coding:
- [ ] Personally reviewed generated code?
- [ ] Ran tests?
- [ ] Verified security-related code?
- [ ] Removed AI mentions from commit messages?
```


---

## Advanced Frontend Engineering

### 1. Module System & Build Optimization

**ESM vs CJS 핵심 차이:**

| 특성 | ESM | CJS |
|------|-----|-----|
| 로딩 | 비동기, 정적 분석 가능 | 동기, 런타임 해석 |
| Tree Shaking | ✅ 지원 | ❌ 불가 |
| 브라우저 | 네이티브 지원 | 번들러 필요 |
| 문법 | `import`/`export` | `require`/`module.exports` |
| 순환 의존성 | Live Bindings (참조) | 값 복사 |

**package.json 올바른 설정:**
```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "sideEffects": false
}
```

**빌드 도구 선택 기준:**

| 도구 | 적합한 경우 | Dev Server | Prod Build |
|------|------------|------------|------------|
| **Vite** | 신규 SPA/SSR, 빠른 HMR 필요 | Native ESM | Rollup |
| **Webpack** | 레거시, 복잡한 설정, Module Federation | Bundle-based | Webpack |
| **Turbopack** | Next.js 14+, 대규모 모노레포 | Incremental | 개발 중 |
| **Rollup** | 라이브러리 제작 | N/A | Rollup |
| **esbuild** | 빠른 번들링, 도구 내부 엔진 | 빠름 | 빠름 (최적화 부족) |

**개발 환경 vs 프로덕션 빌드 전략:**
```
Development:
├── Vite/Turbopack → Native ESM, 번들링 없이 즉시 제공
├── HMR → 변경된 모듈만 교체 (O(1))
└── Pre-bundling → node_modules만 esbuild로 사전 번들링

Production:
├── Rollup/Webpack → 전체 번들링 + 최적화
├── Tree Shaking → 사용하지 않는 코드 제거
├── Scope Hoisting → 모듈 병합으로 런타임 오버헤드 제거
└── Code Splitting → 라우트별 청크 분리
```

---

### 2. Tree Shaking Optimization

**Tree Shaking이란:**
사용되지 않는 코드(Dead Code)를 번들에서 제거하는 최적화 기법. ESM의 정적 분석 가능성에 의존한다.

**sideEffects 플래그:**
```json
// package.json
{
  "sideEffects": false
}

// 특정 파일만 사이드 이펙트가 있는 경우
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.ts",
    "./src/global-setup.ts"
  ]
}
```

**Pure 주석 (/*#__PURE__*/):**
```typescript
// 번들러에게 "이 함수 호출은 부작용이 없다"고 알림
// 반환값이 사용되지 않으면 함수 호출 자체를 제거해도 안전

// ❌ 번들러가 사이드 이펙트 여부를 확신할 수 없음
const Component = styled.div`color: red;`;

// ✅ 사이드 이펙트 없음을 명시
const Component = /*#__PURE__*/ styled.div`color: red;`;
```

**배럴 파일(index.ts) 안티패턴:**
```typescript
// ❌ BAD: 전체 모듈 로드 유발
// utils/index.ts
export * from './string';
export * from './date';
export * from './number';
export * from './array';

// 사용처 - formatDate만 필요해도 모든 유틸이 번들에 포함됨
import { formatDate } from '@/utils';

// ✅ GOOD: 직접 import (명시적 경로)
import { formatDate } from '@/utils/date';

// ✅ GOOD: 명시적 re-export (Tree Shaking 친화적)
// utils/index.ts
export { formatDate, parseDate } from './date';
export { capitalize, truncate } from './string';
// export *를 피하고 필요한 것만 명시적으로 export
```

**Tree Shaking 검증:**
```bash
# 번들 분석 - 어떤 모듈이 포함되었는지 시각화
npm run build
npx source-map-explorer dist/*.js

# Webpack 번들 분석
npx webpack-bundle-analyzer stats.json

# Vite 번들 분석
npx vite-bundle-visualizer

# 특정 패키지가 트리 쉐이킹되는지 확인
# bundlephobia.com에서 "Exports Analysis" 확인
```

---

### 3. Code Splitting Strategies

**왜 Code Splitting이 필요한가:**
- 전체 앱을 하나의 파일로 번들링 → 초기 로딩 지연
- 사용자가 방문하지 않을 페이지 코드까지 다운로드
- 코드 변경 시 전체 번들 캐시 무효화

**Route-based Splitting (Next.js):**
```typescript
// Next.js App Router - 자동 적용
// app/dashboard/page.tsx → 별도 청크로 자동 분리

// Pages Router - dynamic import 사용
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(
  () => import('@/components/DashboardChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false  // 클라이언트 전용 컴포넌트
  }
);

// 조건부 로딩
const AdminPanel = dynamic(
  () => import('@/components/AdminPanel'),
  { ssr: false }
);

function Dashboard({ isAdmin }) {
  return (
    <>
      <DashboardChart />
      {isAdmin && <AdminPanel />}
    </>
  );
}
```

**Component-level Splitting (React):**
```typescript
import { lazy, Suspense } from 'react';

// 무거운 컴포넌트 지연 로딩
const HeavyEditor = lazy(() => import('./HeavyEditor'));
const DataVisualizer = lazy(() => import('./DataVisualizer'));

function App() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <HeavyEditor />
    </Suspense>
  );
}

// 라우트와 결합
const routes = [
  {
    path: '/editor',
    element: (
      <Suspense fallback={<PageLoader />}>
        <HeavyEditor />
      </Suspense>
    ),
  },
];
```

**Vendor Chunking (수동 청크 분리):**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 → 별도 청크 (자주 변경 안됨)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리 → 별도 청크
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip'
          ],
          // 차트 라이브러리 → 별도 청크
          'chart-vendor': ['recharts', 'd3'],
        },
      },
    },
  },
});

// 함수형 manualChunks (더 세밀한 제어)
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'react-vendor';
    if (id.includes('@radix-ui')) return 'ui-vendor';
    return 'vendor';  // 나머지 의존성
  }
}
```

**Prefetching 전략:**
```typescript
// Next.js Link - 자동 prefetch
<Link href="/dashboard" prefetch={true}>Dashboard</Link>

// React Router - 수동 prefetch
const prefetchDashboard = () => {
  import('./pages/Dashboard');
};

<button onMouseEnter={prefetchDashboard}>
  Go to Dashboard
</button>
```

---

### 4. Advanced INP Optimization

**INP (Interaction to Next Paint)란:**
사용자 인터랙션(클릭, 키보드 입력)부터 다음 화면 업데이트까지의 지연 시간.

| 점수 | 평가 | 목표 |
|------|------|------|
| < 200ms | Good ✅ | 달성 목표 |
| 200-500ms | Needs Improvement ⚠️ | 개선 필요 |
| > 500ms | Poor ❌ | 긴급 수정 |

**Main Thread Yielding (핵심 기법):**
```typescript
// ❌ BAD: 200ms 동안 UI 블로킹
async function handleClick() {
  await heavyComputation();  // 200ms 블로킹
  updateUI();  // 사용자는 200ms 후에야 반응을 봄
}

// ✅ GOOD: 즉시 피드백 후 처리
async function handleClick() {
  showLoadingIndicator();  // 즉시 피드백

  // 메인 스레드 양보 (브라우저가 렌더링할 기회 제공)
  await scheduler.yield?.() ?? new Promise(r => setTimeout(r, 0));

  await heavyComputation();
  hideLoadingIndicator();
}

// 유틸리티 함수
const yieldToMain = () =>
  scheduler.yield?.() ?? new Promise(resolve => setTimeout(resolve, 0));
```

**Long Task 분할:**
```typescript
// ❌ BAD: 단일 Long Task (200ms)
function handleSubmit() {
  validateForm();      // 50ms
  transformData();     // 80ms
  sendToServer();      // 70ms
  // 총 200ms 블로킹
}

// ✅ GOOD: 각 단계 사이에 yield
async function handleSubmit() {
  showSpinner();

  const isValid = await validateForm();
  await yieldToMain();  // 브라우저 렌더링 기회

  if (!isValid) {
    hideSpinner();
    return;
  }

  const data = transformData();
  await yieldToMain();

  await sendToServer(data);
  hideSpinner();
}
```

**requestIdleCallback으로 백그라운드 처리:**
```typescript
// 우선순위 낮은 작업을 유휴 시간에 처리
function processInChunks<T>(
  items: T[],
  processItem: (item: T) => void,
  onComplete?: () => void
) {
  let index = 0;

  function processChunk(deadline: IdleDeadline) {
    // 남은 유휴 시간이 있고, 처리할 항목이 있는 동안
    while (index < items.length && deadline.timeRemaining() > 1) {
      processItem(items[index++]);
    }

    if (index < items.length) {
      requestIdleCallback(processChunk);
    } else {
      onComplete?.();
    }
  }

  requestIdleCallback(processChunk);
}

// 사용 예
processInChunks(
  largeDataset,
  item => updateAnalytics(item),
  () => console.log('Analytics complete')
);
```

**이벤트 핸들러 최적화:**
```typescript
// ❌ BAD: 동기적 무거운 연산
<input onChange={(e) => {
  const results = expensiveSearch(e.target.value);  // 블로킹
  setResults(results);
}} />

// ✅ GOOD: Debounce + 비동기 처리
const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    const results = await searchAPI(query);
    setResults(results);
  }, 300),
  []
);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

---

### 5. Memory Management

**Chrome DevTools Memory 탭 활용:**
```
1. DevTools → Memory → Take Heap Snapshot
2. 의심되는 작업 수행 (예: 페이지 반복 이동)
3. Take Heap Snapshot 다시
4. Comparison 뷰로 증가한 객체 확인
5. "Detached" 검색으로 분리된 DOM 노드 찾기

주요 지표:
- Retained Size: 객체가 GC되면 해제될 총 메모리
- Shallow Size: 객체 자체가 차지하는 메모리
- Detached DOM tree: GC되지 않는 DOM 노드들
```

**WeakMap/WeakRef 활용:**
```typescript
// ❌ BAD: 강한 참조 → DOM 제거 후에도 메모리 유지
const elementCache = new Map<string, HTMLElement>();

function cacheElement(id: string, element: HTMLElement) {
  elementCache.set(id, element);
  // element가 DOM에서 제거되어도 Map이 참조하므로 GC 불가
}

// ✅ GOOD: 약한 참조 → DOM 제거 시 자동 GC
const elementCache = new WeakMap<HTMLElement, CachedData>();

function cacheElement(element: HTMLElement, data: CachedData) {
  elementCache.set(element, data);
  // element가 DOM에서 제거되면 WeakMap 엔트리도 자동 제거
}

// WeakRef - 대용량 객체 캐싱
class HeavyObjectCache {
  private ref: WeakRef<HeavyObject> | null = null;

  get(): HeavyObject | null {
    return this.ref?.deref() ?? null;  // GC되었으면 null
  }

  set(obj: HeavyObject) {
    this.ref = new WeakRef(obj);
  }
}
```

**대규모 리스트 가상화:**
```typescript
// ❌ BAD: 10,000개 항목 전체 렌더링 → 메모리 폭발
{items.map(item => <ListItem key={item.id} {...item} />)}

// ✅ GOOD: 가상화 - 보이는 항목만 렌더링
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,  // 각 항목 예상 높이
    overscan: 5,  // 화면 밖 추가 렌더링 항목 수
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ListItem {...items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**컴포넌트 외부 상태 주의:**
```typescript
// ❌ BAD: 컴포넌트 외부에서 DOM 참조 유지
const globalCache = new Map<string, HTMLElement>();

function Component({ id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      globalCache.set(id, ref.current);  // 누수!
    }
    // cleanup 없음 → 컴포넌트 언마운트 후에도 DOM 참조 유지
  }, [id]);
}

// ✅ GOOD: cleanup에서 참조 제거
useEffect(() => {
  if (ref.current) {
    globalCache.set(id, ref.current);
  }
  return () => {
    globalCache.delete(id);  // 언마운트 시 참조 제거
  };
}, [id]);
```

---

### 6. Dead Code Elimination

**Knip - 프로젝트 레벨 미사용 코드 검출:**
```json
// knip.json
{
  "entry": [
    "src/index.ts",
    "src/app/**/*.tsx",
    "src/pages/**/*.tsx"
  ],
  "project": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ],
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__mocks__/**"
  ],
  "ignoreDependencies": [
    "@types/*",
    "eslint-*"
  ]
}
```

**Knip 실행:**
```bash
# 미사용 exports, 파일, 의존성 검출
npx knip

# 출력 예시:
# Unused files (2)
# src/utils/deprecated.ts
# src/components/OldButton.tsx
#
# Unused exports (5)
# formatLegacyDate  src/utils/date.ts
# UserContext       src/contexts/UserContext.tsx
#
# Unused dependencies (3)
# lodash
# moment
# classnames

# 자동 수정 (주의해서 사용, 먼저 dry-run)
npx knip --fix --dry-run
npx knip --fix
```

**depcheck - 미사용 의존성 검출:**
```bash
npx depcheck

# 출력 예시:
# Unused dependencies
# * lodash
# * moment
#
# Missing dependencies
# * @types/node
#
# Unused devDependencies
# * @testing-library/jest-dom
```

**Bundle Analyzer 도구:**
```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer stats.json

# Next.js (package.json에 추가)
# "analyze": "ANALYZE=true next build"
ANALYZE=true npm run build
```

**규칙:**
```
✅ DO:
- 미사용 코드는 발견 즉시 삭제
- Git 히스토리가 백업 역할 (필요시 복원 가능)
- 분기별 Knip 실행으로 코드베이스 건강 유지
- CI에 Knip 검사 추가

❌ DON'T:
- 미사용 코드 주석 처리 (// TODO: remove later)
- "나중에 쓸 수도 있으니까" 남겨두기
- 큰 리팩토링 없이 계속 미루기
```

**CI 통합:**
```yaml
# .github/workflows/ci.yml
- name: Check for unused code
  run: npx knip --no-exit-code

# 엄격 모드 (미사용 코드 있으면 실패)
- name: Check for unused code (strict)
  run: npx knip
```


---

## Role-Based Engineering Principles

이 섹션은 11개 전문가 역할의 관점에서 소프트웨어 프로젝트를 검토하고 개선하기 위한 원칙을 제공한다.

### 1. Architect Principles

**Architecture Decision Records (ADR):**
모든 중요한 아키텍처 결정은 문서화되어야 한다.

```markdown
# ADR-001: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[결정이 필요한 배경과 제약 조건]

## Decision
[선택한 결정과 이유]

## Consequences
[결정으로 인한 긍정적/부정적 영향]
```

**Technical Debt Management:**
| 지표 | 목표 | 설명 |
|------|------|------|
| TDR (Technical Debt Ratio) | ≤ 5% | 기술 부채 / 전체 개발 비용 |
| 스프린트 할당 | 20% | 기술 부채 해소에 할당하는 용량 |
| 부채 분류 | 4분면 | Deliberate/Inadvertent × Prudent/Reckless |

**Scalability Design:**
| 전략 | 적용 시점 |
|------|----------|
| Vertical Scaling | 초기 단계, 단순한 확장 필요 시 |
| Horizontal Scaling | 트래픽 예측 불가, 고가용성 필요 시 |
| Database Sharding | 단일 DB 한계 도달 시 |

**Security by Design (OWASP 9원칙):**
1. Attack Surface 최소화
2. Secure Defaults 설정
3. Least Privilege 원칙
4. Defense in Depth
5. Fail Securely
6. Don't Trust Services
7. Separation of Duties
8. Avoid Security by Obscurity
9. Keep Security Simple

**Architect Checklist:**
- [ ] ADR 템플릿 존재 및 활용
- [ ] NFR(비기능 요구사항) 문서화
- [ ] 확장성 전략 정의
- [ ] 보안 아키텍처 리뷰 완료
- [ ] Bounded Context 정의 (DDD)

---

### 2. Senior Developer Principles

**Code Review Best Practices:**
| 항목 | 권장 값 |
|------|---------|
| PR 크기 | ≤ 400줄 |
| 리뷰 속도 | 300-500 lines/hour |
| 리뷰 항목 | 로직, 보안, 성능, 가독성, 테스트 |

**Boy Scout Rule:**
> "Always leave the code better than you found it."

- 작은 개선을 지속적으로 적용
- 단, 현재 PR 범위를 벗어나는 리팩토링은 별도 이슈로 분리

**RIIFD Debugging Framework:**
```
1. Reproduce  → 문제를 일관되게 재현
2. Isolate    → 원인 범위를 좁혀 격리
3. Identify   → 근본 원인(Root Cause) 파악
4. Fix        → 수정 적용 및 검증
5. Document   → 해결 과정과 교훈 기록
```

**Estimation (Cone of Uncertainty):**
| 프로젝트 단계 | 추정 오차 범위 |
|-------------|--------------|
| 초기 아이디어 | 4x ~ 0.25x |
| 요구사항 정의 | 2x ~ 0.5x |
| 설계 완료 | 1.25x ~ 0.8x |

**Developer Checklist:**
- [ ] PR 크기 400줄 이하 유지
- [ ] 의미 있는 커밋 메시지 (Conventional Commits)
- [ ] 테스트 커버리지 확인
- [ ] 기술 부채 발생 시 TODO/FIXME 태그 추가

---

### 3. Senior PM Principles

**Scope Management (Triple Constraint):**
```
        Scope
         /\
        /  \
       /    \
      /______\
   Time      Cost
```
- 하나를 변경하면 다른 요소에 영향
- 변경 요청은 Impact Analysis 후 승인

**Risk Management Matrix:**
| 영향\확률 | Low | Medium | High |
|----------|-----|--------|------|
| High | 모니터링 | 완화 계획 | 즉시 대응 |
| Medium | 수용 | 모니터링 | 완화 계획 |
| Low | 수용 | 수용 | 모니터링 |

**RACI Matrix:**
| 역할 | 설명 |
|------|------|
| **R**esponsible | 실제 수행자 |
| **A**ccountable | 최종 책임자 (한 명만) |
| **C**onsulted | 자문 제공자 (양방향 소통) |
| **I**nformed | 결과 통보 대상 (단방향 소통) |

**PM Checklist:**
- [ ] 프로젝트 헌장(Charter) 작성
- [ ] WBS(Work Breakdown Structure) 정의
- [ ] 리스크 레지스터 유지
- [ ] 주간 상태 보고 수행
- [ ] RACI 매트릭스 정의

---

### 4. Senior BA Principles

**Requirements Elicitation Techniques:**
| 기법 | 적합한 상황 |
|------|-----------|
| 인터뷰 | 심층 이해 필요 시 |
| 워크샵 | 다수 이해관계자 합의 필요 시 |
| 관찰 | 현행 프로세스 이해 시 |
| 프로토타이핑 | 시각화 필요 시 |
| 설문조사 | 대규모 정량 데이터 필요 시 |

**User Story (INVEST 원칙):**
| 원칙 | 설명 |
|------|------|
| **I**ndependent | 다른 스토리와 독립적 |
| **N**egotiable | 협상 가능 (계약이 아님) |
| **V**aluable | 사용자에게 가치 제공 |
| **E**stimable | 추정 가능한 크기 |
| **S**mall | 한 스프린트 내 완료 가능 |
| **T**estable | 인수 조건으로 테스트 가능 |

**형식:** `As a [role], I want [feature], so that [benefit].`

**Gap Analysis:**
```
As-Is → To-Be → Gap 식별 → Action Plan
```

**BA Checklist:**
- [ ] 요구사항 추적 매트릭스(RTM) 유지
- [ ] 모든 User Story에 인수 조건 포함
- [ ] 비기능 요구사항 명시
- [ ] 이해관계자 승인 획득
- [ ] BRD/FRD/SRS 문서화

---

### 5. Senior QA Principles

**Test Pyramid:**
```
        /\
       /  \     E2E Tests (10%)
      /----\
     /      \   Integration Tests (20%)
    /--------\
   /          \ Unit Tests (70%)
  /------------\
```

**Risk-Based Testing:**
```
우선순위 = 비즈니스 영향도 × 실패 확률
```
- High Risk → 철저한 테스트
- Low Risk → Smoke Test 수준

**Test Automation ROI:**
```
ROI = (수동 테스트 비용 × 실행 횟수 - 자동화 비용) / 자동화 비용
```
- 3회 이상 실행 예상 시 자동화 고려
- 자주 변경되는 UI는 자동화 ROI 낮음

**Quality Metrics:**
| 지표 | 공식 | 목표 |
|------|------|------|
| Defect Density | 결함 수 / KLOC | 낮을수록 좋음 |
| Escape Rate | 프로덕션 결함 / 전체 결함 | < 10% |
| Test Coverage | 테스트된 코드 / 전체 코드 | > 80% |

**Bug Report Template:**
```markdown
**Title:** [간결한 문제 설명]
**Environment:** [OS, Browser, Version]
**Steps to Reproduce:**
1. ...
2. ...
**Expected:** [기대 결과]
**Actual:** [실제 결과]
**Severity:** [Critical/Major/Minor/Trivial]
**Attachments:** [스크린샷, 로그]
```

**QA Checklist:**
- [ ] 테스트 전략 문서 작성
- [ ] 테스트 케이스 리뷰 완료
- [ ] 자동화 테스트 CI/CD 통합
- [ ] 회귀 테스트 스위트 유지
- [ ] Shift-Left Testing 적용

---

### 6. UI Expert Principles

**Visual Hierarchy:**
- F-Pattern / Z-Pattern 레이아웃 활용
- 8pt Grid System 적용
- 타이포그래피 스케일: 1.25 또는 1.333 비율

**Design Token System:**
```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' },
    // ...
  },
  spacing: { 1: '4px', 2: '8px', 4: '16px', 8: '32px' },
  typography: { xs: '12px', sm: '14px', base: '16px', lg: '18px' },
};
```

**WCAG 2.2 접근성:**
| 원칙 | 핵심 요구사항 |
|------|-------------|
| Perceivable | 명암비 4.5:1 이상, alt 텍스트 |
| Operable | 키보드 네비게이션, 충분한 시간 |
| Understandable | 일관된 네비게이션, 오류 방지 |
| Robust | 보조 기술 호환성 |

**Responsive Breakpoints (Mobile First):**
```css
/* Base: Mobile (< 640px) */
@media (min-width: 640px) { /* sm: Tablet */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large Desktop */ }
```

**Atomic Design:**
```
Atoms → Molecules → Organisms → Templates → Pages
```

**UI Checklist:**
- [ ] 색상 명암비 검증 (WCAG AA 이상)
- [ ] 키보드 네비게이션 테스트
- [ ] 반응형 디자인 검증 (3개 이상 뷰포트)
- [ ] 모든 상태 디자인 (default, hover, active, disabled, error, loading, empty)

---

### 7. UX Expert Principles

**User-Centered Design (UCD) Process:**
```
Research → Design → Evaluate → Iterate
   ↑_____________________________|
```

**Nielsen's 10 Usability Heuristics:**
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize and recover from errors
10. Help and documentation

**Information Architecture:**
| 기법 | 목적 |
|------|------|
| Card Sorting | 콘텐츠 분류 검증 |
| Tree Testing | 네비게이션 구조 검증 |
| 3-Click Rule | 3번 클릭 내 목표 도달 |

**User Journey Mapping:**
```
[인지] → [고려] → [결정] → [구매] → [사용] → [추천]
   ↓        ↓        ↓        ↓        ↓        ↓
  감정 / 행동 / 접점 / Pain Point / Opportunity
```

**A/B Testing 원칙:**
- 한 번에 하나의 변수만 테스트
- 통계적 유의성 확보 (p < 0.05)
- 최소 샘플 크기 계산 후 실행

**UX Checklist:**
- [ ] 사용자 페르소나 정의
- [ ] 핵심 User Flow 문서화
- [ ] 사용성 테스트 수행 (5명 이상)
- [ ] 접근성 심사 통과
- [ ] Journey Map 작성

---

### 8. Senior Designer Principles

**Design System Governance:**
- Contribution 가이드라인 수립
- 버전 관리 및 Changelog 유지
- 정기적 Audit (분기별)

**Design-Dev Handoff:**
| 도구 | 용도 |
|------|------|
| Figma Dev Mode | 스펙 추출, 코드 스니펫 |
| Storybook | 컴포넌트 문서화, 시각적 테스트 |
| Design Token | 디자인-코드 동기화 |

**Handoff 필수 포함 사항:**
- 모든 상태 디자인 (default, hover, active, disabled, error)
- 반응형 뷰 제공
- 애니메이션 스펙 (duration, easing)
- 에셋 내보내기 (@1x, @2x, @3x 또는 SVG)

**Design Critique Framework:**
```
1. 맥락 설명 (목표, 제약)
2. 구체적 피드백 요청
3. 건설적 비판 (문제 + 제안)
4. 결정 사항 문서화
```

**Designer Checklist:**
- [ ] 디자인 시스템 문서 최신화
- [ ] 컴포넌트 네이밍 규칙 준수
- [ ] 다크모드/라이트모드 지원
- [ ] 디자인 QA 수행
- [ ] 브랜드 가이드라인 준수

---

### 9. Senior Backend Principles

**API Style 선택 기준:**
| 스타일 | 적합한 경우 |
|--------|-----------|
| REST | 표준 CRUD, 캐싱 중요, 브라우저 직접 호출 |
| GraphQL | 복잡한 관계, 클라이언트 유연성, Over-fetching 방지 |
| gRPC | 마이크로서비스 간 통신, 고성능, 스트리밍 |

**REST API Best Practices:**
```
✅ DO:
- 명사형 리소스 URL (/users, /orders)
- HTTP 메서드 활용 (GET, POST, PUT, DELETE)
- 적절한 상태 코드 (200, 201, 400, 404, 500)
- API 버저닝 (/v1/users)

❌ DON'T:
- 동사형 URL (/getUsers, /createOrder)
- 모든 응답에 200 OK
- 버저닝 없는 Breaking Change
```

**Database Design:**
| 원칙 | 설명 |
|------|------|
| 정규화 | 3NF까지 적용 후 필요시 비정규화 |
| 인덱싱 | WHERE, JOIN, ORDER BY 컬럼 |
| N+1 방지 | JOIN 또는 Eager Loading 사용 |

**Caching Strategy:**
| 패턴 | 사용 시점 |
|------|----------|
| Cache-Aside | 읽기 많은 워크로드 |
| Write-Through | 데이터 일관성 중요 |
| Write-Behind | 쓰기 성능 중요 |

**Resilience Patterns:**
```
┌──────────────────────────────────────────┐
│ Circuit Breaker: 연속 실패 시 요청 차단   │
│ Retry: 일시적 실패 시 재시도 (지수 백오프) │
│ Fallback: 실패 시 대안 응답 제공          │
│ Bulkhead: 장애 격리 (리소스 분리)         │
│ Timeout: 무한 대기 방지                  │
└──────────────────────────────────────────┘
```

**Backend Checklist:**
- [ ] API 문서화 (OpenAPI/Swagger)
- [ ] 인덱스 최적화 검토
- [ ] N+1 쿼리 검출 및 수정
- [ ] 서킷 브레이커 적용
- [ ] 헬스 체크 엔드포인트 제공 (/health)

---

### 10. Security Expert Principles

**OWASP Top 10 2025:**
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Data Integrity Failures
9. Logging & Monitoring Failures
10. SSRF (Server-Side Request Forgery)

**Authentication 방식 선택:**
| 방식 | 사용 시점 |
|------|----------|
| OAuth 2.0 + OIDC | 외부 IdP 연동 (Google, GitHub) |
| JWT | 무상태 인증, API 서버 |
| Session | 서버 사이드 상태 관리 |
| PKCE | 모바일/SPA OAuth 보안 강화 |

**JWT Security Best Practices:**
```
✅ DO:
- 짧은 만료 시간 (15분 권장)
- Refresh Token Rotation
- RS256 (비대칭키) 사용
- HttpOnly, Secure 쿠키 저장

❌ DON'T:
- 민감 정보 페이로드에 포함
- localStorage 저장
- HS256 (대칭키) 프로덕션 사용
- 긴 만료 시간 (> 1시간)
```

**Input Validation & Output Encoding:**
```
Input → Validation → Sanitization → Parameterized Query → Output Encoding
```
- 화이트리스트 기반 검증
- 서버 사이드 필수 검증
- SQL Injection: Parameterized Query 사용
- XSS: Output Encoding, CSP 헤더

**Security Testing:**
| 유형 | 도구 예시 | 시점 |
|------|----------|------|
| SAST | SonarQube, Semgrep | 개발 중 |
| DAST | OWASP ZAP, Burp Suite | 배포 전 |
| SCA | Snyk, Dependabot | CI/CD |

**Encryption:**
| 용도 | 권장 알고리즘 |
|------|-------------|
| 전송 중 (TLS) | TLS 1.3 |
| 저장 시 | AES-256 |
| 비밀번호 | bcrypt 또는 Argon2 (salt 포함) |

**Security Checklist:**
- [ ] OWASP Top 10 취약점 점검
- [ ] 보안 헤더 설정 (CSP, HSTS, X-Frame-Options)
- [ ] 의존성 취약점 스캔 (npm audit, Snyk)
- [ ] 민감 데이터 암호화 확인
- [ ] 로깅/모니터링 설정

---

### 11. Entrepreneur/Business Principles

**ROI Analysis:**
```
ROI = (이익 - 비용) / 비용 × 100%

기술 투자 평가 시 고려 사항:
- 개발 비용 vs 절감 비용/수익 증가
- Time to Value (가치 실현 시점)
- 기회비용 포함
```

**MVP (Minimum Viable Product):**
```
Build → Measure → Learn → (Repeat)
```
- 핵심 가치 제안만 포함
- 2-4주 내 출시 가능 범위
- 학습을 위한 최소 기능

**Product-Market Fit (PMF) 측정:**
> Sean Ellis Test: "이 제품을 사용할 수 없다면 얼마나 실망하시겠습니까?"
> 40% 이상이 "매우 실망"이면 PMF 달성

**Time-to-Market vs Quality:**
| 상황 | 전략 |
|------|------|
| 시장 선점 중요 | 빠른 출시, 기술 부채 감수 |
| 경쟁 치열 | 차별화 기능 집중 |
| 규제 산업 | 품질/보안 우선 |

**Technical Debt Cost:**
- 미국 기업 연간 $1.52T 기술 부채 비용 (2022)
- 개발 시간의 33%가 기술 부채 해결에 소요
- 조기 해결이 비용 효율적

**Cost Optimization:**
| 영역 | 전략 |
|------|------|
| 클라우드 | Reserved/Spot Instance, 자동 스케일링 |
| 인프라 | 서버리스, 컨테이너 |
| 개발 | 오픈소스 활용, 자동화 |

**Sustainable Pace:**
- 주 40시간 초과 시 생산성 급감
- 번아웃 방지 = 장기 생산성 유지
- 정기적 휴식, 온콜 로테이션

**Business Checklist:**
- [ ] 비즈니스 가치 기준 우선순위 설정
- [ ] MVP 범위 명확히 정의
- [ ] 기술 부채 비용 추적
- [ ] 팀 지속 가능성 모니터링
- [ ] ROI 분석 수행

