/**
 * ExcelUploader - Excel 파일 업로드 컴포넌트
 * T040: 대량 생성을 위한 Excel 파일 업로드 UI
 */
import React, { useCallback, useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import { downloadBulkTemplate, startBulkGeneration } from '../../services/conversationApi';

const ExcelUploader = ({ onJobStarted, disabled = false }) => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile) => {
    setError(null);

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Excel 파일만 업로드할 수 있습니다. (.xlsx, .xls)');
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setFile(selectedFile);
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  // Download template
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setError(null);

    try {
      await downloadBulkTemplate();
    } catch (err) {
      setError(err.message || '템플릿 다운로드에 실패했습니다.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Upload and start bulk generation
  const handleUpload = async () => {
    if (!file || isUploading || disabled) return;

    setIsUploading(true);
    setError(null);

    try {
      const job = await startBulkGeneration(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onJobStarted) {
        onJobStarted(job);
      }
    } catch (err) {
      setError(err.message || '대량 생성 시작에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Download */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1px solid #BBF7D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Excel 템플릿</p>
            <p className="text-xs text-green-600">템플릿을 다운로드하여 시나리오를 입력하세요</p>
          </div>
        </div>
        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: '#16A34A',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isDownloadingTemplate ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isDownloadingTemplate ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          다운로드
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{
          padding: '32px 24px',
          borderRadius: '16px',
          border: isDragOver
            ? '2px dashed #A855F7'
            : file
            ? '2px solid #A855F7'
            : '2px dashed #E5E7EB',
          background: isDragOver
            ? '#FAF5FF'
            : file
            ? '#FAF5FF'
            : '#F9FAFB',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        {file ? (
          <div className="space-y-3">
            <CheckCircle size={40} className="text-purple-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#6B7280',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
              파일 제거
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload
              size={40}
              className={isDragOver ? 'text-purple-500' : 'text-gray-400'}
              style={{ margin: '0 auto' }}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Excel 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="text-xs text-gray-500 mt-1">
                .xlsx, .xls 파일 (최대 5MB, 100개 시나리오)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#DC2626',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={isUploading || disabled}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: isUploading
              ? '#E5E7EB'
              : 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
            color: isUploading ? '#9CA3AF' : '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: isUploading || disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isUploading
              ? 'none'
              : '0 4px 12px rgba(168, 85, 247, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload size={18} />
              대량 생성 시작
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ExcelUploader;
