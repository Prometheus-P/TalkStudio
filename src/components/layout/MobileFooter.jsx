/**
 * MobileFooter - 모바일 확장형 푸터 메뉴바
 * 4탭: 미리보기, 편집, 저장, 더보기
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState } from 'react';
import {
  Eye,
  Edit,
  MoreVertical,
  FolderOpen,
  Share2,
  Settings,
  HelpCircle,
  FilePlus,
  Download,
  Layers,
  Video,
  Mail,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import SaveButton from './SaveButton';
import BottomSheet from '../common/BottomSheet';
import useChatStore from '../../store/useChatStore';
import { exportCanvas, downloadDataUrl } from '../../utils/exportUtils';
import { renderSequence } from '../../utils/sequenceRenderer';
import { exportAndDownload } from '../../utils/zipExporter';
import { encodeVideo, downloadVideo, isMediaRecorderSupported } from '../../utils/videoEncoder';

// 탭 버튼 컴포넌트
const FooterTab = ({ icon, label, isActive, onClick, color }) => {
  const IconComponent = icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-all duration-200"
      style={{
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <div
        className="p-3 rounded-2xl transition-all duration-200"
        style={{
          background: isActive
            ? `linear-gradient(145deg, ${color} 0%, ${color}dd 100%)`
            : 'transparent',
          boxShadow: isActive
            ? `0px 4px 0px ${color}50`
            : 'none',
        }}
      >
        <IconComponent
          size={22}
          style={{
            color: isActive ? '#FFFFFF' : '#9CA3AF',
          }}
        />
      </div>
      <span
        className="text-xs font-semibold"
        style={{
          color: isActive ? color : '#9CA3AF',
        }}
      >
        {label}
      </span>
    </button>
  );
};

// 메뉴 아이템 컴포넌트
const MenuItem = ({ icon, label, onClick, badge, disabled }) => {
  const IconComponent = icon;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 px-6 py-4 transition-colors"
      style={{
        background: 'transparent',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
        }}
      >
        <IconComponent size={20} style={{ color: '#6B7280' }} />
      </div>
      <span
        className="flex-1 text-left font-medium"
        style={{ color: '#374151', fontSize: '15px' }}
      >
        {label}
      </span>
      {badge && (
        <span
          className="px-2 py-1 text-xs font-bold rounded-lg"
          style={{
            background: badge.bg || '#FEF3C7',
            color: badge.color || '#D97706',
          }}
        >
          {badge.text}
        </span>
      )}
    </button>
  );
};

const MobileFooter = ({
  activeView,
  onViewChange,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [progress, setProgress] = useState(0);

  const messages = useChatStore((s) => s.conversation.messages);
  const theme = useChatStore((s) => s.theme);
  const setVisibleCount = useChatStore((s) => s.setVisibleMessageCount);
  const stopRendering = useChatStore((s) => s.stopSequenceRendering);
  const startRendering = useChatStore((s) => s.startSequenceRendering);
  const setSequenceProgress = useChatStore((s) => s.setSequenceProgress);

  const isVideoSupported = isMediaRecorderSupported();

  // PNG 저장
  const handlePngSave = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas) return;

    setSaveStatus('saving');
    setShowSaveOptions(false);

    const scaleWrapper = canvas.parentElement;
    const outerWrapper = scaleWrapper?.parentElement;
    const originalScaleTransform = scaleWrapper?.style.transform;
    const originalOuterStyle = outerWrapper ? {
      width: outerWrapper.style.width,
      height: outerWrapper.style.height,
      overflow: outerWrapper.style.overflow,
    } : null;

    try {
      if (scaleWrapper && originalScaleTransform?.includes('scale')) {
        scaleWrapper.style.transform = 'none';
        if (outerWrapper) {
          outerWrapper.style.width = 'auto';
          outerWrapper.style.height = 'auto';
          outerWrapper.style.overflow = 'visible';
        }
      }

      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

      const result = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const { dataUrl, filename } = await exportCanvas(result, 'png');
      downloadDataUrl(dataUrl, filename);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('PNG 내보내기 실패:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      if (scaleWrapper && originalScaleTransform) {
        scaleWrapper.style.transform = originalScaleTransform;
        if (outerWrapper && originalOuterStyle) {
          outerWrapper.style.width = originalOuterStyle.width;
          outerWrapper.style.height = originalOuterStyle.height;
          outerWrapper.style.overflow = originalOuterStyle.overflow;
        }
      }
    }
  };

  // 시퀀스 내보내기
  const handleSequenceExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas || messages.length === 0) return;

    setSaveStatus('saving');
    setShowSaveOptions(false);
    startRendering();

    const scaleWrapper = canvas.parentElement;
    const outerWrapper = scaleWrapper?.parentElement;
    const originalScaleTransform = scaleWrapper?.style.transform;
    const originalOuterStyle = outerWrapper ? {
      width: outerWrapper.style.width,
      height: outerWrapper.style.height,
      overflow: outerWrapper.style.overflow,
    } : null;

    try {
      if (scaleWrapper && originalScaleTransform?.includes('scale')) {
        scaleWrapper.style.transform = 'none';
        if (outerWrapper) {
          outerWrapper.style.width = 'auto';
          outerWrapper.style.height = 'auto';
          outerWrapper.style.overflow = 'visible';
        }
      }

      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

      const frames = await renderSequence(
        canvas,
        messages,
        setVisibleCount,
        {
          onProgress: (p) => {
            setProgress(Math.round(p));
            setSequenceProgress(Math.round(p));
          },
          scale: 2,
          delay: 150,
        }
      );

      await exportAndDownload(frames, {
        projectName: 'talkstudio',
        metadata: {
          resolution: `${theme.canvasWidth}x${theme.canvasHeight}`,
          theme: theme.id,
        },
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('시퀀스 내보내기 실패:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      if (scaleWrapper && originalScaleTransform) {
        scaleWrapper.style.transform = originalScaleTransform;
        if (outerWrapper && originalOuterStyle) {
          outerWrapper.style.width = originalOuterStyle.width;
          outerWrapper.style.height = originalOuterStyle.height;
          outerWrapper.style.overflow = originalOuterStyle.overflow;
        }
      }
      stopRendering();
      setProgress(0);
    }
  };

  // 영상 내보내기
  const handleVideoExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas || messages.length === 0 || !isVideoSupported) return;

    setSaveStatus('saving');
    setShowSaveOptions(false);
    setProgress(0);

    const scaleWrapper = canvas.parentElement;
    const outerWrapper = scaleWrapper?.parentElement;
    const originalScaleTransform = scaleWrapper?.style.transform;
    const originalOuterStyle = outerWrapper ? {
      width: outerWrapper.style.width,
      height: outerWrapper.style.height,
      overflow: outerWrapper.style.overflow,
    } : null;

    try {
      if (scaleWrapper && originalScaleTransform?.includes('scale')) {
        scaleWrapper.style.transform = 'none';
        if (outerWrapper) {
          outerWrapper.style.width = 'auto';
          outerWrapper.style.height = 'auto';
          outerWrapper.style.overflow = 'visible';
        }
      }

      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

      const frames = await renderSequence(canvas, messages, setVisibleCount, {
        onProgress: (p) => setProgress(Math.round(p * 0.5)),
        scale: 2,
        delay: 100,
      });

      const videoBlob = await encodeVideo(frames, {
        width: theme.canvasWidth,
        height: theme.canvasHeight,
        fps: 30,
        onProgress: (p) => setProgress(50 + Math.round(p * 0.5)),
      });

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      downloadVideo(videoBlob, `talkstudio_${timestamp}.webm`);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('영상 내보내기 실패:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      if (scaleWrapper && originalScaleTransform) {
        scaleWrapper.style.transform = originalScaleTransform;
        if (outerWrapper && originalOuterStyle) {
          outerWrapper.style.width = originalOuterStyle.width;
          outerWrapper.style.height = originalOuterStyle.height;
          outerWrapper.style.overflow = originalOuterStyle.overflow;
        }
      }
      stopRendering();
      setProgress(0);
    }
  };

  // 공유하기
  const handleShare = async () => {
    setShowMoreMenu(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TalkStudio',
          text: '대화 스크린샷을 만들어보세요!',
          url: window.location.href,
        });
      } catch {
        // 사용자가 취소한 경우
      }
    } else {
      // 클립보드에 URL 복사
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <>
      {/* 하단 탭바 */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-20 flex justify-around items-center px-4"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <FooterTab
          icon={Eye}
          label="미리보기"
          isActive={activeView === 'preview'}
          onClick={() => onViewChange('preview')}
          color="#A855F7"
        />
        <FooterTab
          icon={Edit}
          label="편집하기"
          isActive={activeView === 'editor'}
          onClick={() => onViewChange('editor')}
          color="#3B82F6"
        />
        <SaveButton
          status={saveStatus}
          onTap={handlePngSave}
          onLongPress={() => setShowSaveOptions(true)}
          disabled={saveStatus === 'saving'}
        />
        <FooterTab
          icon={MoreVertical}
          label="더보기"
          isActive={showMoreMenu}
          onClick={() => setShowMoreMenu(true)}
          color="#6B7280"
        />
      </nav>

      {/* 저장 옵션 바텀시트 */}
      <BottomSheet
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        title="저장 옵션"
      >
        <div className="py-2">
          <MenuItem
            icon={Download}
            label="PNG로 저장"
            onClick={handlePngSave}
          />
          <MenuItem
            icon={Layers}
            label="시퀀스 내보내기"
            onClick={handleSequenceExport}
            disabled={messages.length === 0}
            badge={{ text: '대량 문의', bg: '#EEF2FF', color: '#6366F1' }}
          />
          <MenuItem
            icon={Video}
            label="영상으로 저장"
            onClick={handleVideoExport}
            disabled={!isVideoSupported || messages.length === 0}
            badge={{ text: 'Beta', bg: '#FEF3C7', color: '#D97706' }}
          />

          {saveStatus === 'saving' && progress > 0 && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">진행률</span>
                <span className="text-sm font-medium text-purple-600">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!isVideoSupported && (
            <div className="px-6 py-3 text-xs text-gray-400">
              영상 내보내기는 Chrome/Edge에서 지원됩니다
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 더보기 바텀시트 */}
      <BottomSheet
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title="메뉴"
      >
        <div className="py-2">
          <MenuItem
            icon={FolderOpen}
            label="프로젝트 관리"
            onClick={() => {
              setShowMoreMenu(false);
              // TODO: 프로젝트 관리 시트 열기
            }}
            badge={{ text: '준비중', bg: '#F3F4F6', color: '#6B7280' }}
          />
          <MenuItem
            icon={FilePlus}
            label="새 프로젝트로 저장"
            onClick={() => {
              setShowMoreMenu(false);
              // TODO: 새 프로젝트 생성
            }}
            badge={{ text: '준비중', bg: '#F3F4F6', color: '#6B7280' }}
          />
          <MenuItem
            icon={Share2}
            label="공유하기"
            onClick={handleShare}
          />

          <div className="h-px bg-gray-200 my-2 mx-6" />

          <MenuItem
            icon={Settings}
            label="설정"
            onClick={() => {
              setShowMoreMenu(false);
              // TODO: 설정 페이지
            }}
            badge={{ text: '준비중', bg: '#F3F4F6', color: '#6B7280' }}
          />
          <MenuItem
            icon={HelpCircle}
            label="도움말"
            onClick={() => {
              setShowMoreMenu(false);
              // 온보딩 가이드 다시 보기
              localStorage.removeItem('talkstudio_guide_completed');
              window.location.reload();
            }}
          />

          {/* 문의 링크 */}
          <a
            href="mailto:parkdavid31@gmail.com"
            className="flex items-center gap-2 px-6 py-3 text-sm text-gray-500"
          >
            <Mail size={14} />
            <span>문의하기: parkdavid31@gmail.com</span>
          </a>
        </div>
      </BottomSheet>
    </>
  );
};

export default MobileFooter;
