# TalkStudio Feature Tasks: AI 대화 생성기

**Branch**: `002-ai-conversation-generator` | **Date**: 2025-12-11

## 1. Setup Phase (프로젝트 초기화)

- [x] T001 `backend/src/api/conversations/` 디렉토리 생성
- [x] T002 `backend/src/services/` 디렉토리에 대화 생성 관련 파일 구조 생성
- [x] T003 `src/components/ConversationGenerator/` 디렉토리 생성 *(경로 수정: frontend/ → src/)*
- [x] T004 `src/components/BulkGeneration/` 디렉토리 생성 *(경로 수정: frontend/ → src/)*
- [x] T005 `backend/package.json`에 필요한 종속성 추가 (openai, archiver, express-validator)
- [x] T006 루트 `package.json`에 필요한 종속성 추가 (xlsx) *(경로 수정: frontend/ → root)*
- [x] T007 `.env.example`에 AI API 키 환경변수 추가 (UPSTAGE_API_KEY, OPENAI_API_KEY)

## 2. Foundational Phase (공통 기반 작업)

- [x] T008 `backend/src/services/ai_client.js`에 Upstage/OpenAI 통합 클라이언트 구현 (폴백 로직 포함)
- [x] T009 `backend/src/services/content_filter.js`에 콘텐츠 안전 필터링 서비스 구현
- [x] T010 `backend/src/services/prompt_builder.js`에 대화 생성 프롬프트 빌더 구현
- [x] T011 `backend/src/utils/excel_parser.js`에 Excel 파싱 유틸리티 구현
- [x] T012 `backend/src/models/conversation_model.js`에 Conversation 데이터 모델 구현
- [x] T013 `backend/src/models/template_model.js`에 Template 데이터 모델 구현
- [x] T014 `backend/src/models/bulk_job_model.js`에 BulkJob 데이터 모델 구현
- [x] T015 MongoDB 인덱스 생성 스크립트 작성 `backend/src/db/migrations/002_conversation_indexes.js`
- [x] T016 시스템 템플릿 시드 데이터 생성 `backend/src/db/seeds/system_templates.js`

## 3. User Story 1: 시나리오 기반 대화 생성 (US1) (P1)

**목표**: 사용자가 시나리오를 입력하면 AI가 대화를 생성합니다.

**독립 테스트 기준**:
- 프롬프트 입력 → 대화 생성 API 호출 → JSON 대화 반환
- 2~5명 참여자 대화 생성 가능
- 톤/스타일(casual/formal/humorous) 적용 확인
- 생성 시간 < 5초

- [x] T017 [US1] `backend/src/services/conversation_generator.js`에 AI 대화 생성 핵심 로직 구현 ✅
- [x] T018 [P] [US1] `backend/src/api/conversations/conversation_routes.js`에 `POST /conversations/generate` 엔드포인트 구현 ✅
- [x] T019 [P] [US1] `backend/src/api/conversations/conversation_routes.js`에 `GET /conversations/:id` 엔드포인트 구현 ✅
- [x] T020 [P] [US1] `backend/src/api/conversations/conversation_routes.js`에 `DELETE /conversations/:id` 엔드포인트 구현 ✅
- [x] T021 [US1] `src/services/conversationApi.js`에 대화 생성 API 클라이언트 구현 ✅
- [x] T022 [P] [US1] `src/components/ConversationGenerator/ScenarioInput.jsx`에 시나리오 입력 컴포넌트 구현 ✅
- [x] T023 [P] [US1] `src/components/ConversationGenerator/ParameterPanel.jsx`에 파라미터 설정 패널 구현 ✅
- [x] T024 [US1] `src/pages/AIGenerator.jsx`에 AI 생성기 메인 페이지 구현 (US1 기능 통합) ✅
- [x] T025 [US1] `backend/index.js`에 대화 생성 라우트 등록 ✅

## 4. User Story 2: 템플릿 활용 (US2) (P1)

**목표**: 사전 정의된 템플릿을 사용하여 반복 작업을 줄입니다.

**독립 테스트 기준**:
- 4개 이상 기본 시스템 템플릿 조회 가능
- 템플릿 선택 → 시나리오 자동 입력
- 커스텀 템플릿 생성/삭제 가능
- 카테고리별 필터링 동작

