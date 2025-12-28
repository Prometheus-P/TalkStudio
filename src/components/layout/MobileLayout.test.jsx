/**
 * MobileLayout Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileLayout from './MobileLayout';

// Mock child components
vi.mock('../preview/ChatPreview', () => ({
  default: () => <div data-testid="chat-preview">ChatPreview</div>,
}));

vi.mock('../editor/LeftPanel', () => ({
  default: () => <div data-testid="left-panel">LeftPanel</div>,
}));

vi.mock('./Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./BottomTabBar', () => ({
  default: ({ activeView, setActiveView }) => (
    <div data-testid="bottom-tab-bar">
      <button onClick={() => setActiveView('preview')} data-testid="preview-tab">
        preview {activeView === 'preview' ? '(active)' : ''}
      </button>
      <button onClick={() => setActiveView('editor')} data-testid="editor-tab">
        editor {activeView === 'editor' ? '(active)' : ''}
      </button>
    </div>
  ),
}));

describe('MobileLayout', () => {
  it('should render bottom tab bar', () => {
    render(<MobileLayout />);
    expect(screen.getByTestId('bottom-tab-bar')).toBeInTheDocument();
  });

  it('should show preview by default', () => {
    render(<MobileLayout />);
    expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
  });

  it('should not show editor components by default', () => {
    render(<MobileLayout />);
    expect(screen.queryByTestId('left-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('should switch to editor view when editor tab clicked', () => {
    render(<MobileLayout />);
    fireEvent.click(screen.getByTestId('editor-tab'));

    expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-preview')).not.toBeInTheDocument();
  });

  it('should switch back to preview view', () => {
    render(<MobileLayout />);

    // Switch to editor
    fireEvent.click(screen.getByTestId('editor-tab'));
    expect(screen.getByTestId('left-panel')).toBeInTheDocument();

    // Switch back to preview
    fireEvent.click(screen.getByTestId('preview-tab'));
    expect(screen.getByTestId('chat-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('left-panel')).not.toBeInTheDocument();
  });
});
