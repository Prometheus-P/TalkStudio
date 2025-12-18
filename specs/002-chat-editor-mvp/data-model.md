# Data Model: TalkStudio Chat Editor MVP

**Date**: 2025-12-11
**Feature Branch**: `002-chat-editor-mvp`

## Overview

이 문서는 TalkStudio MVP의 데이터 모델을 정의합니다. 모든 데이터는 브라우저 localStorage에 JSON 형태로 저장됩니다.

---

## Entity Relationship Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                           Project                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ id: string (nanoid)                                         ││
│  │ title: string                                               ││
│  │ createdAt: ISO8601                                          ││
│  │ updatedAt: ISO8601                                          ││
│  │ themeId: string ──────────────────────┐                     ││
│  │ customStyles?: Partial<ThemeStyles>   │                     ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                                │                       │
│         │ 1:N                            │ N:1                   │
│         ▼                                ▼                       │
│  ┌──────────────┐                ┌──────────────┐               │
│  │   Speaker    │                │    Theme     │               │
│  │  (2~10개)    │                │  (프리셋)    │               │
│  └──────────────┘                └──────────────┘               │
│         │                                                        │
│         │ 1:N                                                    │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Message    │                                               │
│  │  (0~N개)     │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entities

### Project

프로젝트는 하나의 대화 스크린샷 작업 단위입니다.

```typescript
interface Project {
  /** 고유 ID (nanoid, 21자) */
  id: string;

  /** 프로젝트 제목 */
  title: string;

  /** 생성 일시 (ISO 8601) */
  createdAt: string;

  /** 마지막 수정 일시 (ISO 8601) */
  updatedAt: string;

  /** 적용된 테마 ID */
  themeId: ThemeId;

  /** 테마 위에 적용된 커스텀 스타일 (선택) */
  customStyles?: Partial<ThemeStyles>;

  /** 상단 바 설정 */
  statusBar: StatusBarConfig;

  /** 발화자 목록 (2~10명) */
  speakers: Speaker[];

  /** 메시지 목록 (순서대로) */
  messages: Message[];
}
```

**Validation Rules**:
- `id`: 21자 nanoid, 필수
- `title`: 1~100자, 필수, 기본값 "새 프로젝트"
- `speakers`: 최소 2개, 최대 10개
- `messages`: 빈 배열 허용

**State Transitions**:
- `new` → 생성 시 기본 2명 발화자, 빈 메시지 목록
- `editing` → 메시지/발화자/스타일 변경 시 `updatedAt` 갱신
- `saved` → localStorage에 저장 완료

---

### Speaker

대화 참여자 정보입니다.

```typescript
interface Speaker {
  /** 고유 ID (nanoid) */
  id: string;

  /** 발화자 이름 */
  name: string;

  /** 프로필 이미지 (Base64 Data URL 또는 null) */
  profileImage: string | null;

  /** 메시지 정렬 방향 */
  alignment: 'left' | 'right';

  /** "나" 여부 (첫 번째 발화자는 기본 true) */
  isMe: boolean;
}
```

**Validation Rules**:
- `id`: 21자 nanoid, 필수
- `name`: 1~30자, 필수, 기본값 "발화자 1", "발화자 2"
- `profileImage`: null 허용, Base64 Data URL (max 500KB 권장)
- `alignment`: 'left' 또는 'right', `isMe`가 true면 'right', false면 'left' 기본값
- `isMe`: boolean, 프로젝트당 1명만 true 허용

**Default Values (새 프로젝트)**:
```typescript
const defaultSpeakers: Speaker[] = [
  { id: nanoid(), name: '나', profileImage: null, alignment: 'right', isMe: true },
  { id: nanoid(), name: '상대방', profileImage: null, alignment: 'left', isMe: false },
];
```

---

### Message

개별 메시지 데이터입니다.

```typescript
interface Message {
  /** 고유 ID (nanoid) */
  id: string;

  /** 발화자 ID (Speaker.id 참조) */
  speakerId: string;

  /** 메시지 텍스트 내용 */
  text: string;

  /** 메시지 타입 */
  type: MessageType;

  /** 타임스탬프 표시 여부 */
  showTimestamp: boolean;

  /** 타임스탬프 (선택적 표시용, ISO 8601) */
  timestamp?: string;

  /** 정렬 순서 (0부터 시작) */
  order: number;
}

type MessageType = 'normal' | 'emphasis' | 'system';
```

