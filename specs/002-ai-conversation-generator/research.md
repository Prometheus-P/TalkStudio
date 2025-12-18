# Research Notes: AI 대화 생성기

**Feature**: 002-ai-conversation-generator | **Date**: 2025-12-11

## 1. AI Provider Selection

### Decision: Upstage (Primary) + OpenAI (Fallback)

**Rationale**:
- Upstage Solar Pro: 한국어 대화 생성에 최적화된 모델
- 기존 001 기능에서 Upstage 통합 완료 → 코드 재사용 가능
- OpenAI GPT-4o-mini: 안정적인 폴백, 영어 콘텐츠에 강점

**Alternatives Considered**:
| Provider | Pros | Cons | Decision |
|----------|------|------|----------|
| Upstage Solar | 한국어 최적화, 비용 효율 | 영어 품질 낮음 | ✅ Primary |
| OpenAI GPT-4o-mini | 안정성, 다국어 | 비용 높음 | ✅ Fallback |
| Claude | 대화 품질 우수 | API 비용 높음 | ❌ Rejected |
| Local LLM (Ollama) | 비용 0 | 품질/속도 불안정 | ❌ Rejected |

### API Integration Pattern

```javascript
// Upstage는 OpenAI SDK와 호환
import OpenAI from 'openai';

const upstage = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY,
  baseURL: 'https://api.upstage.ai/v1/solar'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

## 2. Conversation Generation Prompt Engineering

### Decision: Structured JSON Output with System Prompt

**Rationale**:
- JSON 형식으로 일관된 대화 구조 보장
- 참여자 이름, 메시지, 타임스탬프 포함
- 톤/스타일 가이드라인 시스템 프롬프트에 포함

**Prompt Template**:
```text
System: You are a conversation generator. Generate realistic chat conversations in JSON format.

Rules:
- participants: Array of participant names
- messages: Array of {sender, text, timestamp}
- Match the requested tone: {casual|formal|humorous}
- Use natural language appropriate for the scenario
- Include realistic reactions, questions, and responses

Output JSON Schema:
{
  "participants": ["이름1", "이름2"],
  "messages": [
    {"sender": "이름1", "text": "메시지 내용", "timestamp": "14:30"}
  ]
}

User: Generate a {message_count} message conversation about "{scenario}" with {participant_count} participants in {tone} tone.
```

## 3. Content Safety Filtering

### Decision: Dual-Layer Filtering (Pre + Post)

**Rationale**:
- Pre-filter: 입력 프롬프트에서 부적절한 요청 차단
- Post-filter: 생성된 콘텐츠 검사 후 안전하지 않으면 재생성

**Implementation**:
```javascript
// Pre-filter: Block inappropriate requests
const blockedKeywords = ['폭력', '혐오', '불법', ...];

// Post-filter: Validate generated content
const validateContent = (conversation) => {
  // Check for inappropriate content
  // Return { safe: boolean, reason?: string }
};
```

**Alternatives Considered**:
- OpenAI Moderation API: 영어 최적화, 한국어 지원 제한적
- 자체 키워드 필터: 단순하지만 우회 가능
- **선택**: 키워드 필터 + AI 자체 가이드라인 조합

## 4. Bulk Generation Architecture

### Decision: Async Job Queue with Progress Tracking

**Rationale**:
- 100건 생성 시 5분 소요 → 동기 처리 불가
- 클라이언트에 실시간 진행 상태 제공 필요
- 일부 실패 시에도 성공 건 제공

**Architecture**:
```
Client                  Backend                    AI Provider
  │                        │                           │
  │──POST /bulk/start─────▶│                           │
  │◀──jobId───────────────│                           │
  │                        │                           │
  │──GET /bulk/{id}/status▶│                           │
  │◀──{progress: 30%}─────│                           │
  │                        │──generate───────────────▶│
  │                        │◀──conversation───────────│
  │                        │                           │
  │──GET /bulk/{id}/status▶│                           │
  │◀──{progress: 100%}────│                           │
  │                        │                           │
  │──GET /bulk/{id}/download▶│                         │
  │◀──ZIP file────────────│                           │
```

**Alternatives Considered**:
- Redis Queue (Bull): 과도한 인프라 복잡도 → ❌
- In-memory Map: 단일 서버에서 충분 → ✅ Selected
- Database Job Table: 영속성 필요 시 고려

## 5. Excel Template Design

### Decision: xlsx Library with Validation

**Rationale**:
- xlsx: 브라우저/Node.js 양쪽에서 사용 가능
- 템플릿 다운로드 → 사용자 작성 → 업로드 워크플로우

**Template Schema**:
| Column | Type | Required | Validation |
|--------|------|----------|------------|
| scenario | string | Yes | 10-500자 |
| participants | number | Yes | 2-5 |
| message_count | number | Yes | 5-50 |
| tone | enum | Yes | casual/formal/humorous |
| platform | enum | Yes | kakaotalk/discord/telegram/instagram |

**Error Feedback**:
```json
{
  "valid": false,
  "errors": [
    {"row": 3, "column": "participants", "message": "2-5 사이의 숫자여야 합니다"},
    {"row": 7, "column": "scenario", "message": "시나리오가 너무 짧습니다 (최소 10자)"}
  ]
}
```

## 6. TalkStudio Renderer Integration

### Decision: Reuse Existing Zustand Store + Components

**Rationale**:
- TalkStudio는 이미 카카오톡/디스코드/텔레그램/인스타그램 렌더러 보유
- Zustand store에 대화 데이터 주입 → 자동 렌더링
- html2canvas로 이미지 캡처 (기존 기능)

**Integration Flow**:
```javascript
// 1. AI 생성 대화를 TalkStudio 형식으로 변환
const convertToTalkStudioFormat = (aiConversation) => ({
  theme: 'kakaotalk', // or discord, telegram, instagram
  messages: aiConversation.messages.map(m => ({
    id: uuid(),
    sender: m.sender === participants[0] ? 'me' : 'other',
    type: 'text',
    text: m.text,
    time: m.timestamp
  }))
});

// 2. Zustand store 업데이트
useChatStore.setState({ messages: convertedMessages });

// 3. 기존 Preview 컴포넌트가 자동 렌더링
// 4. html2canvas로 캡처
```

## 7. Performance Optimization

### Decisions

| Concern | Solution |
|---------|----------|
| 단일 생성 < 5초 | Streaming response + 낙관적 UI |
| 대량 생성 100건 < 5분 | 병렬 처리 (동시 5건) |
| 이미지 생성 최적화 | 캔버스 재사용, 메모리 정리 |
| API 비용 절감 | 캐싱 (동일 프롬프트), 토큰 최적화 |

## 8. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Python AI Agent 재사용? | ❌ Node.js에서 직접 OpenAI SDK 사용 (더 단순) |
| 실시간 스트리밍 필요? | ✅ SSE로 생성 중 프리뷰 표시 |
| 대화 저장 기간? | 90일 (001과 동일 정책) |
| 템플릿 저장 위치? | MongoDB (사용자별 커스텀 템플릿) |
