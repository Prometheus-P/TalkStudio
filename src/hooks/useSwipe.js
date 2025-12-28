/**
 * useSwipe - 스와이프 제스처 감지 훅
 */
import { useState, useCallback, useRef } from 'react';

export function useSwipe(onSwipeLeft, onSwipeRight, options = {}) {
  const { threshold = 50, preventScroll = false } = options;

  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    // 수평 스와이프가 수직보다 크면 스크롤 방지
    if (preventScroll) {
      const deltaX = Math.abs(touchEnd.current.x - touchStart.current.x);
      const deltaY = Math.abs(touchEnd.current.y - touchStart.current.y);
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }, [preventScroll]);

  const onTouchEnd = useCallback(() => {
    setIsSwiping(false);

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = Math.abs(touchEnd.current.y - touchStart.current.y);

    // 수평 이동이 수직 이동보다 크고 threshold 이상일 때만 스와이프
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
  };
}
