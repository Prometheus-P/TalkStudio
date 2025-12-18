/**
 * ExcelImporter Component
 * Client-side Excel parsing with drag & drop support
 */

import { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import useChatStore, { useExcelImport } from '../../store/useChatStore';

// Column mapping configuration
const COLUMN_MAPPINGS = {
  speaker: ['speaker', '발신자', '보낸사람', 'who', 'from', 'sender'],
  text: ['text', '내용', '메시지', 'message', 'content', '텍스트'],
  type: ['type', '타입', '유형', 'kind'],
  time: ['time', '시간', 'timestamp', '날짜', 'date'],
  name: ['name', '이름', '닉네임', 'nickname', 'display_name'],
};

// Unique ID generator
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Parse Excel file and extract chat messages
 */
async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('엑셀 파일에 시트가 없습니다.'));
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          reject(new Error('데이터가 부족합니다. 헤더와 최소 1개의 메시지가 필요합니다.'));
          return;
        }

        // Find header row and map columns
        const { headerIndex, columnMap } = findHeaderRow(rows);

        if (!columnMap || !columnMap.speaker || !columnMap.text) {
          reject(new Error('필수 컬럼을 찾을 수 없습니다. "speaker"와 "text" 컬럼이 필요합니다.'));
          return;
        }

        // Parse data rows
        const dataRows = rows.slice(headerIndex + 1);
        const messages = [];
        const errors = [];

        dataRows.forEach((row, index) => {
          try {
            const message = parseRow(row, columnMap, index + headerIndex + 2);
            if (message) {
              messages.push(message);
            }
          } catch (err) {
            errors.push({ row: index + headerIndex + 2, error: err.message });
          }
        });

        if (messages.length === 0) {
          reject(new Error('유효한 메시지를 찾을 수 없습니다.'));
          return;
        }

        resolve({
          messages,
          stats: {
            totalRows: dataRows.length,
            parsedRows: messages.length,
            errors: errors.slice(0, 10), // Limit errors
            warnings: errors.length > 0 ? [`${errors.length}개의 행에서 오류가 발생했습니다.`] : [],
          },
        });
      } catch (err) {
        reject(new Error(`파일 파싱 실패: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Find header row and create column mapping
 */
function findHeaderRow(rows, maxSearch = 10) {
  for (let i = 0; i < Math.min(rows.length, maxSearch); i++) {
    const row = rows[i];
    const columnMap = tryMapColumns(row);

    if (columnMap && columnMap.speaker !== undefined && columnMap.text !== undefined) {
      return { headerIndex: i, columnMap };
    }
  }
  return { headerIndex: -1, columnMap: null };
}

/**
 * Try to map row to column indices
 */
function tryMapColumns(row) {
  if (!row || !Array.isArray(row)) return null;

  const columnMap = {};

  row.forEach((cell, index) => {
    if (cell === null || cell === undefined) return;

    const cellStr = String(cell).trim().toLowerCase();

    for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
      if (aliases.includes(cellStr)) {
        columnMap[field] = index;
        break;
      }
    }
  });

  return Object.keys(columnMap).length > 0 ? columnMap : null;
}

/**
 * Parse a single row into a message object
 */
function parseRow(row, columnMap, rowIndex) {
  if (!row || row.every((cell) => cell === '' || cell === null)) {
    return null;
  }

  // Get speaker (required)
  const speakerRaw = row[columnMap.speaker];
  if (!speakerRaw) return null;

  const speakerStr = String(speakerRaw).trim().toLowerCase();
  let speaker = 'other';
  if (['me', '나', '본인', '1'].includes(speakerStr)) {
    speaker = 'me';
  } else if (['system', '시스템'].includes(speakerStr)) {
    speaker = 'system';
  }

  // Get text (required)
  const textRaw = row[columnMap.text];
  if (!textRaw) return null;

  const text = String(textRaw).trim();
  if (!text) return null;

  // Get type (optional)
  let type = 'text';
  if (columnMap.type !== undefined) {
    const typeRaw = row[columnMap.type];
    if (typeRaw) {
      const typeStr = String(typeRaw).trim().toLowerCase();
      if (['emoji', '이모지', '이모티콘'].includes(typeStr)) {
        type = 'emoji';
      } else if (['image', '이미지', '사진'].includes(typeStr)) {
        type = 'image';
      } else if (['system', '시스템'].includes(typeStr)) {
        type = 'system';
      }
    }
  }

  // Get name (optional)
  let speakerName = null;
  if (columnMap.name !== undefined && row[columnMap.name]) {
    speakerName = String(row[columnMap.name]).trim();
  }

  // Get timestamp (optional)
  let timestamp = new Date().toISOString();
  if (columnMap.time !== undefined && row[columnMap.time]) {
    const timeVal = row[columnMap.time];
    if (timeVal instanceof Date) {
      timestamp = timeVal.toISOString();
    } else if (typeof timeVal === 'string') {
      // Try to parse string time
      const parsed = new Date(timeVal);
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed.toISOString();
      }
    }
  }

  return {
    id: generateId(),
    speaker,
    speaker_name: speakerName,
    text,
    type,
    timestamp,
    read: true,
  };
}

/**
 * Validate file type
 */
function isValidExcelFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ];
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const extension = '.' + file.name.split('.').pop().toLowerCase();

  return validTypes.includes(file.type) || validExtensions.includes(extension);
}

/**
 * Main ExcelImporter Component
 */
export default function ExcelImporter({
  onImportComplete,
  mode = 'replace', // 'replace' | 'append'
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { isLoading, error, stats } = useExcelImport();
  const {
    setExcelLoading,
    setExcelError,
    importFromExcel,
    appendFromExcel,
    clearMessages,
  } = useChatStore();

  // Handle file selection
  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      // Validate file type
      if (!isValidExcelFile(file)) {
        setExcelError('지원하지 않는 파일 형식입니다. .xlsx, .xls, .csv 파일만 업로드 가능합니다.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setExcelError('파일 크기가 5MB를 초과합니다.');
        return;
      }

      setExcelLoading(true);
      setPreview(null);

      try {
        const result = await parseExcelFile(file);

        // Show preview
        setPreview({
          filename: file.name,
          messages: result.messages.slice(0, 5), // Preview first 5
          stats: result.stats,
          allMessages: result.messages,
        });
      } catch (err) {
        setExcelError(err.message);
      }
    },
    [setExcelLoading, setExcelError]
  );

  // Confirm import
  const confirmImport = useCallback(() => {
    if (!preview) return;

    try {
      if (mode === 'append') {
        appendFromExcel(preview.allMessages, preview.stats);
      } else {
        importFromExcel(preview.allMessages, preview.stats);
      }

      setPreview(null);

      if (onImportComplete) {
        onImportComplete(preview.allMessages, preview.stats);
      }
    } catch (err) {
      setExcelError(err.message);
    }
  }, [preview, mode, appendFromExcel, importFromExcel, setExcelError, onImportComplete]);

  // Cancel import
  const cancelImport = useCallback(() => {
    setPreview(null);
    setExcelError(null);
  }, [setExcelError]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  // Click to select file
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files[0];
      handleFile(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className={`excel-importer ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-102'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label="엑셀 파일 업로드"
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">파일 분석 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-700">엑셀 파일을 드래그하거나 클릭하여 업로드</p>
              <p className="text-sm text-gray-500 mt-1">.xlsx, .xls, .csv (최대 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && !preview && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-red-800">업로드 실패</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">미리보기</h3>

          {/* Stats */}
          <div className="flex gap-4 mb-4 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              파일: {preview.filename}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
              {preview.stats.parsedRows}개 메시지
            </span>
            {preview.stats.errors.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                {preview.stats.errors.length}개 오류
              </span>
            )}
          </div>

          {/* Message preview */}
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {preview.messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`
                  flex items-start gap-2 p-2 rounded-lg text-sm
                  ${msg.speaker === 'me' ? 'bg-yellow-50' : 'bg-gray-50'}
                `}
              >
                <span className={`
                  px-1.5 py-0.5 rounded text-xs font-medium
                  ${msg.speaker === 'me' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-700'}
                `}>
                  {msg.speaker}
                </span>
                <span className="flex-1 text-gray-700 truncate">{msg.text}</span>
              </div>
            ))}
            {preview.allMessages.length > 5 && (
              <p className="text-center text-gray-500 text-sm py-2">
                ... 외 {preview.allMessages.length - 5}개 메시지
              </p>
            )}
          </div>

          {/* Warnings */}
          {preview.stats.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">{preview.stats.warnings.join(', ')}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={confirmImport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {mode === 'append' ? '추가하기' : '가져오기'}
            </button>
            <button
              onClick={cancelImport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Template info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">엑셀 형식 안내</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">speaker</th>
              <th className="pb-2">text</th>
              <th className="pb-2">type</th>
              <th className="pb-2">name</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="py-1">me</td>
              <td className="py-1">안녕하세요!</td>
              <td className="py-1">text</td>
              <td className="py-1">나</td>
            </tr>
            <tr>
              <td className="py-1">other</td>
              <td className="py-1">반가워요</td>
              <td className="py-1">text</td>
              <td className="py-1">지수</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
