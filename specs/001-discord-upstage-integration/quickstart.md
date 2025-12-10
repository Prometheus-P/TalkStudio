# TalkStudio Feature Quickstart: Discord 대화 캡쳐 및 Upstage API 연동

## 1. 개요
본 문서는 '대량의 디스코드 대화 내역 캡쳐 및 Upstage API 연동 콘텐츠 생성' 기능을 개발 환경에서 빠르게 시작하고 테스트하기 위한 간략한 가이드를 제공합니다.

## 2. 전제 조건
- Node.js (v20 이상) 및 npm/yarn 설치
- Python (v3.10 이상) 및 pip 설치
- Git 설치
- Discord 개발자 포털에서 봇 생성 및 토큰 발급
- Upstage API 키 발급
- `.env` 파일에 필요한 환경 변수 설정 (Discord 봇 토큰, Upstage API 키 등)

## 3. 개발 환경 설정

### 3.1. 프로젝트 클론 및 의존성 설치
```bash
# 리포지토리 클론
git clone [YOUR_REPOSITORY_URL]
cd TalkStudio

# 현재 feature 브랜치로 이동
git checkout 001-discord-upstage-integration

# Frontend 의존성 설치
npm install # 또는 yarn install
cd frontend # (예상되는 frontend 디렉토리 경로)
npm install # 또는 yarn install
cd ..

# Backend 및 AI Agent System 의존성 설치 (가정: requirements.txt 파일 존재)
# pip install -r backend/requirements.txt # (백엔드 Python인 경우)
pip install -r ai_agent_system/requirements.txt # (AI Agent System Python인 경우)
```

### 3.2. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 변수들을 설정합니다.

```ini
# Discord Bot Token (Discord Developer Portal에서 발급)
DISCORD_BOT_TOKEN="YOUR_DISCORD_BOT_TOKEN"

# Upstage API Key
UPSTAGE_API_KEY="YOUR_UPSTAGE_API_KEY"

# 기타 백엔드 및 DB 설정 (필요시)
# DATABASE_URL="mongodb://localhost:27017/talkstudio"
```

### 3.3. Discord 봇 권한 설정
Discord 개발자 포털에서 봇에 다음 권한(Permissions)을 부여해야 합니다.
- `Message Content Intent` 활성화
- `Read Message History`
- `Send Messages` (콘텐츠를 다시 Discord에 전송하는 경우)
봇을 원하는 Discord 서버에 초대합니다.

## 4. 기능 실행 및 테스트

### 4.1. AI Agent System 실행 (Discord 메시지 캡쳐)
AI Agent System 내에서 Discord 메시지 캡쳐 및 의도 분석 로직을 직접 실행하여 테스트할 수 있습니다.
```bash
# ai_agent_system 디렉토리로 이동
cd ai_agent_system

# Discord 봇 실행 스크립트 (예시)
python src/agents/discord_capture_agent.py
```
*Note*: 이 스크립트는 Discord API로부터 메시지를 캡쳐하고 데이터베이스에 저장하는 역할을 합니다.

### 4.2. 백엔드 서버 실행
```bash
# 백엔드 디렉토리로 이동
cd backend # (예상되는 backend 디렉토리 경로)

# 백엔드 서버 실행
npm run dev # 또는 python src/main.py (백엔드가 Python인 경우)
```
*Note*: 이 서버는 Discord 통합 관리 및 콘텐츠 생성 요청을 처리하는 API를 제공합니다.

### 4.3. 콘텐츠 생성 및 조회 (Postman 또는 cURL 활용)
백엔드 API(`api-contract.md` 참조)를 사용하여 Discord 설정을 등록하고, 메시지 캡쳐를 트리거하며, 최종적으로 콘텐츠 생성을 요청하고 조회할 수 있습니다.

**예시: Discord 설정 등록 (cURL)**
```bash
curl -X POST http://localhost:3000/api/v1/integrations/discord/config \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
           "serverId": "YOUR_DISCORD_SERVER_ID",
           "serverName": "My Awesome Server",
           "botToken": "YOUR_DISCORD_BOT_TOKEN",
           "enabledChannels": ["YOUR_DISCORD_CHANNEL_ID_1", "YOUR_DISCORD_CHANNEL_ID_2"],
           "captureStartDate": "2023-01-01T00:00:00Z"
         }'
```
*Note*: `YOUR_JWT_TOKEN`, `YOUR_DISCORD_SERVER_ID`, `YOUR_DISCORD_CHANNEL_ID` 등을 실제 값으로 대체해야 합니다.

### 4.4. 프론트엔드 UI 확인 (예정)
프론트엔드 UI가 개발되면, 웹 인터페이스를 통해 Discord 통합 관리 및 생성된 콘텐츠를 시각적으로 확인할 수 있습니다.

## 5. 문제 해결 (Troubleshooting)
- **환경 변수 누락**: `.env` 파일에 모든 필수 변수가 설정되었는지 확인하세요.
- **Discord 봇 권한 오류**: Discord 개발자 포털에서 봇에 필요한 모든 권한 (특히 `Message Content Intent`)이 부여되었는지 확인하세요.
- **API 키 오류**: Upstage API 키가 유효하고 올바르게 설정되었는지 확인하세요.
- **Rate Limit**: Discord API 또는 Upstage API의 Rate Limit에 도달한 경우, 요청 간 지연 시간을 두거나 재시도 로직을 확인하세요.
