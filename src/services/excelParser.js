/**
 * Excel Parser Service - 브라우저 기반 Excel 파싱
 * backend/app/services/excel_service.py 로직을 프론트엔드로 이식
 */
import ExcelJS from 'exceljs';

// 열 매핑 (한국어/영어 지원)
const COLUMN_MAPPINGS = {
  speaker: ['speaker', '발신자', '보낸사람', 'who', 'from'],
  text: ['text', '내용', '메시지', 'message', 'content'],
  type: ['type', '타입', '유형'],
  time: ['time', '시간', 'timestamp', '날짜'],
  name: ['name', '이름', '닉네임', 'nickname'],
};

// 발신자 매핑
const SPEAKER_ALIASES = {
  me: ['me', '나', '본인', '1'],
  system: ['system', '시스템'],
};

// 메시지 타입 매핑
const MESSAGE_TYPE_ALIASES = {
  emoji: ['emoji', '이모지', '이모티콘'],
  image: ['image', '이미지', '사진'],
  system: ['system', '시스템'],
};

// 상수
const SUPPORTED_EXTENSIONS = ['.xlsx', '.xls', '.xlsm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 1000;

/**
 * Excel 파싱 에러 클래스
 */
export class ExcelParseError extends Error {
  constructor(message, row = null, column = null) {
    super(message);
    this.name = 'ExcelParseError';
    this.row = row;
    this.column = column;
  }

  formatMessage() {
    const parts = [this.message];
    if (this.row !== null) parts.push(`(행: ${this.row})`);
    if (this.column !== null) parts.push(`(열: ${this.column})`);
    return parts.join(' ');
  }
}

/**
 * 파일 확장자 검증
 */
function validateFilename(filename) {
  if (!filename) {
    throw new ExcelParseError('파일명이 없습니다');
  }

  const ext = filename.includes('.')
    ? '.' + filename.split('.').pop().toLowerCase()
    : '';

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new ExcelParseError(
      `지원하지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_EXTENSIONS.join(', ')}`
    );
  }
}

/**
 * 파일 크기 검증
 */
function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new ExcelParseError(`파일 크기가 ${maxMB}MB를 초과했습니다`);
  }
}

/**
 * 헤더 행에서 열 매핑 시도
 */
function tryMapColumns(row) {
  if (!row || row.length === 0) return null;

  const columnMap = {};
  row.forEach((cell, colIdx) => {
    if (cell === null || cell === undefined) return;

    const cellStr = String(cell).trim().toLowerCase();
    for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
      if (aliases.includes(cellStr)) {
        columnMap[field] = colIdx;
        break;
      }
    }
  });

  return Object.keys(columnMap).length > 0 ? columnMap : null;
}

/**
 * 헤더 행 찾기 (처음 10행 내에서 검색)
 */
function findHeaderRow(rows, maxSearch = 10) {
  for (let rowIdx = 0; rowIdx < Math.min(rows.length, maxSearch); rowIdx++) {
    const columnMap = tryMapColumns(rows[rowIdx]);
    if (columnMap && 'speaker' in columnMap && 'text' in columnMap) {
      return { headerRowIdx: rowIdx, columnMap };
    }
  }
  return { headerRowIdx: -1, columnMap: null };
}

/**
 * 발신자 문자열을 role로 변환
 */
function parseSpeaker(speakerStr) {
  const normalized = speakerStr.trim().toLowerCase();

  if (SPEAKER_ALIASES.me.includes(normalized)) {
    return 'me';
  } else if (SPEAKER_ALIASES.system.includes(normalized)) {
    return 'system';
  }
  return 'other';
}

/**
 * 메시지 타입 파싱
 */
function parseMessageType(typeStr) {
  if (!typeStr) return 'text';

  const normalized = String(typeStr).trim().toLowerCase();

  if (MESSAGE_TYPE_ALIASES.emoji.includes(normalized)) {
    return 'emoji';
  } else if (MESSAGE_TYPE_ALIASES.image.includes(normalized)) {
    return 'image';
  } else if (MESSAGE_TYPE_ALIASES.system.includes(normalized)) {
    return 'system';
  }
  return 'text';
}

/**
 * 시간 파싱
 */
