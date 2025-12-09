# TalkStudio 데이터 모델 명세

## 1. 개요
본 문서는 TalkStudio 애플리케이션의 핵심 데이터 엔티티와 그 관계를 정의합니다. 이는 데이터베이스 스키마 설계 및 API 데이터 구조 정의의 기반이 됩니다.

## 2. 데이터베이스 개요 (예정)
- **유형**: NoSQL (MongoDB) 또는 관계형 (PostgreSQL) - 추후 확정
- **목적**: 사용자 데이터, 대화 기록, 에이전트 구성, 시스템 로그 저장.

## 3. 핵심 엔티티

### 3.1. User (사용자)
- **설명**: TalkStudio 플랫폼을 사용하는 사용자 계정 정보.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `username`: `String` (Unique, Not Null)
    - `email`: `String` (Unique, Not Null)
    - `passwordHash`: `String` (Not Null, 해싱된 비밀번호)
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - `preferences`: `Object` (JSONB, 사용자 설정)

### 3.2. Conversation (대화)
- **설명**: 사용자 한 명과 AI 에이전트 시스템 간의 단일 대화 세션.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `userId`: `UUID` (Foreign Key, User._id 참조)
    - `title`: `String` (대화 제목, 자동 생성 또는 사용자 지정)
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - `agentConfigSnapshot`: `Object` (JSONB, 해당 대화 시점의 에이전트 설정)
    - `status`: `Enum` (`active`, `archived`, `deleted`)

### 3.3. Message (메시지)
- **설명**: 대화 내에서 교환되는 단일 메시지 (사용자 또는 에이전트).
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `conversationId`: `UUID` (Foreign Key, Conversation._id 참조)
    - `sender`: `Enum` (`user`, `agent`)
    - `content`: `String` (메시지 내용)
    - `timestamp`: `DateTime`
    - `agentTraceId`: `UUID` (Optional, 관련 에이전트 트레이스 참조)
    - `rawAgentResponse`: `Object` (Optional, 에이전트의 원시 응답 데이터)

### 3.4. Agent (에이전트)
- **설명**: AI 에이전트 시스템에 등록된 개별 에이전트 정의.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `name`: `String` (Unique, Not Null)
    - `description`: `String`
    - `modelConfig`: `Object` (JSONB, 사용 LLM 및 모델 매개변수)
    - `toolConfigs`: `Array<Object>` (JSONB, 사용 가능한 도구 목록 및 설정)
    - `promptTemplate`: `String` (에이전트의 기본 프롬프트 템플릿)
    - `version`: `String` (에이전트 정의의 버전)
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - `status`: `Enum` (`active`, `inactive`, `deprecated`)

### 3.5. AgentTrace (에이전트 실행 트레이스)
- **설명**: 에이전트 실행의 상세 로그 및 흐름. 디버깅 및 시각화용.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `conversationId`: `UUID` (Foreign Key, Conversation._id 참조)
    - `messageId`: `UUID` (Foreign Key, Message._id 참조, Optional)
    - `rootAgentId`: `UUID` (최초 호출된 에이전트)
    - `traceSteps`: `Array<Object>` (JSONB, 각 에이전트의 호출, 도구 사용, 핸드오프 등 상세 기록)
    - `startTime`: `DateTime`
    - `endTime`: `DateTime`
    - `status`: `Enum` (`success`, `failure`, `partial`)
    - `errorMessage`: `String` (Optional)

## 4. 관계
- `User` 1 : N `Conversation` (한 사용자는 여러 대화를 가질 수 있습니다)
- `Conversation` 1 : N `Message` (한 대화는 여러 메시지를 포함합니다)
- `Message` N : 1 `AgentTrace` (하나의 메시지 생성에 여러 트레이스 스텝이 기여할 수 있으며, 트레이스는 하나의 메시지에 연결될 수 있습니다)
- `Agent`는 시스템 전역으로 정의되며, `Conversation`의 `agentConfigSnapshot`에 복사되거나 참조될 수 있습니다.