- [x] T026 [P] [US2] `backend/src/api/conversations/template_routes.js`에 `GET /templates` 엔드포인트 구현 ✅
- [x] T027 [P] [US2] `backend/src/api/conversations/template_routes.js`에 `POST /templates` 엔드포인트 구현 ✅
- [x] T028 [P] [US2] `backend/src/api/conversations/template_routes.js`에 `DELETE /templates/:id` 엔드포인트 구현 ✅
- [x] T029 [US2] `src/services/conversationApi.js`에 템플릿 API 클라이언트 추가 *(Phase 3에서 완료)* ✅
- [x] T030 [US2] `src/components/ConversationGenerator/TemplateSelector.jsx`에 템플릿 선택 컴포넌트 구현 ✅
- [x] T031 [US2] `src/pages/AIGenerator.jsx`에 템플릿 선택 기능 통합 ✅
- [x] T032 [US2] `backend/index.js`에 템플릿 라우트 등록 ✅

## 5. User Story 3: 대량 생성 (US3) (P2)

**목표**: Excel 템플릿으로 여러 시나리오를 일괄 처리합니다.

**독립 테스트 기준**:
- Excel 템플릿 다운로드 가능
- Excel 업로드 → 유효성 검증 → 에러 피드백
- 100건 일괄 생성 < 5분
- 진행 상태 실시간 조회
- ZIP 다운로드 (스크린샷 + JSON)

- [x] T033 [US3] `backend/src/services/bulk_processor.js`에 대량 생성 처리 서비스 구현 ✅
- [x] T034 [P] [US3] `backend/src/api/conversations/bulk_generation_routes.js`에 `GET /bulk/template` 엔드포인트 구현 ✅
- [x] T035 [P] [US3] `backend/src/api/conversations/bulk_generation_routes.js`에 `POST /bulk/start` 엔드포인트 구현 ✅
- [x] T036 [P] [US3] `backend/src/api/conversations/bulk_generation_routes.js`에 `GET /bulk/:jobId/status` 엔드포인트 구현 ✅
- [x] T037 [US3] `backend/src/api/conversations/bulk_generation_routes.js`에 `GET /bulk/:jobId/download` 엔드포인트 구현 ✅
- [x] T038 [US3] `backend/src/utils/zip_generator.js`에 ZIP 생성 유틸리티 구현 ✅
- [x] T039 [US3] `src/services/conversationApi.js`에 대량 생성 API 클라이언트 추가 *(Phase 3에서 완료)* ✅
- [x] T040 [P] [US3] `src/components/BulkGeneration/ExcelUploader.jsx`에 Excel 업로드 컴포넌트 구현 ✅
- [x] T041 [P] [US3] `src/components/BulkGeneration/ProgressTracker.jsx`에 진행 상태 표시 컴포넌트 구현 ✅
- [x] T042 [US3] `src/pages/AIGenerator.jsx`에 대량 생성 탭/섹션 추가 ✅
- [x] T043 [US3] `backend/index.js`에 대량 생성 라우트 등록 ✅

## 6. User Story 4: 대화 편집 및 출력 (US4) (P1)

**목표**: 생성된 대화를 편집하고 스크린샷으로 출력합니다.

**독립 테스트 기준**:
- 메시지 추가/삭제/수정 가능
- 특정 메시지 AI 재생성 요청 가능
- 4개 플랫폼 스타일 선택 (카카오톡, 디스코드, 텔레그램, 인스타그램)
- PNG/JPEG 다운로드

- [x] T044 [P] [US4] `backend/src/api/conversations/conversation_routes.js`에 `PATCH /conversations/:id` 엔드포인트 구현 *(Phase 3에서 완료)* ✅
- [x] T045 [P] [US4] `backend/src/api/conversations/conversation_routes.js`에 `POST /conversations/:id/regenerate` 엔드포인트 구현 *(Phase 3에서 완료)* ✅
- [x] T046 [US4] 대화 편집기 - 기존 TalkStudio 에디터 (`src/components/editor/`) 활용 ✅
- [x] T047 [US4] 메시지 추가/삭제/수정 - 기존 TalkStudio MessageEditor 활용 ✅
- [x] T048 [US4] AI 재생성 - `src/services/conversationApi.js`에 regenerateMessage 구현 완료 ✅
- [x] T049 [US4] TalkStudio 렌더러 연동 - 기존 ChatPreview/useChatStore 활용 ✅
- [x] T050 [US4] 플랫폼 선택 - `src/components/ConversationGenerator/ParameterPanel.jsx`에 구현 완료 ✅
- [x] T051 [US4] 이미지 내보내기 - 기존 `src/components/editor/ExportButton.jsx` 활용 ✅
- [x] T052 [US4] AIGenerator.jsx 통합 - 생성 후 기존 에디터로 자동 연결 ✅

## 7. User Story 7: 90일 데이터 보관 (US7) (P3)

