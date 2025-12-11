/**
 * ZIP Generator - ZIP 파일 생성 유틸리티
 * T038: 대량 생성 결과를 ZIP 파일로 패키징
 */
import archiver from 'archiver';
import { Readable } from 'stream';
import logger from './logger.js';

/**
 * Create ZIP buffer from bulk job results
 * @param {Object} bulkJob - BulkJob with populated conversations
 * @returns {Promise<Buffer>} - ZIP file buffer
 */
export const createBulkResultsZip = async (bulkJob) => {
  return new Promise((resolve, reject) => {
    logger.info('Creating ZIP file', { jobId: bulkJob._id });

    const chunks = [];
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      logger.info('ZIP file created', { jobId: bulkJob._id, size: buffer.length });
      resolve(buffer);
    });

    archive.on('error', (error) => {
      logger.error('ZIP creation failed', { jobId: bulkJob._id, error: error.message });
      reject(error);
    });

    // Add summary JSON
    const summary = {
      jobId: bulkJob._id,
      fileName: bulkJob.fileName,
      totalScenarios: bulkJob.totalScenarios,
      completedScenarios: bulkJob.completedScenarios,
      failedScenarios: bulkJob.failedScenarios,
      status: bulkJob.status,
      createdAt: bulkJob.createdAt,
      completedAt: bulkJob.completedAt,
      errors: bulkJob.errors,
    };

    archive.append(JSON.stringify(summary, null, 2), { name: 'summary.json' });

    // Add each conversation result
    const successfulResults = bulkJob.results.filter((r) => r.status === 'success');

    successfulResults.forEach((result, index) => {
      const conversation = result.conversationId;
      if (!conversation) return;

      // Create conversation JSON
      const conversationData = {
        id: conversation._id,
        scenarioIndex: result.scenarioIndex,
        scenario: bulkJob.scenarios[result.scenarioIndex]?.scenario,
        participants: conversation.participants,
        messages: conversation.messages,
        tone: conversation.tone,
        platform: conversation.platform,
        status: conversation.status,
        createdAt: conversation.createdAt,
      };

      const fileName = `conversations/${String(index + 1).padStart(3, '0')}_${conversation._id}.json`;
      archive.append(JSON.stringify(conversationData, null, 2), { name: fileName });

      // Create TalkStudio format JSON (for direct import)
      const talkStudioFormat = {
        messages: conversation.messages.map((msg, msgIdx) => ({
          id: `bulk-${conversation._id}-${msgIdx}`,
          sender: msg.sender === conversation.participants[0] ? 'me' : 'other',
          type: 'text',
          text: msg.text,
          time: msg.timestamp,
        })),
        profiles: {
          me: { name: conversation.participants[0] || '나' },
          other: { name: conversation.participants[1] || '상대방' },
        },
        platform: conversation.platform,
      };

      const talkStudioFileName = `talkstudio_import/${String(index + 1).padStart(3, '0')}_talkstudio_format.json`;
      archive.append(JSON.stringify(talkStudioFormat, null, 2), { name: talkStudioFileName });
    });

    // Add errors log if there are failures
    if (bulkJob.errors.length > 0) {
      const errorsLog = bulkJob.errors.map((err) => ({
        scenarioIndex: err.scenarioIndex,
        scenario: bulkJob.scenarios[err.scenarioIndex]?.scenario,
        error: err.error,
      }));

      archive.append(JSON.stringify(errorsLog, null, 2), { name: 'errors.json' });
    }

    // Add README
    const readme = `# TalkStudio 대량 생성 결과

## 파일 구조

- \`summary.json\`: 작업 요약 정보
- \`conversations/\`: 생성된 대화 원본 JSON
- \`talkstudio_import/\`: TalkStudio에 직접 가져올 수 있는 형식
- \`errors.json\`: 실패한 시나리오 목록 (있는 경우)

## 작업 정보

- 작업 ID: ${bulkJob._id}
- 파일명: ${bulkJob.fileName}
- 총 시나리오: ${bulkJob.totalScenarios}개
- 성공: ${bulkJob.completedScenarios}개
- 실패: ${bulkJob.failedScenarios}개
- 생성일: ${bulkJob.createdAt}
- 완료일: ${bulkJob.completedAt}

## TalkStudio 가져오기

\`talkstudio_import/\` 폴더의 JSON 파일을 TalkStudio 앱에서
"프로젝트 불러오기" 기능으로 가져올 수 있습니다.
`;

    archive.append(readme, { name: 'README.md' });

    // Finalize archive
    archive.finalize();
  });
};

/**
 * Create a simple ZIP from array of files
 * @param {Array<{name: string, content: string|Buffer}>} files - Files to zip
 * @returns {Promise<Buffer>} - ZIP file buffer
 */
export const createZipFromFiles = async (files) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    files.forEach(({ name, content }) => {
      archive.append(content, { name });
    });

    archive.finalize();
  });
};

export default {
  createBulkResultsZip,
  createZipFromFiles,
};
