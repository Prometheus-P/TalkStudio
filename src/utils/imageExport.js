/**
 * Image Export Utility
 * High-quality image capture with html-to-image
 * Optimized for Korean fonts, iOS emoji, and complex CSS effects
 */

import { toPng, toBlob } from 'html-to-image';

export const DEVICE_SIZES = {
  // 일반 모바일
  iphone14ProMax: { width: 430, height: 932 },
  iphone14: { width: 390, height: 844 },
  iphoneSE: { width: 375, height: 667 },
  androidFHD: { width: 411, height: 915 },
  // 정사각형
  square: { width: 600, height: 600 },
  // 쇼츠/릴스/스토리 (9:16)
  shorts: { width: 1080, height: 1920 },
  igStory: { width: 1080, height: 1920 },
  // 기본값
  default: { width: 390, height: 844 },
};

const FONT_EMBED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');
`;

/**
 * Wait for all fonts to be loaded
 */
async function waitForFonts() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Pre-load and convert image to base64 to avoid CORS issues
 */
async function preloadImage(src) {
  if (!src || src.startsWith('data:')) {
    return src || null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 40;
        canvas.height = img.naturalHeight || 40;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);

    const separator = src.includes('?') ? '&' : '?';
    img.src = `${src}${separator}t=${Date.now()}`;
  });
}

/**
 * Pre-load all images in an element before capture
 */
async function preloadAllImages(element) {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images)
    .filter((img) => img.src && !img.src.startsWith('data:'))
    .map((img) =>
      preloadImage(img.src).then((base64) => {
        if (base64) img.src = base64;
      })
    );

  await Promise.all(promises);
}

/**
 * Workaround for CSS filter rendering issues in html-to-image
 * Temporarily removes problematic CSS properties during capture
 */
function applyFilterWorkaround(element) {
  const elementsWithFilters = element.querySelectorAll('*');
  const originalStyles = new Map();

  elementsWithFilters.forEach((el) => {
    const style = window.getComputedStyle(el);
    const filter = style.filter;
    const backdropFilter = style.backdropFilter || style.webkitBackdropFilter;

    if ((filter && filter !== 'none') || (backdropFilter && backdropFilter !== 'none')) {
      originalStyles.set(el, {
        filter: el.style.filter,
        backdropFilter: el.style.backdropFilter,
        webkitBackdropFilter: el.style.webkitBackdropFilter,
      });

      // Convert filter effects to solid colors for better rendering
      if (backdropFilter && backdropFilter !== 'none') {
        const bgColor = style.backgroundColor;
        if (bgColor && bgColor !== 'transparent') {
          el.style.backdropFilter = 'none';
          el.style.webkitBackdropFilter = 'none';
          // Increase opacity for glassmorphism simulation
          el.style.backgroundColor = bgColor.replace(/[\d.]+\)$/, '0.95)');
        }
      }
    }
  });

  return () => {
    originalStyles.forEach((styles, el) => {
      el.style.filter = styles.filter;
      el.style.backdropFilter = styles.backdropFilter;
      el.style.webkitBackdropFilter = styles.webkitBackdropFilter;
    });
  };
}

/**
 * Filter function to skip problematic nodes
 */
function filterNode(node) {
  const tagName = node.tagName;
  return tagName !== 'SCRIPT' && tagName !== 'NOSCRIPT' && tagName !== 'LINK';
}

/**
 * Common capture options
 */
function getCaptureOptions(element, options = {}) {
  const { scale = 2, backgroundColor = null } = options;
  const rect = element.getBoundingClientRect();

  return {
    quality: 1,
    pixelRatio: scale,
    cacheBust: true,
    skipAutoScale: false,
    filter: filterNode,
    backgroundColor: backgroundColor || undefined,
    width: rect.width,
    height: rect.height,
    style: {
      fontFamily: "'Noto Sans KR', 'Noto Color Emoji', -apple-system, sans-serif",
    },
    fontEmbedCSS: FONT_EMBED_CSS,
  };
}

/**
 * Export element as PNG with proper handling
 */
export async function exportAsPng(element, options = {}) {
  const { filename = `talkstudio-${Date.now()}.png` } = options;

  if (!element) {
    throw new Error('Export element not found');
  }

  await waitForFonts();
  await preloadAllImages(element);

  // Apply filter workaround and get restore function
  const restoreFilters = applyFilterWorkaround(element);

  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const dataUrl = await toPng(element, getCaptureOptions(element, options));

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          success: true,
          filename,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        resolve({ success: true, filename, width: 0, height: 0 });
      };
      img.src = dataUrl;
    });
  } finally {
    restoreFilters();
  }
}

/**
 * Export directly from a React ref
 */
export async function exportFromRef(ref, options = {}) {
  const element = ref?.current;
  if (!element) {
    throw new Error('Ref element not found');
  }
  return exportAsPng(element, options);
}

/**
 * Copy to clipboard instead of downloading
 */
export async function copyToClipboard(element, options = {}) {
  if (!element) {
    throw new Error('Export element not found');
  }

  await waitForFonts();
  await preloadAllImages(element);

  const restoreFilters = applyFilterWorkaround(element);

  try {
    const blob = await toBlob(element, getCaptureOptions(element, options));

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);

    return { success: true, copied: true };
  } finally {
    restoreFilters();
  }
}

/**
 * Get data URL without downloading
 */
export async function getDataUrl(element, options = {}) {
  if (!element) {
    throw new Error('Export element not found');
  }

  await waitForFonts();
  await preloadAllImages(element);

  const restoreFilters = applyFilterWorkaround(element);

  try {
    return await toPng(element, getCaptureOptions(element, options));
  } finally {
    restoreFilters();
  }
}

/**
 * Batch export multiple elements
 */
export async function batchExport(elements, options = {}) {
  const results = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const filename = options.filenamePrefix
      ? `${options.filenamePrefix}-${i + 1}.png`
      : `talkstudio-${Date.now()}-${i + 1}.png`;

    try {
      const result = await exportAsPng(element, { ...options, filename });
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export default {
  exportAsPng,
  exportFromRef,
  copyToClipboard,
  getDataUrl,
  batchExport,
  DEVICE_SIZES,
};
