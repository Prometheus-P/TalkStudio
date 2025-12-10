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

## 시작하기

### 1. 전제 조건
- Node.js (v20 이상) 및 npm/yarn 설치
- Python (v3.10 이상) 및 pip 설치
- Git 설치
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
# 개발 서버 실행
npm run dev # (예정)
```

**b. Backend 설정**
```bash
cd backend
npm install
# 개발 서버 실행
npm run start # (예정)
```
- `backend/` 디렉토리의 `.env` 파일에 `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_SECRET` 등을 설정합니다.

**c. AI Agent System 설정**
```bash
cd ai_agent_system
python -m venv venv
source venv/bin/activate # macOS/Linux
# 또는 venv\Scripts\activate # Windows
pip install -r requirements.txt
```
- `ai_agent_system/` 디렉토리의 `.env` 파일에 `DISCORD_BOT_TOKEN`, `UPSTAGE_API_KEY`, `DATABASE_URL` 등을 설정합니다.

### 4. Discord 봇 권한 설정
Discord 개발자 포털에서 봇에 다음 권한(Permissions)을 부여해야 합니다.
- `Message Content Intent` 활성화
- `Read Message History`
- `Send Messages` (콘텐츠를 다시 Discord에 전송하는 경우)
봇을 원하는 Discord 서버에 초대합니다.

## 기여 (예정)
TalkStudio 프로젝트에 기여하고 싶으시다면, `CONTRIBUTING.md` 파일을 참조해 주세요.

## 라이선스 (예정)
본 프로젝트는 [라이선스 종류]에 따라 배포됩니다.
