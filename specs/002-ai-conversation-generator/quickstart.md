# Quickstart Guide: AI 대화 생성기

**Feature**: 002-ai-conversation-generator | **Date**: 2025-12-11

## Prerequisites

1. Node.js 20+
2. MongoDB 실행 중
3. Upstage API 키 (필수)
4. OpenAI API 키 (선택, 폴백용)

## Environment Setup

`.env` 파일에 추가:

```bash
# AI Providers
UPSTAGE_API_KEY=your_upstage_api_key
OPENAI_API_KEY=your_openai_api_key  # Optional fallback

# Generation Settings
AI_DEFAULT_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
AI_TIMEOUT_MS=30000

# Rate Limiting
GENERATION_RATE_LIMIT_PER_MIN=60
BULK_RATE_LIMIT_PER_HOUR=10
```

## Quick API Test

### 1. 단일 대화 생성

```bash
curl -X POST http://localhost:3000/api/v1/conversations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "게임 아이템 거래 협상",
    "participants": 2,
    "messageCount": 10,
    "tone": "casual",
    "platform": "kakaotalk"
  }'
```

### 2. 템플릿 목록 조회

```bash
curl http://localhost:3000/api/v1/templates
```

### 3. 템플릿으로 대화 생성

```bash
# 먼저 템플릿 ID 확인
TEMPLATE_ID=$(curl -s http://localhost:3000/api/v1/templates | jq -r '.data.templates[0].templateId')

# 템플릿 기반 생성
curl -X POST http://localhost:3000/api/v1/conversations/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"templateId\": \"$TEMPLATE_ID\",
    \"platform\": \"discord\"
  }"
```

### 4. 대량 생성

```bash
# 1. 템플릿 다운로드
curl -o template.xlsx http://localhost:3000/api/v1/bulk/template

# 2. Excel 편집 후 업로드
curl -X POST http://localhost:3000/api/v1/bulk/start \
  -F "file=@filled_template.xlsx"

# 3. 상태 확인
JOB_ID="returned_job_id"
curl http://localhost:3000/api/v1/bulk/$JOB_ID/status

# 4. 결과 다운로드
curl -o results.zip http://localhost:3000/api/v1/bulk/$JOB_ID/download
```

## Frontend Usage

### 1. 대화 생성 페이지 접근

```
http://localhost:5173/ai-generator
```

### 2. 워크플로우

```
1. 시나리오 입력 또는 템플릿 선택
   ↓
2. 파라미터 조정 (참여자 수, 메시지 수, 톤)
   ↓
3. "생성" 버튼 클릭
   ↓
4. AI가 대화 생성 (실시간 프리뷰)
   ↓
5. 필요시 메시지 편집
   ↓
6. 플랫폼 스타일 선택
   ↓
7. 스크린샷 다운로드
```

### 3. React 컴포넌트 사용 예시

```jsx
import { useConversationGenerator } from '../hooks/useConversationGenerator';

function MyComponent() {
  const { generate, conversation, isLoading, error } = useConversationGenerator();

  const handleGenerate = () => {
    generate({
      scenario: '친구와 약속 잡기',
      participants: 2,
      messageCount: 8,
      tone: 'casual',
      platform: 'kakaotalk'
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        대화 생성
      </button>
      {conversation && <ConversationPreview data={conversation} />}
    </div>
  );
}
```

## Prompt Engineering Tips

### 좋은 시나리오 예시

```
✅ "중고거래 앱에서 아이폰 15를 판매하는 대화. 가격 협상과 직거래 장소 정하기."
✅ "대학교 동기들이 졸업 후 첫 모임을 계획하는 그룹 채팅."
✅ "온라인 쇼핑몰 고객이 배송 지연에 대해 문의하는 상담 대화."
```

### 피해야 할 시나리오

```
❌ "대화" (너무 모호함)
❌ "재미있는 대화" (구체적이지 않음)
❌ 부적절한 콘텐츠 요청 (자동 필터링됨)
```

## Troubleshooting

### AI 생성 실패

```bash
# 1. API 키 확인
echo $UPSTAGE_API_KEY

# 2. API 연결 테스트
curl https://api.upstage.ai/v1/solar/models \
  -H "Authorization: Bearer $UPSTAGE_API_KEY"

# 3. 로그 확인
tail -f backend/logs/app.log | grep "conversation"
```

### 대량 생성 타임아웃

- 동시 처리 수 조정: `BULK_CONCURRENT_LIMIT=3`
- 청크 크기 조정: `BULK_CHUNK_SIZE=10`

### 부적절한 콘텐츠 에러

시나리오가 콘텐츠 정책을 위반하면 `422 CONTENT_POLICY_VIOLATION` 에러 반환.
시나리오를 수정하거나 톤을 `formal`로 변경해 보세요.

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| 단일 생성 (10 메시지) | < 5s | ~3s |
| 단일 생성 (50 메시지) | < 10s | ~8s |
| 대량 생성 (100건) | < 5min | ~4min |
| 스크린샷 렌더링 | < 1s | ~500ms |
