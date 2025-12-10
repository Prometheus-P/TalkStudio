# TalkStudio Feature Data Model: Discord 대화 캡쳐 및 Upstage API 연동

## 1. 개요
본 문서는 '대량의 디스코드 대화 내역 캡쳐, 의도를 반영하여 upstage api로 생성하는 기능'을 위한 핵심 데이터 엔티티 및 그 관계를 정의합니다. 기존 `docs/specs/DATA_MODEL.md`의 확장 및 특정 기능에 특화된 모델을 포함합니다.

## 2. 핵심 엔티티

### 2.1. DiscordMessage (Discord 메시지)
- **설명**: Discord API를 통해 캡쳐된 개별 메시지 데이터. 이는 원시 데이터로 저장되며, 분석 및 생성에 활용됩니다.
- **기존 `DATA_MODEL.md`의 `Message` 엔티티와 연관**: `Message` 엔티티는 사용자와 AI 에이전트 간의 대화에 초점을 맞추지만, `DiscordMessage`는 외부 소스(Discord)에서 가져온 원시 데이터를 나타냅니다.
- **속성**:
    - `_id`: `UUID` (Primary Key, 내부 관리용)
    - `discordMessageId`: `String` (Discord의 실제 메시지 ID, Unique)
    - `authorId`: `String` (Discord 사용자 ID)
    - `authorName`: `String` (Discord 사용자 이름)
    - `timestamp`: `DateTime` (메시지 전송 시간)
    - `content`: `String` (메시지 본문)
    - `channelId`: `String` (메시지가 속한 Discord 채널 ID)
    - `serverId`: `String` (메시지가 속한 Discord 서버 ID)
    - `rawContent`: `Object` (JSONB, Discord API로부터 받은 원시 메시지 JSON 데이터 - 옵션)
    - `isProcessed`: `Boolean` (의도 분석 및 콘텐츠 생성에 사용되었는지 여부)
    - `createdAt`: `DateTime` (캡쳐 시간)

### 2.2. IntentAnalysisResult (의도 분석 결과)
- **설명**: 캡쳐된 Discord 메시지로부터 추출된 의도, 키워드, 감정 등 분석 결과.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `discordMessageId`: `String` (Foreign Key, DiscordMessage._id 참조)
    - `extractedIntents`: `Array<String>` (분류된 의도 목록, 예: "질문", "제안", "불평")
    - `keywords`: `Array<String>` (추출된 핵심 키워드)
    - `sentiment`: `String` (감정 분석 결과, 예: "positive", "negative", "neutral")
    - `analysisModelVersion`: `String` (의도 분석에 사용된 모델 버전)
    - `analysisTimestamp`: `DateTime` (분석 수행 시간)
    - `rawData`: `Object` (JSONB, 분석 모듈의 원시 출력 데이터 - 옵션)

### 2.3. GeneratedContent (생성된 콘텐츠)
- **설명**: Upstage API를 통해 생성된 결과물.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `relatedDiscordMessageIds`: `Array<String>` (이 콘텐츠 생성에 사용된 DiscordMessage._id 목록)
    - `contentType`: `String` (생성된 콘텐츠 유형, 예: "summary", "faq_answer", "idea_list")
    - `generatedText`: `String` (Upstage API가 생성한 텍스트 본문)
    - `upstageModelUsed`: `String` (콘텐츠 생성에 사용된 Upstage 모델 이름)
    - `promptUsed`: `String` (Upstage API에 전달된 프롬프트)
    - `temperature`: `Number` (생성 시 사용된 temperature 값)
    - `generatedAt`: `DateTime` (콘텐츠 생성 시간)
    - `feedback`: `Object` (JSONB, 사용자 피드백 - 옵션)

### 2.4. DiscordConfig (Discord 설정)
- **설명**: TalkStudio가 Discord 서버/채널에 접근하고 메시지를 캡쳐하기 위한 설정 정보.
- **속성**:
    - `_id`: `UUID` (Primary Key)
    - `serverId`: `String` (Discord 서버 ID)
    - `serverName`: `String`
    - `botToken`: `String` (암호화되어 저장되어야 함)
    - `enabledChannels`: `Array<String>` (메시지 캡쳐를 활성화할 채널 ID 목록)
    - `captureStartDate`: `DateTime` (메시지 캡쳐 시작 일자)
    - `isActive`: `Boolean` (이 설정이 활성화되어 있는지 여부)
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - `lastCapturedTimestamp`: `DateTime` (최종 캡쳐된 메시지의 타임스탬프)

## 3. 관계

- `DiscordConfig` 1 : N `DiscordMessage` (하나의 Discord 설정은 여러 메시지를 캡쳐합니다)
- `DiscordMessage` 1 : 1 `IntentAnalysisResult` (하나의 Discord 메시지는 하나의 분석 결과를 가질 수 있습니다)
- `DiscordMessage` N : M `GeneratedContent` (여러 Discord 메시지가 하나의 콘텐츠 생성에 사용될 수 있으며, 하나의 메시지가 여러 콘텐츠 생성에 기여할 수 있습니다)

## 4. 데이터 흐름

1.  `DiscordConfig`에 따라 `DiscordMessage`를 캡쳐하고 저장.
2.  새로 캡쳐된 `DiscordMessage`에 대해 `IntentAnalysisResult`를 생성하고 저장.
3.  특정 `IntentAnalysisResult` 또는 `DiscordMessage` 그룹을 기반으로 `GeneratedContent`를 생성하고 저장.
