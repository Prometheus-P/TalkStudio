# TalkStudio Feature Tasks: 대량 디스코드 대화 캡쳐 및 Upstage API 연동 콘텐츠 생성

**Branch**: `001-discord-upstage-integration` | **Date**: 2025-12-09

## 1. Setup Phase (프로젝트 초기화)

- [X] T001 프로젝트 루트에 `backend/` 디렉토리 생성
- [X] T002 프로젝트 루트에 `ai_agent_system/` 디렉토리 생성
- [X] T003 `frontend/` 디렉토리 생성 및 기존 `src/` 이동 (기존 React 프로젝트 구조 재구성)
- [X] T004 `backend/` 디렉토리 내 Node.js 프로젝트 초기화 및 `package.json` 생성
- [X] T005 `ai_agent_system/` 디렉토리 내 Python 프로젝트 초기화 및 `requirements.txt` 생성
- [X] T006 `backend/`와 `ai_agent_system/`에 `.env` 파일 예시 (`.env.example`) 생성 (Discord 봇 토큰, Upstage API 키 플레이스홀더 포함)

## 2. Foundational Phase (공통 기반 작업)

- [X] T007 `ai_agent_system/requirements.txt`에 `discord.py` 및 `openai` (Upstage 호환) 종속성 추가
- [X] T008 `backend/package.json`에 Express, MongoDB 클라이언트, 기타 필수 종속성 추가
- [X] T009 `backend/src/config/` 디렉토리 및 환경 변수 (`.env`) 로드 및 검증 로직 구현 (Discord Bot Token, Upstage API Key 등)
- [X] T010 `ai_agent_system/src/config/` 디렉토리 및 환경 변수 (`.env`) 로드 및 검증 로직 구현
- [X] T011 `backend/src/db/` 디렉토리 및 MongoDB 데이터베이스 연결 설정 구현
- [X] T012 `ai_agent_system/src/db/` 디렉토리 및 데이터베이스 연결 설정 구현 (Backend와 동일한 MongoDB 사용)

## 3. User Story 1: Discord 연동 및 메시지 캡쳐 (US1) (P1)

**목표**: Discord API를 통해 특정 서버/채널의 메시지를 안정적으로 캡쳐하고, 캡쳐된 데이터를 구성하여 저장합니다.

**독립 테스트 기준**:
- Discord 설정이 성공적으로 저장/조회/삭제되는가?
- 특정 Discord 채널에서 메시지가 지정된 시간 범위 내에서 정확하게 캡쳐되는가?
- Discord API Rate Limit을 준수하며 대량의 메시지가 안정적으로 캡쳐되는가?
- 캡쳐된 메시지가 `DiscordMessage` 데이터 모델에 따라 올바르게 데이터베이스에 저장되는가?

- [X] T013 [US1] `ai_agent_system/src/services/discord_client.py`에 `discord.py`를 활용한 Discord API 클라이언트 초기화 및 메시지 fetch 로직 구현
- [X] T014 [US1] `ai_agent_system/src/agents/discord_capture_agent.py`에 Discord 메시지 캡쳐 에이전트 클래스 정의
- [X] T015 [US1] `ai_agent_system/src/agents/discord_capture_agent.py`에 `DiscordConfig`에 따라 메시지를 캡쳐하고 `DiscordMessage` 엔티티로 변환하여 저장하는 로직 구현
- [X] T016 [P] [US1] `backend/src/models/discord_config_model.js`에 `DiscordConfig` 데이터 모델 구현 및 데이터베이스 연동
- [X] T017 [P] [US1] `backend/src/api/integrations/discord_config_routes.js`에 `POST /integrations/discord/config` (설정 등록/업데이트) API 엔드포인트 구현
- [X] T018 [P] [US1] `backend/src/api/integrations/discord_config_routes.js`에 `GET /integrations/discord/config/{configId}` (설정 조회) API 엔드포인트 구현
- [X] T019 [P] [US1] `backend/src/api/integrations/discord_config_routes.js`에 `DELETE /integrations/discord/config/{configId}` (설정 삭제) API 엔드포인트 구현
- [X] T020 [P] [US1] `backend/src/api/integrations/discord_capture_routes.js`에 `POST /integrations/discord/config/{configId}/capture/start` (캡쳐 시작/재개) API 엔드포인트 구현 (AI Agent System에 작업 위임)
- [X] T021 [P] [US1] `backend/src/api/integrations/discord_capture_routes.js`에 `GET /integrations/discord/capture/{captureJobId}/status` (캡쳐 상태 조회) API 엔드포인트 구현
- [X] T022 [US1] `ai_agent_system/src/models/discord_message_model.py`에 `DiscordMessage` 데이터 모델 구현 및 데이터베이스 연동
- [X] T023 [US1] Discord API Rate Limit 처리 및 재시도 로직 구현 (`ai_agent_system/src/services/discord_client.py`)

