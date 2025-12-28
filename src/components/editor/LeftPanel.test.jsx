/**
 * LeftPanel Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeftPanel from './LeftPanel';

// Mock child components
vi.mock('./MessageEditor', () => ({
  default: () => <div data-testid="message-editor">MessageEditor</div>,
}));

vi.mock('./ProfileEditor', () => ({
  default: () => <div data-testid="profile-editor">ProfileEditor</div>,
}));

vi.mock('./ThemeControls', () => ({
  default: () => <div data-testid="theme-controls">ThemeControls</div>,
}));

vi.mock('./UnifiedExportButton', () => ({
  default: () => <button data-testid="unified-export-button">저장하기</button>,
}));

describe('LeftPanel', () => {
  describe('Tabs', () => {
    it('should render all three tabs', () => {
      render(<LeftPanel />);
      expect(screen.getByText('메시지')).toBeInTheDocument();
      expect(screen.getByText('프로필')).toBeInTheDocument();
      expect(screen.getByText('스타일')).toBeInTheDocument();
    });

    it('should show messages tab by default', () => {
      render(<LeftPanel />);
      expect(screen.getByTestId('message-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-editor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-controls')).not.toBeInTheDocument();
    });

    it('should switch to profile tab when clicked', () => {
      render(<LeftPanel />);
      fireEvent.click(screen.getByText('프로필'));

      expect(screen.getByTestId('profile-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('message-editor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-controls')).not.toBeInTheDocument();
    });

    it('should switch to theme tab when clicked', () => {
      render(<LeftPanel />);
      fireEvent.click(screen.getByText('스타일'));

      expect(screen.getByTestId('theme-controls')).toBeInTheDocument();
      expect(screen.queryByTestId('message-editor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('profile-editor')).not.toBeInTheDocument();
    });

    it('should switch back to messages tab', () => {
      render(<LeftPanel />);

      // Go to profile first
      fireEvent.click(screen.getByText('프로필'));
      expect(screen.getByTestId('profile-editor')).toBeInTheDocument();

      // Switch back to messages
      fireEvent.click(screen.getByText('메시지'));
      expect(screen.getByTestId('message-editor')).toBeInTheDocument();
    });
  });

  describe('Export Button', () => {
    it('should render unified export button', () => {
      render(<LeftPanel />);
      expect(screen.getByTestId('unified-export-button')).toBeInTheDocument();
    });

    it('should display save text', () => {
      render(<LeftPanel />);
      expect(screen.getByText('저장하기')).toBeInTheDocument();
    });
  });

  describe('Tab Styling', () => {
    it('should have proper tab count', () => {
      render(<LeftPanel />);
      const tabs = screen.getAllByRole('button').filter((btn) =>
        ['메시지', '프로필', '스타일'].includes(btn.textContent)
      );
      expect(tabs.length).toBe(3);
    });
  });
});
