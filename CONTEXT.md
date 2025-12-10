# TalkStudio Project Context

## 1. Project Overview
TalkStudio는 AI Software Factory v4.0 프레임워크를 기반으로 구축된 프로젝트입니다. 이 프로젝트는 사용자 입력을 처리하고, 에이전트 기반 AI 애플리케이션을 통해 복잡한 작업을 자동화하며, 대화형 및 지능형 기능을 제공하는 것을 목표로 합니다.

## 2. AI Software Factory v4.0 Integration
TalkStudio는 AI Software Factory v4.0의 핵심 원칙인 'Quality First, Security by Design, TDD-Native'를 준수하여 개발됩니다. 이는 견고하고 보안성이 뛰어난 고품질 AI 애플리케이션을 보장하기 위한 프레임워크와 방법론을 제공합니다.

## 3. Core Components and SDK
본 프로젝트는 에이전트 기반 AI 애플리케이션 구축을 위한 경량 Python SDK를 활용합니다. 이 SDK는 다음과 같은 핵심 구성 요소를 통해 에이전트 생성을 단순화합니다:
- **Agents**: LLM, 지침 및 도구를 사용하여 정의된 AI 에이전트.
- **Handoffs**: 에이전트 간의 작업 위임을 가능하게 합니다.
- **Guardrails**: 입력/출력 유효성 검사를 통해 바람직하지 않은 동작을 방지합니다.
- **Tracing**: 디버깅 및 모니터링을 위한 내장 트레이싱 기능.
- **Visualization**: 에이전트 구조 이해를 돕기 위한 시각화 기능.

다양한 AI 모델(예: OpenAI)을 지원하며 Model Context Protocol (MCP)을 통해 외부 도구와 통합됩니다. 여러 에이전트의 오케스트레이션은 복잡한 작업을 처리하는 데 사용됩니다. 실행은 Runner 클래스에 의해 처리되며, 스트리밍 출력도 지원됩니다.

## 4. Context Management
애플리케이션 내 에이전트 실행의 핵심은 `Context` 클래스를 통한 컨텍스트 관리입니다. `Context` 클래스는 서버의 시작 매개변수와 같은 중요한 컨텍스트 정보를 캡슐화하는 싱글톤으로 설계되었습니다. 특히, `readonly_mode`는 서버가 읽기 전용 모드로 시작되었는지 여부를 제어하여, 시스템의 안정성과 보안을 유지하는 데 필수적인 역할을 합니다. 이 컨텍스트는 에이전트들이 작업을 수행하는 데 필요한 환경 정보를 일관되게 제공합니다.
