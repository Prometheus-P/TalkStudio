/**
 * Video Encoder - 프레임 시퀀스를 MP4/WebM 영상으로 변환
 * WebCodecs API 우선 사용, 미지원 시 Canvas 기반 MediaRecorder 폴백
 */

/**
 * WebCodecs API 지원 여부 확인
 */
export function isWebCodecsSupported() {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

/**
 * MediaRecorder 지원 여부 확인
 */
export function isMediaRecorderSupported() {
  return typeof MediaRecorder !== 'undefined';
}

/**
 * 지원되는 비디오 코덱 확인
 */
export async function getSupportedCodecs() {
  const codecs = [];

  if (isWebCodecsSupported()) {
    // WebCodecs 코덱 확인
    const webCodecsFormats = [
      { codec: 'avc1.42001E', name: 'H.264 Baseline' },
      { codec: 'avc1.4D001E', name: 'H.264 Main' },
      { codec: 'avc1.64001E', name: 'H.264 High' },
      { codec: 'vp8', name: 'VP8' },
      { codec: 'vp09.00.10.08', name: 'VP9' },
    ];

    for (const format of webCodecsFormats) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec: format.codec,
          width: 1080,
          height: 1920,
          bitrate: 5_000_000,
        });
        if (support.supported) {
          codecs.push({ ...format, api: 'WebCodecs' });
        }
      } catch {
        // 지원하지 않음
      }
    }
  }

  // MediaRecorder 코덱 확인
  if (isMediaRecorderSupported()) {
    const mimeTypes = [
      { mimeType: 'video/webm;codecs=vp9', name: 'WebM VP9' },
      { mimeType: 'video/webm;codecs=vp8', name: 'WebM VP8' },
      { mimeType: 'video/webm', name: 'WebM' },
    ];

    for (const format of mimeTypes) {
      if (MediaRecorder.isTypeSupported(format.mimeType)) {
        codecs.push({ ...format, api: 'MediaRecorder' });
      }
    }
  }

  return codecs;
}

/**
 * 프레임 배열을 비디오로 인코딩 (MediaRecorder 사용)
 * @param {Array<{blob: Blob, duration: number}>} frames - 프레임 배열
 * @param {Object} options - 인코딩 옵션
 * @returns {Promise<Blob>} 비디오 Blob
 */
export async function encodeVideo(frames, options = {}) {
  const {
    width = 1080,
    height = 1920,
    fps = 30,
    mimeType = 'video/webm;codecs=vp9',
    onProgress = () => {},
  } = options;

  if (frames.length === 0) {
    throw new Error('No frames to encode');
  }

  // Canvas 생성
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // MediaRecorder 설정
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
    videoBitsPerSecond: 5_000_000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => {
      reject(new Error(`MediaRecorder error: ${e.error?.message || 'Unknown error'}`));
    };

    recorder.start();

    // 프레임 순차 그리기
    (async () => {
      try {
        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];

          // Blob을 이미지로 변환
          const img = await blobToImage(frame.blob);

          // Canvas에 그리기
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // duration만큼 대기 (ms)
          const frameDuration = (frame.duration || 1) * 1000;
          await wait(frameDuration);

          // 진행률 업데이트
          onProgress(Math.round(((i + 1) / frames.length) * 100));
        }

        // 마지막 프레임 잠시 유지
        await wait(500);

        recorder.stop();
      } catch (err) {
        recorder.stop();
        reject(err);
      }
    })();
  });
}

/**
 * WebCodecs API를 사용한 고성능 인코딩
 * @param {Array<{blob: Blob, duration: number}>} frames
 * @param {Object} options
 * @returns {Promise<Blob>}
 */
export async function encodeVideoWebCodecs(frames, options = {}) {
  const {
    width = 1080,
    height = 1920,
    fps = 30,
    bitrate = 5_000_000,
    onProgress = () => {},
  } = options;

  if (!isWebCodecsSupported()) {
    throw new Error('WebCodecs not supported');
  }

  const encodedChunks = [];
  let frameIndex = 0;

  // 인코더 설정
  const encoder = new VideoEncoder({
    output: (chunk, _meta) => {
      const buffer = new ArrayBuffer(chunk.byteLength);
      chunk.copyTo(buffer);
      encodedChunks.push({
        data: buffer,
        timestamp: chunk.timestamp,
        type: chunk.type,
      });
    },
    error: (e) => {
      throw new Error(`Encoder error: ${e.message}`);
    },
  });

  await encoder.configure({
    codec: 'vp09.00.10.08', // VP9
    width,
    height,
    bitrate,
    framerate: fps,
  });

  // Canvas 생성
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 프레임 인코딩
  let timestamp = 0;
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const img = await blobToImageBitmap(frame.blob);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // duration 기반 프레임 수 계산
    const durationMs = (frame.duration || 1) * 1000;
    const numFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

    for (let f = 0; f < numFrames; f++) {
      const videoFrame = new VideoFrame(canvas, {
        timestamp: timestamp * 1000, // microseconds
      });

      encoder.encode(videoFrame, { keyFrame: frameIndex % 30 === 0 });
      videoFrame.close();

      timestamp += 1000 / fps;
      frameIndex++;
    }

    img.close();
    onProgress(Math.round(((i + 1) / frames.length) * 100));
  }

  await encoder.flush();
  encoder.close();

  // WebM 컨테이너 생성 (간단한 구현)
  // 실제 프로덕션에서는 muxer 라이브러리 사용 권장
  const blob = new Blob(
    encodedChunks.map(c => new Uint8Array(c.data)),
    { type: 'video/webm' }
  );

  return blob;
}

/**
 * 자동으로 최적의 인코더 선택
 */
export async function encodeVideoAuto(frames, options = {}) {
  // WebCodecs 시도
  if (isWebCodecsSupported()) {
    try {
      return await encodeVideoWebCodecs(frames, options);
    } catch (err) {
      console.warn('WebCodecs failed, falling back to MediaRecorder:', err);
    }
  }

  // MediaRecorder 폴백
  if (isMediaRecorderSupported()) {
    return await encodeVideo(frames, options);
  }

  throw new Error('No video encoding method available');
}

/**
 * 비디오 다운로드
 */
export function downloadVideo(blob, filename = 'talkstudio_video.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 헬퍼 함수
// ============================================

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function blobToImageBitmap(blob) {
  return await createImageBitmap(blob);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  isWebCodecsSupported,
  isMediaRecorderSupported,
  getSupportedCodecs,
  encodeVideo,
  encodeVideoWebCodecs,
  encodeVideoAuto,
  downloadVideo,
};