## 4. User Story 2: 의도 추출 및 분석 (US2) (P1)

**목표**: 캡쳐된 Discord 메시지에서 사용자의 의도, 핵심 키워드, 감정을 정확하게 분석합니다.

**독립 테스트 기준**:
- 다양한 메시지에 대해 의도 분류, 키워드 추출, 감정 분석이 정확하게 수행되는가?
- 의도 분석 결과가 `IntentAnalysisResult` 데이터 모델에 따라 올바르게 데이터베이스에 저장되는가?

- [X] T024 [US2] `ai_agent_system/src/services/nlp_processor.py`에 Discord 메시지 전처리 (봇 명령어, 이모지 제거 등) 로직 구현
- [X] T025 [US2] `ai_agent_system/src/services/nlp_processor.py`에 의도 분류 모델 연동 (scikit-learn 또는 Hugging Face Transformers 기반) 및 의도 추출 로직 구현
- [X] T026 [US2] `ai_agent_system/src/services/nlp_processor.py`에 핵심 키워드 및 주제 추출 로직 구현
- [X] T027 [US2] `ai_agent_system/src/services/nlp_processor.py`에 감정 분석 로직 구현
- [X] T028 [US2] `ai_agent_system/src/models/intent_analysis_result_model.py`에 `IntentAnalysisResult` 데이터 모델 구현 및 데이터베이스 연동
- [X] T029 [US2] `ai_agent_system/src/agents/intent_analysis_agent.py`에 `DiscordMessage`를 받아 의도 분석을 수행하고 `IntentAnalysisResult`를 저장하는 에이전트 클래스 정의
- [X] T030 [P] [US2] `backend/src/api/integrations/intent_analysis_routes.js`에 `GET /integrations/discord/messages/{discordMessageId}/intent-analysis` (의도 분석 결과 조회) API 엔드포인트 구현

## 5. User Story 3: Upstage API 콘텐츠 생성 (US3) (P1)

**목표**: 분석된 의도를 기반으로 Upstage API를 통해 요약, FAQ 답변 등 다양한 형식의 콘텐츠를 생성합니다.

**독립 테스트 기준**:
- 의도 및 대화 내용을 기반으로 Upstage API 호출 시 적절한 프롬프트가 생성되는가?
- Upstage API로부터 다양한 콘텐츠 종류 (요약, FAQ 등)가 성공적으로 생성되는가?
- 생성 파라미터 (temperature, maxLength, tone)가 콘텐츠 생성에 올바르게 적용되는가?
- 생성된 콘텐츠가 `GeneratedContent` 데이터 모델에 따라 올바르게 데이터베이스에 저장되는가?

- [X] T031 [US3] `ai_agent_system/src/services/upstage_client.py`에 Upstage API 클라이언트 초기화 및 텍스트 생성 (`text_generation`) 메서드 구현
- [X] T032 [US3] `ai_agent_system/src/services/prompt_engineer.py`에 의도 분석 결과 및 Discord 메시지를 기반으로 Upstage LLM 프롬프트를 생성하는 로직 구현
- [X] T033 [US3] `ai_agent_system/src/models/generated_content_model.py`에 `GeneratedContent` 데이터 모델 구현 및 데이터베이스 연동
- [X] T034 [US3] `ai_agent_system/src/agents/content_generation_agent.py`에 의도 기반 프롬프트 엔지니어링 및 Upstage API 호출을 통해 콘텐츠를 생성하고 `GeneratedContent`를 저장하는 에이전트 클래스 정의
- [X] T035 [P] [US3] `backend/src/api/content_generation_routes.js`에 `POST /content/generate` (콘텐츠 생성 요청) API 엔드포인트 구현 (AI Agent System에 작업 위임)
- [X] T036 [P] [US3] `backend/src/api/content_generation_routes.js`에 `GET /content/generated/{generatedContentId}` (생성된 콘텐츠 조회) API 엔드포인트 구현
- [X] T037 [US3] Upstage API 비용 관리 및 사용량 모니터링 로직 구현 (`ai_agent_system/src/services/upstage_client.py`)
- [X] T038 [US3] LLM Hallucination 방지 및 사실 확인 메커니즘 (예: RAG 연동) 초기 연구 및 적용 고려 (`ai_agent_system/src/agents/content_generation_agent.py`)

