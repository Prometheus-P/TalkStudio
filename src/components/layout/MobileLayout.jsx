/**
 * MobileLayout - 모바일 전용 레이아웃
 * 스와이프 제스처 및 개선된 UX
 */
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ChatPreview from '../preview/ChatPreview';
import LeftPanel from '../editor/LeftPanel';
import Sidebar from './Sidebar';
import MobileGuide from './MobileGuide';
import MobileFooter from './MobileFooter';
import useChatStore from '../../store/useChatStore';
import { useSwipe } from '../../hooks/useSwipe';

const GUIDE_COMPLETED_KEY = 'talkstudio_guide_completed';

// 초기 가이드 상태 계산 (lazy initialization)
const getInitialGuideState = () => {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(GUIDE_COMPLETED_KEY);
};

const MobileLayout = () => {
  const [activeView, setActiveView] = useState('preview');
  const [showGuide, setShowGuide] = useState(getInitialGuideState);

  const platformSkin = useChatStore((s) => s.conversation.platformSkin);

  const handleGuideComplete = () => {
    localStorage.setItem(GUIDE_COMPLETED_KEY, 'true');
    setShowGuide(false);
  };

  const handleGuideSkip = () => {
    localStorage.setItem(GUIDE_COMPLETED_KEY, 'true');
    setShowGuide(false);
  };

  // 스와이프로 뷰 전환
  const handleSwipeLeft = () => {
    if (activeView === 'preview') {
      setActiveView('editor');
    }
  };

  const handleSwipeRight = () => {
    if (activeView === 'editor') {
      setActiveView('preview');
    }
  };

  const swipeHandlers = useSwipe(handleSwipeLeft, handleSwipeRight, {
    threshold: 50,
  });

  // 뷰 변경 핸들러
  const handleViewChange = (view) => {
    if (view !== activeView) {
      setActiveView(view);
    }
  };

  if (showGuide) {
    return (
      <MobileGuide
        onComplete={handleGuideComplete}
        onSkip={handleGuideSkip}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      {/* 모바일 헤더 */}
      <header
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{
          background: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
          boxShadow: '0px 4px 0px rgba(124, 58, 237, 0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-white" />
          <span className="text-white font-bold text-lg">TalkStudio</span>
        </div>
        <span
          className="px-3 py-1 text-xs font-bold uppercase rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
          }}
        >
          {platformSkin}
        </span>
      </header>

      {/* 메인 콘텐츠 - 스와이프 영역 */}
      <div
        className="flex-1 overflow-hidden relative"
        {...swipeHandlers}
      >
        {/* Preview View */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            activeView === 'preview'
              ? 'translate-x-0'
              : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-4 pb-24">
            <div className="flex flex-col items-center">
              <ChatPreview />
            </div>
          </div>
        </div>

        {/* Editor View */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            activeView === 'editor'
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col overflow-hidden pb-20">
            {/* 플랫폼 선택 (가로 스크롤) */}
            <div className="shrink-0 border-b border-gray-200 bg-white">
              <Sidebar horizontal />
            </div>
            {/* 에디터 패널 */}
            <div className="flex-1 overflow-y-auto bg-white">
              <LeftPanel />
            </div>
          </div>
        </div>
      </div>

      {/* 확장형 푸터 메뉴바 */}
      <MobileFooter
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* 스와이프 힌트 */}
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: 0.5,
          fontSize: '11px',
          color: '#9CA3AF',
        }}
      >
        ← 스와이프로 전환 →
      </div>
    </div>
  );
};

export default MobileLayout;
