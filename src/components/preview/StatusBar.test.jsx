/**
 * StatusBar Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from './StatusBar';

describe('StatusBar', () => {
  const mockStatusBar = {
    time: '9:41',
    battery: 85,
    isWifi: true,
  };

  const mockTheme = {
    id: 'kakao',
    headerBg: '#FABE00',
  };

  it('should render time', () => {
    render(<StatusBar statusBar={mockStatusBar} theme={mockTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render wifi icon when isWifi is true', () => {
    render(<StatusBar statusBar={mockStatusBar} theme={mockTheme} />);
    // Should render signal, wifi, and battery icons
    const container = screen.getByText('9:41').parentElement.parentElement;
    expect(container.querySelectorAll('svg').length).toBe(3);
  });

  it('should not render wifi icon when isWifi is false', () => {
    const noWifiStatusBar = { ...mockStatusBar, isWifi: false };
    render(<StatusBar statusBar={noWifiStatusBar} theme={mockTheme} />);
    // Should render signal and battery only
    const container = screen.getByText('9:41').parentElement.parentElement;
    expect(container.querySelectorAll('svg').length).toBe(2);
  });

  it('should render with kakao theme', () => {
    render(<StatusBar statusBar={mockStatusBar} theme={mockTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render battery icon for high battery', () => {
    render(<StatusBar statusBar={mockStatusBar} theme={mockTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render battery icon for medium battery', () => {
    const mediumBattery = { ...mockStatusBar, battery: 50 };
    render(<StatusBar statusBar={mediumBattery} theme={mockTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render battery icon for low battery', () => {
    const lowBattery = { ...mockStatusBar, battery: 15 };
    render(<StatusBar statusBar={lowBattery} theme={mockTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render with discord theme', () => {
    const discordTheme = { id: 'discord', headerBg: '#36393F' };
    render(<StatusBar statusBar={mockStatusBar} theme={discordTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render with telegram theme', () => {
    const telegramTheme = { id: 'telegram', headerBg: '#517FA5' };
    render(<StatusBar statusBar={mockStatusBar} theme={telegramTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render with insta theme', () => {
    const instaTheme = { id: 'insta', headerBg: '#FAFAFA' };
    render(<StatusBar statusBar={mockStatusBar} theme={instaTheme} />);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('should render correct number of icons with wifi enabled', () => {
    render(<StatusBar statusBar={mockStatusBar} theme={mockTheme} />);
    const container = screen.getByText('9:41').parentElement.parentElement;
    // Signal + Wifi + Battery = 3 icons
    expect(container.querySelectorAll('svg').length).toBe(3);
  });

  it('should render correct time value', () => {
    const differentTime = { ...mockStatusBar, time: '12:30' };
    render(<StatusBar statusBar={differentTime} theme={mockTheme} />);
    expect(screen.getByText('12:30')).toBeInTheDocument();
  });
});