## 6. User Story 4: 결과 저장 및 활용 (US4) (P1)

**목표**: 캡쳐/분석된 데이터와 생성된 콘텐츠를 효과적으로 저장하고, 사용자에게 조회 및 활용될 수 있도록 제공합니다.

**독립 테스트 기준**:
- 웹 UI에서 Discord 통합 설정 및 캡쳐 상태를 직관적으로 확인할 수 있는가?
- 웹 UI에서 의도 분석 결과 및 생성된 콘텐츠를 필터링/조회할 수 있는가?
- (선택 사항) 생성된 콘텐츠가 Discord 채널로 성공적으로 전송되는가?

- [X] T039 [US4] `frontend/src/components/DiscordIntegrationConfig.jsx`에 Discord 통합 설정 (등록/조회/삭제) UI 컴포넌트 구현
- [X] T040 [US4] `frontend/src/components/CaptureStatusDisplay.jsx`에 Discord 메시지 캡쳐 상태 조회 UI 컴포넌트 구현
- [X] T041 [US4] `frontend/src/pages/DiscordIntegrations.jsx`에 Discord 통합 관리 페이지 구현 (config list, capture status)
- [X] T042 [US4] `frontend/src/components/IntentAnalysisResultView.jsx`에 의도 분석 결과 표시 UI 컴포넌트 구현
- [X] T043 [US4] `frontend/src/components/GeneratedContentView.jsx`에 생성된 콘텐츠 표시 UI 컴포넌트 구현
- [X] T044 [US4] `frontend/src/pages/ContentManagement.jsx`에 생성된 콘텐츠 관리 페이지 구현 (조회, 필터링)
- [X] T045 [US4] (Optional) `ai_agent_system/src/services/discord_notifier.py`에 Discord 채널로 메시지를 전송하는 로직 구현

## 7. Polish & Cross-Cutting Concerns (최종 다듬기 및 공통 관심사)

- [X] T046 전반적인 에러 로깅 및 모니터링 시스템 연동 (`docs/MONITORING.md` 참조)
- [X] T047 보안 강화 (API Key 암호화 저장, Discord OAuth2 흐름 개선 등)
- [X] T048 테스트 코드 작성 (유닛, 통합, E2E) for all new components/features (`docs/TEST_STRATEGY.md` 참조)
- [X] T048a [US1] 성능 테스트: 10,000개 Discord 메시지 캡쳐 < 60초 검증 (k6 또는 Artillery 활용)
- [X] T049 Swagger/OpenAPI 문서 자동 생성 및 배포 파이프라인 연동 (`specs/001-discord-upstage-integration/contracts/api-contract.md` 참조)
- [X] T050 CI/CD 파이프라인 업데이트 (`.github/workflows/ci.yml`, `deploy_staging.yml`, `deploy_production.yml`에 이 기능 관련 테스트/배포 단계 추가)
- [X] T051 `README.md`, `CONTRIBUTING.md` 등 문서 업데이트 및 기능 사용 가이드 추가
- [X] T052 최종 코드 리뷰 및 리팩토링
- [X] T053 성능 최적화 및 확장성 점검

## User Story Dependencies

- **US1 (Discord 연동 및 메시지 캡쳐)**: None
- **US2 (의도 추출 및 분석)**: Depends on US1 (캡쳐된 Discord 메시지 필요)
- **US3 (Upstage API 콘텐츠 생성)**: Depends on US2 (분석된 의도 필요)
- **US4 (결과 저장 및 활용)**: Depends on US1, US2, US3 (캡쳐/분석 데이터 및 생성 콘텐츠 필요)

## Parallel Execution Opportunities

