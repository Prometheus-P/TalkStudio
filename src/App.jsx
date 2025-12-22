/**
 * TalkStudio - App.jsx
 * 3-Column 레이아웃: Sidebar + Editor + Preview
 * CLAYMORPHISM DESIGN STYLE (Tailwind 커스텀 클래스 적용)
 */
import React, { useState, useMemo } from 'react';
import { FolderOpen, Save, Cloud, CloudOff } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import LeftPanel from './components/editor/LeftPanel';
import ChatPreview from './components/preview/ChatPreview';
import ProjectListModal from './components/editor/ProjectListModal';
import useChatStore from './store/useChatStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useMediaQuery } from './hooks/useMediaQuery';
import MobileLayout from './components/layout/MobileLayout';

const DesktopLayout = ({ children }) => <>{children}</>;

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const platformSkin = useChatStore((s) => s.conversation.platformSkin);
  const currentProjectId = useChatStore((s) => s.currentProjectId);
  const conversation = useChatStore((s) => s.conversation);
  const theme = useChatStore((s) => s.theme);
  const statusBar = useChatStore((s) => s.statusBar);
  const saveCurrentProject = useChatStore((s) => s.saveCurrentProject);

  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

  // 프로젝트 데이터 (auto-save용)
  const projectData = useMemo(() => {
    if (!currentProjectId) return null;
    return {
      id: currentProjectId,
      title: conversation.title || '제목 없음',
      conversation,
      theme,
      statusBar,
    };
  }, [currentProjectId, conversation, theme, statusBar]);

  // Auto-save 훅
  const { isSaving } = useAutoSave(projectData, {
    enabled: !!currentProjectId,
    debounceMs: 2000,
    onSave: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  // 저장 상태 업데이트 - isSaving 변경 시 직접 반영
  const displayStatus = isSaving ? 'saving' : saveStatus;

  // 수동 저장
  const handleManualSave = () => {
    if (!currentProjectId) {
      // 새 프로젝트로 저장
      const result = saveCurrentProject();
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-medium bg-clay-main">
      <DesktopLayout>
        {/* 1. 좌측 사이드바 - 플랫폼 선택 (Claymorphism) */}
        <Sidebar />

        {/* 2. 에디터 영역 (중앙) - Clay Card */}
        <div className="w-[420px] min-w-[380px] flex flex-col m-4 mr-2 bg-clay-card rounded-clay shadow-clay-lg">
          {/* 헤더 - Clay Style */}
          <header className="h-16 flex items-center justify-between px-6 shrink-0 rounded-t-clay bg-clay-purple shadow-clay-md">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
                TalkStudio
              </h1>
              <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-clay-amber text-clay-amber-dark shadow-clay-sm">
                BETA
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* 프로젝트 버튼 */}
              <button
                onClick={() => setProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-transform hover:scale-105 bg-white/20 text-white"
                title="프로젝트 관리"
              >
                <FolderOpen size={14} />
                <span className="text-xs font-semibold">프로젝트</span>
              </button>

              {/* 저장 버튼 */}
              <button
                onClick={handleManualSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-transform hover:scale-105 text-white ${
                  currentProjectId
                    ? displayStatus === 'saved'
                      ? 'bg-green-500/30'
                      : displayStatus === 'error'
                      ? 'bg-red-500/30'
                      : 'bg-white/20'
                    : 'bg-white/15'
                }`}
                title={currentProjectId ? '저장됨' : '새 프로젝트로 저장'}
              >
                {displayStatus === 'saving' ? (
                  <Cloud size={14} className="animate-pulse" />
                ) : displayStatus === 'saved' ? (
                  <Cloud size={14} />
                ) : displayStatus === 'error' ? (
                  <CloudOff size={14} />
                ) : (
                  <Save size={14} />
                )}
                <span className="text-xs font-semibold">
                  {displayStatus === 'saving'
                    ? '저장 중...'
                    : displayStatus === 'saved'
                    ? '저장됨'
                    : displayStatus === 'error'
                    ? '오류'
                    : '저장'}
                </span>
              </button>

              {/* 플랫폼 표시 */}
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/25 text-white">
                {platformSkin}
              </span>
            </div>
          </header>

          {/* 컨트롤 패널 */}
          <div className="flex-1 overflow-hidden">
            <LeftPanel />
          </div>
        </div>

        {/* 3. 미리보기 영역 (우측) - Clay Style */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-auto m-4 ml-2 bg-clay-preview rounded-clay shadow-clay-blue">
          {/* 배경 데코레이션 */}
          <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-clay-deco-pink opacity-30 blur-[40px]" />
          <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full bg-clay-deco-green opacity-30 blur-[50px]" />

          {/* 플랫폼 레이블 - Clay Pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 z-10 bg-clay-card-white rounded-clay-md shadow-clay-neutral-sm">
            <span className="text-sm font-semibold text-gray-500">
              미리보기
            </span>
            <span className="text-sm font-bold uppercase px-3 py-0.5 rounded-full bg-clay-purple text-white shadow-clay-xs">
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
              <div className="relative p-3 bg-clay-phone rounded-clay-xl shadow-clay-phone">
                {/* 노치 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 z-20 bg-clay-phone rounded-b-clay-md" />

                {/* 스크린 영역 */}
                <div className="overflow-hidden rounded-clay-lg shadow-clay-neutral-sm">
                  <ChatPreview />
                </div>
              </div>

              {/* 반사광 효과 - Clay highlight */}
              <div
                className="absolute -top-1 -left-1 right-20 h-16 pointer-events-none rounded-clay-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                }}
              />
            </div>
          )}

          {/* 안내 텍스트 - Clay Style */}
          <div className="absolute bottom-4 px-5 py-2 bg-clay-card-light rounded-clay-sm shadow-clay-neutral-md text-gray-500 font-semibold text-[13px]">
            메시지를 편집하고 PNG로 저장하세요
          </div>
        </div>
      </DesktopLayout>

      {/* 프로젝트 목록 모달 */}
      <ProjectListModal
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
}

export default App;
