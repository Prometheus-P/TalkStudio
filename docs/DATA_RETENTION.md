# TalkStudio 데이터 보관 정책

> **버전**: 1.0.0
> **최종 수정**: 2024-12-12
> **기능**: 002-ai-conversation-generator

## 개요

TalkStudio AI 대화 생성기는 저장소 비용 관리 및 개인정보 보호를 위해 자동 데이터 보관 정책을 적용합니다. 이 문서는 데이터 보관 기간, 자동 삭제 메커니즘, 관련 기술 구현을 설명합니다.

## 데이터 보관 기간

### 1. 대화 데이터 (Conversations)

| 데이터 | 보관 기간 | 삭제 방식 |
|--------|----------|----------|
| 생성된 대화 | **90일** | MongoDB TTL 자동 삭제 |
| 대화 메시지 | **90일** | 대화 삭제 시 함께 삭제 |
| 메타데이터 | **90일** | 대화 삭제 시 함께 삭제 |

### 2. 대량 생성 작업 (BulkJobs)

| 데이터 | 보관 기간 | 삭제 방식 |
|--------|----------|----------|
| 작업 정보 | **24시간** | MongoDB TTL 자동 삭제 |
| 생성 결과 | **24시간** | 작업 삭제 시 함께 삭제 |
| 에러 로그 | **24시간** | 작업 삭제 시 함께 삭제 |

### 3. 템플릿 (Templates)

| 데이터 | 보관 기간 | 삭제 방식 |
|--------|----------|----------|
| 시스템 템플릿 | **영구 보관** | 수동 삭제만 가능 |
| 커스텀 템플릿 | **영구 보관** | 사용자 삭제 시 삭제 |

## 기술 구현

### MongoDB TTL 인덱스

데이터 자동 삭제는 MongoDB의 [TTL (Time To Live) 인덱스](https://www.mongodb.com/docs/manual/core/index-ttl/)를 사용합니다.

```javascript
// 대화 데이터 - 90일 후 자동 삭제
{
  expiresAt: 1,
  name: 'idx_conversations_ttl',
  expireAfterSeconds: 0
}

// 대량 생성 작업 - 24시간 후 자동 삭제
{
  expiresAt: 1,
  name: 'idx_bulkjobs_ttl',
  expireAfterSeconds: 0
}
```

### 만료 시간 계산

각 데이터 모델에서 `expiresAt` 필드는 생성 시 자동 설정됩니다:

```javascript
// Conversation Model
expiresAt: {
  type: Date,
  default: () => {
    const date = new Date();
    date.setDate(date.getDate() + 90); // 90일 후
    return date;
  }
}

// BulkJob Model
expiresAt: {
  type: Date,
  default: () => {
    const date = new Date();
    date.setHours(date.getHours() + 24); // 24시간 후
    return date;
  }
}
```

## 관련 파일

| 파일 | 설명 |
|------|------|
| `backend/src/models/conversation_model.js` | 대화 모델 (expiresAt 필드) |
| `backend/src/models/bulk_job_model.js` | 대량 생성 작업 모델 (expiresAt 필드) |
| `backend/src/db/migrations/002_conversation_indexes.js` | TTL 인덱스 생성 마이그레이션 |
| `backend/src/jobs/data_retention_job.js` | 데이터 보관 작업 (추가 정리 작업) |

## 사용자 안내사항

### 데이터 백업

- 생성된 대화는 90일 후 자동 삭제됩니다.
- 중요한 대화는 **ZIP 다운로드** 기능을 사용하여 로컬에 백업하세요.
- 대량 생성 결과는 24시간 내에 다운로드하세요.

### 데이터 삭제

- 사용자는 언제든 수동으로 대화를 삭제할 수 있습니다.
- 삭제된 데이터는 복구할 수 없습니다.

## 보안 고려사항

- 만료된 데이터는 MongoDB 백그라운드 프로세스에 의해 물리적으로 삭제됩니다.
- 삭제는 비가역적이며 복구가 불가능합니다.
- TTL 삭제는 MongoDB 서버 부하에 따라 약간의 지연이 발생할 수 있습니다.

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2024-12-12 | 초기 문서 작성 |

## 관련 문서

- [Feature Spec: AI 대화 생성기](../specs/002-ai-conversation-generator/spec.md)
- [Data Model](../specs/002-ai-conversation-generator/data-model.md)
