---
title: TalkStudio - Monitoring & Alerting
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
---

# Monitoring & Alerting

> TalkStudio 모니터링 및 알림 시스템 구성 가이드입니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [ARCHITECTURE.md](../specs/ARCHITECTURE.md)
- [ERROR_HANDLING_GUIDE.md](../guides/ERROR_HANDLING_GUIDE.md)

---

## 1. Monitoring Overview

### 1.1 Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TalkStudio Monitoring Stack                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │   Browser    │────▶│   Sentry     │────▶│   Alerts     │       │
│   │   (Client)   │     │   (Errors)   │     │   (Slack)    │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│          │                                                          │
│          ▼                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │   Analytics  │────▶│   Dashboard  │────▶│   Reports    │       │
│   │   (GA/Mix)   │     │   (Grafana)  │     │   (Weekly)   │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│          │                                                          │
│          ▼                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │    CDN       │────▶│  CloudWatch  │────▶│  PagerDuty   │       │
│   │   (Metrics)  │     │  (Infra)     │     │  (On-call)   │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Monitoring Pillars

| Pillar | 도구 | 목적 |
|--------|------|------|
| **Error Tracking** | Sentry | 런타임 에러 추적 |
| **Analytics** | Google Analytics / Mixpanel | 사용자 행동 분석 |
| **Performance** | Lighthouse CI / Web Vitals | 성능 모니터링 |
| **Infrastructure** | CloudWatch / Vercel Analytics | 인프라 메트릭 |
| **Uptime** | UptimeRobot / Pingdom | 가용성 모니터링 |

---

## 2. Error Monitoring (Sentry)

### 2.1 Sentry Setup

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_APP_ENV,
      release: `talkstudio@${import.meta.env.VITE_APP_VERSION}`,

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% 샘플링

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],

      // 민감한 정보 필터링
      beforeSend(event) {
        // PII 제거
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}
```

### 2.2 Error Boundary Integration

```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <ErrorFallback error={error} onReset={resetError} />
    ),
    showDialog: true,
    dialogOptions: {
      title: '오류가 발생했습니다',
      subtitle: '문제를 해결하기 위해 노력하고 있습니다.',
      labelSubmit: '제출',
      labelClose: '닫기',
    },
  }
);
```

### 2.3 Custom Error Tracking

```typescript
// 커스텀 에러 트래킹
export function trackError(error: Error, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

// 사용자 컨텍스트 설정
export function setUserContext(userId: string, traits?: Record<string, unknown>) {
  Sentry.setUser({
    id: userId,
    ...traits,
  });
}

// 커스텀 이벤트
export function trackEvent(name: string, data?: Record<string, unknown>) {
  Sentry.captureMessage(name, {
    level: 'info',
    extra: data,
  });
}
```

### 2.4 Sentry Alert Rules

| 알림 이름 | 조건 | 심각도 | 알림 채널 |
|----------|------|--------|----------|
| High Error Rate | > 10 errors/min | Critical | PagerDuty, Slack |
| New Error | 새로운 에러 유형 | Warning | Slack |
| Error Spike | 평소 대비 200% 증가 | Critical | Slack |
| Unhandled Rejection | Promise rejection | Warning | Slack |

---

## 3. Performance Monitoring

### 3.1 Core Web Vitals

```typescript
// src/lib/performance.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function sendToAnalytics(metric: Metric) {
  // Google Analytics로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Sentry Performance로 전송
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: 'info',
    extra: metric,
  });
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

### 3.2 Performance Thresholds

| 메트릭 | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4s | > 4s |
| **FID** (First Input Delay) | ≤ 100ms | ≤ 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | ≤ 1.8s | ≤ 3s | > 3s |
| **TTFB** (Time to First Byte) | ≤ 800ms | ≤ 1800ms | > 1800ms |

### 3.3 Lighthouse CI

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://talkstudio.app'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 4. Analytics

