# TalkStudio

## 프로젝트 개요
TalkStudio는 AI Software Factory v4.0 프레임워크를 기반으로 개발된 지능형 대화 및 자동화 플랫폼입니다. 에이전트 기반 AI 애플리케이션을 활용하여 사용자에게 혁신적인 경험과 효율적인 워크플로우를 제공합니다.

## 주요 기능
- **AI 기반 대화**: 자연어 처리 및 생성을 통한 지능형 대화.
- **작업 자동화**: 에이전트 오케스트레이션을 통한 복잡한 작업 자동화.
- **확장 가능한 아키텍처**: 모듈화된 설계로 유연한 기능 추가 및 확장이 가능합니다.
- **안정적인 컨텍스트 관리**: 에이전트 실행에 필요한 컨텍스트를 효율적으로 관리합니다.
- **Discord 대화 분석 및 콘텐츠 생성**: 대량의 Discord 대화 내역을 캡쳐하고, 의도를 분석하여 Upstage API를 통해 요약, FAQ, 아이디어 등의 콘텐츠를 자동으로 생성합니다.

## 기술 스택
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js (Express.js), MongoDB (with Mongoose)
- **AI/Agent Framework**: Python (v3.10+), 경량 Agent SDK, `discord.py`, `Upstage API Python SDK`, `PyMongo`, `Pydantic`
- **Testing**: Jest (Frontend, Backend), Pytest (AI Agent System)

## 프로젝트 구조

```
TalkStudio/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   └── store/            # Zustand 상태 관리
│   └── package.json
├── backend/                  # Node.js 백엔드 API
│   ├── src/
│   │   ├── api/              # REST API 라우트
│   │   ├── models/           # MongoDB 모델
│   │   ├── config/           # 환경 설정
│   │   └── db/               # 데이터베이스 연결
│   └── package.json
├── ai_agent_system/          # Python AI 에이전트 시스템
│   ├── src/
│   │   ├── agents/           # AI 에이전트 클래스
│   │   ├── services/         # 외부 API 클라이언트
│   │   ├── models/           # 데이터 모델
│   │   └── config/           # 환경 설정
│   └── requirements.txt
├── docs/                     # 문서
│   ├── MONITORING.md         # 모니터링 전략
│   └── TEST_STRATEGY.md      # 테스트 전략
└── specs/                    # 기능 명세
    └── 001-discord-upstage-integration/
```

## 시작하기

### 1. 전제 조건
- Node.js (v20 이상) 및 npm/yarn 설치
- Python (v3.10 이상) 및 pip 설치
- Git 설치
- MongoDB 인스턴스 (로컬 또는 클라우드)
- Discord 개발자 포털에서 봇 생성 및 토큰 발급
- Upstage API 키 발급

### 2. 프로젝트 클론
```bash
git clone [YOUR_REPOSITORY_URL]
cd TalkStudio
```

### 3. 의존성 설치 및 환경 변수 설정

**a. Frontend 설정**
```bash
cd frontend
npm install
npm run dev
```

**b. Backend 설정**
```bash
cd backend
npm install
# .env 파일 생성 (.env.example 참조)
cp .env.example .env
# 환경 변수 편집 후 실행
node index.js
```

Backend `.env` 필수 변수:
```env
DATABASE_URL=mongodb://localhost:27017/talkstudio
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_SECRET=your-encryption-secret-key
DISCORD_BOT_TOKEN=your-discord-bot-token
UPSTAGE_API_KEY=your-upstage-api-key
PORT=3000
```

**c. AI Agent System 설정**
```bash
cd ai_agent_system
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
# .env 파일 생성
cp .env.example .env
```

AI Agent System `.env` 필수 변수:
```env
DISCORD_BOT_TOKEN=your-discord-bot-token
UPSTAGE_API_KEY=your-upstage-api-key
DATABASE_URL=mongodb://localhost:27017/talkstudio
```

### 4. Discord 봇 권한 설정
Discord 개발자 포털에서 봇에 다음 권한을 부여:
- `Message Content Intent` 활성화
- `Read Message History`
- `Send Messages` (콘텐츠를 다시 Discord에 전송하는 경우)

봇을 원하는 Discord 서버에 초대합니다.

## Discord-Upstage 통합 기능 사용법

### API 엔드포인트

Backend 서버 실행 후 Swagger UI에서 전체 API 문서 확인 가능:
- **Swagger UI**: `http://localhost:3000/api-docs`

#### Discord 통합 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/integrations/discord/config` | Discord 설정 등록 |
| GET | `/api/v1/integrations/discord/config/:configId` | 설정 조회 |
| DELETE | `/api/v1/integrations/discord/config/:configId` | 설정 삭제 |

