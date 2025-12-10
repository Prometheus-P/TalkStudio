---
title: TalkStudio - Clean Code Guide
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# Clean Code Guide

> 이 문서는 TalkStudio 프로젝트의 클린 코드 규칙을 정의합니다.
> 읽기 쉽고, 유지보수하기 좋은 코드 작성을 위한 가이드입니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [CONTRIBUTING.md](../../CONTRIBUTING.md) - 기여 가이드
- [CODE_REVIEW_GUIDE.md](../../CODE_REVIEW_GUIDE.md) - 코드 리뷰 가이드
- [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) - 에러 처리 가이드

---

## 1. 클린 코드 원칙

### 1.1 핵심 원칙

```
┌─────────────────────────────────────────────────────────────────┐
│                      클린 코드의 핵심                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. 의도를 드러내는 코드를 작성한다                               │
│ 2. 중복을 제거한다 (DRY - Don't Repeat Yourself)                │
│ 3. 한 번에 한 가지만 한다 (단일 책임)                           │
│ 4. 작게 유지한다 (함수, 클래스, 파일)                           │
│ 5. 부수 효과를 최소화한다                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 코드 품질 메트릭

| 항목 | 제한 | 이유 |
|------|------|------|
| 함수 길이 | 20줄 이하 | 가독성, 단일 책임 |
| 함수 매개변수 | 4개 이하 | 인터페이스 단순화 |
| 중첩 깊이 | 3단계 이하 | 복잡도 제어 |
| 컴포넌트 길이 | 150줄 이하 | 관리 용이성 |
| 파일 길이 | 300줄 이하 | 탐색 용이성 |

---

## 2. 네이밍 규칙

### 2.1 의도를 드러내는 이름

```javascript
// ❌ 나쁜 예시
const d = 30;
const list = [];
function process(x) { }
const temp = users.filter(u => u.a);

// ✅ 좋은 예시
const daysUntilExpiration = 30;
const activeMessages = [];
function validateMessage(message) { }
const activeUsers = users.filter(user => user.isActive);
```

### 2.2 네이밍 컨벤션

| 유형 | 컨벤션 | 예시 |
|------|--------|------|
| 변수 | camelCase | `messageCount`, `isLoading` |
| 상수 | SCREAMING_SNAKE | `MAX_MESSAGE_LENGTH`, `THEME_COLORS` |
| 함수 | camelCase (동사) | `handleSubmit`, `validateInput` |
| 컴포넌트 | PascalCase | `MessageEditor`, `ChatPreview` |
| 훅 | camelCase + use | `useTheme`, `useDebounce` |
| 이벤트 핸들러 | handle + Event | `handleClick`, `handleChange` |
| 불리언 | is/has/can/should | `isActive`, `hasError`, `canSubmit` |

### 2.3 컴포넌트 네이밍

```jsx
// ✅ 좋은 컴포넌트 이름
function MessageEditor() { }      // 역할 명확
function ProfileCard() { }        // 무엇을 표시하는지 명확
function ThemeSelector() { }      // 기능 명확

// ❌ 나쁜 컴포넌트 이름
function Editor1() { }            // 의미 없는 숫자
function MsgEd() { }              // 축약어
function Component() { }          // 너무 일반적
```

### 2.4 함수 네이밍 패턴

```javascript
// 조회 함수: get, find, fetch
function getMessage(id) { }
function findActiveUsers() { }
function fetchUserProfile() { }

// 계산 함수: calculate, compute
function calculateTotal() { }
function computeMessageCount() { }

// 변환 함수: to, format, parse
function toUpperCase(str) { }
function formatTime(timestamp) { }
function parseMessage(raw) { }

// 검증 함수: is, has, can, validate
function isValidEmail(email) { }
function hasPermission(user) { }
function canEditMessage(user, message) { }
function validateMessage(message) { }

// 이벤트 핸들러: handle + Event
function handleClick() { }
function handleSubmit() { }
function handleThemeChange() { }
```

---

## 3. 함수 작성 규칙

### 3.1 단일 책임 원칙

```javascript
// ❌ 여러 일을 하는 함수
function handleFormSubmit(data) {
  // 1. 검증
  if (!data.name) throw new Error('Name required');
  if (!data.email) throw new Error('Email required');

  // 2. 데이터 변환
  const formattedData = {
    ...data,
    name: data.name.trim(),
    email: data.email.toLowerCase(),
  };

  // 3. API 호출
  fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(formattedData),
  });

  // 4. UI 업데이트
  showNotification('Success!');
  clearForm();
}

