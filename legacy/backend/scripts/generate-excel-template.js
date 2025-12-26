// scripts/generate-excel-template.js
// Script to generate the Excel message template

import ExcelJS from 'exceljs';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateTemplate() {
  // Create workbook
  const workbook = new ExcelJS.Workbook();

  // Create Messages worksheet
  const worksheet = workbook.addWorksheet('Messages');

  // Set columns with headers and widths
  worksheet.columns = [
    { header: 'authorId (필수)', key: 'authorId', width: 20 },
    { header: 'authorName (필수)', key: 'authorName', width: 15 },
    { header: 'content (필수)', key: 'content', width: 50 },
    { header: 'timestamp (선택, YYYY-MM-DD HH:mm:ss)', key: 'timestamp', width: 22 },
    { header: 'channelId (선택)', key: 'channelId', width: 15 },
    { header: 'channelName (선택)', key: 'channelName', width: 15 },
  ];

  // Example data rows
  const exampleData = [
    {
      authorId: 'user123456789',
      authorName: '홍길동',
      content: '안녕하세요! 질문이 있습니다.',
      timestamp: '2024-01-15 14:30:00',
      channelId: 'channel123',
      channelName: '일반',
    },
    {
      authorId: 'user987654321',
      authorName: '김철수',
      content: '네, 무엇이든 물어보세요!',
      timestamp: '2024-01-15 14:31:00',
      channelId: 'channel123',
      channelName: '일반',
    },
    {
      authorId: 'user123456789',
      authorName: '홍길동',
      content: 'TalkStudio에서 디스코드 메시지를 어떻게 캡쳐하나요?',
      timestamp: '2024-01-15 14:32:00',
      channelId: 'channel123',
      channelName: '일반',
    },
  ];

  // Add example rows
  worksheet.addRows(exampleData);

  // Create instructions worksheet
  const instructionsSheet = workbook.addWorksheet('사용법');

  const instructionsData = [
    ['TalkStudio 메시지 템플릿 사용법'],
    [''],
    ['필수 컬럼:'],
    ['- authorId: Discord 사용자 ID 또는 고유 식별자'],
    ['- authorName: 메시지 작성자 이름'],
    ['- content: 메시지 내용 (최대 4000자)'],
    [''],
    ['선택 컬럼:'],
    ['- timestamp: 메시지 시간 (형식: YYYY-MM-DD HH:mm:ss)'],
    ['- channelId: Discord 채널 ID'],
    ['- channelName: 채널 이름'],
    [''],
    ['주의사항:'],
    ['1. 첫 번째 행은 헤더입니다. 삭제하지 마세요.'],
    ['2. 예시 데이터(2-4행)는 삭제하고 실제 데이터를 입력하세요.'],
    ['3. 파일 크기는 10MB를 초과할 수 없습니다.'],
    ['4. 중복 메시지(같은 작성자 + 같은 내용)는 허용되지 않습니다.'],
  ];

  instructionsData.forEach(row => {
    instructionsSheet.addRow(row);
  });

  // Set column width for instructions
  instructionsSheet.getColumn(1).width = 60;

  // Output path
  const outputDir = join(__dirname, '..', 'public', 'templates');
  const outputPath = join(outputDir, 'message_template.xlsx');

  // Ensure directory exists
  mkdirSync(outputDir, { recursive: true });

  // Write file
  const buffer = await workbook.xlsx.writeBuffer();
  writeFileSync(outputPath, buffer);

  console.log(`Template generated: ${outputPath}`);
}

generateTemplate().catch(console.error);
