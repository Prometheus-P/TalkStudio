# TalkStudio Feature API Contract: Discord 대화 캡쳐 및 Upstage API 연동

## 1. 개요
본 문서는 TalkStudio 백엔드가 '대량의 디스코드 대화 내역 캡쳐 및 Upstage API 연동 콘텐츠 생성' 기능을 위해 제공하는 RESTful API 엔드포인트를 정의합니다. 기존 `API_SPEC.md`의 확장으로 새로운 엔드포인트를 추가합니다.

## 2. 기본 정보
- **기본 URL**: `/api/v1`
- **인증**: JWT (JSON Web Token) 기반 인증
- **응답 형식**: JSON (공통 응답 구조는 `API_SPEC.md` 참조)

## 3. Discord 통합 관리 API

### 3.1. Discord 설정 등록/업데이트
- **엔드포인트**: `POST /integrations/discord/config`
- **설명**: 새로운 Discord 서버 통합 설정을 등록하거나 기존 설정을 업데이트합니다. 봇 토큰은 암호화되어 저장됩니다.
- **요청 바디**:
    ```json
    {
      "serverId": "string",
      "serverName": "string (optional)",
      "botToken": "string",
      "enabledChannels": ["string"],
      "captureStartDate": "ISO_DATE_STRING (optional, default: now)"
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "configId": "uuid",
        "serverId": "string",
        "serverName": "string",
        "enabledChannels": ["string"]
      },
      "message": "Discord 설정이 성공적으로 저장되었습니다."
    }
    ```

### 3.2. Discord 설정 조회
- **엔드포인트**: `GET /integrations/discord/config/{configId}`
- **설명**: 특정 Discord 통합 설정을 조회합니다. (봇 토큰은 반환하지 않음)
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "configId": "uuid",
        "serverId": "string",
        "serverName": "string",
        "enabledChannels": ["string"],
        "captureStartDate": "ISO_DATE_STRING",
        "isActive": "boolean",
        "lastCapturedTimestamp": "ISO_DATE_STRING (optional)"
      }
    }
    ```

### 3.3. Discord 설정 삭제
- **엔드포인트**: `DELETE /integrations/discord/config/{configId}`
- **설명**: 특정 Discord 통합 설정을 삭제합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "message": "Discord 설정이 성공적으로 삭제되었습니다."
    }
    ```

## 4. Discord 메시지 캡쳐 API

### 4.1. 메시지 캡쳐 시작/재개
- **엔드포인트**: `POST /integrations/discord/config/{configId}/capture/start`
- **설명**: 지정된 Discord 설정에 따라 메시지 캡쳐 작업을 시작하거나 재개합니다.
- **요청 바디**:
    ```json
    {
      "fromTimestamp": "ISO_DATE_STRING (optional, If not provided, uses captureStartDate from config or lastCapturedTimestamp)",
      "limitMessages": "integer (optional, max messages to capture)"
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "captureJobId": "uuid",
        "status": "string (e.g., 'started', 'pending')"
      },
      "message": "메시지 캡쳐 작업이 시작되었습니다."
    }
    ```

### 4.2. 메시지 캡쳐 상태 조회
- **엔드포인트**: `GET /integrations/discord/capture/{captureJobId}/status`
- **설명**: 특정 메시지 캡쳐 작업의 현재 상태를 조회합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "captureJobId": "uuid",
        "configId": "uuid",
        "status": "string (e.g., 'running', 'completed', 'failed')",
        "messagesCaptured": "integer",
        "totalMessagesExpected": "integer (optional)",
        "progress": "number (0-100)",
        "startTime": "ISO_DATE_STRING",
        "endTime": "ISO_DATE_STRING (optional)",
        "errorMessage": "string (optional)"
      }
    }
    ```

## 5. 콘텐츠 생성 API

### 5.1. 의도 기반 콘텐츠 생성 요청
- **엔드포인트**: `POST /content/generate`
- **설명**: 특정 Discord 메시지 또는 의도 분석 결과를 기반으로 Upstage API를 통해 콘텐츠 생성을 요청합니다.
- **요청 바디**:
    ```json
    {
      "discordMessageIds": ["uuid"],
      "contentType": "string (e.g., 'summary', 'faq_answer', 'idea_list')",
      "generationParameters": {
        "temperature": "number (0-1)",
        "maxLength": "integer",
        "tone": "string (optional)"
      }
    }
    ```
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "generatedContentId": "uuid",
        "status": "string (e.g., 'pending', 'generating')",
        "previewText": "string (optional, first few words)"
      },
      "message": "콘텐츠 생성 요청이 접수되었습니다."
    }
    ```

### 5.2. 생성된 콘텐츠 조회
- **엔드포인트**: `GET /content/generated/{generatedContentId}`
- **설명**: 특정 생성된 콘텐츠의 상세 정보를 조회합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "generatedContentId": "uuid",
        "contentType": "string",
        "generatedText": "string",
        "upstageModelUsed": "string",
        "promptUsed": "string",
        "generatedAt": "ISO_DATE_STRING",
        "status": "string (e.g., 'completed', 'failed')"
      }
    }
    ```

## 6. 의도 분석 결과 조회 API (Read-Only)

### 6.1. 특정 메시지의 의도 분석 결과 조회
- **엔드포인트**: `GET /integrations/discord/messages/{discordMessageId}/intent-analysis`
- **설명**: 특정 Discord 메시지에 대한 의도 분석 결과를 조회합니다.
- **응답**:
    ```json
    {
      "status": "success",
      "data": {
        "discordMessageId": "string",
        "extractedIntents": ["string"],
        "keywords": ["string"],
        "sentiment": "string",
        "analysisModelVersion": "string",
        "analysisTimestamp": "ISO_DATE_STRING"
      }
    }
    ```