// ✅ 단일 책임으로 분리
function validateFormData(data) {
  if (!data.name) throw new Error('Name required');
  if (!data.email) throw new Error('Email required');
  return true;
}

function formatUserData(data) {
  return {
    ...data,
    name: data.name.trim(),
    email: data.email.toLowerCase(),
  };
}

async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return response.json();
}

async function handleFormSubmit(data) {
  validateFormData(data);
  const formattedData = formatUserData(data);
  await createUser(formattedData);
  showNotification('Success!');
  clearForm();
}
```

### 3.2 함수 길이 제한

```javascript
// ❌ 너무 긴 함수 (50줄+)
function processMessages(messages) {
  // ... 50줄 이상의 코드
}

// ✅ 작은 함수들로 분리
function filterActiveMessages(messages) {
  return messages.filter(msg => !msg.deleted);
}

function sortByTimestamp(messages) {
  return [...messages].sort((a, b) => b.createdAt - a.createdAt);
}

function groupBySender(messages) {
  return messages.reduce((groups, msg) => {
    const key = msg.sender;
    groups[key] = groups[key] || [];
    groups[key].push(msg);
    return groups;
  }, {});
}

function processMessages(messages) {
  const active = filterActiveMessages(messages);
  const sorted = sortByTimestamp(active);
  return groupBySender(sorted);
}
```

### 3.3 매개변수 규칙

```javascript
// ❌ 매개변수가 너무 많음
function createMessage(text, sender, time, type, imageUrl, reactions, isRead) {
  // ...
}

// ✅ 객체로 그룹화
function createMessage({
  text,
  sender,
  time,
  type = 'text',
  imageUrl,
  reactions = [],
  isRead = false,
}) {
  // ...
}

// 사용
createMessage({
  text: 'Hello!',
  sender: 'me',
  time: '12:30',
});
```

### 3.4 부수 효과 최소화

```javascript
// ❌ 부수 효과가 있는 함수
let totalCount = 0;

function addMessage(message) {
  messages.push(message);  // 외부 상태 변경
  totalCount++;            // 외부 변수 변경
  console.log('Added');    // 콘솔 출력
}

// ✅ 순수 함수
function addMessage(messages, newMessage) {
  return [...messages, newMessage];  // 새 배열 반환
}

// 부수 효과는 명시적으로 분리
function handleAddMessage(message) {
  const updatedMessages = addMessage(messages, message);
  setMessages(updatedMessages);
  logEvent('message_added', message);
}
```

---

## 4. React 컴포넌트 규칙

### 4.1 컴포넌트 구조

```jsx
// ✅ 권장 컴포넌트 구조
import { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

// 1. 상수 정의
const MAX_LENGTH = 1000;

// 2. 헬퍼 함수 (컴포넌트 외부)
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

// 3. 컴포넌트 정의
export function MessageEditor({ onSubmit, disabled = false }) {
  // 3.1 훅 호출 (순서 유지)
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  // 3.2 파생 상태
  const isValid = text.trim().length > 0 && text.length <= MAX_LENGTH;
  const charCount = text.length;

  // 3.3 이벤트 핸들러
  const handleChange = useCallback((e) => {
    setText(e.target.value);
    setError(null);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!isValid) {
      setError('유효하지 않은 메시지입니다');
      return;
    }
    onSubmit(text.trim());
    setText('');
  }, [text, isValid, onSubmit]);

  // 3.4 조건부 렌더링
  if (disabled) {
    return <div className="disabled">편집 불가</div>;
  }

  // 3.5 메인 렌더링
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={handleChange}
        maxLength={MAX_LENGTH}
      />
      {error && <span className="error">{error}</span>}
      <span>{charCount}/{MAX_LENGTH}</span>
      <button type="submit" disabled={!isValid}>전송</button>
    </form>
  );
}

