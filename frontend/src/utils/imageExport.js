/**
 * Image Export Utility
 * Uses html-to-image for better font rendering (especially Korean)
 */

import { toPng, toBlob } from 'html-to-image';

// Mobile device dimensions (standard aspect ratios)
export const DEVICE_SIZES = {
  // iPhone 14 Pro Max
  iphone14ProMax: { width: 430, height: 932 },
  // iPhone 14/13
  iphone14: { width: 390, height: 844 },
  // iPhone SE
  iphoneSE: { width: 375, height: 667 },
  // Android common
  androidFHD: { width: 411, height: 915 },
  // Custom square for social media
  square: { width: 600, height: 600 },
  // Instagram story
  igStory: { width: 1080, height: 1920 },
  // Default
  default: { width: 390, height: 844 },
};

/**
 * Wait for all fonts to be loaded
 */
async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Additional delay for font rendering
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Pre-load and convert image to base64 to avoid CORS issues
 */
async function preloadImage(src) {
  if (!src) return null;

  // Skip if already base64
  if (src.startsWith('data:')) {
    return src;
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
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        console.warn('Failed to convert image to base64:', src, err);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image:', src);
      resolve(null);
    };

    // Add timestamp to bust cache
    const separator = src.includes('?') ? '&' : '?';
    img.src = `${src}${separator}t=${Date.now()}`;
  });
}

/**
 * Pre-load all images in an element before capture
 */
async function preloadAllImages(element) {
  const images = element.querySelectorAll('img');
  const promises = [];

  images.forEach((img) => {
    if (img.src && !img.src.startsWith('data:')) {
      promises.push(
        preloadImage(img.src).then((base64) => {
          if (base64) {
            img.src = base64;
          }
        })
      );
    }
  });

  await Promise.all(promises);
}

/**
 * Filter function for html-to-image to skip problematic elements
 */
function filterNode(node) {
  // Skip script tags
  if (node.tagName === 'SCRIPT') return false;
  // Skip noscript tags
  if (node.tagName === 'NOSCRIPT') return false;
  return true;
}

/**
 * Export element as PNG with proper handling
 */
export async function exportAsPng(element, options = {}) {
  const {
    scale = 2,
    filename = `talkstudio-${Date.now()}.png`,
    backgroundColor = null,
  } = options;

  if (!element) {
    throw new Error('Export element not found');
  }

  try {
    // Wait for fonts to load
    await waitForFonts();

    // Pre-load all images to base64
    await preloadAllImages(element);

    // Small delay for rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture with html-to-image
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: scale,
      cacheBust: true,
      skipAutoScale: false,
      filter: filterNode,
      backgroundColor: backgroundColor || undefined,
      style: {
        // Ensure font is applied
        fontFamily: "'Noto Sans KR', sans-serif",
      },
      fontEmbedCSS: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
      `,
    });

    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();

    // Get image dimensions from dataUrl
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
      img.src = dataUrl;
    });
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

/**
 * Export directly from a ref (React ref)
 */
export async function exportFromRef(ref, options = {}) {
  const element = ref.current;
  if (!element) {
    throw new Error('Ref element not found');
  }
  return exportAsPng(element, options);
}

/**
 * Copy to clipboard instead of downloading
 */
export async function copyToClipboard(element, options = {}) {
  const { scale = 2, backgroundColor = null } = options;

  if (!element) {
    throw new Error('Export element not found');
  }

  // Wait for fonts
  await waitForFonts();

  // Pre-load all images
  await preloadAllImages(element);

  const blob = await toBlob(element, {
    quality: 1,
    pixelRatio: scale,
    cacheBust: true,
    filter: filterNode,
    backgroundColor: backgroundColor || undefined,
    fontEmbedCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
    `,
  });

  if (!blob) {
    throw new Error('Failed to create image blob');
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return { success: true, copied: true };
  } catch (err) {
    throw new Error('Failed to copy to clipboard: ' + err.message);
  }
}

/**
 * Get data URL without downloading
 */
export async function getDataUrl(element, options = {}) {
  const { scale = 2, backgroundColor = null } = options;

  if (!element) {
    throw new Error('Export element not found');
  }

  // Wait for fonts
  await waitForFonts();

  // Pre-load all images
  await preloadAllImages(element);

  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: scale,
    cacheBust: true,
    filter: filterNode,
    backgroundColor: backgroundColor || undefined,
    fontEmbedCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
    `,
  });

  return dataUrl;
}

export default {
  exportAsPng,
  exportFromRef,
  copyToClipboard,
  getDataUrl,
  DEVICE_SIZES,
};
