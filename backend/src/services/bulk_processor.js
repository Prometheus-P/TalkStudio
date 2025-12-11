/**
 * BulkProcessor - 대량 대화 생성 처리 서비스
 * T033: Excel 파일에서 시나리오를 읽고 대량 생성을 처리
 */
import BulkJob from '../models/bulk_job_model.js';
import { generateConversation } from './conversation_generator.js';
import { parseExcel } from '../utils/excel_parser.js';
import logger from '../utils/logger.js';

/**
 * Validate Excel data structure
 * @param {Array} rows - Parsed Excel rows
 * @returns {Object} - { valid: boolean, errors: Array }
 */
const validateExcelData = (rows) => {
  const errors = [];
  const requiredFields = ['scenario'];

  if (!rows || rows.length === 0) {
    return { valid: false, errors: ['Excel 파일에 데이터가 없습니다.'] };
  }

  if (rows.length > 100) {
    return { valid: false, errors: ['한 번에 최대 100개의 시나리오만 처리할 수 있습니다.'] };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Excel row number (1-indexed, header is row 1)

    // Check required fields
    requiredFields.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push(`행 ${rowNum}: ${field} 필드가 비어있습니다.`);
      }
    });

    // Validate scenario length
    if (row.scenario && String(row.scenario).trim().length < 10) {
      errors.push(`행 ${rowNum}: 시나리오는 최소 10자 이상이어야 합니다.`);
    }

    // Validate participants (if provided)
    if (row.participants !== undefined && row.participants !== '') {
      const participants = Number(row.participants);
      if (isNaN(participants) || participants < 2 || participants > 5) {
        errors.push(`행 ${rowNum}: 참여자 수는 2~5명이어야 합니다.`);
      }
    }

    // Validate messageCount (if provided)
    if (row.messageCount !== undefined && row.messageCount !== '') {
      const messageCount = Number(row.messageCount);
      if (isNaN(messageCount) || messageCount < 5 || messageCount > 50) {
        errors.push(`행 ${rowNum}: 메시지 수는 5~50개여야 합니다.`);
      }
    }

    // Validate tone (if provided)
    if (row.tone && !['casual', 'formal', 'humorous'].includes(row.tone)) {
      errors.push(`행 ${rowNum}: 톤은 casual, formal, humorous 중 하나여야 합니다.`);
    }

    // Validate platform (if provided)
    if (row.platform && !['kakaotalk', 'discord', 'telegram', 'instagram'].includes(row.platform)) {
      errors.push(`행 ${rowNum}: 플랫폼은 kakaotalk, discord, telegram, instagram 중 하나여야 합니다.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create a new bulk job from Excel file
 * @param {Buffer} fileBuffer - Excel file buffer
 * @param {string} fileName - Original file name
 * @returns {Object} - Created BulkJob
 */
export const createBulkJob = async (fileBuffer, fileName) => {
  logger.info('Creating bulk job', { fileName });

  // Parse Excel file
  const rows = parseExcel(fileBuffer);

  // Validate data
  const validation = validateExcelData(rows);
  if (!validation.valid) {
    throw new Error(`데이터 검증 실패: ${validation.errors.join(', ')}`);
  }

  // Create scenarios from rows
  const scenarios = rows.map((row, index) => ({
    index,
    scenario: String(row.scenario).trim(),
    participants: row.participants ? Number(row.participants) : 2,
    messageCount: row.messageCount ? Number(row.messageCount) : 10,
    tone: row.tone || 'casual',
    platform: row.platform || 'kakaotalk',
    participantNames: row.participantNames
      ? String(row.participantNames).split(',').map((n) => n.trim())
      : undefined,
  }));

  // Create bulk job document
  const bulkJob = new BulkJob({
    fileName,
    totalScenarios: scenarios.length,
    scenarios,
    status: 'pending',
  });

  await bulkJob.save();

  logger.info('Bulk job created', { jobId: bulkJob._id, totalScenarios: scenarios.length });

  return bulkJob;
};

/**
 * Process a bulk job (async processing)
 * @param {string} jobId - BulkJob ID
 */
export const processBulkJob = async (jobId) => {
  logger.info('Starting bulk job processing', { jobId });

  const bulkJob = await BulkJob.findById(jobId);
  if (!bulkJob) {
    throw new Error('Bulk job not found');
  }

  // Update status to processing
  bulkJob.status = 'processing';
  bulkJob.startedAt = new Date();
  await bulkJob.save();

  let completed = 0;
  let failed = 0;

  // Process each scenario
  for (const scenarioItem of bulkJob.scenarios) {
    try {
      logger.info('Processing scenario', { jobId, scenarioIndex: scenarioItem.index });

      // Generate conversation
      const conversation = await generateConversation({
        scenario: scenarioItem.scenario,
        participants: scenarioItem.participants,
        messageCount: scenarioItem.messageCount,
        tone: scenarioItem.tone,
        platform: scenarioItem.platform,
        participantNames: scenarioItem.participantNames,
      });

      // Store result
      bulkJob.results.push({
        scenarioIndex: scenarioItem.index,
        conversationId: conversation._id,
        status: 'success',
      });

      completed++;

    } catch (error) {
      logger.error('Failed to process scenario', {
        jobId,
        scenarioIndex: scenarioItem.index,
        error: error.message,
      });

      // Store error
      bulkJob.errors.push({
        scenarioIndex: scenarioItem.index,
        error: error.message,
      });

      failed++;
    }

    // Update progress
    bulkJob.completedScenarios = completed;
    bulkJob.failedScenarios = failed;
    await bulkJob.save();
  }

  // Update final status
  bulkJob.status = failed === bulkJob.totalScenarios ? 'failed' : 'completed';
  bulkJob.completedAt = new Date();
  await bulkJob.save();

  logger.info('Bulk job completed', {
    jobId,
    completed,
    failed,
    status: bulkJob.status,
  });

  return bulkJob;
};

/**
 * Get bulk job status
 * @param {string} jobId - BulkJob ID
 * @returns {Object} - Job status info
 */
export const getBulkJobStatus = async (jobId) => {
  const bulkJob = await BulkJob.findById(jobId).lean();
  if (!bulkJob) {
    return null;
  }

  return {
    id: bulkJob._id,
    status: bulkJob.status,
    totalScenarios: bulkJob.totalScenarios,
    completedScenarios: bulkJob.completedScenarios,
    failedScenarios: bulkJob.failedScenarios,
    progress: Math.round((bulkJob.completedScenarios / bulkJob.totalScenarios) * 100),
    errors: bulkJob.errors,
    startedAt: bulkJob.startedAt,
    completedAt: bulkJob.completedAt,
    createdAt: bulkJob.createdAt,
    expiresAt: bulkJob.expiresAt,
  };
};

/**
 * Get bulk job results with conversations
 * @param {string} jobId - BulkJob ID
 * @returns {Object} - Job with populated conversations
 */
export const getBulkJobResults = async (jobId) => {
  const bulkJob = await BulkJob.findById(jobId)
    .populate('results.conversationId')
    .lean();

  if (!bulkJob) {
    return null;
  }

  return bulkJob;
};

/**
 * Delete a bulk job
 * @param {string} jobId - BulkJob ID
 */
export const deleteBulkJob = async (jobId) => {
  const result = await BulkJob.findByIdAndDelete(jobId);
  return !!result;
};

export default {
  createBulkJob,
  processBulkJob,
  getBulkJobStatus,
  getBulkJobResults,
  deleteBulkJob,
  validateExcelData,
};
