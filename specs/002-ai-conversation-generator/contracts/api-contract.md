# API Contract: AI 대화 생성기

**Feature**: 002-ai-conversation-generator | **Version**: 1.0.0 | **Base Path**: `/api/v1`

## Overview

AI 기반 대화 생성 및 스크린샷 출력을 위한 REST API

## Authentication

내부 전용 시스템 - 인증 없음 (네트워크 레벨 보안)

## Endpoints

### 1. Conversations

#### POST /conversations/generate

AI를 사용하여 새 대화 생성

**Request**:
```json
{
  "scenario": "게임 아이템 거래 협상 대화",
  "participants": 2,
  "messageCount": 10,
  "tone": "casual",
  "platform": "kakaotalk",
  "parameters": {
    "temperature": 0.7
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| scenario | string | Yes | 10-500자 |
| participants | number | Yes | 2-5 |
| messageCount | number | Yes | 5-50 |
| tone | enum | Yes | casual, formal, humorous |
| platform | enum | Yes | kakaotalk, discord, telegram, instagram |
| parameters.temperature | number | No | 0.0-1.0, default: 0.7 |

**Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "conversationId": "674a1b2c3d4e5f6789012345",
    "scenario": "게임 아이템 거래 협상 대화",
    "participants": ["판매자", "구매자"],
    "messages": [
      {
        "sender": "판매자",
        "text": "안녕하세요! 아이템 보셨나요?",
        "timestamp": "14:30",
        "type": "text"
      },
      {
        "sender": "구매자",
        "text": "네 봤어요. 가격 협상 가능할까요?",
        "timestamp": "14:31",
        "type": "text"
      }
    ],
    "tone": "casual",
    "platform": "kakaotalk",
    "aiProvider": "upstage",
    "status": "completed",
    "createdAt": "2025-12-11T14:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 유효하지 않은 입력
- `422 Unprocessable Entity`: 부적절한 콘텐츠 요청
- `503 Service Unavailable`: AI API 장애

---

#### GET /conversations/:id

특정 대화 조회

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "conversationId": "674a1b2c3d4e5f6789012345",
    "scenario": "게임 아이템 거래 협상 대화",
    "participants": ["판매자", "구매자"],
    "messages": [...],
    "tone": "casual",
    "platform": "kakaotalk",
    "status": "completed",
    "createdAt": "2025-12-11T14:30:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: 대화를 찾을 수 없음

---

#### PATCH /conversations/:id

대화 편집 (메시지 수정)

**Request**:
```json
{
  "messages": [
    {
      "sender": "판매자",
      "text": "수정된 메시지 내용",
      "timestamp": "14:30",
      "type": "text"
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "conversationId": "674a1b2c3d4e5f6789012345",
    "status": "edited",
    "updatedAt": "2025-12-11T15:00:00Z"
  }
}
```

---

#### POST /conversations/:id/regenerate

특정 메시지 재생성 요청

**Request**:
```json
{
  "messageIndex": 3,
  "instruction": "더 친근한 톤으로"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "regeneratedMessage": {
      "sender": "구매자",
      "text": "ㅋㅋ 그럼 조금만 깎아주세요~",
      "timestamp": "14:32",
      "type": "text"
    }
  }
}
```

---

#### DELETE /conversations/:id

대화 삭제

**Response (204 No Content)**

---

### 2. Templates

#### GET /templates

템플릿 목록 조회

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| category | string | 카테고리 필터 |
| isSystem | boolean | 시스템 템플릿만 조회 |

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "templates": [
      {
        "templateId": "674a1b2c3d4e5f6789012346",
        "name": "게임 아이템 거래",
        "category": "game_trade",
        "scenario": "온라인 게임에서 아이템을 거래하는...",
        "participants": 2,
        "messageCount": 10,
        "tone": "casual",
        "isSystem": true
      }
    ],
    "total": 4
  }
}
```

---

#### POST /templates

커스텀 템플릿 생성

**Request**:
```json
{
  "name": "내 커스텀 템플릿",
  "category": "daily_chat",
  "scenario": "카페에서 만나 수다 떠는 친구들",
  "participants": 3,
  "messageCount": 15,
  "tone": "casual"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "templateId": "674a1b2c3d4e5f6789012347",
    "name": "내 커스텀 템플릿",
    "isSystem": false,
    "createdAt": "2025-12-11T15:00:00Z"
  }
}
```

---

#### DELETE /templates/:id

커스텀 템플릿 삭제 (시스템 템플릿 삭제 불가)

**Response (204 No Content)**

**Error Responses**:
- `403 Forbidden`: 시스템 템플릿 삭제 시도

---

### 3. Bulk Generation

#### POST /bulk/start

대량 생성 작업 시작

**Request (multipart/form-data)**:
| Field | Type | Description |
|-------|------|-------------|
| file | File | Excel 파일 (.xlsx) |

**Response (202 Accepted)**:
```json
{
  "status": "success",
  "data": {
    "jobId": "674a1b2c3d4e5f6789012348",
    "totalCount": 50,
    "status": "pending",
    "message": "대량 생성 작업이 시작되었습니다"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 잘못된 Excel 형식
- `422 Unprocessable Entity`: 유효성 검증 실패 (에러 목록 포함)

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {"row": 3, "column": "participants", "message": "2-5 사이의 숫자여야 합니다"},
    {"row": 7, "column": "scenario", "message": "시나리오가 너무 짧습니다"}
  ]
}
```

---

#### GET /bulk/:jobId/status

대량 생성 작업 상태 조회

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "jobId": "674a1b2c3d4e5f6789012348",
    "status": "processing",
    "totalCount": 50,
    "completedCount": 23,
    "failedCount": 2,
    "progress": 50,
    "errors": [
      {"row": 15, "error": "AI 생성 실패: 부적절한 콘텐츠"}
    ]
  }
}
```

---

#### GET /bulk/:jobId/download

완료된 대량 생성 결과 다운로드 (ZIP)

**Response (200 OK)**:
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="bulk_conversations_674a1b2c.zip"`

ZIP 구조:
```
bulk_conversations_674a1b2c/
├── 001_game_trade_kakaotalk.png
├── 002_daily_chat_discord.png
├── ...
├── conversations.json
└── errors.json
```

**Error Responses**:
- `404 Not Found`: 작업을 찾을 수 없음
- `409 Conflict`: 작업이 아직 진행 중

---

### 4. Excel Template

#### GET /bulk/template

Excel 템플릿 다운로드

**Response (200 OK)**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="bulk_generation_template.xlsx"`

---

## Error Response Format

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {}
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | 입력 유효성 검증 실패 |
| NOT_FOUND | 404 | 리소스를 찾을 수 없음 |
| FORBIDDEN | 403 | 권한 없음 |
| CONTENT_POLICY_VIOLATION | 422 | 부적절한 콘텐츠 |
| AI_SERVICE_ERROR | 503 | AI API 장애 |
| RATE_LIMIT_EXCEEDED | 429 | API 호출 한도 초과 |

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /conversations/generate | 60 req/min |
| POST /bulk/start | 10 req/hour |
| Other endpoints | 300 req/min |
