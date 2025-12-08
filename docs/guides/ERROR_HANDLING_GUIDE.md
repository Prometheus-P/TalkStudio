---
title: TalkStudio - Error Handling Guide
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# Error Handling Guide

> 이 문서는 TalkStudio 프로젝트의 에러 처리 패턴과 전략을 정의합니다.
> 일관된 에러 처리로 사용자 경험을 개선하고 디버깅을 용이하게 합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [CLEAN_CODE_GUIDE.md](./CLEAN_CODE_GUIDE.md) - 클린 코드 가이드
- [TEST_STRATEGY_GUIDE.md](./TEST_STRATEGY_GUIDE.md) - 테스트 전략
- [FRONTEND_SPEC.md](../specs/FRONTEND_SPEC.md) - 프론트엔드 스펙

---

## 1. 에러 처리 원칙

### 1.1 핵심 원칙

```
┌─────────────────────────────────────────────────────────────────┐
│                      에러 처리 원칙                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. 에러를 숨기지 않는다                                          │
│ 2. 사용자에게 유용한 피드백을 제공한다                           │
│ 3. 개발자에게 디버깅 정보를 제공한다                             │
│ 4. 에러 발생 시에도 앱이 작동하도록 한다 (Graceful Degradation)  │
│ 5. 에러를 예방할 수 있으면 예방한다                              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 에러 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| **Validation Error** | 입력값 검증 실패 | 빈 메시지, 잘못된 형식 |
| **Runtime Error** | 런타임 예외 | 타입 에러, 참조 에러 |
| **Network Error** | 네트워크 요청 실패 | API 호출 실패, 타임아웃 |
| **User Error** | 사용자 조작 오류 | 존재하지 않는 항목 선택 |
| **System Error** | 시스템/환경 문제 | 브라우저 API 미지원 |

---

## 2. 에러 클래스 정의

### 2.1 커스텀 에러 클래스

```javascript
// src/utils/errors.js

/**
 * 애플리케이션 기본 에러
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 검증 에러
 */
export class ValidationError extends AppError {
  constructor(message, field = null, details = {}) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    this.details = details;
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends AppError {
  constructor(message, status = null, url = null) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.status = status;
    this.url = url;
  }
}

/**
 * 캡처 에러 (html2canvas)
 */
export class CaptureError extends AppError {
  constructor(message, originalError = null) {
    super(message, 'CAPTURE_ERROR');
    this.name = 'CaptureError';
    this.originalError = originalError;
  }
}

/**
 * 스토리지 에러
 */
export class StorageError extends AppError {
  constructor(message, operation = null) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
    this.operation = operation; // 'read', 'write', 'delete'
  }
}
```

### 2.2 에러 코드 정의

```javascript
// src/constants/errorCodes.js

export const ERROR_CODES = {
  // 검증 에러 (1xxx)
  VALIDATION_REQUIRED: 'E1001',
  VALIDATION_FORMAT: 'E1002',
  VALIDATION_LENGTH: 'E1003',
  VALIDATION_RANGE: 'E1004',

  // 네트워크 에러 (2xxx)
  NETWORK_OFFLINE: 'E2001',
  NETWORK_TIMEOUT: 'E2002',
  NETWORK_SERVER_ERROR: 'E2003',
  NETWORK_NOT_FOUND: 'E2004',

  // 캡처 에러 (3xxx)
  CAPTURE_FAILED: 'E3001',
  CAPTURE_ELEMENT_NOT_FOUND: 'E3002',
  CAPTURE_CORS_ERROR: 'E3003',

  // 스토리지 에러 (4xxx)
  STORAGE_FULL: 'E4001',
  STORAGE_ACCESS_DENIED: 'E4002',
  STORAGE_PARSE_ERROR: 'E4003',

  // 시스템 에러 (5xxx)
  SYSTEM_NOT_SUPPORTED: 'E5001',
  SYSTEM_UNKNOWN: 'E5999',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_REQUIRED]: '필수 입력 항목입니다',
  [ERROR_CODES.VALIDATION_FORMAT]: '형식이 올바르지 않습니다',
  [ERROR_CODES.VALIDATION_LENGTH]: '길이가 허용 범위를 벗어났습니다',
  [ERROR_CODES.NETWORK_OFFLINE]: '인터넷 연결을 확인해주세요',
  [ERROR_CODES.NETWORK_TIMEOUT]: '요청 시간이 초과되었습니다',
  [ERROR_CODES.CAPTURE_FAILED]: '이미지 생성에 실패했습니다',
  [ERROR_CODES.STORAGE_FULL]: '저장 공간이 부족합니다',
  // ...
};
```

---

## 3. 입력 검증

### 3.1 검증 유틸리티

```javascript
// src/utils/validators.js

