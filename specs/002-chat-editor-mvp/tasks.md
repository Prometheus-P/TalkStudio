# Tasks: TalkStudio Chat Editor MVP

**Input**: Design documents from `/specs/002-chat-editor-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Tests**: Tests not explicitly requested in spec - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, legacy cleanup, dependency installation

- [x] T001 Move existing Python/Discord code to `legacy/` directory per hard constraint
- [x] T002 Update package.json with new dependencies (html-to-image, @dnd-kit/core, @dnd-kit/sortable, nanoid)
- [x] T003 [P] Configure TypeScript strict mode in `tsconfig.json`
- [x] T004 [P] Configure Tailwind CSS 4 in `tailwind.config.js`
- [x] T005 [P] Update Vite config for clean build in `vite.config.ts`
- [x] T006 Create directory structure per plan.md (components/, store/, themes/, types/, utils/, hooks/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and base infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create Project type interface in `src/types/project.ts`
- [x] T008 [P] Create Message type interface in `src/types/project.ts`
- [x] T009 [P] Create Speaker type interface in `src/types/project.ts`
- [x] T010 [P] Create StatusBarConfig type interface in `src/types/project.ts`
- [x] T011 [P] Create Theme and ThemeStyles type interfaces in `src/types/theme.ts`
- [x] T012 Create ID generation utility using nanoid in `src/utils/id.ts`
- [x] T013 [P] Create debounce utility function in `src/utils/debounce.ts`
- [x] T014 Create base useEditorStore with initial state structure in `src/store/useEditorStore.ts`
- [x] T015 [P] Create useUIStore for modals/toasts/loading in `src/store/useUIStore.ts`
- [x] T016 [P] Create Button component in `src/components/common/Button.tsx`
- [x] T017 [P] Create Toast component in `src/components/common/Toast.tsx`
- [x] T018 [P] Create Modal component in `src/components/common/Modal.tsx`
- [x] T019 Create 3-column layout structure in `src/App.tsx`
- [x] T020 [P] Create Sidebar layout component (placeholder) in `src/components/layout/Sidebar.tsx`
- [x] T021 [P] Create EditorPanel layout component (placeholder) in `src/components/layout/EditorPanel.tsx`
- [x] T022 [P] Create PreviewPanel layout component (placeholder) in `src/components/layout/PreviewPanel.tsx`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - 기본 대화 생성 및 이미지 저장 (Priority: P1) MVP

**Goal**: 사용자가 새 프로젝트를 생성하고, 메시지를 추가/삭제하고, PNG 이미지로 저장할 수 있다

**Independent Test**: 새 프로젝트 생성 → 메시지 3개 추가 → 이미지 다운로드

### Store Actions for US1

- [x] T023 [US1] Implement createProject action in `src/store/useChatStore.js` (createNewProject)
- [x] T024 [US1] Implement addMessage action in `src/store/useChatStore.js`
- [x] T025 [US1] Implement deleteMessage action in `src/store/useChatStore.js` (removeMessage)
- [x] T026 [US1] Implement selectMessage action in `src/store/useChatStore.js`

### Preview Components for US1

- [x] T027 [P] [US1] Create PhoneFrame component (iPhone frame wrapper) in `src/App.jsx` (inline)
- [x] T028 [P] [US1] Create StatusBar component (time, battery, wifi icons) in `src/components/preview/StatusBar.jsx`
- [x] T029 [US1] Create ChatBubble component (sent/received styles) in `src/components/preview/MessageBubble.jsx`
- [x] T030 [US1] Integrate preview components into PreviewPanel in `src/components/preview/ChatPreview.jsx`

### Editor Components for US1

- [x] T031 [US1] Create MessageInput component (speaker select, text input, add button) in `src/components/editor/MessageEditor.jsx`
- [x] T032 [US1] Create MessageItem component (display message with delete button) in `src/components/editor/MessageEditor.jsx`
- [x] T033 [US1] Create MessageList component (list of MessageItems) in `src/components/editor/MessageEditor.jsx`
- [x] T034 [US1] Integrate editor components into EditorPanel in `src/components/editor/LeftPanel.jsx`

### Image Export for US1

- [x] T035 [US1] Create image export utility (html2canvas) in `src/components/editor/ExportButton.jsx`
- [x] T036 [US1] Create export functionality in `src/components/editor/ExportButton.jsx`
- [x] T037 [US1] Add export button in `src/components/editor/LeftPanel.jsx`

### Integration for US1

- [x] T038 [US1] Wire up App.jsx with store and layout components
- [x] T039 [US1] Add default Kakao theme styles in `src/themes/presets.js`

**Checkpoint**: User Story 1 완료 - 기본 대화 생성 및 이미지 저장 가능

---

## Phase 4: User Story 2 - 테마/프리셋으로 스타일 변경 (Priority: P2)

**Goal**: 사용자가 카카오톡/디스코드/인스타그램 테마를 선택하여 스타일을 변경할 수 있다

**Independent Test**: 기본 테마로 메시지 작성 → 테마 변경 → 변경된 스타일로 이미지 저장

### Theme Definitions for US2

- [X] T040 [P] [US2] Create Kakao theme preset in `src/themes/presets.js` (combined file)
- [X] T041 [P] [US2] Create Discord theme preset in `src/themes/presets.js` (combined file)
- [X] T042 [P] [US2] Create Instagram theme preset in `src/themes/presets.js` (combined file)
- [X] T043 [US2] Create theme index with all presets in `src/themes/presets.js` (themePresets export)

### Store Actions for US2

- [X] T044 [US2] Implement setPlatform action in `src/store/useChatStore.js` (equivalent to setTheme)
- [X] T045 [US2] Add theme selector to store in `src/store/useChatStore.js`

### UI Components for US2

- [X] T046 [US2] Create theme buttons in Sidebar (integrated approach) in `src/components/layout/Sidebar.jsx`
- [X] T047 [US2] Update Sidebar with theme selection buttons in `src/components/layout/Sidebar.jsx`

### Preview Updates for US2

- [X] T048 [US2] Update MessageBubble to use theme styles dynamically in `src/components/preview/MessageBubble.jsx`
- [X] T049 [US2] Update StatusBar to use theme styles dynamically in `src/components/preview/StatusBar.jsx`
- [X] T050 [US2] Update ChatPreview background to use theme styles in `src/components/preview/ChatPreview.jsx`

**Checkpoint**: User Story 2 완료 - 테마 변경으로 전체 스타일 즉시 변경 가능

---

## Phase 5: User Story 3 - 메시지 순서 변경 및 수정 (Priority: P2)

**Goal**: 사용자가 메시지를 드래그하여 순서를 변경하고, 클릭하여 내용을 수정할 수 있다

**Independent Test**: 메시지 3개 생성 → 순서 변경 → 내용 수정 → 이미지 저장

### Store Actions for US3

- [X] T051 [US3] Implement updateMessage action in `src/store/useChatStore.js`
- [X] T052 [US3] Implement reorderMessages action in `src/store/useChatStore.js`

### Reorder Functionality for US3

- [X] T053 [US3] Add moveMessageUp/Down actions (button-based approach) in `src/store/useChatStore.js`
- [X] T054 [US3] Create MessageItem with up/down buttons in `src/components/editor/MessageEditor.jsx`
- [X] T055 [US3] Implement message reorder via buttons in `src/components/editor/MessageEditor.jsx`

### Edit Mode for US3

- [X] T056 [US3] Add inline textarea editing to MessageItem in `src/components/editor/MessageEditor.jsx`
- [X] T057 [US3] Add onChange handler for real-time text update in `src/components/editor/MessageEditor.jsx`
- [X] T058 [US3] Add author change selector in MessageItem in `src/components/editor/MessageEditor.jsx`

**Checkpoint**: User Story 3 완료 - 메시지 드래그 순서 변경 및 인라인 편집 가능

---

## Phase 6: User Story 4 - 발화자 및 메시지 스타일 커스터마이징 (Priority: P3)

**Goal**: 사용자가 발화자 이름/프로필을 설정하고, 메시지 타입(일반/강조/시스템)을 선택할 수 있다

**Independent Test**: 발화자 2명 설정 → 각각 메시지 작성 → 시스템 메시지 추가 → 이미지 저장

### Store Actions for US4

- [ ] T059 [US4] Implement updateSpeaker action in `src/store/useEditorStore.ts`
- [ ] T060 [US4] Implement addSpeaker action (max 10) in `src/store/useEditorStore.ts`
- [ ] T061 [US4] Implement removeSpeaker action (min 2) in `src/store/useEditorStore.ts`
- [ ] T062 [US4] Implement updateStatusBar action in `src/store/useEditorStore.ts`

### Speaker Panel for US4

- [ ] T063 [US4] Create SpeakerPanel component in `src/components/editor/SpeakerPanel.tsx`
- [ ] T064 [US4] Add speaker name input field to SpeakerPanel in `src/components/editor/SpeakerPanel.tsx`
- [ ] T065 [US4] Add profile image upload to SpeakerPanel in `src/components/editor/SpeakerPanel.tsx`
- [ ] T066 [US4] Add speaker add/remove buttons to SpeakerPanel in `src/components/editor/SpeakerPanel.tsx`

### Message Type for US4

- [ ] T067 [US4] Add message type selector to MessageInput in `src/components/editor/MessageInput.tsx`
- [ ] T068 [US4] Update ChatBubble to render system message style in `src/components/preview/ChatBubble.tsx`
- [ ] T069 [US4] Update ChatBubble to render emphasis message style in `src/components/preview/ChatBubble.tsx`

### StatusBar Customization for US4

- [ ] T070 [US4] Create StatusBarSettings component in `src/components/editor/StatusBarSettings.tsx`
- [ ] T071 [US4] Add time/battery/wifi toggle controls in `src/components/editor/StatusBarSettings.tsx`
- [ ] T072 [US4] Add chat name input field in `src/components/editor/StatusBarSettings.tsx`
- [ ] T073 [US4] Integrate SpeakerPanel and StatusBarSettings into EditorPanel in `src/components/layout/EditorPanel.tsx`

**Checkpoint**: User Story 4 완료 - 발화자 커스터마이징 및 메시지 타입 선택 가능

---

## Phase 7: User Story 5 - 프로젝트 저장 및 불러오기 (Priority: P3)

**Goal**: 사용자가 프로젝트를 localStorage에 저장하고 나중에 불러올 수 있다

**Independent Test**: 프로젝트 생성 → 저장 → 새 프로젝트 → 저장된 프로젝트 불러오기

### Storage Utilities for US5

- [ ] T074 [US5] Create localStorage save/load utilities in `src/utils/storage.ts`
- [ ] T075 [US5] Create project validation utility in `src/utils/storage.ts`
- [ ] T076 [US5] Create corrupted project repair utility in `src/utils/storage.ts`

### Auto-Save for US5

- [ ] T077 [US5] Create useAutoSave hook with debounce in `src/hooks/useAutoSave.ts`
- [ ] T078 [US5] Integrate useAutoSave in App.tsx in `src/App.tsx`

### Store Actions for US5

- [ ] T079 [US5] Implement saveProject action in `src/store/useEditorStore.ts`
- [ ] T080 [US5] Implement loadProject action in `src/store/useEditorStore.ts`
- [ ] T081 [US5] Implement loadProjects (list) action in `src/store/useEditorStore.ts`
- [ ] T082 [US5] Implement deleteProject action in `src/store/useEditorStore.ts`

### Project List UI for US5

- [ ] T083 [US5] Create ProjectListModal component in `src/components/editor/ProjectListModal.tsx`
- [ ] T084 [US5] Add project title display and edit in ProjectListModal in `src/components/editor/ProjectListModal.tsx`
- [ ] T085 [US5] Add project delete confirmation in ProjectListModal in `src/components/editor/ProjectListModal.tsx`
- [ ] T086 [US5] Add "New Project" and "Load Project" buttons to EditorPanel in `src/components/layout/EditorPanel.tsx`

### Storage Error Handling for US5

- [ ] T087 [US5] Add storage quota exceeded handling in `src/utils/storage.ts`
- [ ] T088 [US5] Add corrupted data detection and user notification in `src/utils/storage.ts`

**Checkpoint**: User Story 5 완료 - 프로젝트 자동 저장/수동 저장/불러오기/삭제 가능

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, performance optimization

- [ ] T089 [P] Add loading state indicators to useUIStore in `src/store/useUIStore.ts`
- [ ] T090 [P] Add error boundary component in `src/components/common/ErrorBoundary.tsx`
- [ ] T091 Handle long message text (500+ chars) word-wrap in `src/components/preview/ChatBubble.tsx`
- [ ] T092 Handle 100+ messages scrolling performance in `src/components/preview/PhoneFrame.tsx`
- [ ] T093 Add browser compatibility check for html-to-image in `src/utils/export.ts`
- [ ] T094 [P] Add WebP export option to export utility in `src/utils/export.ts`
- [ ] T095 Update README.md with TalkStudio MVP description in `README.md`
- [ ] T096 Run quickstart.md validation - verify npm run dev works

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ──────────────────────────────────────────┐
    │                                                            │
    ▼                                                            │
Phase 3 (US1: 기본 대화 + 이미지 저장) ← MVP 완료 지점            │
    │                                                            │
    ├────────────────┬────────────────┐                          │
    ▼                ▼                ▼                          │
Phase 4 (US2)    Phase 5 (US3)    [독립적으로 병렬 가능]          │
    │                │                                           │
    ├────────────────┴────────────────┐                          │
    ▼                                 ▼                          │
Phase 6 (US4)                    Phase 7 (US5)                   │
    │                                 │                          │
    └─────────────────┬───────────────┘                          │
                      ▼                                          │
              Phase 8 (Polish) ──────────────────────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (P1) | Phase 2 (Foundational) | - |
| US2 (P2) | Phase 2, US1 (theme integration) | US3 (partially) |
| US3 (P2) | Phase 2, US1 (message list) | US2 (partially) |
| US4 (P3) | Phase 2, US1, US2 (theme styles) | US5 |
| US5 (P3) | Phase 2, US1 (project structure) | US4 |

### Parallel Opportunities per Phase

**Phase 1**: T003, T004, T005 can run in parallel
**Phase 2**: T007-T011 (types), T016-T018 (common), T020-T022 (layout) can run in parallel
**Phase 3**: T027-T028 (preview shells) can run in parallel
**Phase 4**: T040-T042 (theme files) can run in parallel
**Phase 6**: Model/store tasks can run separately from UI tasks

---

## Parallel Execution Examples

### Example 1: Phase 2 Foundational (3 parallel tracks)

```bash
# Track A: Type definitions
Task: T007 "Create Project type interface in src/types/project.ts"
Task: T008 "Create Message type interface in src/types/project.ts"
Task: T009 "Create Speaker type interface in src/types/project.ts"
Task: T010 "Create StatusBarConfig type interface in src/types/project.ts"
Task: T011 "Create Theme and ThemeStyles type interfaces in src/types/theme.ts"

