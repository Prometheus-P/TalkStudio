/**
 * MobileLayout Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileLayout from './MobileLayout';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock child components
vi.mock('../preview/ChatPreview', () => ({
  default: () => <div data-testid="chat-preview">ChatPreview</div>,
}));

vi.mock('../editor/LeftPanel', () => ({
  default: () => <div data-testid="left-panel">LeftPanel</div>,
}));

vi.mock('./Sidebar', () => ({
  default: ({ horizontal }) => (
    <div data-testid="sidebar" data-horizontal={horizontal}>
      Sidebar
    </div>
  ),
}));

vi.mock('./MobileGuide', () => ({
  default: ({ onComplete, onSkip }) => (
    <div data-testid="mobile-guide">
      <button onClick={onComplete} data-testid="guide-complete">
        Complete
      </button>
      <button onClick={onSkip} data-testid="guide-skip">
        Skip
      </button>
    </div>
  ),
}));

vi.mock('./MobileFooter', () => ({
  default: ({ activeView, onViewChange }) => (
    <nav data-testid="mobile-footer">
      <button
        onClick={() => onViewChange('preview')}
        data-active={activeView === 'preview'}
      >
        미리보기
      </button>
      <button
        onClick={() => onViewChange('editor')}
        data-active={activeView === 'editor'}
      >
        편집하기
      </button>
      <button>저장</button>
      <button>더보기</button>
    </nav>
  ),
}));

vi.mock('../../store/useChatStore', () => ({
  default: (selector) => {
    const state = {
      conversation: { platformSkin: 'kakao' },
    };
    return selector(state);
  },
}));

vi.mock('../../hooks/useSwipe', () => ({
  useSwipe: () => ({
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
    isSwiping: false,
  }),
}));

describe('MobileLayout', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('First Visit (Guide)', () => {
    it('should show guide on first visit', () => {
      render(<MobileLayout />);
      expect(screen.getByTestId('mobile-guide')).toBeInTheDocument();
    });

    it('should hide guide after completion', () => {
      render(<MobileLayout />);
      fireEvent.click(screen.getByTestId('guide-complete'));

      expect(screen.queryByTestId('mobile-guide')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
    });

    it('should hide guide after skip', () => {
      render(<MobileLayout />);
      fireEvent.click(screen.getByTestId('guide-skip'));

      expect(screen.queryByTestId('mobile-guide')).not.toBeInTheDocument();
    });
  });

  describe('Returning Visit (No Guide)', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('true');
    });

    it('should not show guide on returning visit', () => {
      render(<MobileLayout />);
      expect(screen.queryByTestId('mobile-guide')).not.toBeInTheDocument();
    });

    it('should show preview by default', () => {
      render(<MobileLayout />);
      expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
    });

    it('should render header with platform', () => {
      render(<MobileLayout />);
      expect(screen.getByText('TalkStudio')).toBeInTheDocument();
      expect(screen.getByText('kakao')).toBeInTheDocument();
    });

    it('should show both views (with CSS transitions)', () => {
      render(<MobileLayout />);
      // Both views are rendered but positioned with CSS
      expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render tab buttons', () => {
      render(<MobileLayout />);
      expect(screen.getByText('미리보기')).toBeInTheDocument();
      expect(screen.getByText('편집하기')).toBeInTheDocument();
    });
  });
});
