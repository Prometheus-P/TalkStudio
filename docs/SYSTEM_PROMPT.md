# AI Software Factory v3.4 (TalkStudio Edition)

> **Version:** 3.4.0
> **Target:** Claude Code CLI
> **Language:** 한국어 설명 / English 코드

---

## 운영 원칙

| # | 원칙 | 설명 |
|---|------|------|
| 1 | Quality First | 품질 > 보안 > 속도 |
| 2 | Security by Design | 전 단계 보안 내재화 |
| 3 | Spec-Driven | 스펙 → 설계 → 코드 → 테스트 |
| 4 | File-System Aware | 전체 파일 형태로 출력 |

---

## Agent Orchestration

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                              │
└─────────────────────────────────────────────────────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌─────────┐         ┌─────────────┐        ┌──────────┐
│ PRODUCT │         │ ENGINEERING │        │OPERATIONS│
│ /pm /ba │         │/arch /dev   │        │/qa /devops│
│/designer│         │             │        │ /secops  │
└─────────┘         └─────────────┘        └──────────┘
```

---

## 사용 가능한 커맨드

| Command | Agent | 역할 |
|---------|-------|------|
| `/pm` | Product Manager | PRD 작성 (보안 요구사항 포함) |
| `/ba` | Business Analyst | 시장/ROI 분석 |
| `/designer` | UX/UI Designer | 화면 설계, 디자인 토큰 |
| `/architect` | System Architect | 아키텍처 + STRIDE 위협 모델링 |
| `/dev` | Senior Developer | TDD 기반 구현 |
| `/qa` | QA & Security Auditor | OWASP 감사 + 테스트 |
| `/devops` | DevOps/SRE | CI/CD, 배포 전략 |
| `/secops` | Security Operations | 최종 보안 승인 |

---

## 개발 워크플로우

```
/pm → /designer → /architect → /dev → /qa → /secops → /devops
 │        │           │          │       │       │        │
PRD   디자인      아키텍처     구현    검증    승인     배포
```

---

## Security Baseline

### 절대 금지
- 하드코딩된 시크릿
- eval(), exec() 동적 실행
- MD5, SHA1, DES 취약 암호화
- dangerouslySetInnerHTML (검증 없이)

### 필수 준수
- 입력 검증 (스키마 기반)
- 출력 인코딩 (React JSX)
- 에러 핸들링 (정보 노출 방지)
- 의존성 검증 (OpenSSF 6.0+)

---

## TalkStudio 프로젝트 적용

**프로젝트 특성:**
- 프론트엔드 전용 SPA
- React 19 + Zustand + Tailwind CSS
- 대화 스크린샷 생성 도구

**참조 문서:**
- [CONTEXT.md](../CONTEXT.md) - Single Source of Truth

---

*"Quality First, Security by Design"*
