/**
 * Excel Parser - Excel 파싱 유틸리티
 * 대량 생성용 Excel 템플릿 파싱 및 검증
 */
import * as XLSX from 'xlsx';
import logger from './logger.js';

// 유효한 톤 옵션
const VALID_TONES = ['casual', 'formal', 'humorous'];

// 유효한 플랫폼 옵션
const VALID_PLATFORMS = ['kakaotalk', 'discord', 'telegram', 'instagram'];

// 템플릿 컬럼 정의
const TEMPLATE_COLUMNS = [
  { key: 'scenario', header: 'scenario', required: true },
  { key: 'participants', header: 'participants', required: true },
  { key: 'messageCount', header: 'message_count', required: true },
  { key: 'tone', header: 'tone', required: true },
  { key: 'platform', header: 'platform', required: true },
];

/**
 * Generate Excel template buffer for download
 * @returns {Buffer} - Excel file buffer
 */
export const generateTemplate = () => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Header row
  const headers = TEMPLATE_COLUMNS.map(col => col.header);

  // Example data rows
  const exampleData = [
    ['게임 아이템 거래 협상. 희귀 아이템을 팔려는 판매자와 사려는 구매자의 대화.', 2, 10, 'casual', 'kakaotalk'],
    ['친구들이 주말 모임 장소를 정하는 그룹 채팅. 여러 의견 조율.', 4, 15, 'casual', 'discord'],
    ['고객이 배송 지연에 대해 문의하는 고객센터 상담.', 2, 8, 'formal', 'telegram'],
  ];

  // Combine headers and data
  const wsData = [headers, ...exampleData];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 60 },  // scenario
    { wch: 12 },  // participants
    { wch: 15 },  // message_count
    { wch: 12 },  // tone
    { wch: 12 },  // platform
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Scenarios');

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
};

/**
 * Parse Excel file and validate content
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {{valid: boolean, data?: Array, errors?: Array}}
 */
export const parseExcel = (fileBuffer) => {
  try {
    // Read workbook
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return { valid: false, errors: [{ row: 0, message: 'Excel 파일에 시트가 없습니다.' }] };
    }

    const ws = wb.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rawData.length < 2) {
      return { valid: false, errors: [{ row: 0, message: '데이터가 없습니다. 최소 1개 행이 필요합니다.' }] };
    }

    // Validate headers
    const headers = rawData[0].map(h => String(h).toLowerCase().trim());
    const expectedHeaders = TEMPLATE_COLUMNS.map(col => col.header);

    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return {
        valid: false,
        errors: [{ row: 1, message: `필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}` }]
      };
    }

    // Create column index map
    const columnMap = {};
    TEMPLATE_COLUMNS.forEach(col => {
      columnMap[col.key] = headers.indexOf(col.header);
    });

    // Parse and validate rows
    const data = [];
    const errors = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 1; // Excel rows are 1-indexed

      // Skip empty rows
      if (!row || row.length === 0 || row.every(cell => cell === null || cell === undefined || cell === '')) {
        continue;
      }

      const rowData = {
        rowIndex: rowNum,
        scenario: String(row[columnMap.scenario] || '').trim(),
        participants: parseInt(row[columnMap.participants]) || 0,
        messageCount: parseInt(row[columnMap.messageCount]) || 0,
        tone: String(row[columnMap.tone] || '').toLowerCase().trim(),
        platform: String(row[columnMap.platform] || '').toLowerCase().trim(),
      };

      // Validate row
      const rowErrors = validateRow(rowData, rowNum);

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        data.push(rowData);
      }
    }

    // Check total count
    if (data.length > 100) {
      return {
        valid: false,
        errors: [{ row: 0, message: '최대 100개 시나리오까지 처리할 수 있습니다.' }]
      };
    }

    if (data.length === 0 && errors.length === 0) {
      return { valid: false, errors: [{ row: 0, message: '유효한 데이터가 없습니다.' }] };
    }

    return {
      valid: errors.length === 0,
      data: data.length > 0 ? data : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    logger.error('Excel parsing failed', { error: error.message });
    return {
      valid: false,
      errors: [{ row: 0, message: `파일 파싱 오류: ${error.message}` }]
    };
  }
};

/**
 * Validate a single row
 * @param {Object} row - Row data
 * @param {number} rowNum - Row number (1-indexed)
 * @returns {Array} - Array of error objects
 */
const validateRow = (row, rowNum) => {
  const errors = [];

  // Scenario validation
  if (!row.scenario || row.scenario.length < 10) {
    errors.push({ row: rowNum, column: 'scenario', message: '시나리오는 최소 10자 이상이어야 합니다.' });
  } else if (row.scenario.length > 500) {
    errors.push({ row: rowNum, column: 'scenario', message: '시나리오는 500자 이하여야 합니다.' });
  }

  // Participants validation
  if (row.participants < 2 || row.participants > 5) {
    errors.push({ row: rowNum, column: 'participants', message: '참여자 수는 2-5 사이여야 합니다.' });
  }

  // Message count validation
  if (row.messageCount < 5 || row.messageCount > 50) {
    errors.push({ row: rowNum, column: 'message_count', message: '메시지 수는 5-50 사이여야 합니다.' });
  }

  // Tone validation
  if (!VALID_TONES.includes(row.tone)) {
    errors.push({ row: rowNum, column: 'tone', message: `톤은 ${VALID_TONES.join(', ')} 중 하나여야 합니다.` });
  }

  // Platform validation
  if (!VALID_PLATFORMS.includes(row.platform)) {
    errors.push({ row: rowNum, column: 'platform', message: `플랫폼은 ${VALID_PLATFORMS.join(', ')} 중 하나여야 합니다.` });
  }

  return errors;
};

// Alias for consistency with bulk_generation_routes
export const generateExcelTemplate = generateTemplate;

export default {
  generateTemplate,
  generateExcelTemplate,
  parseExcel,
  VALID_TONES,
  VALID_PLATFORMS,
};
