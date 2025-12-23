// backend/src/services/excel_parser.js
// Excel file parsing service (FR-6.1)

import ExcelJS from 'exceljs';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('excel-parser');

/**
 * Expected columns in the message template
 */
export const TEMPLATE_COLUMNS = {
  authorId: { required: true, type: 'string', description: 'Discord 사용자 ID' },
  authorName: { required: true, type: 'string', description: '작성자 이름' },
  content: { required: true, type: 'string', description: '메시지 내용' },
  timestamp: { required: false, type: 'date', description: '메시지 시간 (YYYY-MM-DD HH:mm:ss)' },
  channelId: { required: false, type: 'string', description: '채널 ID' },
  channelName: { required: false, type: 'string', description: '채널 이름' },
};

/**
 * Parse Excel file buffer to JSON array
 * @param {Buffer} buffer - Excel file buffer
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} { data: Array, headers: Array, sheetName: string }
 */
export const parseExcelBuffer = async (buffer, options = {}) => {
  const { sheetIndex = 0, headerRow = 1 } = options;

  try {
    // Read workbook from buffer
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Get worksheet
    const worksheet = workbook.worksheets[sheetIndex];
    if (!worksheet) {
      throw new Error(`Sheet at index ${sheetIndex} not found`);
    }

    const sheetName = worksheet.name;

    // Extract headers from first row
    const headerRowData = worksheet.getRow(1);
    const headers = [];
    headerRowData.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cell.value ? String(cell.value) : null;
    });

    // Convert worksheet to JSON array
    const jsonData = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const headerName = headers[colNumber - 1];
        if (headerName) {
          // Handle date values
          let value = cell.value;
          if (value instanceof Date) {
            value = value.toISOString().replace('T', ' ').substring(0, 19);
          }
          rowData[headerName] = value;
        }
      });
      jsonData.push(rowData);
    });

    // Remove header row from data if using row number
    const data = headerRow === 1 ? jsonData : jsonData.slice(1);

    logger.info('Excel parsed successfully', {
      sheetName,
      rowCount: data.length,
      columnCount: headers.filter(Boolean).length,
    });

    return {
      data,
      headers: headers.filter(Boolean),
      sheetName,
      rowCount: data.length,
    };
  } catch (error) {
    logger.error('Excel parsing failed', { error: error.message });
    throw new Error(`Excel 파일 파싱 실패: ${error.message}`);
  }
};

/**
 * Parse Excel file and convert to DiscordMessage format
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Promise<Object>} { messages: Array, errors: Array }
 */
export const parseMessagesFromExcel = async (buffer) => {
  const { data, headers } = await parseExcelBuffer(buffer);
  const messages = [];
  const errors = [];

  // Validate headers
  const requiredColumns = Object.entries(TEMPLATE_COLUMNS)
    .filter(([, config]) => config.required)
    .map(([name]) => name);

  const missingColumns = requiredColumns.filter(
    (col) => !headers.some((h) => h.toLowerCase() === col.toLowerCase())
  );

  if (missingColumns.length > 0) {
    errors.push({
      row: 0,
      type: 'header',
      message: `필수 컬럼 누락: ${missingColumns.join(', ')}`,
    });
    return { messages, errors };
  }

  // Create column mapping (case-insensitive)
  const columnMap = {};
  headers.forEach((header) => {
    const lowerHeader = header.toLowerCase();
    const matchingKey = Object.keys(TEMPLATE_COLUMNS).find(
      (k) => k.toLowerCase() === lowerHeader
    );
    if (matchingKey) {
      columnMap[header] = matchingKey;
    }
  });

  // Parse each row
  data.forEach((row, index) => {
    const rowNumber = index + 2; // 1-based, skip header
    const message = {};

    try {
      // Map columns to message fields
      Object.entries(columnMap).forEach(([excelCol, msgField]) => {
        let value = row[excelCol];

        // Type conversion
        const fieldConfig = TEMPLATE_COLUMNS[msgField];
        if (fieldConfig.type === 'date' && value) {
          value = parseDate(value);
        }

        message[msgField] = value;
      });

      // Add row metadata
      message._sourceRow = rowNumber;
      message._importedAt = new Date().toISOString();

      messages.push(message);
    } catch (error) {
      errors.push({
        row: rowNumber,
        type: 'parse',
        message: error.message,
        data: row,
      });
    }
  });

  logger.info('Messages parsed from Excel', {
    totalRows: data.length,
    successCount: messages.length,
    errorCount: errors.length,
  });

  return { messages, errors };
};

/**
 * Parse date string to ISO format
 */
const parseDate = (value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`유효하지 않은 날짜 형식: ${value}`);
  }

  return date.toISOString();
};

/**
 * Get template column information
 */
export const getTemplateInfo = () => {
  return {
    columns: TEMPLATE_COLUMNS,
    requiredColumns: Object.entries(TEMPLATE_COLUMNS)
      .filter(([, config]) => config.required)
      .map(([name]) => name),
    optionalColumns: Object.entries(TEMPLATE_COLUMNS)
      .filter(([, config]) => !config.required)
      .map(([name]) => name),
  };
};

export default {
  parseExcelBuffer,
  parseMessagesFromExcel,
  getTemplateInfo,
  TEMPLATE_COLUMNS,
};
