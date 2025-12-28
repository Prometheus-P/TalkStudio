/**
 * UnifiedExportButton - 통합 내보내기 버튼
 * PNG, 시퀀스, 영상 내보내기를 하나의 드롭다운으로 통합
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2, ChevronDown, Layers, Video, Mail } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import {
  checkExportSupport,
  IMAGE_FORMATS,
  exportCanvas,
  downloadDataUrl,
} from '../../utils/exportUtils';
import { renderSequence } from '../../utils/sequenceRenderer';
import { exportAndDownload } from '../../utils/zipExporter';
import { encodeVideo, downloadVideo, isMediaRecorderSupported } from '../../utils/videoEncoder';
import { calculateTotalDuration, formatDuration } from '../../utils/durationCalculator';

const UnifiedExportButton = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null); // 'png' | 'sequence' | 'video'
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  const messages = useChatStore((s) => s.conversation.messages);
  const theme = useChatStore((s) => s.theme);
  const setVisibleCount = useChatStore((s) => s.setVisibleMessageCount);
  const stopRendering = useChatStore((s) => s.stopSequenceRendering);
  const startRendering = useChatStore((s) => s.startSequenceRendering);
  const setSequenceProgress = useChatStore((s) => s.setSequenceProgress);

  const isVideoSupported = isMediaRecorderSupported();

  // PNG 내보내기
  const handlePngExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas) return;

    setIsExporting(true);
    setExportType('png');
    setShowMenu(false);

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
    } catch (error) {
      console.error('PNG 내보내기 실패:', error);
      alert('이미지 내보내기에 실패했습니다.');
    } finally {
      if (scaleWrapper && originalScaleTransform) {
        scaleWrapper.style.transform = originalScaleTransform;
        if (outerWrapper && originalOuterStyle) {
          outerWrapper.style.width = originalOuterStyle.width;
          outerWrapper.style.height = originalOuterStyle.height;
          outerWrapper.style.overflow = originalOuterStyle.overflow;
        }
      }
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 시퀀스 내보내기
  const handleSequenceExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas || messages.length === 0) return;

    setIsExporting(true);
    setExportType('sequence');
    setShowMenu(false);
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
    } catch (error) {
      console.error('시퀀스 내보내기 실패:', error);
      alert('시퀀스 내보내기에 실패했습니다.');
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
      setIsExporting(false);
      setExportType(null);
      setProgress(0);
    }
  };

  // 영상 내보내기
  const handleVideoExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas || messages.length === 0) return;

    setIsExporting(true);
    setExportType('video');
    setShowMenu(false);
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

      setStage('rendering');
      const frames = await renderSequence(canvas, messages, setVisibleCount, {
        onProgress: (p) => setProgress(Math.round(p * 0.5)),
        scale: 2,
        delay: 100,
      });

      setStage('encoding');
      const videoBlob = await encodeVideo(frames, {
        width: theme.canvasWidth,
        height: theme.canvasHeight,
        fps: 30,
        onProgress: (p) => setProgress(50 + Math.round(p * 0.5)),
      });

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      downloadVideo(videoBlob, `talkstudio_${timestamp}.webm`);
    } catch (error) {
      console.error('영상 내보내기 실패:', error);
      alert('영상 내보내기에 실패했습니다.');
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
      setIsExporting(false);
      setExportType(null);
      setStage('');
      setProgress(0);
    }
  };

  // 버튼 텍스트
  const getButtonText = () => {
    if (!isExporting) return '저장하기';
    if (exportType === 'png') return '저장 중...';
    if (exportType === 'sequence') return `렌더링 중... ${progress}%`;
    if (exportType === 'video') {
      return stage === 'rendering'
        ? `프레임 생성 중... ${progress}%`
        : `인코딩 중... ${progress}%`;
    }
    return '저장 중...';
  };

  return (
    <div className="relative w-full">
      {/* 메인 버튼 */}
      <div className="flex gap-1">
        <button
          onClick={handlePngExport}
          disabled={isExporting}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px 20px',
            borderRadius: '20px 0 0 20px',
            fontWeight: 700,
            fontSize: '15px',
            color: '#FFFFFF',
            background: isExporting
              ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
              : 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
            boxShadow: isExporting
              ? '0px 4px 0px rgba(107, 114, 128, 0.4)'
              : '0px 6px 0px rgba(124, 58, 237, 0.5)',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
          }}
        >
          {isExporting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {getButtonText()}
            </>
          ) : (
            <>
              <Download size={20} />
              저장하기
            </>
          )}
        </button>

        {/* 드롭다운 버튼 */}
        <button
          onClick={() => !isExporting && setShowMenu(!showMenu)}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 12px',
            borderRadius: '0 20px 20px 0',
            fontWeight: 700,
            color: '#FFFFFF',
            background: isExporting
              ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
              : 'linear-gradient(145deg, #8B5CF6 0%, #6D28D9 100%)',
            boxShadow: isExporting
              ? '0px 4px 0px rgba(107, 114, 128, 0.4)'
              : '0px 6px 0px rgba(109, 40, 217, 0.5)',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            borderLeft: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <ChevronDown
            size={18}
            style={{
              transform: showMenu ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* 진행률 바 */}
      {isExporting && (exportType === 'sequence' || exportType === 'video') && (
        <div
          className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-2"
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 드롭다운 메뉴 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F3F4F6 100%)',
              borderRadius: '16px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              zIndex: 20,
            }}
          >
            {/* PNG 옵션 */}
            <button
              onClick={handlePngExport}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                transition: 'background 0.15s',
              }}
              className="hover:bg-purple-50"
            >
              <Download size={18} style={{ color: '#A855F7' }} />
              <span>PNG로 저장</span>
            </button>

            {/* 시퀀스 옵션 */}
            <button
              onClick={handleSequenceExport}
              disabled={messages.length === 0}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'transparent',
                border: 'none',
                cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: messages.length === 0 ? '#9CA3AF' : '#374151',
                transition: 'background 0.15s',
              }}
              className="hover:bg-purple-50"
            >
              <Layers size={18} style={{ color: '#3B82F6' }} />
              <span className="flex-1 text-left">시퀀스 내보내기</span>
              <a
                href="mailto:parkdavid31@gmail.com"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: '#EEF2FF',
                  color: '#6366F1',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Mail size={10} />
                대량 문의
              </a>
            </button>

            {/* 영상 옵션 */}
            <button
              onClick={handleVideoExport}
              disabled={!isVideoSupported || messages.length === 0}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'transparent',
                border: 'none',
                cursor: (!isVideoSupported || messages.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: (!isVideoSupported || messages.length === 0) ? '#9CA3AF' : '#374151',
                transition: 'background 0.15s',
              }}
              className="hover:bg-purple-50"
            >
              <Video size={18} style={{ color: '#F59E0B' }} />
              <span className="flex-1 text-left">영상으로 저장</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  fontWeight: 700,
                }}
              >
                Beta
              </span>
            </button>

            {!isVideoSupported && (
              <div
                style={{
                  padding: '8px 16px',
                  fontSize: '11px',
                  color: '#9CA3AF',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                영상 내보내기는 Chrome/Edge에서 지원됩니다
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedExportButton;
