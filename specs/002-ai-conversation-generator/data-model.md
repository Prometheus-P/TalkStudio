# Data Model: AI 대화 생성기

**Feature**: 002-ai-conversation-generator | **Date**: 2025-12-11

## Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│    Template         │       │   Conversation      │
├─────────────────────┤       ├─────────────────────┤
│ _id: ObjectId       │       │ _id: ObjectId       │
│ name: string        │       │ templateId?: ObjectId│──┐
│ category: enum      │◀──────│ scenario: string    │  │
│ scenario: string    │       │ participants: array │  │
│ participants: number│       │ messages: array     │  │
│ messageCount: number│       │ tone: enum          │  │
│ tone: enum          │       │ platform: enum      │  │
│ isSystem: boolean   │       │ parameters: object  │  │
│ createdAt: Date     │       │ status: enum        │  │
└─────────────────────┘       │ createdAt: Date     │  │
                              │ expiresAt: Date     │  │
                              └─────────────────────┘  │
                                        │              │
                              ┌─────────┴──────────────┘
                              │
                              ▼
┌─────────────────────┐       ┌─────────────────────┐
│    BulkJob          │       │    Message          │
├─────────────────────┤       ├─────────────────────┤
│ _id: ObjectId       │       │ sender: string      │
│ status: enum        │       │ text: string        │
│ totalCount: number  │       │ timestamp: string   │
│ completedCount: num │       │ type: enum          │
│ failedCount: number │       └─────────────────────┘
│ scenarios: array    │
│ results: array      │
│ errors: array       │
│ createdAt: Date     │
│ completedAt?: Date  │
└─────────────────────┘
```

## Entities

### 1. Template (시나리오 템플릿)

사전 정의된 또는 사용자 커스텀 대화 시나리오 템플릿

```typescript
interface Template {
  _id: ObjectId;
  name: string;                    // 템플릿 이름
  category: TemplateCategory;      // 카테고리
  scenario: string;                // 시나리오 설명 (프롬프트)
  participants: number;            // 기본 참여자 수 (2-5)
  messageCount: number;            // 기본 메시지 수 (5-50)
  tone: ToneType;                  // 기본 톤
  isSystem: boolean;               // 시스템 제공 템플릿 여부
  createdAt: Date;
  updatedAt: Date;
}

enum TemplateCategory {
  GAME_TRADE = 'game_trade',       // 게임 아이템 거래
  DAILY_CHAT = 'daily_chat',       // 일상 대화
  CUSTOMER_SERVICE = 'customer_service', // 고객 문의
  FRIEND_CHAT = 'friend_chat'      // 친구 대화
}

enum ToneType {
  CASUAL = 'casual',               // 캐주얼
  FORMAL = 'formal',               // 포멀
  HUMOROUS = 'humorous'            // 유머러스
}
```

**Validation Rules**:
- `name`: 1-100자, 필수
- `scenario`: 10-500자, 필수
- `participants`: 2-5, 필수
- `messageCount`: 5-50, 필수
- `isSystem`: 시스템 템플릿은 삭제/수정 불가

**Indexes**:
```javascript
db.templates.createIndex({ category: 1 });
db.templates.createIndex({ isSystem: 1 });
db.templates.createIndex({ name: 'text' });
```

### 2. Conversation (생성된 대화)

AI가 생성한 대화 데이터

```typescript
interface Conversation {
  _id: ObjectId;
  templateId?: ObjectId;           // 사용된 템플릿 (선택적)
  scenario: string;                // 시나리오 설명
  participants: string[];          // 참여자 이름 목록
  messages: Message[];             // 대화 메시지 배열
  tone: ToneType;                  // 적용된 톤
  platform: PlatformType;          // 출력 플랫폼
  parameters: GenerationParameters; // AI 생성 파라미터
  status: ConversationStatus;      // 상태
  aiProvider: AIProvider;          // 사용된 AI 제공자
  createdAt: Date;
  expiresAt: Date;                 // 90일 후 자동 삭제
}

interface Message {
  sender: string;                  // 발신자 이름
  text: string;                    // 메시지 내용
  timestamp: string;               // 시간 (HH:MM 형식)
  type: MessageType;               // 메시지 타입
}

interface GenerationParameters {
  temperature: number;             // 0.0-1.0
  maxTokens: number;               // 최대 토큰 수
  model: string;                   // 사용된 모델명
}

enum PlatformType {
  KAKAOTALK = 'kakaotalk',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  INSTAGRAM = 'instagram'
}