### 4.1 Google Analytics Setup

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function initAnalytics() {
  if (!import.meta.env.VITE_GA_TRACKING_ID) return;

  // GA4 스크립트 로드
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_TRACKING_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
    send_page_view: false, // SPA에서는 수동 관리
  });
}
```

### 4.2 Event Tracking

```typescript
// 페이지 뷰 트래킹
export function trackPageView(path: string, title: string) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

// 사용자 액션 트래킹
export function trackAction(action: string, category: string, label?: string, value?: number) {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// TalkStudio 특화 이벤트
export const TalkStudioEvents = {
  messageAdded: (theme: string) =>
    trackAction('message_added', 'conversation', theme),

  themeChanged: (theme: string) =>
    trackAction('theme_changed', 'settings', theme),

  imageExported: (format: string) =>
    trackAction('image_exported', 'export', format),

  profileUpdated: () =>
    trackAction('profile_updated', 'settings'),
};
```

### 4.3 Key Metrics to Track

| 카테고리 | 메트릭 | 설명 |
|----------|--------|------|
| **Engagement** | Session Duration | 평균 세션 시간 |
| | Messages per Session | 세션당 메시지 생성 수 |
| | Bounce Rate | 이탈률 |
| **Features** | Theme Usage | 테마별 사용 비율 |
| | Export Count | 이미지 내보내기 횟수 |
| | Profile Changes | 프로필 변경 횟수 |
| **Technical** | Error Rate | 에러 발생률 |
| | Page Load Time | 페이지 로드 시간 |
| | Browser Distribution | 브라우저 분포 |

---

## 5. Infrastructure Monitoring

### 5.1 CDN Metrics (CloudFront/Vercel)

| 메트릭 | 설명 | 임계값 |
|--------|------|--------|
| Request Count | 요청 수 | - |
| Error Rate | 4xx/5xx 비율 | < 1% |
| Cache Hit Ratio | 캐시 적중률 | > 90% |
| Bandwidth | 대역폭 사용량 | - |
| Origin Latency | 오리진 지연 시간 | < 500ms |

### 5.2 Uptime Monitoring

```yaml
# UptimeRobot 설정
monitors:
  - name: TalkStudio Production
    url: https://talkstudio.app
    type: HTTP
    interval: 60  # 1분
    alert_contacts:
      - slack_webhook
      - pagerduty

  - name: TalkStudio Staging
    url: https://staging.talkstudio.app
    type: HTTP
    interval: 300  # 5분
    alert_contacts:
      - slack_webhook

  - name: TalkStudio API Health
    url: https://talkstudio.app/build-info.json
    type: HTTP
    interval: 60
    keyword: "version"  # 응답에 포함되어야 할 키워드
```

### 5.3 AWS CloudWatch (AWS 사용 시)

```typescript
// CloudWatch 알람 설정
const alarms = {
  S3: {
    '4xxErrors': {
      threshold: 100,
      period: 300,
      evaluationPeriods: 2,
    },
    '5xxErrors': {
      threshold: 10,
      period: 300,
      evaluationPeriods: 1,
    },
  },
  CloudFront: {
    'OriginLatency': {
      threshold: 1000,
      period: 300,
      evaluationPeriods: 3,
    },
    '5xxErrorRate': {
      threshold: 5,
      period: 300,
      evaluationPeriods: 2,
    },
  },
};
```

---

## 6. Alerting System

### 6.1 Alert Severity Levels

| Level | 이름 | 설명 | 응답 시간 | 알림 채널 |
|-------|------|------|----------|----------|
| P1 | Critical | 서비스 다운 | 즉시 | PagerDuty + Slack + Phone |
| P2 | High | 주요 기능 장애 | 15분 | PagerDuty + Slack |
| P3 | Medium | 성능 저하 | 1시간 | Slack |
| P4 | Low | 경고 | 24시간 | Slack (low-priority) |

### 6.2 Alert Rules Configuration

```yaml
# alert-rules.yml
alerts:
  - name: Service Down
    severity: P1
    condition: uptime_check == false for 2 minutes
    channels: [pagerduty, slack-critical, phone]
    message: "🚨 TalkStudio 서비스 다운!"

  - name: High Error Rate
    severity: P2
    condition: error_rate > 5% for 5 minutes
    channels: [pagerduty, slack-alerts]
    message: "⚠️ 에러율 급증: {{ error_rate }}%"

  - name: Performance Degradation
    severity: P3
    condition: p95_latency > 3000ms for 10 minutes
    channels: [slack-alerts]
    message: "🐢 성능 저하 감지: p95 {{ latency }}ms"

  - name: Error Spike
    severity: P3
    condition: error_count > 100 in 5 minutes
    channels: [slack-alerts]
    message: "📈 에러 급증: {{ count }} errors"

  - name: Low Cache Hit Ratio
    severity: P4
    condition: cache_hit_ratio < 80% for 30 minutes
    channels: [slack-monitoring]
    message: "💾 캐시 적중률 저하: {{ ratio }}%"
```

### 6.3 Slack Integration

```typescript
// Slack Webhook 메시지 포맷
interface SlackAlert {
  channel: string;
  username: 'TalkStudio Monitor';
  icon_emoji: ':robot_face:';
  attachments: [{
    color: string; // 'danger' | 'warning' | 'good'
    title: string;
    text: string;
    fields: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    footer: string;
    ts: number;
  }];
}

// 알림 예시
const alertMessage: SlackAlert = {
  channel: '#ops-alerts',
  username: 'TalkStudio Monitor',
  icon_emoji: ':robot_face:',
  attachments: [{
    color: 'danger',
    title: '🚨 High Error Rate Detected',
    text: 'Production 환경에서 에러율이 급증했습니다.',
    fields: [
      { title: 'Environment', value: 'Production', short: true },
      { title: 'Error Rate', value: '8.5%', short: true },
      { title: 'Affected Users', value: '~150', short: true },
      { title: 'Duration', value: '5 minutes', short: true },
    ],
    footer: 'Sentry Error Tracking',
    ts: Date.now() / 1000,
  }],
};
```

### 6.4 PagerDuty Integration

```yaml
# PagerDuty 서비스 설정
service:
  name: TalkStudio Production
  escalation_policy: production-team
  alert_creation: create_incidents
  auto_resolve_timeout: 240  # 4시간

escalation_policy:
  name: production-team
  rules:
    - escalation_delay_in_minutes: 0
      targets:
        - type: user
          id: on-call-engineer
    - escalation_delay_in_minutes: 15
      targets:
        - type: user
          id: tech-lead
    - escalation_delay_in_minutes: 30
      targets:
        - type: user
          id: engineering-manager
```

---

## 7. Dashboards

### 7.1 Operations Dashboard

```
┌────────────────────────────────────────────────────────────────────┐
│                    TalkStudio Operations Dashboard                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Uptime    │  │ Error Rate  │  │   Latency   │  │  Traffic  │ │
│  │   99.9%     │  │    0.1%     │  │   120ms     │  │   5.2k    │ │
│  │     ✅      │  │     ✅      │  │     ✅      │  │   /hour   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Error Rate (24h)                          │  │
│  │  █                                                           │  │
│  │  █ █                                                    █    │  │
│  │  █ █ █                                                █ █    │  │
│  │  █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █    │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐  │
│  │    Core Web Vitals       │  │      Recent Errors            │  │
│  │                          │  │                               │  │
│  │  LCP:  1.8s    ✅        │  │  TypeError: null ref   (x3)   │  │
│  │  FID:  45ms    ✅        │  │  NetworkError         (x1)    │  │
│  │  CLS:  0.05    ✅        │  │  ChunkLoadError       (x1)    │  │
│  │                          │  │                               │  │
│  └──────────────────────────┘  └───────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Dashboard Panels

| 패널 | 메트릭 | 데이터 소스 |
|------|--------|------------|
| Uptime | 가용성 % | UptimeRobot |
| Error Rate | 에러/요청 비율 | Sentry |
| Latency | p50, p95, p99 응답시간 | CloudFront/Vercel |
| Traffic | 시간당 요청 수 | Analytics |
| Core Web Vitals | LCP, FID, CLS | web-vitals |
| Recent Errors | 최근 에러 목록 | Sentry |
| Deployments | 배포 이력 | GitHub Actions |

---

## 8. On-Call Procedures

### 8.1 On-Call Schedule

```
주간 로테이션:
- 월~금: Primary On-Call + Secondary On-Call
- 주말: Weekend On-Call (단독)

교대 시간: 매주 월요일 09:00 KST
```

### 8.2 On-Call Responsibilities

1. **알림 응답**: 15분 내 응답
2. **초기 대응**: 문제 파악 및 영향도 평가
3. **에스컬레이션**: 필요시 상위 담당자 호출
4. **커뮤니케이션**: Slack에 상황 업데이트
5. **인시던트 기록**: 모든 조치 사항 기록
6. **핸드오프**: 교대 시 상황 인계

### 8.3 On-Call Toolkit

```bash
# 필수 접근 권한
- AWS Console (read-only)
- Sentry Dashboard
- Vercel Dashboard
- GitHub Actions
- Slack (ops channels)

# 유용한 명령어
# Health check
curl -I https://talkstudio.app

# 버전 확인
curl https://talkstudio.app/build-info.json | jq .

# CloudFront 캐시 무효화 (AWS)
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# 롤백 (GitHub Actions 트리거)
gh workflow run deploy-prod.yml -f version=v1.2.2
```

---

## 9. Runbooks

### 9.1 High Error Rate

```markdown
## Runbook: High Error Rate

### 증상
- Error rate > 5%
- Sentry에 새로운 에러 급증

### 진단 단계
1. Sentry 대시보드에서 에러 유형 확인
2. 최근 배포 여부 확인
3. 에러 발생 시점과 배포 시점 비교
4. 영향 받는 사용자 수 파악

### 대응
1. **최근 배포 관련인 경우**
   - 롤백 고려
   - 롤백 실행: `gh workflow run deploy-prod.yml -f version={이전버전}`

2. **외부 서비스 문제인 경우**
   - DiceBear API 상태 확인
   - Fallback 활성화 여부 확인

3. **클라이언트 이슈인 경우**
   - 특정 브라우저/OS 확인
   - Hotfix 계획 수립

### 해결 후
- 인시던트 리포트 작성
- 근본 원인 분석
```

### 9.2 Performance Degradation

```markdown
## Runbook: Performance Degradation

### 증상
- LCP > 4s
- 사용자 불만 접수
- Analytics에서 bounce rate 증가

### 진단 단계
1. Lighthouse 점수 확인
2. 번들 사이즈 확인
3. CDN 캐시 상태 확인
4. 이미지 최적화 상태 확인

### 대응
1. **캐시 문제인 경우**
   - CloudFront 캐시 무효화
   - Cache headers 확인

2. **번들 크기 증가**
   - 최근 추가된 의존성 확인
   - Code splitting 검토

3. **리소스 로딩 문제**
   - Preload/prefetch 설정 확인
   - Third-party 스크립트 지연 로딩

### 해결 후
- 성능 개선 PR 생성
- Lighthouse CI 모니터링 강화
```

---

## Validation Checklist

- [x] 모니터링 아키텍처 정의
- [x] Error tracking (Sentry) 설정 가이드
- [x] Performance monitoring 설정
- [x] Analytics 이벤트 정의
- [x] Alert severity 및 규칙 정의
- [x] Dashboard 구성 가이드
- [x] On-call 절차 문서화
- [x] Runbook 템플릿 제공