import { ValidationError } from './errors';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * 메시지 검증
 * @param {Object} message - 메시지 객체
 * @returns {{ isValid: boolean, errors: ValidationError[] }}
 */
export function validateMessage(message) {
  const errors = [];

  // 발신자 검증
  if (!message.sender) {
    errors.push(new ValidationError(
      '발신자를 선택해주세요',
      'sender',
      { code: ERROR_CODES.VALIDATION_REQUIRED }
    ));
  } else if (!['me', 'other'].includes(message.sender)) {
    errors.push(new ValidationError(
      '유효하지 않은 발신자입니다',
      'sender',
      { code: ERROR_CODES.VALIDATION_FORMAT, value: message.sender }
    ));
  }

  // 텍스트 검증
  if (!message.text?.trim()) {
    errors.push(new ValidationError(
      '메시지를 입력해주세요',
      'text',
      { code: ERROR_CODES.VALIDATION_REQUIRED }
    ));
  } else if (message.text.length > 1000) {
    errors.push(new ValidationError(
      '메시지는 1000자 이하로 입력해주세요',
      'text',
      { code: ERROR_CODES.VALIDATION_LENGTH, max: 1000, current: message.text.length }
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 프로필 검증
 */
export function validateProfile(profile) {
  const errors = [];

  if (!profile.name?.trim()) {
    errors.push(new ValidationError(
      '이름을 입력해주세요',
      'name',
      { code: ERROR_CODES.VALIDATION_REQUIRED }
    ));
  } else if (profile.name.length > 20) {
    errors.push(new ValidationError(
      '이름은 20자 이하로 입력해주세요',
      'name',
      { code: ERROR_CODES.VALIDATION_LENGTH }
    ));
  }

  if (profile.avatar && !isValidUrl(profile.avatar)) {
    errors.push(new ValidationError(
      '유효한 URL을 입력해주세요',
      'avatar',
      { code: ERROR_CODES.VALIDATION_FORMAT }
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
```

### 3.2 폼 검증 적용

```jsx
// 컴포넌트에서 검증 사용
function MessageEditor() {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const addMessage = useChatStore(state => state.addMessage);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 검증
    const validation = validateMessage({
      sender: 'me',
      text,
      time: getCurrentTime(),
    });

    if (!validation.isValid) {
      // 첫 번째 에러만 표시
      setError(validation.errors[0].message);
      return;
    }

    // 성공
    setError(null);
    addMessage({ sender: 'me', text: text.trim(), time: getCurrentTime() });
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null); // 입력 시 에러 클리어
        }}
        aria-invalid={!!error}
        aria-describedby={error ? 'text-error' : undefined}
      />
      {error && (
        <span id="text-error" role="alert" className="text-red-500">
          {error}
        </span>
      )}
      <button type="submit">전송</button>
    </form>
  );
}
```

---

## 4. React 에러 경계

### 4.1 ErrorBoundary 컴포넌트

```jsx
// src/components/common/ErrorBoundary.jsx

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // 에러 리포팅 서비스로 전송 (선택)
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // 커스텀 fallback이 있으면 사용
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, reset: this.handleReset })
          : fallback;
      }

      // 기본 에러 UI
      return (
        <div className="p-6 bg-red-50 rounded-lg text-center">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-red-600 mb-4">
            {error?.message || '알 수 없는 오류가 발생했습니다'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return children;
  }
}
```

### 4.2 ErrorBoundary 사용

```jsx
// App.jsx
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <div className="flex h-screen">
      {/* 사이드바는 에러 시에도 유지 */}
      <Sidebar />

      {/* 에디터 영역 에러 격리 */}
      <ErrorBoundary
        fallback={({ reset }) => (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p>에디터를 불러오는데 실패했습니다</p>
              <button onClick={reset}>다시 시도</button>
            </div>
          </div>
        )}
      >
        <Editor />
      </ErrorBoundary>

      {/* 프리뷰 영역 에러 격리 */}
      <ErrorBoundary>
        <Preview />
      </ErrorBoundary>
    </div>
  );
}
```

---

## 5. 비동기 에러 처리

### 5.1 서비스 레이어 에러 처리

```javascript
// src/services/captureService.js