#### 메시지 캡쳐
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/integrations/discord/config/:configId/capture/start` | 캡쳐 시작 |
| GET | `/api/v1/integrations/discord/capture/:captureJobId/status` | 캡쳐 상태 조회 |

#### 콘텐츠 생성
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/content/generate` | 콘텐츠 생성 요청 |
| GET | `/api/v1/content/generated/:generatedContentId` | 생성된 콘텐츠 조회 |

### 사용 예시

**1. Discord 설정 등록**
```bash
curl -X POST http://localhost:3000/api/v1/integrations/discord/config \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "YOUR_DISCORD_SERVER_ID",
    "serverName": "My Server",
    "botToken": "YOUR_BOT_TOKEN",
    "enabledChannels": ["CHANNEL_ID_1", "CHANNEL_ID_2"]
  }'
```

**2. 메시지 캡쳐 시작**
```bash
curl -X POST http://localhost:3000/api/v1/integrations/discord/config/{configId}/capture/start \
  -H "Content-Type: application/json" \
  -d '{
    "limitMessages": 1000
  }'
```

**3. 콘텐츠 생성 요청**
```bash
curl -X POST http://localhost:3000/api/v1/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "discordMessageIds": ["msg_id_1", "msg_id_2"],
    "contentType": "summary",
    "generationParameters": {
      "temperature": 0.7,
      "maxLength": 500
    }
  }'
```

## AI 대화 생성기 사용법

시나리오를 입력하면 AI가 자연스러운 대화를 생성하고, TalkStudio 렌더링 엔진을 통해 카카오톡/디스코드 등 플랫폼 스타일 스크린샷으로 출력합니다.

### 기능 개요

| 기능 | 설명 |
|------|------|
| 시나리오 기반 생성 | 프롬프트를 입력하면 AI가 대화 생성 |
| 템플릿 활용 | 사전 정의된 템플릿으로 빠른 시작 |
| 대량 생성 | Excel 업로드로 최대 100건 일괄 처리 |
| 대화 편집 | 생성된 대화 수정 및 재생성 |
| 스크린샷 내보내기 | 4개 플랫폼 스타일 PNG/JPEG 출력 |

### API 엔드포인트

#### 대화 생성
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/conversations/generate` | 새 대화 생성 |
| GET | `/api/v1/conversations/:id` | 대화 조회 |
| PATCH | `/api/v1/conversations/:id` | 대화 수정 |
| DELETE | `/api/v1/conversations/:id` | 대화 삭제 |
| POST | `/api/v1/conversations/:id/regenerate` | 메시지 재생성 |

#### 템플릿 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/templates` | 템플릿 목록 조회 |
| POST | `/api/v1/templates` | 커스텀 템플릿 생성 |
| DELETE | `/api/v1/templates/:id` | 템플릿 삭제 |

#### 대량 생성
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/bulk/template` | Excel 템플릿 다운로드 |
| POST | `/api/v1/bulk/start` | 대량 생성 시작 |
| GET | `/api/v1/bulk/:jobId/status` | 진행 상태 조회 |
| GET | `/api/v1/bulk/:jobId/download` | 결과 ZIP 다운로드 |

### 사용 예시

**1. 대화 생성 요청**
```bash
curl -X POST http://localhost:3000/api/v1/conversations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "친구와 카페에서 주말 계획에 대해 이야기하는 캐주얼한 대화",
    "participants": 2,
    "messageCount": 10,
    "tone": "casual",
    "platform": "kakaotalk"
  }'
```

**2. 생성 파라미터**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| scenario | string | ✅ | 시나리오 설명 (10-500자) |
| participants | number | - | 참여자 수 (2-5, 기본값: 2) |
| messageCount | number | - | 메시지 수 (5-50, 기본값: 10) |
| tone | string | - | casual / formal / humorous (기본값: casual) |
| platform | string | - | kakaotalk / discord / telegram / instagram (기본값: kakaotalk) |
| participantNames | string[] | - | 참여자 이름 배열 |
| templateId | string | - | 템플릿 ID |

**3. Rate Limiting**
API 요청 제한이 적용됩니다:
- 대화 생성: 분당 10회
- 템플릿 API: 분당 30회
- 대량 생성: 분당 3회

### 데이터 보관 정책

- **대화 데이터**: 생성 후 90일간 보관, 이후 자동 삭제
- **대량 생성 작업**: 24시간 후 자동 삭제 (결과 파일 포함)
- MongoDB TTL 인덱스를 통한 자동 정리

## 테스트

```bash
# Frontend 테스트
cd frontend && npm test

# Backend 테스트
cd backend && npm test

# AI Agent System 테스트
cd ai_agent_system && python -m pytest --cov
```

## 기여
TalkStudio 프로젝트에 기여하고 싶으시다면, `CONTRIBUTING.md` 파일을 참조해 주세요.

## 라이선스
본 프로젝트는 MIT 라이선스에 따라 배포됩니다.