# Track B: Common components (parallel with Track A)
Task: T016 "Create Button component in src/components/common/Button.tsx"
Task: T017 "Create Toast component in src/components/common/Toast.tsx"
Task: T018 "Create Modal component in src/components/common/Modal.tsx"

# Track C: Layout shells (parallel with Track A, B)
Task: T020 "Create Sidebar layout component in src/components/layout/Sidebar.tsx"
Task: T021 "Create EditorPanel layout component in src/components/layout/EditorPanel.tsx"
Task: T022 "Create PreviewPanel layout component in src/components/layout/PreviewPanel.tsx"
```

### Example 2: Phase 4 Theme Presets (fully parallel)

```bash
# All theme files can be created simultaneously
Task: T040 "Create Kakao theme preset in src/themes/kakao.ts"
Task: T041 "Create Discord theme preset in src/themes/discord.ts"
Task: T042 "Create Instagram theme preset in src/themes/instagram.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T022)
3. Complete Phase 3: User Story 1 (T023-T039)
4. **STOP and VALIDATE**: 새 프로젝트 생성 → 메시지 추가 → PNG 저장 테스트
5. **MVP 완료**: 배포 가능한 최소 기능 제품

### Incremental Delivery

```text
Phase 1-2 → Foundation
Phase 3   → US1 완료 (MVP!) - 기본 대화 + 이미지 저장
Phase 4   → US2 완료 - 테마 변경
Phase 5   → US3 완료 - 메시지 편집/순서 변경
Phase 6   → US4 완료 - 커스터마이징
Phase 7   → US5 완료 - 프로젝트 저장/불러오기
Phase 8   → Polish - 엣지 케이스, 최적화
```

각 단계가 완료될 때마다 독립적으로 테스트하고 배포 가능

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Phase 1: Setup | 6 | 3 |
| Phase 2: Foundational | 16 | 12 |
| Phase 3: US1 (P1) | 17 | 4 |
| Phase 4: US2 (P2) | 11 | 3 |
| Phase 5: US3 (P2) | 8 | 0 |
| Phase 6: US4 (P3) | 15 | 0 |
| Phase 7: US5 (P3) | 15 | 0 |
| Phase 8: Polish | 8 | 3 |
| **Total** | **96** | **25** |

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [US#] label = maps task to user story for traceability
- MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1) = 39 tasks
- 각 User Story는 독립적으로 테스트 가능하도록 설계됨
- 커밋은 각 태스크 또는 논리적 그룹 완료 후 수행
