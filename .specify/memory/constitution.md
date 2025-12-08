<!--
==========================================================================
SYNC IMPACT REPORT
==========================================================================
Version change: N/A → 1.0.0 (initial creation)

Modified principles: N/A (new constitution)

Added sections:
  - Core Principles (5 principles)
  - Technical Constraints
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - User stories & requirements align with spec-first principle
  ✅ tasks-template.md - TDD and user story structure aligned
  ✅ CLAUDE.md - Already references TDD and Speckit methodology

Follow-up TODOs: None
==========================================================================
-->

# TalkStudio Constitution

## Core Principles

### I. Spec-First Development

All features MUST be specified before implementation begins. No code is written without
a corresponding specification document.

**Rules:**
- Feature specifications MUST exist in `specs/[###-feature-name]/spec.md` before coding
- User stories MUST include acceptance criteria in Given-When-Then format
- Requirements MUST use RFC 2119 keywords (MUST, SHOULD, MAY) for clarity
- Ambiguous requirements MUST be clarified before implementation proceeds

**Rationale:** Specifications prevent scope creep, ensure shared understanding between
human developers and AI agents, and provide testable acceptance criteria.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all feature development. The Red-Green-Refactor cycle MUST be
strictly followed.

**Rules:**
- Tests MUST be written BEFORE implementation code
- Tests MUST fail (RED) before writing production code
- Implementation MUST be minimal to pass tests (GREEN)
- Refactoring MUST NOT change test outcomes (REFACTOR)
- Security test cases MUST cover XSS and input validation scenarios
- Core business logic MUST achieve ≥80% test coverage

**Rationale:** TDD ensures code correctness, prevents regressions, and forces clear
API design through test-first thinking.

### III. Frontend-Only Architecture

TalkStudio is a client-side Single Page Application with no backend dependencies.

**Rules:**
- No server-side code or APIs MUST be introduced
- Data persistence MUST use browser localStorage only
- External API calls MUST be limited to stateless services (e.g., DiceBear avatars)
- All processing MUST occur client-side (image generation via html2canvas)
- User data MUST NOT leave the browser

**Rationale:** Frontend-only architecture eliminates hosting costs, simplifies
deployment, ensures user privacy, and maximizes offline capability.

### IV. Code Quality Standards

Code MUST meet measurable quality metrics to ensure maintainability.

**Rules:**
- Functions MUST NOT exceed 20 lines
- Components MUST NOT exceed 150 lines
- Nesting depth MUST NOT exceed 3 levels
- Component props MUST NOT exceed 5 parameters
- Files MUST NOT exceed 300 lines
- Zustand selectors MUST be used for state access (never full store subscription)

**Rationale:** Small, focused units of code are easier to test, review, and maintain.
Zustand selector pattern prevents unnecessary re-renders.

### V. Security by Default

All user input MUST be treated as untrusted. Security considerations MUST NOT be
deferred.

**Rules:**
- User-provided text MUST be sanitized before rendering
- XSS attack vectors MUST be tested for all input fields
- Dynamic content MUST use React's built-in escaping (no dangerouslySetInnerHTML)
- Third-party dependencies MUST be audited for known vulnerabilities
- No inline event handlers or eval-based code execution

**Rationale:** As a tool that generates shareable images from user input, TalkStudio
must prevent malicious content injection that could harm users.

## Technical Constraints

**Technology Stack (Locked):**
- UI Framework: React 19.x
- State Management: Zustand 5.x
- Styling: Tailwind CSS 4.x
- Build Tool: Vite 7.x (Rolldown)
- Screenshot: html2canvas 1.4.x
- Testing: Vitest + React Testing Library

**Browser Support:**
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

**Performance Targets:**
- Initial load: <3 seconds on 3G
- Image export: <2 seconds for standard conversations
- No memory leaks in long sessions

**Language Policy:**
- Code and variables: English only
- Comments and documentation: Korean permitted
- UI text: Korean (primary), English (future i18n)

## Development Workflow

**Speckit Agent Workflow:**
All feature development follows the Speckit methodology with AI agent collaboration:

1. `/pm` - Product Manager creates PRD
2. `/designer` - UX/UI Designer creates design spec
3. `/architect` - System Architect defines architecture + STRIDE threat model
4. `/dev` - Developer implements with TDD
5. `/qa` - QA Auditor performs OWASP security audit
6. `/devops` - DevOps/SRE configures CI/CD

**Key Documents:**
- `CONTEXT.md` - Project Single Source of Truth
- `CLAUDE.md` - AI agent development guidance
- `specs/[feature]/` - Feature specifications and plans

**Git Workflow:**
- Feature branches: `[###-feature-name]`
- Commits: Conventional commits format
- All code changes require spec traceability

## Governance

**Constitution Authority:**
This constitution supersedes all other development practices for TalkStudio.
Conflicts between this document and other guidance MUST be resolved in favor of
the constitution.

**Amendment Process:**
1. Proposed changes MUST be documented with rationale
2. Changes MUST specify version increment type (MAJOR/MINOR/PATCH)
3. All dependent templates MUST be updated for consistency
4. Migration plan MUST be provided for breaking changes

**Versioning Policy:**
- MAJOR: Incompatible principle changes or removals
- MINOR: New principles or substantial guidance additions
- PATCH: Clarifications, wording improvements, non-semantic changes

**Compliance:**
- All PRs MUST verify compliance with Core Principles
- Complexity beyond constraints MUST be justified in Complexity Tracking
- Regular reviews SHOULD validate adherence to constitution

**Version**: 1.0.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-08
