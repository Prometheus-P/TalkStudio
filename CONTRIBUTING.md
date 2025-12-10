# TalkStudio 기여 가이드라인

TalkStudio 프로젝트에 기여해 주셔서 감사합니다! 여러분의 참여는 이 프로젝트를 더욱 발전시키는 데 큰 도움이 됩니다.

## 1. 행동 강령 (Code of Conduct)
모든 기여자는 [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct.html) v2.0에 명시된 행동 강령을 준수해야 합니다. 우리는 모든 참여자가 환영받고 안전한 환경에서 기여할 수 있도록 노력합니다.

## 2. 기여 방법

### 2.1. 개발 환경 설정
프로젝트를 로컬에서 실행하고 싶다면, 먼저 [README.md](README.md) 파일을 참조하여 기본적인 설정 및 설치를 완료해주세요.
특히, `frontend/`, `backend/`, `ai_agent_system/` 각 디렉토리에서 필요한 의존성을 설치하고 환경 변수를 설정해야 합니다.

### 2.2. 버그 보고
- 버그를 발견하셨다면, GitHub Issues에 보고해주세요.
- 보고 시 다음 정보를 포함해주세요:
    - 버그를 재현하는 단계.
    - 예상되는 동작.
    - 실제 발생한 동작.
    - 사용 중인 환경 (OS, 브라우저, Node.js 버전 등).
    - 관련 스크린샷이나 에러 로그.

### 2.3. 기능 제안
- 새로운 기능이나 개선 사항을 제안하고 싶다면, GitHub Issues에 아이디어를 공유해주세요.
- 제안 시 다음 정보를 포함해주세요:
    - 제안하는 기능/개선 사항에 대한 간략한 설명.
    - 이 기능이 해결하는 문제 또는 제공하는 가치.
    - 가능한 경우, 구현 방법에 대한 간략한 아이디어.

### 2.4. 코드 기여 (Pull Request)
1.  **저장소 포크 (Fork)**: TalkStudio 저장소를 개인 계정으로 포크합니다.
2.  **브랜치 생성**: 기능 개발 또는 버그 수정을 위한 새로운 브랜치를 생성합니다 (`git checkout -b feature/your-feature-name` 또는 `git checkout -b bugfix/your-bug-name`).
3.  **변경 사항 구현**:
    - AI Software Factory v4.0의 TDD (Test-Driven Development) 원칙을 따릅니다.
    - 코드 품질 가이드라인 (함수 길이, 파일 길이, 중첩 깊이 등)을 준수합니다.
    - 기존 프로젝트의 코딩 스타일과 일관성을 유지합니다.
4.  **테스트**: 변경 사항에 대한 유닛 테스트, 통합 테스트를 작성하고 모든 테스트가 통과하는지 확인합니다.
5.  **커밋**: [TDD CYCLE](#tdd-cycle)에 명시된 커밋 메시지 규칙을 준수하여 의미 있는 커밋 메시지를 작성합니다. `Tidy`와 `Behavior` 커밋을 분리하는 원칙을 따릅니다.
6.  **푸시 (Push)**: 변경 사항을 포크한 저장소에 푸시합니다.
7.  **풀 리퀘스트 (Pull Request) 생성**:
    - `main` 브랜치를 대상으로 풀 리퀘스트를 생성합니다.
    - 풀 리퀘스트 설명에 변경 사항에 대한 자세한 정보를 포함합니다 (무엇을 변경했는지, 왜 변경했는지, 어떤 문제를 해결하는지 등).
    - 관련된 Issue가 있다면 링크를 포함합니다.
    - 모든 변경 사항에 대한 테스트 결과가 포함되어야 합니다.

## 3. 코딩 스타일
본 프로젝트는 [ESLint](eslint.config.js) 및 [Prettier](.prettierrc.js)를 사용하여 코드 스타일을 관리합니다. 풀 리퀘스트 생성 전에 다음 명령어를 실행하여 코드 스타일을 자동으로 수정하고 검증하는 것을 권장합니다.

```bash
# 코드 포맷팅
npm run format # (예정)
# 코드 린트
npm run lint # (예정)
```

## 4. 커밋 메시지 가이드라인
AI Software Factory v4.0의 TDD CYCLE에 명시된 커밋 형식 (`<type>(<scope>): <subject>`)을 따릅니다.
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 동작에 영향 없음)
- `refactor`: 코드 리팩토링 (버그 수정이나 기능 추가 없이 코드 구조 개선)
- `test`: 테스트 코드 추가 또는 수정
- `chore`: 빌드 프로세스, 패키지 매니저 설정 변경 등 (소스 코드 변경 없음)
- `perf`: 성능 개선
- `ci`: CI 설정 변경
- `build`: 빌드 시스템 또는 외부 종속성 변경
- `revert`: 이전 커밋 되돌리기

**예시:**
```
feat(auth): add user login functionality
fix(chat): resolve message sending failure
docs(readme): update installation instructions
```
