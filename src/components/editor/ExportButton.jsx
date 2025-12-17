/**
 * ExportButton - PNG 내보내기 버튼
 * CLAYMORPHISM DESIGN STYLE
 * Uses html-to-image for proper Korean font rendering
 */
import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import { exportAsPng } from '../../utils/imageExport';

const ExportButton = () => {
  const isExporting = useChatStore((s) => s.ui.isExporting);
  const setExporting = useChatStore((s) => s.setExporting);

  const handleExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas) {
      console.error('chat-canvas 요소를 찾을 수 없습니다.');
      return;
    }

    setExporting(true);

    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const filename = `talkstudio-${timestamp}.png`;

      await exportAsPng(canvas, {
        scale: 2,
        filename,
        backgroundColor: null,
      });
    } catch (error) {
      console.error('이미지 내보내기 실패:', error);
      alert('이미지 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 24px',
        borderRadius: '20px',
        fontWeight: 700,
        fontSize: '15px',
        color: '#FFFFFF',
        background: isExporting
          ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
          : 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
        boxShadow: isExporting
          ? '0px 4px 0px rgba(107, 114, 128, 0.4)'
          : '0px 6px 0px rgba(124, 58, 237, 0.5)',
        cursor: isExporting ? 'not-allowed' : 'pointer',
        transform: 'translateY(0)',
        transition: 'all 0.2s ease',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0px 9px 0px rgba(124, 58, 237, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isExporting
          ? '0px 4px 0px rgba(107, 114, 128, 0.4)'
          : '0px 6px 0px rgba(124, 58, 237, 0.5)';
      }}
      onMouseDown={(e) => {
        if (!isExporting) {
          e.currentTarget.style.transform = 'translateY(3px)';
          e.currentTarget.style.boxShadow = '0px 3px 0px rgba(124, 58, 237, 0.5)';
        }
      }}
      onMouseUp={(e) => {
        if (!isExporting) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0px 9px 0px rgba(124, 58, 237, 0.5)';
        }
      }}
    >
      {isExporting ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          내보내는 중...
        </>
      ) : (
        <>
          <Download size={20} />
          PNG로 저장
        </>
      )}
    </button>
  );
};

export default ExportButton;
