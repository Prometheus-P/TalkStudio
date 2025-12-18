/**
 * exportUtils - 이미지 내보내기 유틸리티
 * 브라우저 호환성 체크 및 다양한 포맷 지원
 */

/**
 * 브라우저 canvas 내보내기 지원 여부 체크
 */
export const checkExportSupport = () => {
  const canvas = document.createElement('canvas');
  const support = {
    canvas: !!canvas.getContext,
    png: true, // PNG는 모든 브라우저에서 지원
    jpeg: true, // JPEG도 모든 브라우저에서 지원
    webp: false,
  };

  // WebP 지원 체크
  if (canvas.getContext) {
    canvas.width = 1;
    canvas.height = 1;
    support.webp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  return support;
};

/**
 * 이미지 포맷별 MIME 타입
 */
export const IMAGE_FORMATS = {
  png: {
    mimeType: 'image/png',
    extension: 'png',
    quality: 1.0,
    label: 'PNG (무손실)',
  },
  jpeg: {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    quality: 0.92,
    label: 'JPEG (고압축)',
  },
  webp: {
    mimeType: 'image/webp',
    extension: 'webp',
    quality: 0.9,
    label: 'WebP (최적화)',
  },
};

/**
 * 파일명 생성
 */
export const generateFilename = (format = 'png') => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const extension = IMAGE_FORMATS[format]?.extension || 'png';
  return `talkstudio-${timestamp}.${extension}`;
};

/**
 * Canvas를 지정된 포맷으로 내보내기
 */
export const exportCanvas = async (canvas, format = 'png', quality) => {
  const formatInfo = IMAGE_FORMATS[format] || IMAGE_FORMATS.png;
  const finalQuality = quality ?? formatInfo.quality;

  // WebP가 지원되지 않으면 PNG로 폴백
  if (format === 'webp') {
    const support = checkExportSupport();
    if (!support.webp) {
      console.warn('WebP not supported, falling back to PNG');
      return exportCanvas(canvas, 'png');
    }
  }

  const dataUrl = canvas.toDataURL(formatInfo.mimeType, finalQuality);
  return {
    dataUrl,
    filename: generateFilename(format),
    format,
    mimeType: formatInfo.mimeType,
  };
};

/**
 * DataURL을 다운로드
 */
export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 지원되는 포맷 목록 반환
 */
export const getSupportedFormats = () => {
  const support = checkExportSupport();
  const formats = [];

  if (support.png) formats.push('png');
  if (support.jpeg) formats.push('jpeg');
  if (support.webp) formats.push('webp');

  return formats;
};
