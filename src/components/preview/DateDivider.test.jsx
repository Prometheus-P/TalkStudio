/**
 * DateDivider Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateDivider from './DateDivider';

describe('DateDivider', () => {
  const testDate = '2024년 12월 10일';

  it('should render date text', () => {
    render(<DateDivider date={testDate} themeId="kakao" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should render with kakao theme', () => {
    render(<DateDivider date={testDate} themeId="kakao" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should render with discord theme', () => {
    render(<DateDivider date={testDate} themeId="discord" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should render with telegram theme', () => {
    render(<DateDivider date={testDate} themeId="telegram" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should render with insta theme', () => {
    render(<DateDivider date={testDate} themeId="insta" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should use default theme for unknown themeId', () => {
    render(<DateDivider date={testDate} themeId="unknown" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle shorts theme variants', () => {
    render(<DateDivider date={testDate} themeId="kakao-shorts" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle discord-shorts theme', () => {
    render(<DateDivider date={testDate} themeId="discord-shorts" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle telegram-shorts theme', () => {
    render(<DateDivider date={testDate} themeId="telegram-shorts" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle insta-shorts theme', () => {
    render(<DateDivider date={testDate} themeId="insta-shorts" />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle null themeId', () => {
    render(<DateDivider date={testDate} themeId={null} />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should handle undefined themeId', () => {
    render(<DateDivider date={testDate} themeId={undefined} />);
    expect(screen.getByText(testDate)).toBeInTheDocument();
  });

  it('should render Korean date format', () => {
    const koreanDate = '2024년 1월 1일 월요일';
    render(<DateDivider date={koreanDate} themeId="kakao" />);
    expect(screen.getByText(koreanDate)).toBeInTheDocument();
  });

  it('should render English date format', () => {
    const englishDate = 'December 10, 2024';
    render(<DateDivider date={englishDate} themeId="discord" />);
    expect(screen.getByText(englishDate)).toBeInTheDocument();
  });
});
