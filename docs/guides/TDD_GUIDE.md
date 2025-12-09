# TalkStudio TDD (Test-Driven Development) 가이드

## 1. 개요
TalkStudio 프로젝트는 AI Software Factory v4.0의 핵심 원칙 중 하나인 TDD (Test-Driven Development)를 엄격히 준수합니다. TDD는 소프트웨어 품질을 향상시키고, 설계에 대한 확신을 높이며, 유지보수를 용이하게 하는 개발 방법론입니다. 본 문서는 TalkStudio 프로젝트에서 TDD를 효과적으로 적용하기 위한 가이드라인을 제공합니다.

## 2. TDD 사이클

TalkStudio의 TDD 사이클은 다음 세 단계로 구성됩니다: **RED**, **GREEN**, **REFACTOR**.

### 2.1. RED: 실패하는 테스트 작성
- **목표**: 구현하고자 하는 새로운 기능의 동작을 정의하는 실패하는 테스트 코드를 작성합니다.
- **원칙**:
    - **가장 작은 단위**: 한 번에 하나의 기능 또는 행동을 테스트합니다.
    - **실패 확인**: 테스트를 실행하여 작성한 테스트가 *정말로* 실패하는지 확인합니다. 이는 테스트가 올바르게 동작하며, 구현되지 않은 기능을 정확히 지적하는지 확인하는 과정입니다.
    - **명확한 실패 메시지**: 테스트 실패 메시지가 무엇이 잘못되었는지 명확하게 알려주도록 작성합니다.
- **예시**: `test_should_return_empty_list_when_no_items()` (Test Naming 규칙 참고)

### 2.2. GREEN: 테스트를 통과시키는 최소한의 구현
- **목표**: 작성한 실패하는 테스트를 통과시키기 위한 최소한의 코드를 작성합니다.
- **원칙**:
    - **최소한의 변경**: 테스트를 통과시키는 데 필요한 만큼만 코드를 변경합니다. 완벽한 디자인이나 일반적인 해결책을 고민하기보다, *지금 당장* 테스트를 통과시키는 데 집중합니다.
    - **빠른 구현**: 최대한 빠르게 GREEN 상태에 도달하는 것이 중요합니다.
    - **설계 부채는 REFACTOR 단계에서 처리**: 코드가 중복되거나 설계가 좋지 않더라도 일단 테스트를 통과시키는 데 집중합니다.
- **예시**: 빈 배열을 반환하도록 함수를 임시로 구현.

### 2.3. REFACTOR: 코드 개선
- **목표**: 테스트를 통과한 코드를 더 깔끔하고, 효율적이며, 유지보수하기 좋게 개선합니다.
- **원칙**:
    - **테스트 커버리지**: 이 단계에서는 이미 모든 테스트가 통과하는 상태이므로, 리팩토링 중 코드가 깨지더라도 즉시 테스트가 알려줍니다.
    - **중복 제거**: 코드의 중복을 찾아 제거합니다 (DRY 원칙).
    - **가독성 향상**: 변수명, 함수명을 개선하고, 복잡한 로직을 단순화합니다.
    - **설계 개선**: 클래스, 모듈 간의 책임 분할을 명확히 하고, 응집도를 높이며 결합도를 낮춥니다.
    - **성능 최적화**: 필요한 경우 성능 개선을 시도합니다.
    - **Tidy vs Behavior**: 구조 변경(Tidy)과 기능 변경(Behavior)은 별도의 커밋으로 분리하여 관리합니다.

## 3. 테스트 작성 원칙

### 3.1. 테스트 이름 규칙
- `test_should_{expected_behavior}_when_{condition}` 형식을 사용합니다.
- **예시**:
    - `test_should_return_authenticated_user_when_valid_credentials()`
    - `test_should_throw_error_when_invalid_input()`

### 3.2. 테스트는 독립적이어야 합니다.
- 각 테스트는 다른 테스트의 결과에 영향을 받지 않아야 합니다.
- 테스트 간에 공유되는 상태는 없어야 하며, 매 테스트마다 독립적인 환경을 구축해야 합니다.

### 3.3. 테스트는 빠르고 안정적이어야 합니다.
- 테스트는 개발자가 자주 실행하므로, 빠르게 실행되어야 합니다.
- 외부 의존성(DB, 네트워크 등)이 있는 경우, 모킹(Mocking)이나 스터빙(Stubbing)을 적극 활용하여 테스트 속도와 안정성을 확보합니다.

## 4. 커밋 메시지 가이드라인

AI Software Factory v4.0의 TDD CYCLE에 명시된 커밋 형식 (`<type>(<scope>): <subject>`)을 따릅니다.
- `feat`: 새로운 기능 추가 (RED → GREEN → COMMIT)
- `fix`: 버그 수정 (RED → GREEN → COMMIT)
- `refactor`: 코드 리팩토링 (REFACTOR → COMMIT, 모든 테스트 통과 확인 후)
- `test`: 테스트 코드 추가 또는 수정 (RED 단계에 해당)

**예시:**
```
test(auth): add test for user login with invalid credentials
feat(auth): implement user login functionality
refactor(auth): simplify login logic and remove duplication
```

## 5. 도구 및 환경
- **Unit Test Framework**: [프로젝트에 따라 결정, 예: Jest, Pytest]
- **Integration Test Framework**: [프로젝트에 따라 결정, 예: Supertest, Pytest]
- **Code Coverage**: [프로젝트에 따라 결정, 예: Istanbul, Coverage.py]

## 6. 지속적인 개선
TDD는 개발 팀 전체의 노력과 학습이 필요합니다. 정기적인 코드 리뷰와 페어 프로그래밍을 통해 TDD 실천 수준을 높이고, 테스트 코드의 품질을 지속적으로 개선합니다.
