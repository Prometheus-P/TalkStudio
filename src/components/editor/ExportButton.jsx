/**
 * ExportButton - 이미지 내보내기 버튼
 * PNG, JPEG, WebP 포맷 지원
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import {
  checkExportSupport,
  IMAGE_FORMATS,
  exportCanvas,
  downloadDataUrl,
} from '../../utils/exportUtils';

const ExportButton = () => {
  const isExporting = useChatStore((s) => s.ui.isExporting);
  const setExporting = useChatStore((s) => s.setExporting);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [supportedFormats, setSupportedFormats] = useState(['png']);

  // 브라우저 지원 포맷 확인
  useEffect(() => {
    const support = checkExportSupport();
    const formats = [];
    if (support.png) formats.push('png');
    if (support.jpeg) formats.push('jpeg');
    if (support.webp) formats.push('webp');
    setSupportedFormats(formats);
  }, []);

  const handleExport = async () => {
    const canvas = document.getElementById('chat-canvas');
    if (!canvas) {
      console.error('chat-canvas 요소를 찾을 수 없습니다.');
      return;
    }

    setExporting(true);
    setShowFormatMenu(false);

    try {
      const result = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const { dataUrl, filename } = await exportCanvas(result, selectedFormat);
      downloadDataUrl(dataUrl, filename);
    } catch (error) {
      console.error('이미지 내보내기 실패:', error);
      alert('이미지 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const _formatLabel = IMAGE_FORMATS[selectedFormat]?.label || 'PNG';

  return (
    <div className="relative w-full">
      {/* 메인 내보내기 버튼 */}
      <div className="flex gap-1">
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px 20px',
            borderRadius: '20px 0 0 20px',
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
            transition: 'all 0.2s ease',
            border: 'none',
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
              {selectedFormat.toUpperCase()}로 저장
            </>
          )}
        </button>

        {/* 포맷 선택 버튼 */}
        <button
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 12px',
            borderRadius: '0 20px 20px 0',
            fontWeight: 700,
            color: '#FFFFFF',
            background: isExporting
              ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
              : 'linear-gradient(145deg, #8B5CF6 0%, #6D28D9 100%)',
            boxShadow: isExporting
              ? '0px 4px 0px rgba(107, 114, 128, 0.4)'
              : '0px 6px 0px rgba(109, 40, 217, 0.5)',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            borderLeft: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <ChevronDown
            size={18}
            style={{
              transform: showFormatMenu ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* 포맷 선택 드롭다운 */}
      {showFormatMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F3F4F6 100%)',
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {supportedFormats.map((format) => (
            <button
              key={format}
              onClick={() => {
                setSelectedFormat(format);
                setShowFormatMenu(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: selectedFormat === format
                  ? 'rgba(168, 85, 247, 0.1)'
                  : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedFormat === format ? 600 : 400,
                color: selectedFormat === format ? '#7C3AED' : '#374151',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (selectedFormat !== format) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selectedFormat === format
                  ? 'rgba(168, 85, 247, 0.1)'
                  : 'transparent';
              }}
            >
              <span>{IMAGE_FORMATS[format].label}</span>
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                .{IMAGE_FORMATS[format].extension}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
