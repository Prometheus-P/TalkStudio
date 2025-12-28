/**
 * Sidebar Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

// Create mock functions
const mockSetPlatform = vi.fn();
let mockPlatformSkin = 'kakao';

// Mock useChatStore
vi.mock('../../store/useChatStore', () => ({
  default: vi.fn((selector) => {
    const state = {
      conversation: { platformSkin: mockPlatformSkin },
      setPlatform: mockSetPlatform,
    };
    return selector ? selector(state) : state;
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatformSkin = 'kakao';
  });

  it('should render platform buttons', { timeout: 15000 }, () => {
    render(<Sidebar />);

    // Check if platform buttons exist
    expect(screen.getByRole('button', { name: /카카오톡/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /디스코드/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /텔레그램/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /인스타그램/i })).toBeInTheDocument();
  });

  it('should render logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should call setPlatform when button clicked', { timeout: 10000 }, () => {
    render(<Sidebar />);

    const discordButton = screen.getByRole('button', { name: /디스코드/i });
    fireEvent.click(discordButton);

    expect(mockSetPlatform).toHaveBeenCalledWith('discord');
  });

  it('should call setPlatform with correct platform id', { timeout: 10000 }, () => {
    render(<Sidebar />);

    const telegramButton = screen.getByRole('button', { name: /텔레그램/i });
    fireEvent.click(telegramButton);
    expect(mockSetPlatform).toHaveBeenCalledWith('telegram');

    const instaButton = screen.getByRole('button', { name: /인스타그램/i });
    fireEvent.click(instaButton);
    expect(mockSetPlatform).toHaveBeenCalledWith('insta');
  });

  it('should apply active styles to selected platform', { timeout: 10000 }, () => {
    render(<Sidebar />);

    const kakaoButton = screen.getByRole('button', { name: /카카오톡/i });
    // Active button has scale(1.1) transform
    expect(kakaoButton.style.transform).toBe('scale(1.1)');
  });

  it('should apply non-active styles to other platforms', { timeout: 10000 }, () => {
    render(<Sidebar />);

    const discordButton = screen.getByRole('button', { name: /디스코드/i });
    // Non-active button has scale(1) transform
    expect(discordButton.style.transform).toBe('scale(1)');
  });
});
