# TalkStudio API 명세

## 1. 개요
본 문서는 TalkStudio 백엔드가 제공하는 RESTful API 엔드포인트를 정의합니다. 프론트엔드 애플리케이션 및 잠재적인 외부 클라이언트와의 상호작용을 위한 표준을 제공합니다.

## 2. 기본 정보
- **기본 URL**: `/api/v1` (예정)
- **인증**: JWT (JSON Web Token) 기반 인증 (예정)
- **응답 형식**: JSON

## 3. 공통 응답 구조

### 3.1. 성공 응답
```json
{
  "status": "success",
  "data": {
    // API별 데이터
  },
  "message": "요청이 성공적으로 처리되었습니다."
}
```

### 3.2. 에러 응답
```json
{
  "status": "error",
  "code": "ERROR_CODE_ENUM", // 예: UNAUTHORIZED, INVALID_INPUT, AGENT_FAILURE
  "message": "에러 상세 메시지",
  "details": {
    // 추가 에러 정보 (예: 유효성 검사 실패 필드)
  }
}
```

## 4. 인증 (Authentication) API (예정)

### 4.1. 사용자 회원가입
- **엔드포인트**: `POST /auth/register`
- **설명**: 새로운 사용자 계정을 생성합니다.
- **요청 바디**:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "userId": "uuid",
        "username": "string"
      },
      "message": "회원가입이 성공적으로 완료되었습니다."
    }
    ```

### 4.2. 사용자 로그인
- **엔드포인트**: `POST /auth/login`
- **설명**: 사용자 로그인을 처리하고 JWT를 발급합니다.
- **요청 바디**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "string (JWT)",
        "refreshToken": "string (JWT)"
      },
      "message": "로그인이 성공적으로 완료되었습니다."
    }
    ```

## 5. 대화 (Chat) API

### 5.1. 새 대화 시작
- **엔드포인트**: `POST /chat/start`
- **설명**: 새로운 대화 세션을 시작합니다.
- **요청 바디**:
    ```json
    {
      "initialMessage": "string (optional)",
      "agentConfig": { // optional, 특정 에이전트 설정
        "agentId": "string",
        "params": "object"
      }
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "conversationId": "uuid",
        "initialResponse": "string (optional)"
      },
      "message": "새 대화가 시작되었습니다."
    }
    ```

### 5.2. 메시지 전송 및 응답 수신
- **엔드포인트**: `POST /chat/{conversationId}/message`
- **설명**: 지정된 대화에 메시지를 전송하고 AI 에이전트의 응답을 받습니다. 스트리밍 응답 지원을 위해 WebSocket으로 전환될 수 있습니다.
- **요청 바디**:
    ```json
    {
      "message": "string"
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "messageId": "uuid",
        "response": "string",
        "agentTrace": "object (optional, for debugging/visualization)"
      },
      "message": "메시지 처리 완료."
    }
    ```

### 5.3. 대화 기록 조회
- **엔드포인트**: `GET /chat/{conversationId}/history`
- **설명**: 특정 대화의 전체 메시지 기록을 조회합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "history": [
          {
            "messageId": "uuid",
            "sender": "user" | "agent",
            "content": "string",
            "timestamp": "ISO_DATE_STRING"
          }
          // ...
        ]
      }
    }
    ```

## 6. 에이전트 관리 (Agent Management) API (예정)

### 6.1. 사용 가능한 에이전트 목록 조회
- **엔드포인트**: `GET /agents`
- **설명**: 현재 시스템에 배포된 에이전트들의 목록과 기본 정보를 반환합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "agents": [
          {
            "agentId": "string",
            "name": "string",
            "description": "string",
            "capabilities": ["string"],
            "parameters": "object (schema of configurable parameters)"
          }
        ]
      }
    }
    ```

## 7. 웹소켓 (WebSocket) API (예정)

### 7.1. 실시간 대화 스트리밍
- **엔드포인트**: `ws://[hostname]/ws/chat/{conversationId}`
- **설명**: 클라이언트와 서버 간의 실시간 메시지 교환 및 에이전트 응답 스트리밍을 위한 WebSocket 연결.
- **클라이언트 송신 메시지**:
    ```json
    {
      "type": "message",
      "content": "string"
    }
    ```
- **서버 수신 메시지 (스트리밍)**:
    ```json
    {
      "type": "agent_response_chunk",
      "content": "string (partial response)"
    }
    ```
    ```json
    {
      "type": "agent_response_end",
      "messageId": "uuid",
      "fullResponse": "string",
      "agentTrace": "object (optional)"
    }
    ```
    ```json
    {
      "type": "error",
      "code": "ERROR_CODE",
      "message": "string"
    }
    ```
