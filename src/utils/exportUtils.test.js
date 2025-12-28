/**
 * Export Utilities Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkExportSupport,
  IMAGE_FORMATS,
  generateFilename,
  exportCanvas,
  downloadDataUrl,
  getSupportedFormats,
} from './exportUtils';

describe('Export Utilities', () => {
  // ============================================
  // checkExportSupport
  // ============================================
  describe('checkExportSupport', () => {
    it('should return support object', () => {
      const support = checkExportSupport();
      expect(support).toHaveProperty('canvas');
      expect(support).toHaveProperty('png');
      expect(support).toHaveProperty('jpeg');
      expect(support).toHaveProperty('webp');
    });

    it('should report PNG as supported', () => {
      const support = checkExportSupport();
      expect(support.png).toBe(true);
    });

    it('should report JPEG as supported', () => {
      const support = checkExportSupport();
      expect(support.jpeg).toBe(true);
    });

    it('should check canvas support', () => {
      const support = checkExportSupport();
      expect(typeof support.canvas).toBe('boolean');
    });
  });

  // ============================================
  // IMAGE_FORMATS
  // ============================================
  describe('IMAGE_FORMATS', () => {
    it('should have PNG format', () => {
      expect(IMAGE_FORMATS.png).toBeDefined();
      expect(IMAGE_FORMATS.png.mimeType).toBe('image/png');
      expect(IMAGE_FORMATS.png.extension).toBe('png');
      expect(IMAGE_FORMATS.png.quality).toBe(1.0);
    });

    it('should have JPEG format', () => {
      expect(IMAGE_FORMATS.jpeg).toBeDefined();
      expect(IMAGE_FORMATS.jpeg.mimeType).toBe('image/jpeg');
      expect(IMAGE_FORMATS.jpeg.extension).toBe('jpg');
      expect(IMAGE_FORMATS.jpeg.quality).toBe(0.92);
    });

    it('should have WebP format', () => {
      expect(IMAGE_FORMATS.webp).toBeDefined();
      expect(IMAGE_FORMATS.webp.mimeType).toBe('image/webp');
      expect(IMAGE_FORMATS.webp.extension).toBe('webp');
      expect(IMAGE_FORMATS.webp.quality).toBe(0.9);
    });

    it('should have labels for all formats', () => {
      expect(IMAGE_FORMATS.png.label).toBeDefined();
      expect(IMAGE_FORMATS.jpeg.label).toBeDefined();
      expect(IMAGE_FORMATS.webp.label).toBeDefined();
    });
  });

  // ============================================
  // generateFilename
  // ============================================
  describe('generateFilename', () => {
    it('should generate PNG filename by default', () => {
      const filename = generateFilename();
      expect(filename).toMatch(/^talkstudio-\d{14}\.png$/);
    });

    it('should generate PNG filename when specified', () => {
      const filename = generateFilename('png');
      expect(filename).toMatch(/\.png$/);
    });

    it('should generate JPEG filename', () => {
      const filename = generateFilename('jpeg');
      expect(filename).toMatch(/\.jpg$/);
    });

    it('should generate WebP filename', () => {
      const filename = generateFilename('webp');
      expect(filename).toMatch(/\.webp$/);
    });

    it('should include timestamp', () => {
      const filename = generateFilename();
      const match = filename.match(/talkstudio-(\d+)/);
      expect(match).toBeTruthy();
      expect(match[1].length).toBe(14);
    });

    it('should fallback to png for unknown format', () => {
      const filename = generateFilename('unknown');
      expect(filename).toMatch(/\.png$/);
    });
  });

  // ============================================
  // exportCanvas
  // ============================================
  describe('exportCanvas', () => {
    let mockCanvas;

    beforeEach(() => {
      mockCanvas = document.createElement('canvas');
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      const ctx = mockCanvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
    });

    it('should export canvas as PNG', async () => {
      const result = await exportCanvas(mockCanvas, 'png');
      expect(result.dataUrl).toMatch(/^data:image\/png/);
      expect(result.format).toBe('png');
      expect(result.mimeType).toBe('image/png');
      expect(result.filename).toMatch(/\.png$/);
    });

    it('should export canvas as JPEG', async () => {
      const result = await exportCanvas(mockCanvas, 'jpeg');
      expect(result.dataUrl).toMatch(/^data:image\/jpeg/);
      expect(result.format).toBe('jpeg');
    });

    it('should use default PNG format', async () => {
      const result = await exportCanvas(mockCanvas);
      expect(result.format).toBe('png');
    });

    it('should use custom quality', async () => {
      const result = await exportCanvas(mockCanvas, 'jpeg', 0.5);
      expect(result.dataUrl).toBeTruthy();
    });

    it('should fallback to PNG for unsupported format', async () => {
      const result = await exportCanvas(mockCanvas, 'unknown');
      expect(result.format).toBe('unknown'); // format stays same
      expect(result.dataUrl).toMatch(/^data:image\/png/); // but uses PNG mime type
    });
  });

  // ============================================
  // downloadDataUrl
  // ============================================
  describe('downloadDataUrl', () => {
    it('should create and click download link', () => {
      const mockClick = vi.fn();
      const mockAppend = vi.fn();
      const mockRemove = vi.fn();

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
          };
        }
        return originalCreateElement(tag);
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppend);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemove);

      downloadDataUrl('data:image/png;base64,test', 'test.png');

      expect(mockClick).toHaveBeenCalled();
      expect(mockAppend).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  // ============================================
  // getSupportedFormats
  // ============================================
  describe('getSupportedFormats', () => {
    it('should return array of supported formats', () => {
      const formats = getSupportedFormats();
      expect(Array.isArray(formats)).toBe(true);
      expect(formats).toContain('png');
      expect(formats).toContain('jpeg');
    });

    it('should include at least png and jpeg', () => {
      const formats = getSupportedFormats();
      expect(formats.length).toBeGreaterThanOrEqual(2);
    });
  });
});