- T016-T019 (Discord Config CRUD API)는 T013-T015 (Discord Capture Agent)와 병렬 개발 가능.
- T020-T021 (Capture Trigger/Status API)는 T013-T015가 구현 완료된 후에 개발될 수 있으나, 백엔드 API만 먼저 구현 가능.
- T024-T027 (NLP Processor)는 Discord 메시지 스키마가 확정되면 T013-T015와 병렬 개발 가능.
- T031-T034 (Upstage Client/Content Generation Agent)는 의도 분석 결과 스키마가 확정되면 T024-T029와 병렬 개발 가능.
- T039-T044 (Frontend UI)는 해당 백엔드 API (T017-T021, T030, T035-T036)가 확정되고 목업 API로 개발 시작 가능.

## Implementation Strategy

MVP (Minimum Viable Product)는 다음 User Story들을 순차적으로 구현하여, 최소한의 Discord 메시지 캡쳐, 의도 분석 및 Upstage API를 통한 콘텐츠 생성을 웹 UI에서 확인하는 것을 목표로 합니다:

1.  **US1: Discord 연동 및 메시지 캡쳐**: Discord 서버 설정 등록 및 메시지 캡쳐 후 DB 저장.
2.  **US2: 의도 추출 및 분석**: 캡쳐된 메시지에 대한 기본 의도 분석.
3.  **US3: Upstage API 콘텐츠 생성**: 분석된 메시지로부터 요약 콘텐츠 생성.
4.  **US4: 결과 저장 및 활용**: 웹 UI에서 캡쳐/분석 결과 및 생성된 콘텐츠 조회.

이후, 점진적으로 콘텐츠 종류 확장, Discord 채널로의 결과 전송, 고급 의도 분석 모델 도입, 성능 최적화 등을 진행합니다.

## Implementation Notes

**Stack Deviation**: The backend uses Express.js + MongoDB instead of Fastify + PostgreSQL as originally planned. This deviation was made to leverage existing implementation and reduce migration overhead. The core functionality remains intact.

**Completed**: 2025-12-11
- Setup Phase: 6/6 tasks ✅
- Foundational Phase: 6/6 tasks ✅
- US1 Discord Integration: 11/11 tasks ✅
- US2 Intent Analysis: 7/7 tasks ✅
- US3 Upstage Content: 8/8 tasks ✅
- US4 Frontend UI: 7/7 tasks ✅
- Polish Phase: 9/9 tasks ✅

**Total Progress**: 54/54 tasks completed (100%)

---

## 8. Enhancement Phase: Clarification 기반 신규 요구사항 (v1.1)

> 2025-12-11 `/speckit.clarify` 세션에서 추가된 요구사항

### US5: OpenAI Fallback 및 AI 비교 (FR-4.4, FR-4.5)

**목표**: Upstage 장애 시 OpenAI 자동 전환 및 AI 결과 비교 기능

**독립 테스트 기준**:
- Upstage API 장애 시 OpenAI로 자동 전환되는가?
- 두 AI의 결과를 비교하여 품질 차이를 확인할 수 있는가?

- [X] T054 [US5] `ai_agent_system/src/services/openai_client.py`에 OpenAI API 클라이언트 구현
- [X] T055 [US5] `ai_agent_system/src/services/ai_router.py`에 Upstage/OpenAI 라우팅 및 fallback 로직 구현
- [X] T056 [US5] `ai_agent_system/src/agents/content_generation_agent.py`에 ai_router 연동 (기존 upstage_client 대체)
- [X] T057 [P] [US5] `ai_agent_system/src/services/ai_comparator.py`에 두 AI 결과 비교 로직 구현
- [X] T058 [P] [US5] `backend/src/api/content_generation_routes.js`에 `POST /content/compare` (AI 비교 요청) API 엔드포인트 추가
- [X] T059 [US5] `frontend/src/components/AIComparisonView.jsx`에 AI 비교 결과 표시 UI 컴포넌트 구현

### US6: Excel 데이터 입출력 (FR-6)

**목표**: Excel 템플릿을 통한 메시지 데이터 입력 및 JSON 내보내기

**독립 테스트 기준**:
- Excel 파일 업로드 시 메시지 데이터가 정확히 파싱되는가?
- 유효성 검증 실패 시 오류 행이 피드백되는가?
- 생성된 콘텐츠가 JSON 형식으로 내보내지는가?

