/**
 * Sequence Renderer - 메시지 시퀀스를 프레임별로 캡처
 * html2canvas를 사용하여 각 메시지 상태를 PNG로 캡처
 */
import html2canvas from 'html2canvas';
import { calculateDuration } from './durationCalculator';

/**
 * 메시지 시퀀스를 프레임별로 캡처
 * @param {HTMLElement} container - 캡처 대상 DOM 요소 (#chat-canvas)
 * @param {Array} messages - 전체 메시지 배열
 * @param {Function} setVisibleCount - 표시할 메시지 수를 설정하는 함수
 * @param {Object} options - 렌더링 옵션
 * @param {Function} options.onProgress - 진행률 콜백 (0-100)
 * @param {number} options.scale - 캡처 스케일 (기본: 2)
 * @param {number} options.delay - 프레임 간 대기 시간 ms (기본: 150)
 * @returns {Promise<Array<{index: number, blob: Blob, duration: number, filename: string}>>}
 */
export async function renderSequence(
  container,
  messages,
  setVisibleCount,
  options = {}
) {
  const {
    onProgress = () => {},
    scale = 2,
    delay = 150,
  } = options;

  const frames = [];
  const totalMessages = messages.length;

  if (totalMessages === 0) {
    return frames;
  }

  // 시작 전 초기화
  setVisibleCount(0);
  await waitForRender(50);

  for (let i = 0; i < totalMessages; i++) {
    // 1. 메시지 i+1개까지 표시 (0-indexed이므로 i+1)
    setVisibleCount(i + 1);

    // 2. DOM 업데이트 및 렌더링 대기
    await waitForRender(delay);

    // 3. 캔버스 캡처
    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      // 외부 이미지 허용
      allowTaint: false,
      // 폰트 렌더링 대기
      onclone: () => {
        // 폰트 로딩 완료 대기
        return document.fonts.ready;
      },
    });

    // 4. Blob으로 변환
    const blob = await canvasToBlob(canvas, 'image/png');

    // 5. 메모리 정리 - 캔버스 해제
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;

    // 6. 프레임 정보 저장
    const message = messages[i];
    frames.push({
      index: i,
      blob,
      duration: calculateDuration(message.text),
      filename: `frame_${String(i).padStart(4, '0')}.png`,
      messageText: message.text?.substring(0, 50), // 메타데이터용
    });

    // 7. 진행률 업데이트
    const progress = Math.round(((i + 1) / totalMessages) * 100);
    onProgress(progress);

    // 8. 가비지 컬렉션 힌트 (대용량 시퀀스용)
    if (i > 0 && i % 10 === 0) {
      await waitForRender(50); // GC 시간 확보
    }
  }

  return frames;
}

/**
 * Canvas를 Blob으로 변환
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, mimeType = 'image/png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      1.0 // 최대 품질
    );
  });
}

/**
 * 렌더링 완료 대기
 * @param {number} ms - 대기 시간
 */
function waitForRender(ms = 100) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
}

/**
 * 시퀀스 렌더링 취소 가능한 버전
 * @param {HTMLElement} container
 * @param {Array} messages
 * @param {Function} setVisibleCount
 * @param {Object} options
 * @returns {{ promise: Promise, cancel: Function }}
 */
export function renderSequenceWithCancel(container, messages, setVisibleCount, options = {}) {
  let cancelled = false;

  const promise = (async () => {
    const { onProgress = () => {}, scale = 2, delay = 150 } = options;
    const frames = [];
    const totalMessages = messages.length;

    if (totalMessages === 0) return frames;

    setVisibleCount(0);
    await waitForRender(50);

    for (let i = 0; i < totalMessages; i++) {
      if (cancelled) {
        throw new Error('Rendering cancelled');
      }

      setVisibleCount(i + 1);
      await waitForRender(delay);

      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const blob = await canvasToBlob(canvas, 'image/png');

      // 메모리 정리
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;

      const message = messages[i];
      frames.push({
        index: i,
        blob,
        duration: calculateDuration(message.text),
        filename: `frame_${String(i).padStart(4, '0')}.png`,
        messageText: message.text?.substring(0, 50),
      });

      onProgress(Math.round(((i + 1) / totalMessages) * 100));
    }

    return frames;
  })();

  return {
    promise,
    cancel: () => {
      cancelled = true;
    },
  };
}

export default renderSequence;