function parseTimestamp(timeVal, _rowNum) {
  if (timeVal === null || timeVal === undefined) {
    return formatCurrentTime();
  }

  // Date 객체인 경우
  if (timeVal instanceof Date) {
    return formatDateTime(timeVal);
  }

  // 문자열인 경우
  if (typeof timeVal === 'string') {
    const timeStr = timeVal.trim();

    // 시:분 형식 (HH:MM)
    const timeOnlyMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (timeOnlyMatch) {
      const hours = parseInt(timeOnlyMatch[1], 10);
      const minutes = timeOnlyMatch[2];
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours > 12 ? hours - 12 : hours || 12;
      return `${period} ${displayHours}:${minutes}`;
    }

    // 날짜-시간 형식 시도
    const dateFormats = [
      /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s+(\d{1,2}):(\d{2})/,
      /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/,
    ];

    for (const format of dateFormats) {
      const match = timeStr.match(format);
      if (match) {
        const hours = match[4] ? parseInt(match[4], 10) : 12;
        const minutes = match[5] || '00';
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours > 12 ? hours - 12 : hours || 12;
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')} ${period} ${displayHours}:${minutes}`;
      }
    }

    // 파싱 실패 시 그대로 반환
    return timeStr;
  }

  // 숫자인 경우 (Excel 날짜 시리얼 넘버)
  if (typeof timeVal === 'number') {
    const date = excelSerialToDate(timeVal);
    return formatDateTime(date);
  }

  return formatCurrentTime();
}

/**
 * Excel 시리얼 날짜를 Date 객체로 변환
 */
