/**
 * BottomSheet - 재사용 가능한 모바일 바텀시트
 * 스와이프 다운으로 닫기, 배경 탭으로 닫기 지원
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useEffect, useRef, useState } from 'react';

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  closeOnBackdrop = true,
  maxHeight = '80vh',
}) => {
  const sheetRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  // 스와이프 다운으로 닫기
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    // 아래로만 드래그 허용
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // 100px 이상 드래그하면 닫기
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 transition-opacity duration-250"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 transition-transform duration-250"
        style={{
          maxHeight,
          transform: `translateY(${isDragging ? dragY : 0}px)`,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0px -8px 32px rgba(0, 0, 0, 0.15)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 드래그 핸들 */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                background: '#D1D5DB',
              }}
            />
          </div>
        )}

        {/* 타이틀 */}
        {title && (
          <div
            className="px-6 py-3 border-b"
            style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
          >
            <h3
              className="font-bold text-lg"
              style={{ color: '#374151' }}
            >
              {title}
            </h3>
          </div>
        )}

        {/* 콘텐츠 */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: `calc(${maxHeight} - ${title ? '80px' : '40px'})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
