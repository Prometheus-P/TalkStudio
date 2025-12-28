/**
 * MessageBubble Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';

describe('MessageBubble', () => {
  const mockAuthor = {
    id: 'me',
    name: '테스트',
    avatarUrl: 'https://example.com/avatar.png',
  };

  const mockMessage = {
    id: '1',
    role: 'me',
    text: '안녕하세요',
    datetime: '2024-12-10 오후 3:30',
  };

  const mockTheme = {
    id: 'kakao',
    fontFamily: 'Apple SD Gothic Neo',
    bubble: {
      me: {
        bg: '#FEE500',
        textColor: '#000000',
        radius: '20px',
      },
      other: {
        bg: '#FFFFFF',
        textColor: '#000000',
        radius: '20px',
      },
      system: {
        bg: '#E5E5EA',
        textColor: '#666666',
        radius: '12px',
      },
    },
  };

  it('should render message text', () => {
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={mockTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render system message', () => {
    const systemMessage = {
      ...mockMessage,
      role: 'system',
      text: '시스템 메시지입니다',
    };
    render(
      <MessageBubble
        message={systemMessage}
        author={mockAuthor}
        theme={mockTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('시스템 메시지입니다')).toBeInTheDocument();
  });

  it('should render with discord theme', () => {
    const discordTheme = {
      ...mockTheme,
      id: 'discord',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={discordTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render with telegram theme', () => {
    const telegramTheme = {
      ...mockTheme,
      id: 'telegram',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={telegramTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render with instagram theme', () => {
    const instaTheme = {
      ...mockTheme,
      id: 'insta',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={instaTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render with discord-shorts theme', () => {
    const discordShortsTheme = {
      ...mockTheme,
      id: 'discord-shorts',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={discordShortsTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render other role message', () => {
    const otherMessage = {
      ...mockMessage,
      role: 'other',
    };
    const otherAuthor = {
      id: 'other',
      name: '상대방',
      avatarUrl: 'https://example.com/other.png',
    };
    render(
      <MessageBubble
        message={otherMessage}
        author={otherAuthor}
        theme={mockTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should handle legacy time format', () => {
    const legacyMessage = {
      id: '1',
      role: 'me',
      text: '레거시 메시지',
      time: '오후 3:30',
    };
    render(
      <MessageBubble
        message={legacyMessage}
        author={mockAuthor}
        theme={mockTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('레거시 메시지')).toBeInTheDocument();
  });

  it('should render with telegram-shorts theme', () => {
    const telegramShortsTheme = {
      ...mockTheme,
      id: 'telegram-shorts',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={telegramShortsTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render with kakao-shorts theme', () => {
    const kakaoShortsTheme = {
      ...mockTheme,
      id: 'kakao-shorts',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={kakaoShortsTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('should render with insta-shorts theme', () => {
    const instaShortsTheme = {
      ...mockTheme,
      id: 'insta-shorts',
    };
    render(
      <MessageBubble
        message={mockMessage}
        author={mockAuthor}
        theme={instaShortsTheme}
        isFirstInGroup={true}
        isLastInGroup={true}
      />
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });
});
