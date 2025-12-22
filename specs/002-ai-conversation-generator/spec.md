# Feature Specification: AI 대화 생성기

**Branch**: `002-ai-conversation-generator` | **Date**: 2025-12-11 | **Status**: Draft

## Overview

TalkStudio에 AI 기반 대화 생성 기능을 추가합니다. 사용자가 시나리오(게임 아이템 거래, 일상 대화 등)를 입력하면 Upstage API가 자연스러운 대화를 생성하고, 기존 TalkStudio 렌더링 엔진을 통해 카카오톡/디스코드/텔레그램 스타일 스크린샷으로 출력합니다.

## Functional Requirements

### FR-1: AI 대화 생성
- **FR-1.1**: 사용자가 시나리오 프롬프트를 입력하면 AI가 대화를 생성한다
- **FR-1.2**: 대화 참여자 수(2~5명)를 지정할 수 있다
- **FR-1.3**: 대화 길이(메시지 수: 5~50개)를 지정할 수 있다
- **FR-1.4**: 톤/스타일(캐주얼, 포멀, 유머러스)을 선택할 수 있다

### FR-2: 시나리오 템플릿
- **FR-2.1**: 사전 정의된 시나리오 템플릿을 선택할 수 있다
- **FR-2.2**: 템플릿 카테고리: 게임 거래, 일상 대화, 고객 문의, 친구 대화
- **FR-2.3**: 템플릿을 커스터마이즈하여 저장할 수 있다

### FR-3: 대화 편집
- **FR-3.1**: 생성된 대화를 수동으로 편집할 수 있다
- **FR-3.2**: 개별 메시지 추가/삭제/수정이 가능하다
- **FR-3.3**: AI에게 특정 메시지 재생성을 요청할 수 있다

### FR-4: 스크린샷 렌더링
- **FR-4.1**: 생성된 대화를 TalkStudio 기존 렌더링 엔진으로 출력한다
- **FR-4.2**: 플랫폼 스타일 선택 (카카오톡, 디스코드, 텔레그램, 인스타그램)
- **FR-4.3**: PNG/JPEG 이미지로 다운로드할 수 있다

### FR-5: 대량 생성 (Bulk Generation)
- **FR-5.1**: Excel 템플릿으로 여러 시나리오를 일괄 입력할 수 있다
- **FR-5.2**: 일괄 생성된 대화를 ZIP으로 다운로드할 수 있다
- **FR-5.3**: 진행 상태를 실시간으로 확인할 수 있다

### FR-6: AI 제공자 관리
- **FR-6.1**: Upstage API를 기본 제공자로 사용한다
- **FR-6.2**: OpenAI를 백업 제공자로 자동 전환한다
- **FR-6.3**: 생성 파라미터(temperature, max_tokens)를 조정할 수 있다

## Non-Functional Requirements

| ID | Category | Requirement | Metric |
|----|----------|-------------|--------|
| NFR-1 | Performance | 단일 대화 생성 | < 5 seconds |
| NFR-2 | Performance | 대량 생성 (100건) | < 5 minutes |
| NFR-3 | Quality | 대화 자연스러움 | 사용자 만족도 > 80% |
| NFR-4 | Reliability | AI API 장애 대응 | 자동 폴백 + 재시도 |
| NFR-5 | Cost | API 비용 관리 | 월 $300 이하 (초기) |

## User Stories

### US1: 시나리오 기반 대화 생성
**As a** 콘텐츠 제작자
**I want to** 시나리오를 입력하면 AI가 대화를 생성
**So that** 빠르게 다양한 대화 스크린샷을 만들 수 있다

**Acceptance Criteria**:
- [ ] 프롬프트 입력 → 대화 생성 < 5초
- [ ] 2~5명 참여자 대화 생성 가능
- [ ] 톤/스타일 선택 적용 확인

### US2: 템플릿 활용
**As a** 콘텐츠 제작자
**I want to** 미리 정의된 템플릿을 사용
**So that** 반복 작업을 줄일 수 있다

**Acceptance Criteria**:
- [ ] 4개 이상 기본 템플릿 제공
- [ ] 템플릿 커스터마이즈 저장
- [ ] 템플릿 카테고리 필터링

### US3: 대량 생성
**As a** 콘텐츠 제작자
**I want to** 여러 시나리오를 한 번에 처리
**So that** 대량의 스크린샷을 효율적으로 생성할 수 있다

**Acceptance Criteria**:
- [ ] Excel 템플릿 업로드
- [ ] 100건 일괄 생성 < 5분
- [ ] ZIP 다운로드 제공

### US4: 대화 편집 및 출력
**As a** 콘텐츠 제작자
**I want to** 생성된 대화를 편집하고 스크린샷으로 출력
**So that** 원하는 결과물을 얻을 수 있다

**Acceptance Criteria**:
- [ ] 메시지 추가/삭제/수정
- [ ] 4개 플랫폼 스타일 지원
- [ ] PNG/JPEG 다운로드

### US7: 90일 데이터 보관 (P3)
**As a** 시스템 관리자
**I want to** 생성된 대화 데이터가 90일 후 자동 삭제
**So that** 저장소 비용을 관리하고 데이터 보관 정책을 준수할 수 있다

**Acceptance Criteria**:
- [ ] Conversation 문서에 expiresAt 필드 자동 설정 (생성일 + 90일)
- [ ] MongoDB TTL 인덱스로 자동 삭제
- [ ] BulkJob은 24시간 후 자동 삭제
- [ ] 삭제 전 경고 알림 (선택적)

## Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-1 | 빈 프롬프트 입력 | "시나리오를 입력해주세요" 에러 |
| EC-2 | 부적절한 콘텐츠 요청 | AI 콘텐츠 필터링 + 거부 메시지 |
| EC-3 | API 할당량 초과 | 대기열 + 사용자 알림 |
| EC-4 | 대량 생성 중 일부 실패 | 성공 건 다운로드 + 실패 목록 제공 |

## Out of Scope (v1)

- 실시간 협업 편집
- 음성 메시지 생성
- 비디오/GIF 출력
- 다국어 UI (한국어만 지원)

## Technical Notes

### 기존 시스템 연동
- `001-discord-upstage-integration`의 Upstage 클라이언트 재사용
- TalkStudio 기존 렌더링 컴포넌트 활용

### 데이터 흐름
```
User Input (Scenario + Parameters)
    ↓
Backend API (/api/v1/conversations/generate)
    ↓
AI Agent (Upstage/OpenAI)
    ↓
Conversation Data (JSON)
    ↓
Frontend Editor (Review/Edit)
    ↓
TalkStudio Renderer
    ↓
Screenshot Export
```

## Excel 템플릿 구조 (대량 생성용)

| Column | Description | Example |
|--------|-------------|---------|
| scenario | 시나리오 설명 | "게임 아이템 거래 협상" |
| participants | 참여자 수 | 2 |
| message_count | 메시지 수 | 10 |
| tone | 톤/스타일 | casual |
| platform | 출력 플랫폼 | kakaotalk |
