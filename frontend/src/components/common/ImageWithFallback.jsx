/**
 * ImageWithFallback Component
 * Handles image loading with fallback for broken images
 */

import { useState, useCallback, useEffect, memo } from 'react';

// Default avatar placeholder (SVG data URI)
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzU4NjVmMiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOCIvPjxwYXRoIGQ9Ik0yMCAyNWMtOCAwLTE0IDYtMTQgMTJ2M2gyOHYtM2MwLTYtNi0xMi0xNC0xMnoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOCIvPjwvc3ZnPg==';

/**
 * Convert an image URL to base64 data URL
 */
async function convertToBase64(src) {
  if (!src || src.startsWith('data:')) {
    return src;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        console.warn('Failed to convert image:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    // Try with cache bust
    const separator = src.includes('?') ? '&' : '?';
    img.src = `${src}${separator}_t=${Date.now()}`;
  });
}

/**
 * ImageWithFallback - Shows fallback on error
 */
const ImageWithFallback = memo(function ImageWithFallback({
  src,
  alt = '',
  fallback = DEFAULT_AVATAR,
  fallbackText = '',
  fallbackBgColor = '#5865f2',
  className = '',
  style = {},
  onLoad,
  onError,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convert external images to base64 on mount
  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      if (!src) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // If already base64, use directly
      if (src.startsWith('data:')) {
        setImageSrc(src);
        setIsLoading(false);
        return;
      }

      // Try to convert to base64
      const base64 = await convertToBase64(src);
      if (mounted) {
        if (base64) {
          setImageSrc(base64);
          setHasError(false);
        } else {
          setHasError(true);
        }
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    setHasError(false);
    loadImage();

    return () => {
      mounted = false;
    };
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (onError) onError();
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-300 ${className}`}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...props}
      />
    );
  }

  // Show fallback on error
  if (hasError) {
    // If fallback is a URL/data URI, show image
    if (fallback && (fallback.startsWith('data:') || fallback.startsWith('http'))) {
      return (
        <img
          src={fallback}
          alt={alt}
          className={className}
          style={style}
          {...props}
        />
      );
    }

    // Text fallback (initials)
    if (fallbackText) {
      return (
        <div
          className={className}
          style={{
            ...style,
            backgroundColor: fallbackBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '1rem',
          }}
          {...props}
        >
          {fallbackText.charAt(0).toUpperCase()}
        </div>
      );
    }

    // Default fallback
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: fallbackBgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...props}
      >
        <svg className="w-1/2 h-1/2 text-white/80" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    );
  }

  // Show image
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      crossOrigin="anonymous"
      {...props}
    />
  );
});

export default ImageWithFallback;
export { DEFAULT_AVATAR, convertToBase64 };