**Validation Rules**:
- `id`: 21자 nanoid, 필수
- `speakerId`: 유효한 Speaker.id 참조, 'system' 타입이면 무시 가능
- `text`: 1~2000자, 필수
- `type`: 'normal' | 'emphasis' | 'system' 중 하나
- `showTimestamp`: boolean, 기본값 false
- `order`: 0 이상 정수, 연속적이어야 함

**Message Type Behaviors**:
| Type | Description | Alignment |
|------|-------------|-----------|
| `normal` | 일반 메시지 | Speaker.alignment 따름 |
| `emphasis` | 강조 메시지 (다른 배경색) | Speaker.alignment 따름 |
| `system` | 시스템 메시지 | 중앙 정렬, speakerId 무시 |

---

### Theme (Preset)

테마 프리셋 정의입니다. 읽기 전용 정적 데이터입니다.

```typescript
type ThemeId = 'kakao' | 'discord' | 'instagram';

interface Theme {
  /** 테마 ID */
  id: ThemeId;

  /** 테마 이름 (UI 표시용) */
  name: string;

  /** 테마 미리보기 아이콘/이미지 경로 */
  preview: string;

  /** 테마 스타일 정의 */
  styles: ThemeStyles;
}

interface ThemeStyles {
  /** 캔버스 스타일 */
  canvas: {
    backgroundColor: string;
    backgroundImage?: string;
  };

  /** 상단 바 스타일 */
  statusBar: {
    backgroundColor: string;
    textColor: string;
    style: 'ios' | 'android' | 'minimal';
  };

  /** 말풍선 스타일 */
  bubble: {
    sent: BubbleStyle;
    received: BubbleStyle;
    system: {
      backgroundColor: string;
      textColor: string;
    };
  };

  /** 폰트 스타일 */
  font: {
    family: string;
    sizes: {
      message: string;
      name: string;
      time: string;
    };
  };
}

interface BubbleStyle {
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  padding: string;
}
```

---

### StatusBarConfig

상단 바 표시 설정입니다.

```typescript
interface StatusBarConfig {
  /** 시간 표시 여부 */
  showTime: boolean;

  /** 표시할 시간 (HH:MM 형식) */
  time: string;

  /** 배터리 표시 여부 */
  showBattery: boolean;

  /** 배터리 잔량 (0~100) */
  batteryLevel: number;

  /** Wi-Fi 아이콘 표시 여부 */
  showWifi: boolean;

  /** 셀룰러 신호 표시 여부 */
  showCellular: boolean;

  /** 상대방/채팅방 이름 */
  chatName: string;
}
```

**Default Values**:
```typescript
const defaultStatusBar: StatusBarConfig = {
  showTime: true,
  time: '09:41',
  showBattery: true,
  batteryLevel: 100,
  showWifi: true,
  showCellular: true,
  chatName: '채팅',
};
```

---

## Theme Presets

### Kakao Theme

```typescript
const kakaoTheme: Theme = {
  id: 'kakao',
  name: '카카오톡',
  preview: '/themes/kakao-preview.png',
  styles: {
    canvas: {
      backgroundColor: '#B2C7D9',
    },
    statusBar: {
      backgroundColor: '#F7F7F7',
      textColor: '#000000',
      style: 'ios',
    },
    bubble: {
      sent: {
        backgroundColor: '#FEE500',
        textColor: '#000000',
        borderRadius: '16px',
        padding: '10px 14px',
      },
      received: {
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderRadius: '16px',
        padding: '10px 14px',
      },
      system: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        textColor: '#FFFFFF',
      },
    },
    font: {
      family: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      sizes: {
        message: '14px',
        name: '12px',
        time: '10px',
      },
    },
  },
};
```

### Discord Theme

```typescript
const discordTheme: Theme = {
  id: 'discord',
  name: '디스코드',
  preview: '/themes/discord-preview.png',
  styles: {
    canvas: {
      backgroundColor: '#36393F',
    },
    statusBar: {
      backgroundColor: '#202225',
      textColor: '#FFFFFF',
      style: 'minimal',
    },
    bubble: {
      sent: {
        backgroundColor: 'transparent',
        textColor: '#DCDDDE',
        borderRadius: '0',
        padding: '2px 0',
      },
      received: {
        backgroundColor: 'transparent',
        textColor: '#DCDDDE',
        borderRadius: '0',
        padding: '2px 0',
      },
      system: {
        backgroundColor: 'transparent',
        textColor: '#72767D',
      },
    },
    font: {
      family: "'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      sizes: {
        message: '16px',
        name: '16px',
        time: '12px',
      },
    },
  },
};
```

