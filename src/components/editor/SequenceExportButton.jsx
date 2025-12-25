/**
 * SequenceExportButton - 시퀀스 내보내기 버튼
 * 메시지 시퀀스를 프레임별로 캡처하여 ZIP으로 다운로드
 */
import { useState, useCallback } from 'react';
import useChatStore from '../../store/useChatStore';
import { renderSequence } from '../../utils/sequenceRenderer';
import { exportAndDownload } from '../../utils/zipExporter';
import { formatDuration, calculateTotalDuration } from '../../utils/durationCalculator';

/**
 * SequenceExportButton 컴포넌트
 * DOM에서 #chat-canvas 요소를 직접 찾아 캡처
 */
const SequenceExportButton = () => {
  const [error, setError] = useState(null);

  // Store 상태 구독
  const messages = useChatStore((s) => s.conversation.messages);
  const theme = useChatStore((s) => s.theme);
  const isRendering = useChatStore((s) => s.sequence.isRendering);
  const progress = useChatStore((s) => s.sequence.progress);

  // Store 액션
  const startRendering = useChatStore((s) => s.startSequenceRendering);
  const setProgress = useChatStore((s) => s.setSequenceProgress);
  const setVisibleCount = useChatStore((s) => s.setVisibleMessageCount);
  const stopRendering = useChatStore((s) => s.stopSequenceRendering);

  // 예상 소요 시간 계산
  const estimatedDuration = calculateTotalDuration(messages);
  const estimatedText = messages.length > 0
    ? `${messages.length}프레임 (${formatDuration(estimatedDuration)})`
    : '메시지 없음';

  // 시퀀스 내보내기 핸들러
  const handleExport = useCallback(async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas) {
      setError('캡처 대상을 찾을 수 없습니다');
      return;
    }

    if (messages.length === 0) {
      setError('내보낼 메시지가 없습니다');
      return;
    }

    setError(null);
    startRendering();

    // 캡처를 위해 transform 임시 해제
    const scaleWrapper = canvas.parentElement;
    const outerWrapper = scaleWrapper?.parentElement;
    const originalScaleTransform = scaleWrapper?.style.transform;
    const originalOuterStyle = outerWrapper ? {
      width: outerWrapper.style.width,
      height: outerWrapper.style.height,
      overflow: outerWrapper.style.overflow,
    } : null;

    try {
      // Scale transform 제거 및 원본 크기로 표시
      if (scaleWrapper && originalScaleTransform?.includes('scale')) {
        scaleWrapper.style.transform = 'none';
        if (outerWrapper) {
          outerWrapper.style.width = 'auto';
          outerWrapper.style.height = 'auto';
          outerWrapper.style.overflow = 'visible';
        }
      }

      // 레이아웃 재계산 대기
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

      // 시퀀스 렌더링
      const frames = await renderSequence(
        canvas,
        messages,
        setVisibleCount,
        {
          onProgress: setProgress,
          scale: 2,
          delay: 150,
        }
      );

      // ZIP 생성 및 다운로드
      await exportAndDownload(frames, {
        projectName: 'talkstudio',
        metadata: {
          resolution: `${theme.canvasWidth}x${theme.canvasHeight}`,
          theme: theme.id,
        },
      });
    } catch (err) {
      console.error('Sequence export failed:', err);
      setError(err.message || '내보내기 중 오류가 발생했습니다');
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
      // 전체 메시지 복원 및 상태 초기화
      stopRendering();
    }
  }, [messages, theme, startRendering, setProgress, setVisibleCount, stopRendering]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={isRendering || messages.length === 0}
        className={`
          flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
          font-medium text-sm transition-all duration-200
          ${isRendering
            ? 'bg-blue-100 text-blue-600 cursor-wait'
            : messages.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isRendering ? (
          <>
            <LoadingSpinner />
            <span>렌더링 중... {progress}%</span>
          </>
        ) : (
          <>
            <SequenceIcon />
            <span>시퀀스 내보내기</span>
          </>
        )}
      </button>

      {/* 진행률 바 */}
      {isRendering && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 예상 정보 */}
      {!isRendering && messages.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {estimatedText}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

// 로딩 스피너 아이콘
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// 시퀀스 아이콘
const SequenceIcon = () => (
  <svg
    className="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
    />
  </svg>
);

export default SequenceExportButton;
