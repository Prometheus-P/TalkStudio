# Feature Specification: Discord 대화 캡쳐 및 Upstage API 연동 콘텐츠 생성

**Branch**: `001-discord-upstage-integration` | **Date**: 2025-12-09 | **Status**: Draft

## Overview

TalkStudio에 Discord 서버/채널의 대화 내역을 캡쳐하고, NLP 기반 의도 분석 후 Upstage API를 통해 요약/FAQ 등 콘텐츠를 자동 생성하는 기능을 추가합니다.

## Functional Requirements

### FR-1: Discord 통합 설정 관리
- **FR-1.1**: 사용자는 Discord 서버 ID, 봇 토큰, 활성화할 채널 목록을 등록할 수 있다
- **FR-1.2**: 등록된 설정을 조회, 수정, 삭제할 수 있다
- **FR-1.3**: 봇 토큰은 암호화되어 저장되어야 한다

### FR-2: Discord 메시지 캡쳐
- **FR-2.1**: 설정된 채널에서 지정 시간 범위의 메시지를 캡쳐할 수 있다
- **FR-2.2**: 캡쳐 작업의 진행 상태를 조회할 수 있다
- **FR-2.3**: Discord API Rate Limit을 준수하며 자동 재시도한다

### FR-3: 의도 분석
- **FR-3.1**: 캡쳐된 메시지에서 의도(질문/제안/불평 등)를 분류한다
- **FR-3.2**: 핵심 키워드를 추출한다
- **FR-3.3**: 감정(positive/negative/neutral)을 분석한다

### FR-4: Upstage API 콘텐츠 생성
- **FR-4.1**: 분석된 의도를 기반으로 요약, FAQ, 아이디어 목록을 생성한다
- **FR-4.2**: 생성 파라미터(temperature, maxLength, tone)를 조정할 수 있다
- **FR-4.3**: 생성된 콘텐츠를 저장하고 조회할 수 있다

### FR-5: 결과 표시 UI
- **FR-5.1**: 웹 UI에서 Discord 통합 설정을 관리할 수 있다
- **FR-5.2**: 캡쳐 상태, 의도 분석 결과, 생성된 콘텐츠를 조회할 수 있다

## Non-Functional Requirements

| ID | Category | Requirement | Metric |
|----|----------|-------------|--------|
| NFR-1 | Performance | 메시지 캡쳐 속도 | 10,000 messages < 60 seconds |
| NFR-2 | Performance | 의도 분석 + 콘텐츠 생성 | < 5 seconds per request |
| NFR-3 | Security | 봇 토큰 저장 | AES-256 암호화 |
| NFR-4 | Reliability | Discord API 장애 대응 | 자동 재시도 3회, exponential backoff |
| NFR-5 | Scalability | 동시 사용자 | 1,000 concurrent users |
| NFR-6 | Cost | Upstage API 비용 | 월 $500 이하 (초기) |

## User Stories

### US1: Discord 연동 및 메시지 캡쳐
**As a** 콘텐츠 관리자
**I want to** Discord 서버의 대화를 자동으로 캡쳐하고 저장
**So that** 커뮤니티 대화를 분석하고 활용할 수 있다

**Acceptance Criteria**:
- [ ] Discord 설정 CRUD API 동작 확인
- [ ] 10,000개 메시지 캡쳐 < 60초
- [ ] Rate limit 발생 시 자동 재시도 확인

### US2: 의도 추출 및 분석
**As a** 콘텐츠 관리자
**I want to** 캡쳐된 메시지의 의도와 감정을 자동 분석
**So that** 사용자 니즈를 파악할 수 있다

**Acceptance Criteria**:
- [ ] 의도 분류 정확도 > 70%
- [ ] 키워드 추출 결과 저장 확인
- [ ] 감정 분석 결과 3단계(positive/negative/neutral) 분류

### US3: Upstage API 콘텐츠 생성
**As a** 콘텐츠 관리자
**I want to** 분석된 의도를 기반으로 요약/FAQ 콘텐츠 생성
**So that** 수동 작업 없이 콘텐츠를 제작할 수 있다

**Acceptance Criteria**:
- [ ] 요약(summary) 콘텐츠 생성 확인
- [ ] FAQ 답변 생성 확인
- [ ] 생성 파라미터 적용 확인 (temperature, maxLength)

### US4: 결과 저장 및 활용
**As a** 콘텐츠 관리자
**I want to** 웹 UI에서 모든 결과를 조회하고 관리
**So that** 생성된 콘텐츠를 효율적으로 활용할 수 있다

**Acceptance Criteria**:
- [ ] Discord 설정 관리 UI 동작
- [ ] 캡쳐 상태 실시간 표시
- [ ] 생성된 콘텐츠 목록 조회 및 필터링

## Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-1 | Discord 봇 토큰 만료 | 에러 메시지 표시, 재설정 안내 |
| EC-2 | 빈 채널 캡쳐 시도 | "캡쳐할 메시지가 없습니다" 반환 |
| EC-3 | Upstage API 할당량 초과 | 대기열 추가, 사용자 알림 |
| EC-4 | 메시지에 이모지만 있는 경우 | 의도 분석 스킵, 로그 기록 |

## Out of Scope (v1)

- Discord 실시간 스트리밍 (WebSocket)
- 다국어 의도 분석 (한국어/영어만 지원)
- 생성된 콘텐츠의 Discord 자동 게시 (T045는 선택적)
