/**
 * TalkStudio - Zustand Store
 * 채팅 에디터의 모든 상태를 관리
 */
import { create } from 'zustand';
import { getPreset } from '../themes/presets';
import {
  loadProjects as loadProjectsFromStorage,
  loadProject as loadProjectFromStorage,
  saveProject as saveProjectToStorage,
  deleteProject as deleteProjectFromStorage,
  createNewProject as createNewProjectInStorage,
  generateProjectId,
} from '../utils/storage';
import {
  sanitizeMessage,
  sanitizeAuthor,
  sanitizeTitle,
} from '../utils/sanitize';

const useChatStore = create((set, get) => ({
  // ============================================
  // 0. 프로젝트 상태 관리
  // ============================================
  currentProjectId: null,
  projects: [],

  // ============================================
  // 1. ConversationState - 대화 내용 관리
  // ============================================
  conversation: {
    platformSkin: 'kakao',
    title: '상대방',
    authors: [
      {
        id: 'me',
        name: '나',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      },
      {
        id: 'other',
        name: '상대방',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      },
    ],
    messages: [
      {
        id: '1',
        role: 'other',
        authorId: 'other',
        text: '안녕하세요! TalkStudio입니다.',
        datetime: '2024-12-10 오후 12:30',
      },
      {
        id: '2',
        role: 'me',
        authorId: 'me',
        text: '우와, 진짜 카톡 같네요!',
        datetime: '2024-12-10 오후 12:31',
      },
    ],
    unreadCount: 20, // Discord 알림 뱃지 숫자
  },

  // ============================================
  // 2. ThemeState - 스타일 설정
  // ============================================
  theme: { ...getPreset('kakao') },

  // ============================================
  // 3. StatusBar 설정
  // ============================================
  statusBar: {
    time: '12:30',
    battery: 85,
    isWifi: true,
  },

  // ============================================
  // 4. UI 상태
  // ============================================
  ui: {
    selectedMessageId: null,
    isExporting: false,
  },

  // ============================================
  // 5. 시퀀스 렌더링 상태
  // ============================================
  sequence: {
    isRendering: false,
    progress: 0,
    visibleMessageCount: null, // null = 전체 표시, 숫자 = 해당 개수만 표시
  },

  // ============================================
  // 액션 - 테마 & 플랫폼
  // ============================================

  /** 플랫폼 스킨 변경 (프리셋 자동 적용) */
  setPlatform: (platformSkin) => set((state) => ({
    conversation: { ...state.conversation, platformSkin },
    theme: { ...getPreset(platformSkin) },
  })),

  /** 테마 부분 업데이트 */
  updateTheme: (updates) => set((state) => ({
    theme: { ...state.theme, ...updates },
  })),

  /** 버블 스타일 업데이트 */
  updateBubbleStyle: (role, updates) => set((state) => ({
    theme: {
      ...state.theme,
      bubble: {
        ...state.theme.bubble,
        [role]: { ...state.theme.bubble[role], ...updates },
      },
    },
  })),

  /** 테마 프리셋 초기화 */
  resetThemeToPreset: () => set((state) => ({
    theme: { ...getPreset(state.conversation.platformSkin) },
  })),

  // ============================================
  // 액션 - 대화 내용
  // ============================================

  /** 대화 제목 변경 (sanitized) */
  setTitle: (title) => set((state) => ({
    conversation: { ...state.conversation, title: sanitizeTitle(title) },
  })),

  /** Discord 안읽음 숫자 설정 */
  setUnreadCount: (count) => set((state) => ({
    conversation: {
      ...state.conversation,
      unreadCount: Math.min(999, Math.max(0, count))
    },
  })),

  /** 메시지 추가 (sanitized) */
  addMessage: (message) => set((state) => ({
    conversation: {
      ...state.conversation,
      messages: [
        ...state.conversation.messages,
        { ...sanitizeMessage(message), id: `msg-${Date.now()}` },
      ],
    },
  })),

  /** 메시지 삭제 */
  removeMessage: (id) => set((state) => ({
    conversation: {
      ...state.conversation,
      messages: state.conversation.messages.filter((m) => m.id !== id),
    },
  })),

  /** 메시지 수정 (sanitized) */
  updateMessage: (id, updates) => set((state) => ({
    conversation: {
      ...state.conversation,
      messages: state.conversation.messages.map((m) =>
        m.id === id ? { ...m, ...sanitizeMessage(updates) } : m
      ),
    },
  })),

  /** 메시지 순서 변경 */
  reorderMessages: (fromIndex, toIndex) => set((state) => {
    const messages = [...state.conversation.messages];
    const [removed] = messages.splice(fromIndex, 1);
    messages.splice(toIndex, 0, removed);
    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  /** 메시지 복제 */
  duplicateMessage: (id) => set((state) => {
    const messages = [...state.conversation.messages];
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return state;

    const original = messages[index];
    const duplicate = { ...original, id: `msg-${Date.now()}` };
    messages.splice(index + 1, 0, duplicate);

    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  /** 특정 위치에 메시지 삽입 (sanitized) */
  insertMessageAt: (index, message) => set((state) => {
    const messages = [...state.conversation.messages];
    const newMessage = { ...sanitizeMessage(message), id: `msg-${Date.now()}` };
    messages.splice(index, 0, newMessage);
    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  /** 날짜 구분선 추가 */
  addDateDivider: (dateText) => set((state) => ({
    conversation: {
      ...state.conversation,
      messages: [
        ...state.conversation.messages,
        {
          id: `divider-${Date.now()}`,
          type: 'dateDivider',
          text: dateText || new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      ],
    },
  })),

  /** 특정 위치에 날짜 구분선 삽입 */
  insertDateDividerAt: (index, dateText) => set((state) => {
    const messages = [...state.conversation.messages];
    const newDivider = {
      id: `divider-${Date.now()}`,
      type: 'dateDivider',
      text: dateText || new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    messages.splice(index, 0, newDivider);
    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  /** 메시지 위로 이동 */
  moveMessageUp: (id) => set((state) => {
    const messages = [...state.conversation.messages];
    const idx = messages.findIndex((m) => m.id === id);
    if (idx <= 0) return state;
    [messages[idx - 1], messages[idx]] = [messages[idx], messages[idx - 1]];
    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  /** 메시지 아래로 이동 */
  moveMessageDown: (id) => set((state) => {
    const messages = [...state.conversation.messages];
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1 || idx >= messages.length - 1) return state;
    [messages[idx], messages[idx + 1]] = [messages[idx + 1], messages[idx]];
    return {
      conversation: { ...state.conversation, messages },
    };
  }),

  // ============================================
  // 액션 - Author 관리
  // ============================================

  /** Author 정보 업데이트 (sanitized) */
  updateAuthor: (authorId, updates) => set((state) => ({
    conversation: {
      ...state.conversation,
      authors: state.conversation.authors.map((a) =>
        a.id === authorId ? { ...a, ...sanitizeAuthor(updates) } : a
      ),
    },
  })),

  /** Author 추가 (최대 10명) */
  addAuthor: () => set((state) => {
    if (state.conversation.authors.length >= 10) return state;
    const newId = `author-${Date.now()}`;
    const newAuthor = {
      id: newId,
      name: `참여자 ${state.conversation.authors.length}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newId}`,
    };
    return {
      conversation: {
        ...state.conversation,
        authors: [...state.conversation.authors, newAuthor],
      },
    };
  }),

  /** Author 삭제 (me는 삭제 불가) */
  removeAuthor: (authorId) => set((state) => {
    if (authorId === 'me') return state;
    // 해당 author의 메시지는 'me'로 변경
    const updatedMessages = state.conversation.messages.map((m) =>
      m.authorId === authorId ? { ...m, authorId: 'me', role: 'me' } : m
    );
    return {
      conversation: {
        ...state.conversation,
        authors: state.conversation.authors.filter((a) => a.id !== authorId),
        messages: updatedMessages,
      },
    };
  }),

  // ============================================
  // 액션 - StatusBar
  // ============================================

  /** StatusBar 업데이트 */
  updateStatusBar: (updates) => set((state) => ({
    statusBar: { ...state.statusBar, ...updates },
  })),

  // ============================================
  // 액션 - UI 상태
  // ============================================

  /** 선택된 메시지 설정 */
  selectMessage: (id) => set((state) => ({
    ui: { ...state.ui, selectedMessageId: id },
  })),

  /** Export 상태 설정 */
  setExporting: (isExporting) => set((state) => ({
    ui: { ...state.ui, isExporting },
  })),

  // ============================================
  // 액션 - 시퀀스 렌더링
  // ============================================

  /** 시퀀스 렌더링 시작 */
  startSequenceRendering: () => set((state) => ({
    sequence: { ...state.sequence, isRendering: true, progress: 0 },
  })),

  /** 시퀀스 렌더링 진행률 업데이트 */
  setSequenceProgress: (progress) => set((state) => ({
    sequence: { ...state.sequence, progress },
  })),

  /** 표시할 메시지 수 설정 (시퀀스 캡처용) */
  setVisibleMessageCount: (count) => set((state) => ({
    sequence: { ...state.sequence, visibleMessageCount: count },
  })),

  /** 시퀀스 렌더링 완료/취소 */
  stopSequenceRendering: () => set(() => ({
    sequence: { isRendering: false, progress: 0, visibleMessageCount: null },
  })),

  // ============================================
  // 헬퍼 - Author 조회
  // ============================================

  /** authorId로 Author 정보 가져오기 */
  getAuthor: (authorId) => {
    const state = get();
    return state.conversation.authors.find((a) => a.id === authorId);
  },

  // ============================================
  // 액션 - 프로젝트 관리
  // ============================================

  /** 프로젝트 목록 불러오기 */
  loadProjects: () => {
    const projects = loadProjectsFromStorage();
    set({ projects });
    return projects;
  },

  /** 특정 프로젝트 불러오기 */
  loadProject: (projectId) => {
    const result = loadProjectFromStorage(projectId);
    if (!result.success) return result;

    const { project } = result;
    set({
      currentProjectId: project.id,
      conversation: project.conversation || get().conversation,
      theme: project.theme || getPreset(project.conversation?.platformSkin || 'kakao'),
      statusBar: project.statusBar || get().statusBar,
    });
    return result;
  },

  /** 현재 프로젝트 저장 */
  saveCurrentProject: (title) => {
    const state = get();
    const projectId = state.currentProjectId || generateProjectId();

    const project = {
      id: projectId,
      title: title || state.conversation.title || '제목 없음',
      conversation: state.conversation,
      theme: state.theme,
      statusBar: state.statusBar,
    };

    const result = saveProjectToStorage(project);
    if (result.success) {
      set({
        currentProjectId: projectId,
        projects: loadProjectsFromStorage(),
      });
    }
    return result;
  },

  /** 새 프로젝트 생성 */
  createNewProject: (title = '새 프로젝트') => {
    const newProject = createNewProjectInStorage(title);
    const preset = getPreset('kakao');

    set({
      currentProjectId: newProject.id,
      conversation: {
        platformSkin: 'kakao',
        title: '상대방',
        authors: [
          {
            id: 'me',
            name: '나',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          },
          {
            id: 'other',
            name: '상대방',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
          },
        ],
        messages: [],
        unreadCount: 20,
      },
      theme: preset,
      statusBar: {
        time: '12:30',
        battery: 85,
        isWifi: true,
      },
    });

    return newProject;
  },

  /** 프로젝트 삭제 */
  deleteProject: (projectId) => {
    const result = deleteProjectFromStorage(projectId);
    if (result.success) {
      const state = get();
      if (state.currentProjectId === projectId) {
        set({ currentProjectId: null });
      }
      set({ projects: loadProjectsFromStorage() });
    }
    return result;
  },

  /** 현재 프로젝트 데이터 가져오기 */
  getProjectData: () => {
    const state = get();
    if (!state.currentProjectId) return null;

    return {
      id: state.currentProjectId,
      title: state.conversation.title || '제목 없음',
      conversation: state.conversation,
      theme: state.theme,
      statusBar: state.statusBar,
    };
  },
}));

export default useChatStore;