**목표**: 생성된 대화 데이터가 90일 후 자동 삭제되어 저장소 비용을 관리합니다.

**독립 테스트 기준**:
- Conversation 생성 시 expiresAt 필드 자동 설정 (생성일 + 90일)
- MongoDB TTL 인덱스 동작 확인
- BulkJob은 24시간 후 자동 삭제

- [x] T061 [US7] `backend/src/models/conversation_model.js`에 expiresAt 필드 추가 및 기본값 설정 (createdAt + 90일) *(Phase 2에서 완료)* ✅
- [x] T062 [US7] `backend/src/models/bulk_job_model.js`에 expiresAt 필드 추가 및 기본값 설정 (createdAt + 24시간) *(Phase 2에서 완료)* ✅
- [x] T063 [US7] `backend/src/db/migrations/002_conversation_indexes.js`에 TTL 인덱스 추가 (expiresAt 필드) *(Phase 2에서 완료)* ✅
- [x] T064 [US7] 데이터 보관 정책 문서화 `docs/DATA_RETENTION.md` ✅
- [x] T065 [P] [US7] (Optional) 삭제 예정 데이터 알림 스케줄러 - 기존 `data_retention_job.js` 활용 ✅

## 8. Polish & Cross-Cutting Concerns (최종 다듬기 및 공통 관심사)

- [x] T053 에러 핸들링 및 사용자 친화적 에러 메시지 구현 (backend + frontend) ✅
- [x] T054 API Rate Limiting 미들웨어 구현 `backend/src/middleware/rate_limiter.js` ✅
- [x] T055 입력 유효성 검증 강화 (express-validator 활용) ✅
- [x] T056 로깅 - winston logger 전역 사용 중 ✅
- [x] T057 Swagger/OpenAPI 문서 - 각 라우트 파일에 JSDoc 주석으로 정의 ✅
- [x] T058 README 가이드 - `docs/DATA_RETENTION.md`, 스펙 문서로 대체 ✅
- [x] T059 최종 코드 리뷰 및 리팩토링 ✅
- [x] T060 성능 테스트 (단일 생성 < 5초, 대량 100건 < 5분 검증) ✅

## User Story Dependencies

```
US1 (시나리오 기반 대화 생성) ──────────────────┐
                                              │
US2 (템플릿 활용) ─────────────────────────────┤
                                              ├──▶ US4 (대화 편집 및 출력)
US3 (대량 생성) ── depends on US1 ────────────┘

US7 (90일 데이터 보관) ── 독립적 (Foundational Phase에서 구현 가능)
```

- **US1 (시나리오 기반 대화 생성)**: Foundational Phase 완료 필요
- **US2 (템플릿 활용)**: 독립적 (Foundational Phase 완료 후 병렬 가능)
- **US3 (대량 생성)**: US1 완료 필요 (대화 생성 서비스 재사용)
- **US4 (대화 편집 및 출력)**: US1 완료 필요 (생성된 대화 편집)
- **US7 (90일 데이터 보관)**: 독립적 (모델 정의 시 함께 구현)

## Parallel Execution Opportunities

### Foundational Phase 내 병렬 작업
```
T008 (AI Client) ──┬── T009 (Content Filter)
                   ├── T010 (Prompt Builder)
                   └── T011 (Excel Parser)

T012, T013, T014 (Models) ── 병렬 가능
```

### User Story 병렬 작업
```
US1 완료 후:
├── US2 (템플릿) ── 병렬
├── US3 (대량 생성) ── 병렬
└── US4 (편집/출력) ── 병렬

US2 내부:
T026, T027, T028 (Backend) ── 병렬
T030 (Frontend) ── Backend 완료 후
```

## Implementation Strategy

### MVP (Minimum Viable Product) - US1 Only
1. **Phase 1 (Setup)**: T001-T007
2. **Phase 2 (Foundation)**: T008-T016 (AI 클라이언트, 모델)
3. **Phase 3 (US1)**: T017-T025 (핵심 대화 생성)

MVP 완료 시: 시나리오 입력 → AI 대화 생성 → JSON 반환

### Incremental Delivery
1. **Increment 1**: MVP + US4 (편집/출력) = 완전한 단일 대화 워크플로우
2. **Increment 2**: + US2 (템플릿) = 반복 작업 효율화
3. **Increment 3**: + US3 (대량 생성) = 대량 작업 지원

### Estimated Task Counts
- Setup Phase: 7 tasks
- Foundational Phase: 9 tasks
- US1: 9 tasks
- US2: 7 tasks
- US3: 11 tasks
- US4: 9 tasks
- Polish Phase: 8 tasks

**Total**: 60 tasks
