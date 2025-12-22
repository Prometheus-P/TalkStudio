# Implementation Plan: AI 대화 생성기

**Branch**: `002-ai-conversation-generator` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-conversation-generator/spec.md`

## Summary

TalkStudio에 AI 기반 대화 생성 기능을 추가합니다. 사용자가 시나리오 프롬프트를 입력하면 Upstage API(백업: OpenAI)가 자연스러운 대화를 생성하고, 기존 TalkStudio 렌더링 엔진을 통해 카카오톡/디스코드/텔레그램/인스타그램 스타일 스크린샷으로 출력합니다. 대량 생성을 위한 Excel 입력 및 ZIP 다운로드도 지원합니다.

## Technical Context

**Language/Version**: Frontend: TypeScript/JavaScript (React 19); Backend: Node.js 20 (Express.js)
**Primary Dependencies**: Frontend: React, Zustand, Tailwind CSS, html2canvas, xlsx; Backend: Express.js, openai SDK (Upstage 호환), multer, archiver
**Storage**: MongoDB (기존 001 기능과 동일)
**Testing**: Frontend: Vitest, React Testing Library; Backend: Jest
**Target Platform**: Web Browsers (Chrome, Safari, Firefox), Linux server (Docker)
**Project Type**: Web application (Frontend + Backend)
**Performance Goals**: 단일 대화 생성 < 5초, 대량 생성 100건 < 5분
**Constraints**: Upstage API 비용 월 $300 이하, 콘텐츠 안전 필터링 필수
**Scale/Scope**: 동시 사용자 100명, 대량 생성 최대 100건/요청

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Modularity and Reusability**: ✅ PASS - 대화 생성 서비스를 독립 모듈로 설계, 기존 Upstage 클라이언트 재사용
- **II. User-Centric Design**: ✅ PASS - 직관적인 시나리오 입력 UI, 실시간 편집, 다양한 출력 옵션 제공
- **III. Robustness and Error Handling**: ✅ PASS - AI API 폴백, 재시도, 부적절 콘텐츠 필터링, 대량 생성 실패 복구
- **IV. Performance Optimization**: ✅ PASS - 비동기 대량 생성, 진행 상태 실시간 업데이트, 이미지 최적화
- **V. Maintainability and Readability**: ✅ PASS - TypeScript 타입, JSDoc 문서화, 일관된 코드 스타일

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-conversation-generator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── conversations/
│   │       ├── conversation_routes.js      # 대화 생성 API 엔드포인트
│   │       └── bulk_generation_routes.js   # 대량 생성 API 엔드포인트
│   ├── models/
│   │   ├── conversation_model.js           # 대화 데이터 모델
│   │   └── template_model.js               # 템플릿 데이터 모델
│   ├── services/
│   │   ├── conversation_generator.js       # AI 대화 생성 서비스
│   │   ├── bulk_processor.js               # 대량 생성 처리기
│   │   └── content_filter.js               # 콘텐츠 필터링 서비스
│   └── utils/
│       └── excel_parser.js                 # Excel 파싱 유틸리티
└── tests/
    └── conversations/

frontend/
├── src/
│   ├── components/
│   │   ├── ConversationGenerator/
│   │   │   ├── ScenarioInput.jsx           # 시나리오 입력 컴포넌트
│   │   │   ├── ParameterPanel.jsx          # 파라미터 설정 패널
│   │   │   ├── ConversationEditor.jsx      # 대화 편집기
│   │   │   └── TemplateSelector.jsx        # 템플릿 선택기
│   │   └── BulkGeneration/
│   │       ├── ExcelUploader.jsx           # Excel 업로드 컴포넌트
│   │       └── ProgressTracker.jsx         # 진행 상태 표시기
│   ├── pages/
│   │   └── AIGenerator.jsx                 # AI 생성기 페이지
│   └── services/
│       └── conversationApi.js              # API 클라이언트
└── tests/
```

**Structure Decision**: 기존 TalkStudio 모노레포 구조 유지. backend/와 frontend/ 디렉토리에 새 모듈 추가. 001 기능의 ai_agent_system/은 이 기능에서는 사용하지 않음 (Node.js에서 직접 Upstage API 호출).

## Complexity Tracking

> No Constitution violations. Standard web application pattern.

## Dependencies on Existing Code

| Component | Reuse Strategy |
|-----------|----------------|
| Upstage Client | 001의 `ai_agent_system/src/services/upstage_client.py` 로직을 Node.js로 포팅 |
| TalkStudio Renderer | 기존 `frontend/src/` 렌더링 컴포넌트 그대로 활용 |
| MongoDB Connection | 001의 `backend/src/db/` 연결 설정 재사용 |
| Encryption Service | 001의 API 키 암호화 서비스 재사용 |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI가 부적절한 콘텐츠 생성 | Medium | High | 콘텐츠 필터링 + 프롬프트 가드레일 |
| Upstage API 장애 | Low | Medium | OpenAI 자동 폴백 |
| 대량 생성 시 타임아웃 | Medium | Medium | 비동기 처리 + 청크 분할 |
| 비용 초과 | Low | Medium | 사용량 모니터링 + 일일 한도 설정 |
