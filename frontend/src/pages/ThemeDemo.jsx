/**
 * Theme Demo Page
 * Demonstrates the theme engine with live switching
 */

import { useState, useEffect, useCallback } from 'react';
import ThemeSwitcher from '../components/theme/ThemeSwitcher';
import ChatPreview from '../components/theme/ChatPreview';

// Sample messages for demo
const DEMO_MESSAGES = [
  {
    id: '1',
    speaker: 'other',
    text: '오늘 저녁 뭐 먹을까?',
    type: 'text',
    timestamp: new Date('2024-01-15T18:30:00'),
    read: true,
  },
  {
    id: '2',
    speaker: 'me',
    text: '음... 치킨 어때?',
    type: 'text',
    timestamp: new Date('2024-01-15T18:31:00'),
    read: true,
  },
  {
    id: '3',
    speaker: 'other',
    text: '좋아! 어디서 시킬까?',
    type: 'text',
    timestamp: new Date('2024-01-15T18:31:30'),
    read: true,
  },
  {
    id: '4',
    speaker: 'me',
    text: '교촌 어때? 허니콤보가 최고지 ㅋㅋ',
    type: 'text',
    timestamp: new Date('2024-01-15T18:32:00'),
    read: true,
  },
  {
    id: '5',
    speaker: 'other',
    text: '🍗',
    type: 'emoji',
    timestamp: new Date('2024-01-15T18:32:15'),
    read: true,
  },
  {
    id: '6',
    speaker: 'other',
    text: '완전 동의! 콜이야',
    type: 'text',
    timestamp: new Date('2024-01-15T18:32:30'),
    read: true,
  },
  {
    id: '7',
    speaker: 'system',
    text: '주문이 완료되었습니다.',
    type: 'system',
    timestamp: new Date('2024-01-15T18:35:00'),
  },
  {
    id: '8',
    speaker: 'me',
    text: '시켰어! 40분 정도 걸린대',
    type: 'text',
    timestamp: new Date('2024-01-15T18:36:00'),
    read: false,
  },
];

const DEMO_PROFILES = {
  me: {
    name: '나',
    avatar: null,
  },
  other: {
    name: '지수',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jisoo&backgroundColor=ffdfbf',
  },
};

export default function ThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState('kakao');
  const [messages, setMessages] = useState(DEMO_MESSAGES);

  // Apply theme to document on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);

    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [currentTheme]);

  const handleThemeChange = useCallback((themeId) => {
    setCurrentTheme(themeId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            TalkStudio Theme Engine
          </h1>
          <p className="text-gray-600">
            CSS Variables를 활용한 멀티 플랫폼 테마 시스템
          </p>
        </header>

        {/* Theme Switcher */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">테마 선택</h2>
          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            variant="bar"
          />
        </section>

        {/* Preview Section */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Phone Preview */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">미리보기</h2>

            {/* iPhone frame */}
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[320px] h-[640px] bg-black rounded-[40px] p-3 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-gray-100 rounded-[32px] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />

                  {/* Chat Preview */}
                  <div data-theme={currentTheme} className="h-full">
                    <ChatPreview
                      messages={messages}
                      profiles={DEMO_PROFILES}
                      statusBar={{ time: '10:30', battery: 85, isWifi: true }}
                      header={{ title: DEMO_PROFILES.other.name }}
                    />
                  </div>
                </div>
              </div>

              {/* Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[40px] pointer-events-none" />
            </div>
          </div>

          {/* CSS Variables Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">현재 테마 CSS 변수</h2>

            <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm overflow-auto max-h-[600px]">
              <pre>{`[data-theme="${currentTheme}"] {
  /* Background */
  --chat-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--chat-bg').trim() || 'inherit'};

  /* My Bubble */
  --bubble-me-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--bubble-me-bg').trim() || 'inherit'};
  --bubble-me-text: ${getComputedStyle(document.documentElement).getPropertyValue('--bubble-me-text').trim() || 'inherit'};
  --bubble-me-radius: ${getComputedStyle(document.documentElement).getPropertyValue('--bubble-me-radius').trim() || 'inherit'};

  /* Other's Bubble */
  --bubble-other-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--bubble-other-bg').trim() || 'inherit'};
  --bubble-other-text: ${getComputedStyle(document.documentElement).getPropertyValue('--bubble-other-text').trim() || 'inherit'};

  /* Typography */
  --font-family: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim() || 'inherit'};
  --name-text: ${getComputedStyle(document.documentElement).getPropertyValue('--name-text').trim() || 'inherit'};
  --time-text: ${getComputedStyle(document.documentElement).getPropertyValue('--time-text').trim() || 'inherit'};

  /* Avatar */
  --avatar-size: ${getComputedStyle(document.documentElement).getPropertyValue('--avatar-size').trim() || 'inherit'};
  --avatar-radius: ${getComputedStyle(document.documentElement).getPropertyValue('--avatar-radius').trim() || 'inherit'};
}`}</pre>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-3 gap-3">
              <ColorSwatch
                label="내 버블"
                varName="--bubble-me-bg"
              />
              <ColorSwatch
                label="상대 버블"
                varName="--bubble-other-bg"
              />
              <ColorSwatch
                label="배경"
                varName="--chat-bg"
              />
            </div>

            {/* Usage Example */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">사용 방법</h3>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                {`<div data-theme="${currentTheme}">`}
                <br />
                {'  <div className="chat-container">'}
                <br />
                {'    <div className="bubble bubble-me">내 메시지</div>'}
                <br />
                {'  </div>'}
                <br />
                {'</div>'}
              </code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Color swatch component
 */
function ColorSwatch({ label, varName }) {
  const [color, setColor] = useState('');

  useEffect(() => {
    const updateColor = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      setColor(value);
    };

    updateColor();

    // Update on theme change
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, [varName]);

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
      <div
        className="w-8 h-8 rounded-lg shadow-inner border border-gray-200"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700 truncate">{label}</div>
        <div className="text-xs text-gray-500 font-mono truncate">{color}</div>
      </div>
    </div>
  );
}
