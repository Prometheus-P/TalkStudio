/**
 * App.jsx Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock stores and hooks
const mockSaveCurrentProject = vi.fn();
let mockCurrentProjectId = null;
let mockIsMobile = false;

vi.mock('./store/useChatStore', () => ({
  default: vi.fn((selector) => {
    const state = {
      conversation: {
        platformSkin: 'kakao',
        title: 'Test Project',
        messages: [],
        profiles: { me: {}, other: {} },
      },
      currentProjectId: mockCurrentProjectId,
      theme: {},
      statusBar: { time: '12:00', battery: 100 },
      saveCurrentProject: mockSaveCurrentProject,
    };
    return selector(state);
  }),
}));

vi.mock('./hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    isSaving: false,
    lastSaved: null,
    error: null,
  })),
}));

vi.mock('./hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => mockIsMobile),
}));

vi.mock('./components/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./components/editor/LeftPanel', () => ({
  default: () => <div data-testid="left-panel">LeftPanel</div>,
}));

vi.mock('./components/preview/ChatPreview', () => ({
  default: () => <div data-testid="chat-preview">ChatPreview</div>,
}));

vi.mock('./components/editor/ProjectListModal', () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="project-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('./components/layout/MobileLayout', () => ({
  default: () => <div data-testid="mobile-layout">MobileLayout</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentProjectId = null;
    mockIsMobile = false;
  });

  describe('Desktop Layout', () => {
    it('should render headline', () => {
      render(<App />);
      const headline = screen.getByRole('heading', { name: /TalkStudio/i });
      expect(headline).toBeInTheDocument();
    });

    it('should render BETA badge', () => {
      render(<App />);
      expect(screen.getByText('BETA')).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(<App />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render left panel', () => {
      render(<App />);
      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    });

    it('should render chat preview', () => {
      render(<App />);
      expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
    });

    it('should display platform skin', () => {
      render(<App />);
      const platformBadges = screen.getAllByText('kakao');
      expect(platformBadges.length).toBeGreaterThan(0);
    });

    it('should render preview label', () => {
      render(<App />);
      expect(screen.getByText('미리보기')).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<App />);
      expect(screen.getByText('메시지를 편집하고 PNG로 저장하세요')).toBeInTheDocument();
    });
  });

  describe('Project Modal', () => {
    it('should open project modal when button clicked', () => {
      render(<App />);
      const projectButton = screen.getByTitle('프로젝트 관리');
      fireEvent.click(projectButton);
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    });

    it('should close project modal', () => {
      render(<App />);
      const projectButton = screen.getByTitle('프로젝트 관리');
      fireEvent.click(projectButton);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
    });
  });

  describe('Save Button', () => {
    it('should render save button', () => {
      render(<App />);
      expect(screen.getByText('저장')).toBeInTheDocument();
    });

    it('should call saveCurrentProject on click when no project', () => {
      mockSaveCurrentProject.mockReturnValue({ success: true });
      render(<App />);

      const saveButton = screen.getByText('저장').closest('button');
      fireEvent.click(saveButton);

      expect(mockSaveCurrentProject).toHaveBeenCalled();
    });

    it('should show saved state after successful save', async () => {
      mockSaveCurrentProject.mockReturnValue({ success: true });
      render(<App />);

      const saveButton = screen.getByText('저장').closest('button');
      fireEvent.click(saveButton);

      expect(screen.getByText('저장됨')).toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    it('should render mobile layout on mobile', () => {
      mockIsMobile = true;
      render(<App />);
      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });

    it('should not render desktop components on mobile', () => {
      mockIsMobile = true;
      render(<App />);
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('left-panel')).not.toBeInTheDocument();
    });
  });
});