- [X] T060 [US6] `backend/package.json`에 `xlsx` (SheetJS) 종속성 추가
- [X] T061 [US6] `backend/src/services/excel_parser.js`에 Excel 파일 파싱 로직 구현
- [X] T062 [US6] `backend/src/services/excel_validator.js`에 Excel 데이터 유효성 검증 로직 구현 (오류 행 피드백 포함)
- [X] T063 [P] [US6] `backend/src/api/data_io_routes.js`에 `POST /data/import/excel` (Excel 업로드) API 엔드포인트 구현
- [X] T064 [P] [US6] `backend/src/api/data_io_routes.js`에 `GET /data/export/json` (JSON 내보내기) API 엔드포인트 구현
- [X] T065 [US6] `frontend/src/components/ExcelUploader.jsx`에 Excel 업로드 UI 컴포넌트 구현
- [X] T066 [US6] `frontend/src/components/ExcelValidationFeedback.jsx`에 유효성 검증 결과 표시 UI 구현
- [X] T067 [US6] `public/templates/message_template.xlsx`에 Excel 템플릿 파일 생성

### US7: 데이터 보관 정책 (NFR-8)

**목표**: 90일 후 캡쳐 메시지 및 생성 콘텐츠 자동 삭제

**독립 테스트 기준**:
- 90일 이상 된 데이터가 자동으로 삭제되는가?
- 삭제 작업이 성능에 영향을 주지 않는가?

- [X] T068 [US7] `backend/src/jobs/data_retention_job.js`에 90일 초과 데이터 삭제 cron job 구현
- [X] T069 [US7] `backend/src/config/index.js`에 데이터 보관 기간 설정 추가 (DATA_RETENTION_DAYS=90)
- [X] T070 [P] [US7] `backend/index.js`에 데이터 보관 job 스케줄러 등록 (node-cron 활용)

### US8: 구조화된 로깅 및 메트릭 (NFR-9)

**목표**: JSON 형식 구조화 로그 및 기본 메트릭 (요청수, 지연시간)

**독립 테스트 기준**:
- 모든 요청/응답이 구조화된 JSON 로그로 기록되는가?
- 요청 수와 지연시간 메트릭이 조회 가능한가?

- [X] T071 [US8] `backend/package.json`에 `pino` (구조화 로깅) 종속성 추가
- [X] T072 [US8] `backend/src/utils/logger.js`에 pino 기반 JSON 로거 구현 (기존 logger 교체)
- [X] T073 [US8] `backend/src/middleware/request_logger.js`에 HTTP 요청/응답 로깅 미들웨어 구현
- [X] T074 [P] [US8] `backend/src/middleware/metrics.js`에 요청 수/지연시간 메트릭 수집 미들웨어 구현
- [X] T075 [P] [US8] `backend/src/api/metrics_routes.js`에 `GET /metrics` 엔드포인트 구현 (Prometheus 형식)
- [X] T076 [US8] `ai_agent_system/src/utils/logger.py`에 Python structlog 기반 JSON 로거 구현

---

## v1.1 Enhancement Dependencies

- **US5 (OpenAI Fallback)**: Depends on US3 (기존 Upstage 콘텐츠 생성)
- **US6 (Excel 입출력)**: Depends on US1 (DiscordMessage 모델)
- **US7 (데이터 보관)**: Depends on Foundational Phase (DB 연결)
- **US8 (로깅/메트릭)**: Independent - 모든 요청에 적용

## v1.1 Parallel Execution

- T057-T058 (AI 비교 API/로직)은 T054-T056 (OpenAI 클라이언트) 완료 후 병렬 가능
- T063-T064 (데이터 입출력 API)는 T061-T062 (파서/검증) 완료 후 병렬 가능
- T074-T075 (메트릭)는 T071-T073 (로깅) 과 병렬 가능
- US7 (데이터 보관)은 다른 US와 완전히 독립 실행 가능

## Updated Progress

**v1.0 (Original)**: 54/54 tasks ✅ (100%)
**v1.1 (Enhancements)**: 23/23 tasks ✅ (100%) - US5, US6, US7, US8 완료
**Total**: 77/77 tasks ✅ (100%)
