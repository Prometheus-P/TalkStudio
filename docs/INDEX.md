---
title: TalkStudio - Documentation Index
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
---

# TalkStudio Documentation Index

> TalkStudio 프로젝트 문서의 네비게이션 가이드입니다.

---

## Quick Links

| 문서 | 설명 |
|------|------|
| [README](../README.md) | 프로젝트 소개 및 빠른 시작 |
| [CONTEXT](../CONTEXT.md) | 프로젝트 Single Source of Truth |
| [plan.md](../plan.md) | TDD 개발 계획 |

---

## 1. Foundation Documents (기반 문서)

프로젝트 이해를 위한 핵심 문서입니다.

| 문서 | 설명 | 상태 |
|------|------|------|
| [CONTEXT.md](../CONTEXT.md) | 프로젝트 전체 맥락, Single Source of Truth | ✅ |
| [README.md](../README.md) | 빠른 시작 가이드 | ✅ |
| [ENVIRONMENT.md](../ENVIRONMENT.md) | 개발 환경 설정 가이드 | ✅ |
| [plan.md](../plan.md) | TDD 개발 계획 (실시간 업데이트) | ✅ |

---

## 2. Collaboration Documents (협업 문서)

팀 협업을 위한 규칙과 가이드입니다.

| 문서 | 설명 | 상태 |
|------|------|------|
| [CONTRIBUTING.md](../CONTRIBUTING.md) | 기여 가이드 (PR, 커밋 규칙) | ✅ |
| [CODE_REVIEW_GUIDE.md](../CODE_REVIEW_GUIDE.md) | 코드 리뷰 체크리스트 | ✅ |
| [VERSIONING_GUIDE.md](../VERSIONING_GUIDE.md) | Git 버전 관리 규칙 | ✅ |

---

## 3. Technical Specifications (기술 스펙)

```
docs/specs/
├── PRD.md                  # 제품 요구사항 정의서
├── ARCHITECTURE.md         # 시스템 아키텍처
├── API_SPEC.md             # API 명세
├── DATA_MODEL.md           # 데이터 모델
├── FRONTEND_SPEC.md        # 프론트엔드 상세 스펙
├── BACKEND_DESIGN.md       # 백엔드 설계 (계획)
└── AI_PIPELINE_DESIGN.md   # AI 파이프라인 (계획)
```

| 문서 | 설명 | 상태 |
|------|------|------|
| [PRD.md](./specs/PRD.md) | 제품 요구사항 정의서 | ✅ |
| [ARCHITECTURE.md](./specs/ARCHITECTURE.md) | 시스템 아키텍처 설계 | ✅ |
| [API_SPEC.md](./specs/API_SPEC.md) | API 명세 (외부 API, 내부 인터페이스) | ✅ |
| [DATA_MODEL.md](./specs/DATA_MODEL.md) | 데이터베이스 스키마 & 상태 모델 | ✅ |
| [FRONTEND_SPEC.md](./specs/FRONTEND_SPEC.md) | 프론트엔드 컴포넌트 명세 | ✅ |
| [BACKEND_DESIGN.md](./specs/BACKEND_DESIGN.md) | 백엔드 서비스 설계 (향후 계획) | ✅ |
| [AI_PIPELINE_DESIGN.md](./specs/AI_PIPELINE_DESIGN.md) | AI 파이프라인 설계 (향후 계획) | ✅ |

---

## 4. Development Guides (개발 가이드)

```
docs/guides/
├── TDD_GUIDE.md            # TDD 사이클 상세 절차
├── CLEAN_CODE_GUIDE.md     # 클린 코드 규칙
├── TEST_STRATEGY_GUIDE.md  # 테스트 전략
├── ERROR_HANDLING_GUIDE.md # 에러 처리 패턴
└── prompts/                # AI 프롬프트 라이브러리
```

| 문서 | 설명 | 상태 |
|------|------|------|
| [TDD_GUIDE.md](./guides/TDD_GUIDE.md) | TDD 사이클 상세 절차 | ✅ |
| [CLEAN_CODE_GUIDE.md](./guides/CLEAN_CODE_GUIDE.md) | 클린 코드 규칙 | ✅ |
| [TEST_STRATEGY_GUIDE.md](./guides/TEST_STRATEGY_GUIDE.md) | 테스트 전략 | ✅ |
| [ERROR_HANDLING_GUIDE.md](./guides/ERROR_HANDLING_GUIDE.md) | 에러 처리 패턴 | ✅ |

---

