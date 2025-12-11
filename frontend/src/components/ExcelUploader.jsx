// frontend/src/components/ExcelUploader.jsx
// Excel file upload component (FR-6.1)

import React, { useState, useRef } from 'react';

const ExcelUploader = ({ onUpload, onValidationResult, validateOnly = false }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validateOnly', validateOnly.toString());

      const response = await fetch('/api/data/import/excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.mode === 'validation') {
        onValidationResult?.(result);
      } else {
        onUpload?.(result);
      }

      if (!result.success) {
        setError(result.error || '업로드 중 오류가 발생했습니다');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="excel-uploader">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed',
          borderColor: dragOver ? '#3b82f6' : file ? '#10b981' : '#d1d5db',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#f9fafb',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
        />

        {file ? (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{file.name}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              {formatFileSize(file.size)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
            <div style={{ marginBottom: '4px' }}>
              Excel 파일을 드래그하거나 클릭하여 선택
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              .xlsx, .xls 파일 지원 (최대 10MB)
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: file && !uploading ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: file && !uploading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
          }}
        >
          {uploading ? '처리 중...' : validateOnly ? '유효성 검증' : '업로드'}
        </button>

        {file && (
          <button
            onClick={handleClear}
            disabled={uploading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* Template Download Link */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <a
          href="/templates/message_template.xlsx"
          download
          style={{ color: '#3b82f6', fontSize: '14px' }}
        >
          템플릿 다운로드
        </a>
      </div>
    </div>
  );
};

export default ExcelUploader;