// 4. PropTypes
MessageEditor.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// 5. 기본값 (별도 정의 시)
MessageEditor.defaultProps = {
  disabled: false,
};
```

### 4.2 컴포넌트 분리 기준

```jsx
// ❌ 하나의 큰 컴포넌트
function ChatScreen() {
  return (
    <div>
      {/* 상태바 */}
      <div className="status-bar">
        <span>{time}</span>
        <span>{battery}%</span>
      </div>

      {/* 헤더 */}
      <div className="header">
        <img src={avatar} />
        <span>{name}</span>
      </div>

      {/* 메시지 목록 */}
      <div className="messages">
        {messages.map(msg => (
          <div className={msg.sender === 'me' ? 'my-msg' : 'other-msg'}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="input">
        <input />
        <button>전송</button>
      </div>
    </div>
  );
}

// ✅ 역할별로 분리
function ChatScreen() {
  return (
    <div>
      <StatusBar time={time} battery={battery} />
      <ChatHeader avatar={avatar} name={name} />
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

### 4.3 조건부 렌더링

```jsx
// ❌ 복잡한 삼항 연산자
return (
  <div>
    {isLoading
      ? <Loading />
      : error
        ? <Error message={error} />
        : data
          ? <Content data={data} />
          : <Empty />
    }
  </div>
);

// ✅ Early return 패턴
if (isLoading) return <Loading />;
if (error) return <Error message={error} />;
if (!data) return <Empty />;

return <Content data={data} />;
```

### 4.4 이벤트 핸들러

```jsx
// ❌ 인라인 함수 (매 렌더링마다 새로 생성)
<button onClick={() => handleDelete(item.id)}>
  삭제
</button>

// ✅ useCallback으로 메모이제이션
const handleDelete = useCallback((id) => {
  deleteItem(id);
}, [deleteItem]);

<button onClick={() => handleDelete(item.id)}>
  삭제
</button>

// ✅ 또는 data attribute 활용
const handleDelete = useCallback((e) => {
  const id = e.currentTarget.dataset.id;
  deleteItem(id);
}, [deleteItem]);

<button data-id={item.id} onClick={handleDelete}>
  삭제
</button>
```

---

## 5. 상태 관리 규칙

### 5.1 상태 최소화

```jsx
// ❌ 불필요한 상태
function MessageList() {
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);  // 불필요
  const [hasMessages, setHasMessages] = useState(false);  // 불필요

  useEffect(() => {
    setMessageCount(messages.length);
    setHasMessages(messages.length > 0);
  }, [messages]);
}

// ✅ 파생 값은 계산으로
function MessageList() {
  const [messages, setMessages] = useState([]);

  // 파생 값
  const messageCount = messages.length;
  const hasMessages = messages.length > 0;
}
```

### 5.2 Zustand 셀렉터 최적화

```jsx
// ❌ 전체 스토어 구독
function ThemeButton() {
  const store = useChatStore();  // 모든 상태 변경 시 리렌더링
  return <button>{store.config.theme}</button>;
}

// ✅ 필요한 상태만 구독
function ThemeButton() {
  const theme = useChatStore(state => state.config.theme);
  return <button>{theme}</button>;
}

// ✅ 여러 값 선택 시 shallow 사용
import { shallow } from 'zustand/shallow';

function ProfileInfo() {
  const { name, avatar } = useChatStore(
    state => ({
      name: state.profiles.me.name,
      avatar: state.profiles.me.avatar,
    }),
    shallow
  );

  return (
    <div>
      <img src={avatar} />
      <span>{name}</span>
    </div>
  );
}
```

---

## 6. 스타일링 규칙 (Tailwind)

### 6.1 클래스 순서

```jsx
// ✅ 권장 순서
<div className="
  {/* 1. 레이아웃 */}
  flex items-center justify-between

  {/* 2. 크기 */}
  w-full h-12

  {/* 3. 간격 */}
  p-4 m-2 gap-2

  {/* 4. 배경/테두리 */}
  bg-white border rounded-lg

  {/* 5. 텍스트 */}
  text-gray-700 text-sm font-medium

  {/* 6. 효과 */}
  shadow-sm

  {/* 7. 상태 */}
  hover:bg-gray-100 focus:ring-2

  {/* 8. 트랜지션 */}
  transition-colors duration-200
">
```

### 6.2 반복 스타일 추출

```jsx
// ❌ 반복되는 스타일
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  저장
</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  제출
</button>

// ✅ 컴포넌트로 추출
function Button({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  };

  return (
    <button
      className={`px-4 py-2 rounded transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 7. 코드 정리 규칙

### 7.1 불필요한 코드 제거

```javascript
// ❌ 주석 처리된 코드
function processData(data) {
  // const oldResult = data.map(x => x * 2);
  // console.log('debugging', data);
  return data.map(x => x * 3);
}

// ✅ 완전히 제거
function processData(data) {
  return data.map(x => x * 3);
}
```

### 7.2 매직 넘버 제거

```javascript
// ❌ 매직 넘버 사용
if (messages.length > 100) {
  // ...
}

setTimeout(callback, 5000);

const price = amount * 1.1;

// ✅ 상수로 추출
const MAX_MESSAGES = 100;
const DEBOUNCE_DELAY_MS = 5000;
const TAX_RATE = 1.1;

if (messages.length > MAX_MESSAGES) {
  // ...
}

setTimeout(callback, DEBOUNCE_DELAY_MS);

const price = amount * TAX_RATE;
```

### 7.3 조건문 단순화

```javascript
// ❌ 복잡한 조건문
if (user !== null && user !== undefined && user.isActive === true && user.age >= 18) {
  // ...
}

// ✅ 함수로 추출
function isEligibleUser(user) {
  return user?.isActive && user.age >= 18;
}

if (isEligibleUser(user)) {
  // ...
}
```

---

## 8. 주석 규칙

### 8.1 주석이 필요 없는 코드 작성

```javascript
// ❌ 주석으로 설명이 필요한 코드
// 사용자가 활성 상태인지 확인
const x = u && u.a && u.s === 1;

// ✅ 코드 자체가 설명
const isUserActive = user?.isActive && user.status === 'active';
```

### 8.2 의미 있는 주석만 작성

```javascript
// ❌ 불필요한 주석
// 카운트를 1 증가
count++;

// 메시지 배열을 순회
messages.forEach(msg => {
  // ...
});

// ✅ 의미 있는 주석
// Safari에서 한글 입력 시 composition 이벤트 처리가 필요
// https://github.com/example/issue/123
const handleComposition = (e) => {
  // ...
};

// 비즈니스 요구사항: 메시지 100개 초과 시 오래된 것부터 삭제
if (messages.length > MAX_MESSAGES) {
  messages = messages.slice(-MAX_MESSAGES);
}
```

### 8.3 TODO 주석 형식

```javascript
// TODO: 구현 필요 (담당: @username, 기한: 2025-01-15)
// TODO(#123): 관련 이슈 번호 포함

// FIXME: 버그 수정 필요 - 특정 조건에서 충돌
// HACK: 임시 해결책 - 라이브러리 버그 우회
// NOTE: 중요한 정보
```

---

## 9. 파일 구조 규칙

### 9.1 파일 크기

| 파일 유형 | 최대 줄 수 | 비고 |
|----------|----------|------|
| 컴포넌트 | 150줄 | 분리 권장 |
| 유틸리티 | 200줄 | 관련 함수 그룹 |
| 스토어 | 200줄 | 슬라이스로 분리 |
| 테스트 | 300줄 | describe 블록으로 분리 |

### 9.2 Import 순서

```javascript
// 1. 외부 라이브러리
import { useState, useCallback } from 'react';
import { create } from 'zustand';

// 2. 내부 모듈 (절대 경로)
import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/common';

// 3. 상대 경로 모듈
import { validateMessage } from '../utils/validators';
import { MessageItem } from './MessageItem';

// 4. 스타일/에셋
import './MessageList.css';
import logo from './logo.png';
```

---

## 10. 체크리스트

### 10.1 코드 작성 전 체크리스트

```markdown
- [ ] 요구사항을 이해했는가?
- [ ] 테스트를 먼저 작성했는가?
- [ ] 기존 코드에 유사한 기능이 있는지 확인했는가?
```

### 10.2 코드 작성 후 체크리스트

```markdown
- [ ] 함수/변수 이름이 의도를 설명하는가?
- [ ] 함수가 한 가지 일만 하는가?
- [ ] 중복 코드가 없는가?
- [ ] 매직 넘버가 없는가?
- [ ] 불필요한 주석을 제거했는가?
- [ ] 테스트가 통과하는가?
```

---

> **Remember**: 클린 코드는 "작동하는 코드"를 넘어 "이해하기 쉬운 코드"를 목표로 합니다.
> 미래의 자신과 동료를 위해 코드를 작성하세요.