enum ConversationStatus {
  GENERATING = 'generating',       // 생성 중
  COMPLETED = 'completed',         // 완료
  FAILED = 'failed',               // 실패
  EDITED = 'edited'                // 사용자 편집됨
}

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',                 // v2에서 지원 예정
  EMOJI = 'emoji'
}

enum AIProvider {
  UPSTAGE = 'upstage',
  OPENAI = 'openai'
}
```

**Validation Rules**:
- `scenario`: 10-500자, 필수
- `participants`: 2-5개 이름, 각 이름 1-20자
- `messages`: 5-50개, 각 메시지 1-500자
- `timestamp`: HH:MM 형식

**Indexes**:
```javascript
db.conversations.createIndex({ createdAt: -1 });
db.conversations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.conversations.createIndex({ status: 1 });
db.conversations.createIndex({ templateId: 1 });
```

### 3. BulkJob (대량 생성 작업)

대량 생성 작업 상태 추적

```typescript
interface BulkJob {
  _id: ObjectId;
  status: BulkJobStatus;           // 작업 상태
  totalCount: number;              // 총 생성 요청 수
  completedCount: number;          // 완료된 수
  failedCount: number;             // 실패한 수
  scenarios: BulkScenario[];       // 입력 시나리오 목록
  results: BulkResult[];           // 생성 결과
  errors: BulkError[];             // 에러 목록
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;                 // 24시간 후 삭제
}

interface BulkScenario {
  rowIndex: number;                // Excel 행 번호
  scenario: string;
  participants: number;
  messageCount: number;
  tone: ToneType;
  platform: PlatformType;
}

interface BulkResult {
  rowIndex: number;
  conversationId: ObjectId;        // 생성된 대화 참조
  status: 'success' | 'failed';
}

interface BulkError {
  rowIndex: number;
  error: string;                   // 에러 메시지
}

enum BulkJobStatus {
  PENDING = 'pending',             // 대기 중
  PROCESSING = 'processing',       // 처리 중
  COMPLETED = 'completed',         // 완료
  PARTIALLY_COMPLETED = 'partially_completed', // 일부 완료
  FAILED = 'failed'                // 전체 실패
}
```

**Validation Rules**:
- `totalCount`: 1-100
- `scenarios`: 각 항목 Conversation 검증 규칙 적용

**Indexes**:
```javascript
db.bulkjobs.createIndex({ status: 1 });
db.bulkjobs.createIndex({ createdAt: -1 });
db.bulkjobs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## State Transitions

### Conversation Status Flow

```
      ┌─────────────┐
      │ GENERATING  │
      └──────┬──────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐     ┌─────────┐
│COMPLETED│     │ FAILED  │
└────┬────┘     └─────────┘
     │
     ▼
┌─────────┐
│ EDITED  │
└─────────┘
```

### BulkJob Status Flow

```
┌─────────┐
│ PENDING │
└────┬────┘
     │
     ▼
┌────────────┐
│ PROCESSING │
└──────┬─────┘
       │
 ┌─────┴─────────────────┐
 │                       │
 ▼                       ▼
┌───────────┐     ┌──────────────────────┐
│ COMPLETED │     │ PARTIALLY_COMPLETED  │
└───────────┘     └──────────────────────┘
                         │
                    (모두 실패 시)
                         ▼
                  ┌─────────┐
                  │ FAILED  │
                  └─────────┘
```

## System Templates (초기 데이터)

```javascript
const systemTemplates = [
  {
    name: '게임 아이템 거래',
    category: 'game_trade',
    scenario: '온라인 게임에서 아이템을 거래하는 두 플레이어의 대화. 가격 협상과 거래 방법 논의 포함.',
    participants: 2,
    messageCount: 10,
    tone: 'casual',
    isSystem: true
  },
  {
    name: '일상 안부 인사',
    category: 'daily_chat',
    scenario: '오랜만에 연락하는 친구들의 안부 인사 대화. 근황 공유와 만남 약속.',
    participants: 2,
    messageCount: 8,
    tone: 'casual',
    isSystem: true
  },
  {
    name: '고객 문의 응대',
    category: 'customer_service',
    scenario: '제품 문의에 대한 고객 서비스 담당자와 고객의 대화. 문제 해결 과정.',
    participants: 2,
    messageCount: 12,
    tone: 'formal',
    isSystem: true
  },
  {
    name: '그룹 약속 잡기',
    category: 'friend_chat',
    scenario: '친구들이 모임 일정을 정하는 그룹 채팅. 시간과 장소 조율.',
    participants: 4,
    messageCount: 15,
    tone: 'casual',
    isSystem: true
  }
];
```
