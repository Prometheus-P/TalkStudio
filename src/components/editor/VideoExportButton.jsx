/**
 * VideoExportButton - 영상 내보내기 버튼
 * 시퀀스 이미지를 영상으로 변환하여 다운로드
 */
import { useState, useCallback } from 'react';
import { Video, Loader2 } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import { renderSequence } from '../../utils/sequenceRenderer';
import { encodeVideo, downloadVideo, isMediaRecorderSupported } from '../../utils/videoEncoder';
import { calculateTotalDuration, formatDuration } from '../../utils/durationCalculator';

const VideoExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(''); // 'rendering' | 'encoding'
  const [error, setError] = useState(null);

  const messages = useChatStore((s) => s.conversation.messages);
  const theme = useChatStore((s) => s.theme);
  const setVisibleCount = useChatStore((s) => s.setVisibleMessageCount);
  const stopRendering = useChatStore((s) => s.stopSequenceRendering);

  // 지원 여부 확인
  const isSupported = isMediaRecorderSupported();

  // 예상 시간
  const estimatedDuration = calculateTotalDuration(messages);
  const estimatedText = messages.length > 0
    ? `${formatDuration(estimatedDuration)} 예상`
    : '메시지 없음';

  const handleExport = useCallback(async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas || messages.length === 0) {
      setError('내보낼 메시지가 없습니다');
      return;
    }

    setIsExporting(true);
    setError(null);
    setProgress(0);

    // Scale transform 임시 해제
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

      // Stage 1: 프레임 렌더링
      setStage('rendering');
      const frames = await renderSequence(canvas, messages, setVisibleCount, {
        onProgress: (p) => setProgress(Math.round(p * 0.5)), // 0-50%
        scale: 2,
        delay: 100,
      });

      // Stage 2: 비디오 인코딩
      setStage('encoding');
      const videoBlob = await encodeVideo(frames, {
        width: theme.canvasWidth,
        height: theme.canvasHeight,
        fps: 30,
        onProgress: (p) => setProgress(50 + Math.round(p * 0.5)), // 50-100%
      });

      // 다운로드
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      downloadVideo(videoBlob, `talkstudio_${timestamp}.webm`);

    } catch (err) {
      console.error('Video export failed:', err);
      setError(err.message || '영상 내보내기 실패');
    } finally {
      // Transform 복원
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
      setStage('');
      setProgress(0);
    }
  }, [messages, theme, setVisibleCount, stopRendering]);

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-400 text-center py-2">
        영상 내보내기가 이 브라우저에서 지원되지 않습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={isExporting || messages.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '16px',
          fontWeight: 600,
          fontSize: '14px',
          color: '#FFFFFF',
          background: isExporting
            ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
            : messages.length === 0
              ? 'linear-gradient(145deg, #D1D5DB 0%, #9CA3AF 100%)'
              : 'linear-gradient(145deg, #F59E0B 0%, #D97706 100%)',
          boxShadow: isExporting || messages.length === 0
            ? 'none'
            : '0px 4px 0px rgba(180, 83, 9, 0.5)',
          cursor: isExporting || messages.length === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          border: 'none',
          width: '100%',
        }}
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>
              {stage === 'rendering' ? '프레임 생성 중...' : '영상 인코딩 중...'} {progress}%
            </span>
          </>
        ) : (
          <>
            <Video size={18} />
            <span>영상으로 저장</span>
          </>
        )}
      </button>

      {/* 진행률 바 */}
      {isExporting && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 예상 시간 */}
      {!isExporting && messages.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {estimatedText}
        </p>
      )}

      {/* 에러 */}
      {error && (
        <p className="text-xs text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default VideoExportButton;
