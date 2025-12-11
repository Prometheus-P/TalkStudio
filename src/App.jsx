/**
 * TalkStudio - App.jsx
 * 3-Column 레이아웃: Sidebar + Editor + Preview
 * CLAYMORPHISM DESIGN STYLE
 */
import React from 'react';
import Sidebar from './components/layout/Sidebar';
import LeftPanel from './components/editor/LeftPanel';
import ChatPreview from './components/preview/ChatPreview';
import useChatStore from './store/useChatStore';

function App() {
  const platformSkin = useChatStore((s) => s.conversation.platformSkin);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-medium"
      style={{
        background: 'linear-gradient(135deg, #FFF5F0 0%, #F0F7FF 50%, #F5F0FF 100%)',
      }}
    >
      {/* 1. 좌측 사이드바 - 플랫폼 선택 (Claymorphism) */}
      <Sidebar />

      {/* 2. 에디터 영역 (중앙) - Clay Card */}
      <div
        className="w-[420px] min-w-[380px] flex flex-col m-4 mr-2"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F4FF 100%)',
          borderRadius: '32px',
          boxShadow: '0px 8px 0px rgba(168, 85, 247, 0.2), 0px 16px 40px rgba(168, 85, 247, 0.1)',
        }}
      >
        {/* 헤더 - Clay Style */}
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0"
          style={{
            borderRadius: '32px 32px 0 0',
            background: 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
            boxShadow: '0px 4px 0px rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-bold text-white tracking-tight"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              TalkStudio
            </h1>
            <span
              className="px-3 py-1 text-[11px] font-bold rounded-full"
              style={{
                background: '#FBBF24',
                color: '#92400E',
                boxShadow: '0px 3px 0px rgba(146, 64, 14, 0.3)',
              }}
            >
              BETA
            </span>
          </div>
          <span
            className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full"
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: '#FFFFFF',
            }}
          >
            {platformSkin}
          </span>
        </header>

        {/* 컨트롤 패널 */}
        <div className="flex-1 overflow-hidden">
          <LeftPanel />
        </div>
      </div>

      {/* 3. 미리보기 영역 (우측) - Clay Style */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-auto m-4 ml-2"
        style={{
          background: 'linear-gradient(145deg, #E0F2FE 0%, #DBEAFE 50%, #EDE9FE 100%)',
          borderRadius: '32px',
          boxShadow: '0px 8px 0px rgba(59, 130, 246, 0.15)',
        }}
      >
        {/* 배경 데코레이션 */}
        <div
          className="absolute top-8 left-8 w-24 h-24 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB3CC 100%)',
            opacity: 0.3,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-12 right-12 w-32 h-32 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)',
            opacity: 0.3,
            filter: 'blur(50px)',
          }}
        />

        {/* 플랫폼 레이블 - Clay Pill */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 z-10"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F0F0F0 100%)',
            borderRadius: '20px',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span className="text-sm font-semibold" style={{ color: '#6B7280' }}>
            미리보기
          </span>
          <span
            className="text-sm font-bold uppercase px-3 py-0.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              boxShadow: '0px 2px 0px rgba(139, 92, 246, 0.4)',
            }}
          >
            {platformSkin}
          </span>
        </div>

        {/* Discord: 폰 프레임 없이 직접 렌더링 */}
        {platformSkin === 'discord' ? (
          <div className="flex-1 flex items-center justify-center w-full pt-12 pb-4">
            <ChatPreview />
          </div>
        ) : (
          /* 기타 플랫폼: Clay Style Phone 프레임 */
          <div className="relative">
            {/* 폰 외곽 - Claymorphism */}
            <div
              className="relative p-3"
              style={{
                background: 'linear-gradient(145deg, #2D3748 0%, #1A202C 100%)',
                borderRadius: '52px',
                boxShadow: '0px 12px 0px rgba(0, 0, 0, 0.25), 0px 24px 50px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* 노치 */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 z-20"
                style={{
                  background: 'linear-gradient(145deg, #2D3748 0%, #1A202C 100%)',
                  borderRadius: '0 0 20px 20px',
                }}
              />

              {/* 스크린 영역 */}
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: '44px',
                  boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ChatPreview />
              </div>
            </div>

            {/* 반사광 효과 - Clay highlight */}
            <div
              className="absolute -top-1 -left-1 right-20 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                borderRadius: '52px',
              }}
            />
          </div>
        )}

        {/* 안내 텍스트 - Clay Style */}
        <div
          className="absolute bottom-4 px-5 py-2"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
            borderRadius: '16px',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.08)',
            color: '#6B7280',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          메시지를 편집하고 PNG로 저장하세요
        </div>
      </div>
    </div>
  );
}

export default App;
