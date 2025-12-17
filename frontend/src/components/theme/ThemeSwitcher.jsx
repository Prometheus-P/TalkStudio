/**
 * ThemeSwitcher Component
 * Allows users to switch between different chat themes
 */

import { useState, useCallback } from 'react';

const THEMES = [
  {
    id: 'kakao',
    name: '카카오톡',
    nameEn: 'KakaoTalk',
    icon: '💬',
    colors: ['#fee500', '#b2c7d9'],
    description: '한국의 대표 메신저',
  },
  {
    id: 'instagram',
    name: '인스타그램',
    nameEn: 'Instagram',
    icon: '📸',
    colors: ['#833ab4', '#fd1d1d', '#fcb045'],
    description: 'Instagram DM 스타일',
  },
  {
    id: 'telegram',
    name: '텔레그램',
    nameEn: 'Telegram',
    icon: '✈️',
    colors: ['#2b5278', '#0e1621'],
    description: '다크 모드 메신저',
  },
  {
    id: 'discord',
    name: '디스코드',
    nameEn: 'Discord',
    icon: '🎮',
    colors: ['#5865f2', '#313338'],
    description: '게이머를 위한 채팅',
  },
  {
    id: 'imessage',
    name: '아이메시지',
    nameEn: 'iMessage',
    icon: '🍎',
    colors: ['#007aff', '#ffffff'],
    description: 'Apple iOS 메시지',
  },
];

/**
 * Theme button with gradient preview
 */
function ThemeButton({ theme, isActive, onClick }) {
  const gradientStyle = theme.colors.length > 2
    ? `linear-gradient(135deg, ${theme.colors.join(', ')})`
    : `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1] || theme.colors[0]})`;

  return (
    <button
      type="button"
      onClick={() => onClick(theme.id)}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-xl
        transition-all duration-200 ease-out
        ${isActive
          ? 'bg-white shadow-lg scale-105 ring-2 ring-blue-500'
          : 'bg-gray-50 hover:bg-white hover:shadow-md hover:scale-102'
        }
      `}
      aria-pressed={isActive}
      aria-label={`${theme.nameEn} 테마 선택`}
    >
      {/* Theme color preview */}
      <div
        className="w-10 h-10 rounded-full shadow-inner"
        style={{ background: gradientStyle }}
      />

      {/* Theme icon */}
      <span className="text-xl" role="img" aria-hidden="true">
        {theme.icon}
      </span>

      {/* Theme name */}
      <span className="text-xs font-medium text-gray-700">
        {theme.name}
      </span>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

/**
 * Horizontal theme switcher bar
 */
export function ThemeSwitcherBar({ currentTheme, onThemeChange, className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto py-2 ${className}`}>
      {THEMES.map((theme) => (
        <ThemeButton
          key={theme.id}
          theme={theme}
          isActive={currentTheme === theme.id}
          onClick={onThemeChange}
        />
      ))}
    </div>
  );
}

/**
 * Dropdown theme selector
 */
export function ThemeDropdown({ currentTheme, onThemeChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  const handleSelect = useCallback((themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  }, [onThemeChange]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{activeTheme.icon}</span>
        <span className="font-medium">{activeTheme.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <ul
            className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            role="listbox"
            aria-label="테마 선택"
          >
            {THEMES.map((theme) => (
              <li key={theme.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(theme.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-colors
                    ${currentTheme === theme.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                    }
                  `}
                  role="option"
                  aria-selected={currentTheme === theme.id}
                >
                  <span className="text-xl">{theme.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                  {currentTheme === theme.id && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Main ThemeSwitcher component with both variants
 */
export default function ThemeSwitcher({
  currentTheme = 'kakao',
  onThemeChange,
  variant = 'bar', // 'bar' | 'dropdown'
  className = '',
}) {
  const handleThemeChange = useCallback((themeId) => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', themeId);

    // Callback to parent
    if (onThemeChange) {
      onThemeChange(themeId);
    }
  }, [onThemeChange]);

  if (variant === 'dropdown') {
    return (
      <ThemeDropdown
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        className={className}
      />
    );
  }

  return (
    <ThemeSwitcherBar
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      className={className}
    />
  );
}

// Export theme list for use in other components
export { THEMES };
