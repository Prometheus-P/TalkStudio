/**
 * BottomTabBar Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomTabBar from './BottomTabBar';

describe('BottomTabBar', () => {
  const mockSetActiveView = vi.fn();

  it('should render preview tab', () => {
    render(<BottomTabBar activeView="preview" setActiveView={mockSetActiveView} />);
    expect(screen.getByText('preview')).toBeInTheDocument();
  });

  it('should render editor tab', () => {
    render(<BottomTabBar activeView="preview" setActiveView={mockSetActiveView} />);
    expect(screen.getByText('editor')).toBeInTheDocument();
  });

  it('should highlight active preview tab', () => {
    render(<BottomTabBar activeView="preview" setActiveView={mockSetActiveView} />);
    const previewButton = screen.getByText('preview').closest('button');
    expect(previewButton).toHaveClass('text-violet-600');
  });

  it('should highlight active editor tab', () => {
    render(<BottomTabBar activeView="editor" setActiveView={mockSetActiveView} />);
    const editorButton = screen.getByText('editor').closest('button');
    expect(editorButton).toHaveClass('text-violet-600');
  });

  it('should call setActiveView when preview clicked', () => {
    render(<BottomTabBar activeView="editor" setActiveView={mockSetActiveView} />);
    fireEvent.click(screen.getByText('preview').closest('button'));
    expect(mockSetActiveView).toHaveBeenCalledWith('preview');
  });

  it('should call setActiveView when editor clicked', () => {
    render(<BottomTabBar activeView="preview" setActiveView={mockSetActiveView} />);
    fireEvent.click(screen.getByText('editor').closest('button'));
    expect(mockSetActiveView).toHaveBeenCalledWith('editor');
  });

  it('should show inactive state for non-active tab', () => {
    render(<BottomTabBar activeView="preview" setActiveView={mockSetActiveView} />);
    const editorButton = screen.getByText('editor').closest('button');
    expect(editorButton).toHaveClass('text-gray-600');
    expect(editorButton).not.toHaveClass('text-violet-600');
  });
});