### Instagram Theme

```typescript
const instagramTheme: Theme = {
  id: 'instagram',
  name: '인스타그램 DM',
  preview: '/themes/instagram-preview.png',
  styles: {
    canvas: {
      backgroundColor: '#FFFFFF',
    },
    statusBar: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      style: 'ios',
    },
    bubble: {
      sent: {
        backgroundColor: '#3797F0',
        textColor: '#FFFFFF',
        borderRadius: '22px',
        padding: '12px 16px',
      },
      received: {
        backgroundColor: '#EFEFEF',
        textColor: '#000000',
        borderRadius: '22px',
        padding: '12px 16px',
      },
      system: {
        backgroundColor: 'transparent',
        textColor: '#8E8E8E',
      },
    },
    font: {
      family: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif",
      sizes: {
        message: '14px',
        name: '14px',
        time: '12px',
      },
    },
  },
};
```

---

## Storage Schema

### localStorage Key Structure

```text
talkstudio_projects     → Project[] (전체 프로젝트 목록)
talkstudio_settings     → UserSettings (사용자 설정, v2)
```

### Serialization Example

```json
{
  "talkstudio_projects": [
    {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "title": "친구와의 대화",
      "createdAt": "2025-12-11T10:30:00.000Z",
      "updatedAt": "2025-12-11T10:35:00.000Z",
      "themeId": "kakao",
      "customStyles": null,
      "statusBar": {
        "showTime": true,
        "time": "21:30",
        "showBattery": true,
        "batteryLevel": 85,
        "showWifi": true,
        "showCellular": true,
        "chatName": "철수"
      },
      "speakers": [
        {
          "id": "abc123",
          "name": "나",
          "profileImage": null,
          "alignment": "right",
          "isMe": true
        },
        {
          "id": "def456",
          "name": "철수",
          "profileImage": "data:image/png;base64,...",
          "alignment": "left",
          "isMe": false
        }
      ],
      "messages": [
        {
          "id": "msg001",
          "speakerId": "def456",
          "text": "야 뭐해?",
          "type": "normal",
          "showTimestamp": true,
          "timestamp": "2025-12-11T21:30:00.000Z",
          "order": 0
        },
        {
          "id": "msg002",
          "speakerId": "abc123",
          "text": "그냥 집에 있어",
          "type": "normal",
          "showTimestamp": false,
          "order": 1
        }
      ]
    }
  ]
}
```

---

## Data Integrity

### Validation Functions

```typescript
// 프로젝트 유효성 검사
export const validateProject = (project: unknown): project is Project => {
  if (!project || typeof project !== 'object') return false;

  const p = project as Project;

  return (
    typeof p.id === 'string' && p.id.length === 21 &&
    typeof p.title === 'string' && p.title.length >= 1 && p.title.length <= 100 &&
    typeof p.createdAt === 'string' &&
    typeof p.updatedAt === 'string' &&
    ['kakao', 'discord', 'instagram'].includes(p.themeId) &&
    Array.isArray(p.speakers) && p.speakers.length >= 2 && p.speakers.length <= 10 &&
    Array.isArray(p.messages) &&
    p.speakers.every(validateSpeaker) &&
    p.messages.every(validateMessage)
  );
};

// 손상된 프로젝트 복구 시도
export const repairProject = (project: Partial<Project>): Project | null => {
  // 최소 필수 필드가 없으면 복구 불가
  if (!project.id || !project.speakers?.length) return null;

  return {
    id: project.id,
    title: project.title || '복구된 프로젝트',
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    themeId: project.themeId || 'kakao',
    statusBar: project.statusBar || defaultStatusBar,
    speakers: project.speakers,
    messages: project.messages || [],
  };
};
```

---

## Migration Strategy (v2)

현재 스키마에서 향후 변경 시:

1. **버전 필드 추가**: `schemaVersion: number`
2. **마이그레이션 함수**: 이전 버전 → 현재 버전 변환
3. **IndexedDB 전환**: 대용량 데이터 시 자동 마이그레이션

```typescript
interface StorageMetadata {
  schemaVersion: number;
  lastMigration: string;
}
```