function excelSerialToDate(serial) {
  // Excel의 날짜 시리얼: 1900년 1월 1일부터의 일수
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  const fractionalDay = serial - Math.floor(serial);
  const totalSeconds = Math.floor(fractionalDay * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  dateInfo.setHours(hours);
  dateInfo.setMinutes(minutes);

  return dateInfo;
}

/**
 * 현재 시간을 형식화
 */
function formatCurrentTime() {
  const now = new Date();
  return formatDateTime(now);
}

/**
 * Date 객체를 한국어 형식으로 변환
 */
function formatDateTime(date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours || 12;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day} ${period} ${displayHours}:${minutes}`;
}

/**
 * 단일 행 파싱
 */
function parseRow(row, columnMap, rowNum) {
  const getCell = (field) => {
    const idx = columnMap[field];
    if (idx === undefined || idx >= row.length) return null;
    return row[idx];
  };

  const speakerRaw = getCell('speaker');
  const textRaw = getCell('text');

  // 완전히 빈 행 건너뛰기
  if (speakerRaw === null && textRaw === null) {
    return null;
  }

  // 필수 필드 검증
  if (speakerRaw === null || speakerRaw === undefined || String(speakerRaw).trim() === '') {
    throw new ExcelParseError('발신자 값이 없습니다', rowNum, 'speaker');
  }

  if (textRaw === null || textRaw === undefined || String(textRaw).trim() === '') {
    throw new ExcelParseError('메시지 내용이 없습니다', rowNum, 'text');
  }

  const speaker = String(speakerRaw).trim();
  const text = String(textRaw).trim();

  // 길이 검증
  if (speaker.length > 50) {
    throw new ExcelParseError('발신자 값이 너무 깁니다 (최대 50자)', rowNum, 'speaker');
  }

  if (text.length > 5000) {
    throw new ExcelParseError('메시지 내용이 너무 깁니다 (최대 5000자)', rowNum, 'text');
  }

  const role = parseSpeaker(speaker);
  const messageType = parseMessageType(getCell('type'));
  const datetime = parseTimestamp(getCell('time'), rowNum);
  const name = getCell('name') ? String(getCell('name')).trim() : null;

  return {
    id: `excel-${rowNum}-${Date.now()}`,
    role,
    authorId: role === 'me' ? 'me' : 'other',
    text,
    datetime,
    messageType,
    speakerName: name || speaker,
  };
}

/**
 * Excel 파일을 파싱하여 메시지 배열 반환
 * @param {File} file - Excel 파일
 * @returns {Promise<{messages: Array, stats: Object}>}
 */
export async function parseExcel(file) {
  // 파일 검증
  validateFilename(file.name);
  validateFileSize(file);

  // 파일 읽기
  const arrayBuffer = await file.arrayBuffer();

  // ExcelJS로 워크북 로드
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    throw new ExcelParseError(
      '손상된 엑셀 파일입니다. 파일을 다시 저장한 후 업로드해주세요.'
    );
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new ExcelParseError('엑셀 파일에 시트가 없습니다');
  }

  // 모든 행을 배열로 변환
  const rows = [];
  sheet.eachRow((row, _rowNumber) => {
    const rowData = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // 셀 값 추출 (결과값 우선)
      let value = cell.value;

      // 공식 결과값 처리
      if (value && typeof value === 'object' && 'result' in value) {
        value = value.result;
      }

      // 서식 있는 텍스트 처리
      if (value && typeof value === 'object' && 'richText' in value) {
        value = value.richText.map((r) => r.text).join('');
      }

      rowData[colNumber - 1] = value;
    });
    rows.push(rowData);
  });

  if (rows.length === 0) {
    throw new ExcelParseError('엑셀 파일이 비어있습니다');
  }

  // 행 수 제한 검증
  if (rows.length > MAX_ROWS) {
    throw new ExcelParseError(
      `행 수가 제한(${MAX_ROWS}행)을 초과했습니다. 현재 행 수: ${rows.length}`
    );
  }

  // 헤더 찾기
  const { headerRowIdx, columnMap } = findHeaderRow(rows);
  if (columnMap === null) {
    throw new ExcelParseError(
      "필수 열을 찾을 수 없습니다. 'speaker'(또는 '발신자')와 'text'(또는 '내용') 열이 필요합니다."
    );
  }

  // 데이터 행 파싱
  const messages = [];
  const errors = [];
  const warnings = [];

  const dataRows = rows.slice(headerRowIdx + 1);

  for (let rowOffset = 0; rowOffset < dataRows.length; rowOffset++) {
    const row = dataRows[rowOffset];
    const rowNum = headerRowIdx + 2 + rowOffset; // Excel 1-indexed + header

    try {
      const message = parseRow(row, columnMap, rowNum);
      if (message) {
        messages.push(message);
      }
    } catch (error) {
      if (error instanceof ExcelParseError) {
        errors.push({
          row: rowNum,
          column: error.column,
          error: error.message,
        });
      } else {
        errors.push({
          row: rowNum,
          error: `예상치 못한 오류: ${error.message}`,
        });
      }
    }
  }

  // 에러 경고
  if (errors.length > 10) {
    warnings.push(
      `총 ${errors.length}개의 오류가 발생했습니다. 처음 10개만 표시됩니다.`
    );
  }

  // 결과 없음 처리
  if (messages.length === 0) {
    if (errors.length > 0) {
      const firstError = errors[0];
      throw new ExcelParseError(firstError.error, firstError.row);
    }
    throw new ExcelParseError('유효한 메시지가 없습니다');
  }

  return {
    messages,
    stats: {
      totalRows: dataRows.length,
      parsedRows: messages.length,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
      warnings,
    },
  };
}

/**
 * 템플릿 Excel 파일 생성 및 다운로드
 */
export async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('대화 템플릿');

  // 헤더 설정
  sheet.columns = [
    { header: 'speaker (발신자)', key: 'speaker', width: 15 },
    { header: 'text (내용)', key: 'text', width: 50 },
    { header: 'name (이름)', key: 'name', width: 15 },
    { header: 'time (시간)', key: 'time', width: 20 },
    { header: 'type (타입)', key: 'type', width: 12 },
  ];

  // 헤더 스타일
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 예시 데이터
  sheet.addRow({
    speaker: 'me',
    text: '안녕하세요!',
    name: '나',
    time: '12:30',
    type: 'text',
  });
  sheet.addRow({
    speaker: 'other',
    text: '반갑습니다! TalkStudio입니다.',
    name: '상대방',
    time: '12:31',
    type: 'text',
  });
  sheet.addRow({
    speaker: 'me',
    text: '우와, 정말 편리하네요!',
    name: '나',
    time: '12:32',
    type: 'text',
  });

  // 설명 시트 추가
  const guideSheet = workbook.addWorksheet('사용법');
  guideSheet.getColumn(1).width = 20;
  guideSheet.getColumn(2).width = 60;

  guideSheet.addRow(['필드', '설명']);
  guideSheet.addRow(['speaker (필수)', 'me, 나, 본인 → 내 메시지 / other, 상대방 → 상대 메시지']);
  guideSheet.addRow(['text (필수)', '메시지 내용 (최대 5000자)']);
  guideSheet.addRow(['name', '표시할 이름 (선택사항)']);
  guideSheet.addRow(['time', '시간 (예: 12:30 또는 2024-01-01 12:30)']);
  guideSheet.addRow(['type', 'text(기본), emoji, image, system']);

  guideSheet.getRow(1).font = { bold: true };

  // Blob 생성 및 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'talkstudio_template.xlsx';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export default {
  parseExcel,
  downloadTemplate,
  ExcelParseError,
};
