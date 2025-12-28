/**
 * Sidebar - 플랫폼 선택 사이드바
 * CLAYMORPHISM DESIGN STYLE
 */
import React from 'react';
import { MessageCircle, Send, Instagram, Hash } from 'lucide-react';
import useChatStore from '../../store/useChatStore';

const platforms = [
  {
    id: 'kakao',
    icon: MessageCircle,
    gradient: 'linear-gradient(145deg, #FFE066 0%, #FBBF24 100%)',
    shadowColor: 'rgba(251, 191, 36, 0.5)',
    label: '카카오톡',
  },
  {
    id: 'telegram',
    icon: Send,
    gradient: 'linear-gradient(145deg, #38BDF8 0%, #0EA5E9 100%)',
    shadowColor: 'rgba(14, 165, 233, 0.5)',
    label: '텔레그램',
  },
  {
    id: 'insta',
    icon: Instagram,
    gradient: 'linear-gradient(145deg, #F472B6 0%, #DB2777 50%, #9333EA 100%)',
    shadowColor: 'rgba(219, 39, 119, 0.5)',
    label: '인스타그램',
  },
  {
    id: 'discord',
    icon: Hash,
    gradient: 'linear-gradient(145deg, #818CF8 0%, #6366F1 100%)',
    shadowColor: 'rgba(99, 102, 241, 0.5)',
    label: '디스코드',
  },
];

const Sidebar = ({ horizontal = false }) => {
  const platformSkin = useChatStore((s) => s.conversation.platformSkin);
  const setPlatform = useChatStore((s) => s.setPlatform);

  // 모바일 가로 모드
  if (horizontal) {
    return (
      <nav className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isActive = platformSkin === platform.id;

          return (
            <button
              key={platform.id}
              onClick={() => setPlatform(platform.id)}
              className="flex items-center gap-2 shrink-0"
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                background: isActive
                  ? platform.gradient
                  : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
                boxShadow: isActive
                  ? `0px 4px 0px ${platform.shadowColor}`
                  : '0px 2px 0px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? '#FFFFFF' : '#6B7280',
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isActive ? '#FFFFFF' : '#6B7280',
                }}
              >
                {platform.label}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  // 데스크톱 세로 모드
  return (
    <nav
      className="w-24 flex flex-col items-center py-6 gap-5 shrink-0 m-4 mr-0"
      style={{
        background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
        borderRadius: '32px',
        boxShadow: '0px 8px 0px rgba(91, 33, 182, 0.4), 0px 16px 40px rgba(91, 33, 182, 0.2)',
      }}
    >
      {/* 로고 - Clay Style */}
      <div
        className="w-14 h-14 flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F0E7FF 100%)',
          borderRadius: '20px',
          boxShadow: '0px 6px 0px rgba(91, 33, 182, 0.3)',
        }}
      >
        <span
          className="text-2xl font-black"
          style={{
            background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          T
        </span>
      </div>

      {/* 플랫폼 버튼들 - Clay Buttons */}
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isActive = platformSkin === platform.id;

        return (
          <button
            key={platform.id}
            onClick={() => setPlatform(platform.id)}
            className="relative group"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              background: isActive
                ? platform.gradient
                : 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              boxShadow: isActive
                ? `0px 6px 0px ${platform.shadowColor}`
                : '0px 4px 0px rgba(0, 0, 0, 0.15)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={platform.label}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0px 6px 0px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0px 4px 0px rgba(0, 0, 0, 0.15)';
              }
            }}
          >
            <Icon
              size={26}
              style={{
                color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                filter: isActive ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' : 'none',
              }}
            />

            {/* 활성 인디케이터 - Clay Pill */}
            {isActive && (
              <div
                className="absolute -left-2"
                style={{
                  width: '6px',
                  height: '32px',
                  background: '#FFFFFF',
                  borderRadius: '0 8px 8px 0',
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                }}
              />
            )}

            {/* 툴팁 - Clay Style */}
            <div
              className="absolute left-full ml-4 px-4 py-2 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
                borderRadius: '16px',
                boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
                color: '#374151',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s ease',
              }}
            >
              {platform.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default Sidebar;