import html2canvas from 'html2canvas';
import { CaptureError } from '../utils/errors';

export const captureService = {
  /**
   * DOM 요소를 PNG로 캡처
   * @param {HTMLElement} element
   * @param {Object} options
   * @returns {Promise<Blob>}
   * @throws {CaptureError}
   */
  async capture(element, options = {}) {
    if (!element) {
      throw new CaptureError(
        '캡처할 요소를 찾을 수 없습니다',
        null
      );
    }

    try {
      const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new CaptureError('이미지 변환에 실패했습니다'));
            }
          },
          'image/png'
        );
      });
    } catch (error) {
      // CORS 에러 감지
      if (error.message?.includes('tainted')) {
        throw new CaptureError(
          '외부 이미지로 인해 캡처할 수 없습니다. 이미지 URL을 확인해주세요.',
          error
        );
      }

      throw new CaptureError(
        '이미지 생성 중 오류가 발생했습니다',
        error
      );
    }
  },
};
```

### 5.2 컴포넌트에서 비동기 에러 처리

```jsx
// src/components/preview/ExportButton.jsx

import { useState } from 'react';
import { captureService } from '../../services/captureService';
import { downloadService } from '../../services/downloadService';

export function ExportButton({ targetRef }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!targetRef.current) {
      setError('프리뷰를 찾을 수 없습니다');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const blob = await captureService.capture(targetRef.current, { scale: 2 });
      downloadService.downloadPng(blob);
      setStatus('idle');
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message || '내보내기에 실패했습니다');
      setStatus('error');
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={status === 'loading'}
        className={`
          px-6 py-3 rounded-lg font-medium
          ${status === 'error' ? 'bg-red-500' : 'bg-blue-500'}
          text-white
          disabled:opacity-50
        `}
      >
        {status === 'loading' && '내보내는 중...'}
        {status === 'error' && '다시 시도'}
        {status === 'idle' && '이미지 내보내기'}
      </button>

      {error && (
        <p className="mt-2 text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 5.3 커스텀 훅으로 에러 상태 관리

```javascript
// src/hooks/useAsync.js

import { useState, useCallback } from 'react';

export function useAsync(asyncFunction) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    status,
    data,
    error,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
  };
}

// 사용 예시
function ExportButton({ targetRef }) {
  const { execute, isLoading, isError, error, reset } = useAsync(
    () => captureService.capture(targetRef.current)
  );

  const handleExport = async () => {
    try {
      const blob = await execute();
      downloadService.downloadPng(blob);
    } catch {
      // 에러는 이미 상태에 저장됨
    }
  };

  return (
    <>
      <button onClick={handleExport} disabled={isLoading}>
        {isLoading ? '내보내는 중...' : '내보내기'}
      </button>
      {isError && (
        <div>
          <p>{error.message}</p>
          <button onClick={reset}>확인</button>
        </div>
      )}
    </>
  );
}
```

---

## 6. 사용자 피드백

### 6.1 토스트 알림 시스템

```jsx
// src/components/common/Toast.jsx

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 3000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (message) => context.addToast({ type: 'success', message }),
    error: (message) => context.addToast({ type: 'error', message, duration: 5000 }),
    info: (message) => context.addToast({ type: 'info', message }),
    warning: (message) => context.addToast({ type: 'warning', message }),
  };
}

function ToastContainer({ toasts, onDismiss }) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg text-white shadow-lg
            ${typeStyles[toast.type]}
            animate-slide-in
          `}
          role="alert"
        >
          <div className="flex items-center justify-between gap-4">
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6.2 사용 예시

```jsx
function ExportButton({ targetRef }) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const blob = await captureService.capture(targetRef.current);
      downloadService.downloadPng(blob);
      toast.success('이미지가 저장되었습니다');
    } catch (error) {
      toast.error(error.message || '이미지 저장에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={isLoading}>
      {isLoading ? '저장 중...' : '이미지 내보내기'}
    </button>
  );
}
```

---

## 7. 로깅

### 7.1 로깅 유틸리티

```javascript
// src/utils/logger.js

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

export const logger = {
  debug(...args) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  info(...args) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info('[INFO]', ...args);
    }
  },

  warn(...args) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  error(message, error, context = {}) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', message, {
        error: error?.message || error,
        stack: error?.stack,
        ...context,
      });
    }

    // 프로덕션에서 에러 리포팅 서비스로 전송
    if (import.meta.env.PROD) {
      // reportToService({ message, error, context });
    }
  },
};
```

### 7.2 로깅 적용

```javascript
// 서비스에서 로깅
async function capture(element) {
  logger.debug('Starting capture', { elementId: element?.id });

  try {
    const result = await html2canvas(element);
    logger.info('Capture successful', { width: result.width, height: result.height });
    return result;
  } catch (error) {
    logger.error('Capture failed', error, { elementId: element?.id });
    throw new CaptureError('캡처 실패', error);
  }
}
```

---

## 8. 에러 복구 전략

### 8.1 자동 재시도

```javascript
// src/utils/retry.js

export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt);
      await sleep(waitTime);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 사용 예시
const blob = await withRetry(
  () => captureService.capture(element),
  {
    maxRetries: 3,
    delay: 500,
    shouldRetry: (error) => error.name !== 'ValidationError',
  }
);
```

### 8.2 Fallback 값

```javascript
// 안전한 JSON 파싱
function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    logger.warn('JSON parse failed, using fallback', { str });
    return fallback;
  }
}

// localStorage 안전 접근
function safeGetItem(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? safeJsonParse(value, fallback) : fallback;
  } catch (error) {
    logger.error('localStorage access failed', error, { key });
    return fallback;
  }
}
```

---

## 9. 에러 처리 체크리스트

### 9.1 코드 작성 시

```markdown
- [ ] 입력값 검증을 수행하는가?
- [ ] 비동기 작업에 try-catch가 있는가?
- [ ] 에러 메시지가 사용자 친화적인가?
- [ ] 에러 발생 시 복구 방법이 있는가?
- [ ] 에러가 적절히 로깅되는가?
```

### 9.2 코드 리뷰 시

```markdown
- [ ] 모든 에러 경로가 처리되는가?
- [ ] 에러 메시지가 노출해도 안전한가?
- [ ] 사용자에게 적절한 피드백을 제공하는가?
- [ ] 에러 발생 후 앱이 계속 작동하는가?
```

---

## 10. 모범 사례 요약

| 상황 | 권장 패턴 |
|------|----------|
| 입력 검증 | validateXxx 함수 + ValidationError |
| 비동기 작업 | try-catch + 상태 관리 |
| 컴포넌트 에러 | ErrorBoundary |
| 사용자 알림 | Toast 시스템 |
| 개발자 디버깅 | 구조화된 로깅 |
| 네트워크 에러 | 재시도 로직 |
| 치명적 에러 | Fallback UI |

---

> **Remember**: 좋은 에러 처리는 사용자가 문제를 이해하고 해결할 수 있도록 돕는 것입니다.
> 기술적 세부사항보다 실행 가능한 피드백을 제공하세요.