## 5. CI/CD Workflows (CI/CD 파이프라인)

```
.github/workflows/
├── ci.yml              # CI 파이프라인 (lint, test, build)
├── deploy-dev.yml      # 개발 환경 배포
├── deploy-staging.yml  # 스테이징 환경 배포
└── deploy-prod.yml     # 프로덕션 환경 배포
```

| 문서 | 설명 | 상태 |
|------|------|------|
| [ci.yml](../.github/workflows/ci.yml) | CI 파이프라인 (lint, type-check, test, build) | ✅ |
| [deploy-dev.yml](../.github/workflows/deploy-dev.yml) | 개발 환경 자동 배포 | ✅ |
| [deploy-staging.yml](../.github/workflows/deploy-staging.yml) | 스테이징 환경 배포 | ✅ |
| [deploy-prod.yml](../.github/workflows/deploy-prod.yml) | 프로덕션 환경 배포 (승인 필요) | ✅ |

---

## 6. Operations Documents (운영 문서)

```
docs/operations/
├── DEPLOYMENT_CHECKLIST.md     # 배포 체크리스트
├── RELEASE_MANAGEMENT.md       # 릴리즈 관리
├── MONITORING_AND_ALERTING.md  # 모니터링 & 알람
└── INCIDENT_RESPONSE.md        # 인시던트 대응
```

| 문서 | 설명 | 상태 |
|------|------|------|
| [DEPLOYMENT_CHECKLIST.md](./operations/DEPLOYMENT_CHECKLIST.md) | 배포 전/중/후 체크리스트 | ✅ |
| [RELEASE_MANAGEMENT.md](./operations/RELEASE_MANAGEMENT.md) | 릴리즈 프로세스 및 버전 관리 | ✅ |
| [MONITORING_AND_ALERTING.md](./operations/MONITORING_AND_ALERTING.md) | 모니터링 및 알림 시스템 | ✅ |
| [INCIDENT_RESPONSE.md](./operations/INCIDENT_RESPONSE.md) | 인시던트 대응 절차 | ✅ |

---

## 7. Business Documents (비즈니스 문서)

> 📋 필요 시 생성 예정

```
docs/business/
├── PRODUCT_VISION.md       # 제품 비전
├── MARKET_ANALYSIS.md      # 시장 분석
└── COST_MODEL.md           # 비용 구조
```

---

## Document Status Legend

| 상태 | 의미 |
|------|------|
| ✅ | 완료 |
| ⏳ | 예정 |
| 🔄 | 업데이트 필요 |
| ❌ | 해당 없음 |

---

## Reading Order (권장 순서)

### 신규 팀원 온보딩

```
1. README.md           → 프로젝트 개요 파악
2. CONTEXT.md          → 전체 맥락 이해
3. ENVIRONMENT.md      → 개발 환경 설정
4. CONTRIBUTING.md     → 협업 규칙 숙지
5. specs/PRD.md        → 제품 요구사항 확인
6. specs/ARCHITECTURE.md → 아키텍처 이해
```

### 기능 개발 시작

```
1. plan.md             → 현재 태스크 확인
2. specs/PRD.md        → 요구사항 확인
3. specs/FRONTEND_SPEC.md → 컴포넌트 명세
4. specs/DATA_MODEL.md → 데이터 구조
5. CODE_REVIEW_GUIDE.md → 리뷰 기준 확인
```

### 코드 리뷰 수행

```
1. CODE_REVIEW_GUIDE.md → 체크리스트 확인
2. CONTRIBUTING.md     → 커밋/PR 규칙
3. specs/FRONTEND_SPEC.md → 컴포넌트 규칙
```

---

## Document Templates

새 문서 작성 시 다음 템플릿을 사용하세요:

### 기본 문서 헤더

```markdown
---
title: [문서 제목]
version: 1.0.0
status: Draft | Review | Approved
owner: @username
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: [@reviewer1, @reviewer2]
---

# [문서 제목]

> [문서 한 줄 설명]

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | YYYY-MM-DD | @author | 최초 작성 |

---

## 관련 문서

- [관련 문서 1](./path/to/doc1.md)
- [관련 문서 2](./path/to/doc2.md)

---

## 1. 첫 번째 섹션

...
```

---

## Maintenance

이 인덱스는 새 문서 추가 시 업데이트되어야 합니다.

**마지막 업데이트**: 2025-12-08

---

> **Note**: 문서 관련 질문이나 개선 제안은 GitHub Issues에 등록해주세요.
