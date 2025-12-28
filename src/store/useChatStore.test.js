/**
 * useChatStore - Zustand Store Tests
 * 채팅 에디터 상태 관리 테스트
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useChatStore from './useChatStore';

// Mock storage functions
vi.mock('../utils/storage', () => ({
  loadProjects: vi.fn(() => []),
  loadProject: vi.fn(() => ({ success: true, project: { id: 'test-project' } })),
  saveProject: vi.fn(() => ({ success: true })),
  deleteProject: vi.fn(() => ({ success: true })),
  createNewProject: vi.fn(() => ({ id: 'new-project', title: 'New Project' })),
  generateProjectId: vi.fn(() => 'generated-id'),
}));

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useChatStore.setState({
      currentProjectId: null,
      projects: [],
      conversation: {
        platformSkin: 'kakao',
        title: '상대방',
        authors: [
          { id: 'me', name: '나', avatarUrl: 'https://example.com/me.png' },
          { id: 'other', name: '상대방', avatarUrl: 'https://example.com/other.png' },
        ],
        messages: [
          { id: '1', role: 'other', authorId: 'other', text: 'Hello', datetime: '2024-12-10' },
          { id: '2', role: 'me', authorId: 'me', text: 'Hi', datetime: '2024-12-10' },
        ],
        unreadCount: 20,
      },
      theme: { id: 'kakao', bubble: { me: {}, other: {}, system: {} } },
      statusBar: { time: '12:30', battery: 85, isWifi: true },
      ui: { selectedMessageId: null, isExporting: false },
      sequence: { isRendering: false, progress: 0, visibleMessageCount: null },
    });
  });

  // ============================================
  // Platform & Theme Tests
  // ============================================
  describe('Platform & Theme', () => {
    it('should set platform and update theme', () => {
      const { setPlatform } = useChatStore.getState();

      setPlatform('discord');

      const state = useChatStore.getState();
      expect(state.conversation.platformSkin).toBe('discord');
      expect(state.theme).toBeDefined();
    });

    it('should update theme partially', () => {
      const { updateTheme } = useChatStore.getState();

      updateTheme({ fontSize: 16 });

      const state = useChatStore.getState();
      expect(state.theme.fontSize).toBe(16);
    });

    it('should update bubble style for specific role', () => {
      const { updateBubbleStyle } = useChatStore.getState();

      updateBubbleStyle('me', { bg: '#FF0000' });

      const state = useChatStore.getState();
      expect(state.theme.bubble.me.bg).toBe('#FF0000');
    });

    it('should reset theme to preset', () => {
      const { updateTheme, resetThemeToPreset } = useChatStore.getState();

      updateTheme({ fontSize: 999 });
      resetThemeToPreset();

      const state = useChatStore.getState();
      expect(state.theme.fontSize).not.toBe(999);
    });
  });

  // ============================================
  // Conversation Tests
  // ============================================
  describe('Conversation', () => {
    it('should set title with sanitization', () => {
      const { setTitle } = useChatStore.getState();

      setTitle('New Title');

      const state = useChatStore.getState();
      expect(state.conversation.title).toBe('New Title');
    });

    it('should set unread count within bounds', () => {
      const { setUnreadCount } = useChatStore.getState();

      setUnreadCount(500);
      expect(useChatStore.getState().conversation.unreadCount).toBe(500);

      setUnreadCount(1500);
      expect(useChatStore.getState().conversation.unreadCount).toBe(999);

      setUnreadCount(-10);
      expect(useChatStore.getState().conversation.unreadCount).toBe(0);
    });
  });

  // ============================================
  // Message Tests
  // ============================================
  describe('Messages', () => {
    it('should add message with generated id', () => {
      const { addMessage } = useChatStore.getState();
      const initialCount = useChatStore.getState().conversation.messages.length;

      addMessage({ role: 'me', authorId: 'me', text: 'New message', datetime: '2024-12-10' });

      const state = useChatStore.getState();
      expect(state.conversation.messages.length).toBe(initialCount + 1);
      expect(state.conversation.messages[state.conversation.messages.length - 1].text).toBe('New message');
      expect(state.conversation.messages[state.conversation.messages.length - 1].id).toContain('msg-');
    });

    it('should remove message by id', () => {
      const { removeMessage } = useChatStore.getState();
      const initialCount = useChatStore.getState().conversation.messages.length;

      removeMessage('1');

      const state = useChatStore.getState();
      expect(state.conversation.messages.length).toBe(initialCount - 1);
      expect(state.conversation.messages.find(m => m.id === '1')).toBeUndefined();
    });

    it('should update message by id', () => {
      const { updateMessage } = useChatStore.getState();

      updateMessage('1', { text: 'Updated text' });

      const state = useChatStore.getState();
      const updatedMsg = state.conversation.messages.find(m => m.id === '1');
      expect(updatedMsg.text).toBe('Updated text');
    });

    it('should reorder messages', () => {
      const { reorderMessages } = useChatStore.getState();

      reorderMessages(0, 1);

      const state = useChatStore.getState();
      expect(state.conversation.messages[0].id).toBe('2');
      expect(state.conversation.messages[1].id).toBe('1');
    });

    it('should duplicate message', () => {
      const { duplicateMessage } = useChatStore.getState();
      const initialCount = useChatStore.getState().conversation.messages.length;

      duplicateMessage('1');

      const state = useChatStore.getState();
      expect(state.conversation.messages.length).toBe(initialCount + 1);
      expect(state.conversation.messages[1].text).toBe('Hello');
      expect(state.conversation.messages[1].id).not.toBe('1');
    });

    it('should not duplicate non-existent message', () => {
      const { duplicateMessage } = useChatStore.getState();
      const initialState = useChatStore.getState();

      duplicateMessage('non-existent');

      expect(useChatStore.getState().conversation.messages.length).toBe(initialState.conversation.messages.length);
    });

    it('should insert message at specific index', () => {
      const { insertMessageAt } = useChatStore.getState();

      insertMessageAt(1, { role: 'me', authorId: 'me', text: 'Inserted', datetime: '2024-12-10' });

      const state = useChatStore.getState();
      expect(state.conversation.messages[1].text).toBe('Inserted');
    });

    it('should add date divider', () => {
      const { addDateDivider } = useChatStore.getState();
      const initialCount = useChatStore.getState().conversation.messages.length;

      addDateDivider('2024년 12월 25일');

      const state = useChatStore.getState();
      expect(state.conversation.messages.length).toBe(initialCount + 1);
      const lastMsg = state.conversation.messages[state.conversation.messages.length - 1];
      expect(lastMsg.type).toBe('dateDivider');
      expect(lastMsg.text).toBe('2024년 12월 25일');
    });

    it('should add date divider with default date', () => {
      const { addDateDivider } = useChatStore.getState();

      addDateDivider();

      const state = useChatStore.getState();
      const lastMsg = state.conversation.messages[state.conversation.messages.length - 1];
      expect(lastMsg.type).toBe('dateDivider');
      expect(lastMsg.text).toBeDefined();
    });

    it('should insert date divider at specific index', () => {
      const { insertDateDividerAt } = useChatStore.getState();

      insertDateDividerAt(1, '2024년 12월 25일');

      const state = useChatStore.getState();
      expect(state.conversation.messages[1].type).toBe('dateDivider');
    });

    it('should move message up', () => {
      const { moveMessageUp } = useChatStore.getState();

      moveMessageUp('2');

      const state = useChatStore.getState();
      expect(state.conversation.messages[0].id).toBe('2');
      expect(state.conversation.messages[1].id).toBe('1');
    });

    it('should not move first message up', () => {
      const { moveMessageUp } = useChatStore.getState();
      const initialOrder = useChatStore.getState().conversation.messages.map(m => m.id);

      moveMessageUp('1');

      const newOrder = useChatStore.getState().conversation.messages.map(m => m.id);
      expect(newOrder).toEqual(initialOrder);
    });

    it('should move message down', () => {
      const { moveMessageDown } = useChatStore.getState();

      moveMessageDown('1');

      const state = useChatStore.getState();
      expect(state.conversation.messages[0].id).toBe('2');
      expect(state.conversation.messages[1].id).toBe('1');
    });

    it('should not move last message down', () => {
      const { moveMessageDown } = useChatStore.getState();
      const initialOrder = useChatStore.getState().conversation.messages.map(m => m.id);

      moveMessageDown('2');

      const newOrder = useChatStore.getState().conversation.messages.map(m => m.id);
      expect(newOrder).toEqual(initialOrder);
    });
  });

  // ============================================
  // Author Tests
  // ============================================
  describe('Authors', () => {
    it('should update author info', () => {
      const { updateAuthor } = useChatStore.getState();

      updateAuthor('me', { name: 'John' });

      const state = useChatStore.getState();
      const author = state.conversation.authors.find(a => a.id === 'me');
      expect(author.name).toBe('John');
    });

    it('should add new author', () => {
      const { addAuthor } = useChatStore.getState();
      const initialCount = useChatStore.getState().conversation.authors.length;

      addAuthor();

      const state = useChatStore.getState();
      expect(state.conversation.authors.length).toBe(initialCount + 1);
    });

    it('should not add more than 10 authors', () => {
      const { addAuthor } = useChatStore.getState();

      // Add authors until we have 10
      for (let i = 0; i < 10; i++) {
        addAuthor();
      }

      const countBefore = useChatStore.getState().conversation.authors.length;
      addAuthor();
      const countAfter = useChatStore.getState().conversation.authors.length;

      expect(countAfter).toBe(countBefore);
      expect(countAfter).toBeLessThanOrEqual(10);
    });

    it('should remove author and reassign messages', () => {
      const { removeAuthor, addMessage } = useChatStore.getState();

      // Add a message from 'other'
      addMessage({ role: 'other', authorId: 'other', text: 'Test', datetime: '2024-12-10' });

      removeAuthor('other');

      const state = useChatStore.getState();
      expect(state.conversation.authors.find(a => a.id === 'other')).toBeUndefined();
      // Messages from removed author should be reassigned to 'me'
      const reassignedMessages = state.conversation.messages.filter(m => m.authorId === 'me');
      expect(reassignedMessages.length).toBeGreaterThan(0);
    });

    it('should not remove "me" author', () => {
      const { removeAuthor } = useChatStore.getState();

      removeAuthor('me');

      const state = useChatStore.getState();
      expect(state.conversation.authors.find(a => a.id === 'me')).toBeDefined();
    });

    it('should get author by id', () => {
      const { getAuthor } = useChatStore.getState();

      const author = getAuthor('me');

      expect(author).toBeDefined();
      expect(author.id).toBe('me');
    });
  });

  // ============================================
  // StatusBar Tests
  // ============================================
  describe('StatusBar', () => {
    it('should update status bar', () => {
      const { updateStatusBar } = useChatStore.getState();

      updateStatusBar({ time: '14:00', battery: 50 });

      const state = useChatStore.getState();
      expect(state.statusBar.time).toBe('14:00');
      expect(state.statusBar.battery).toBe(50);
      expect(state.statusBar.isWifi).toBe(true); // unchanged
    });
  });

  // ============================================
  // UI State Tests
  // ============================================
  describe('UI State', () => {
    it('should select message', () => {
      const { selectMessage } = useChatStore.getState();

      selectMessage('1');

      const state = useChatStore.getState();
      expect(state.ui.selectedMessageId).toBe('1');
    });

    it('should set exporting state', () => {
      const { setExporting } = useChatStore.getState();

      setExporting(true);
      expect(useChatStore.getState().ui.isExporting).toBe(true);

      setExporting(false);
      expect(useChatStore.getState().ui.isExporting).toBe(false);
    });
  });

  // ============================================
  // Sequence Rendering Tests
  // ============================================
  describe('Sequence Rendering', () => {
    it('should start sequence rendering', () => {
      const { startSequenceRendering } = useChatStore.getState();

      startSequenceRendering();

      const state = useChatStore.getState();
      expect(state.sequence.isRendering).toBe(true);
      expect(state.sequence.progress).toBe(0);
    });

    it('should set sequence progress', () => {
      const { setSequenceProgress } = useChatStore.getState();

      setSequenceProgress(50);

      const state = useChatStore.getState();
      expect(state.sequence.progress).toBe(50);
    });

    it('should set visible message count', () => {
      const { setVisibleMessageCount } = useChatStore.getState();

      setVisibleMessageCount(5);

      const state = useChatStore.getState();
      expect(state.sequence.visibleMessageCount).toBe(5);
    });

    it('should stop sequence rendering', () => {
      const { startSequenceRendering, setSequenceProgress, stopSequenceRendering } = useChatStore.getState();

      startSequenceRendering();
      setSequenceProgress(50);
      stopSequenceRendering();

      const state = useChatStore.getState();
      expect(state.sequence.isRendering).toBe(false);
      expect(state.sequence.progress).toBe(0);
      expect(state.sequence.visibleMessageCount).toBe(null);
    });
  });

  // ============================================
  // Project Management Tests
  // ============================================
  describe('Project Management', () => {
    it('should load projects', () => {
      const { loadProjects } = useChatStore.getState();

      const projects = loadProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('should create new project', () => {
      const { createNewProject } = useChatStore.getState();

      const project = createNewProject('Test Project');

      expect(project).toBeDefined();
      const state = useChatStore.getState();
      expect(state.currentProjectId).toBeDefined();
      expect(state.conversation.messages).toHaveLength(0);
    });

    it('should get project data', () => {
      const { createNewProject, getProjectData } = useChatStore.getState();

      createNewProject('Test');
      const projectData = getProjectData();

      expect(projectData).toBeDefined();
      expect(projectData.conversation).toBeDefined();
      expect(projectData.theme).toBeDefined();
    });

    it('should return null when no current project', () => {
      useChatStore.setState({ currentProjectId: null });
      const { getProjectData } = useChatStore.getState();

      const projectData = getProjectData();

      expect(projectData).toBe(null);
    });
  });
});
