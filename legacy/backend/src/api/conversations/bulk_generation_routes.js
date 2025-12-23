/**
 * Bulk Generation Routes - 대량 생성 API 엔드포인트
 * T034-T037 구현
 */
import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import multer from 'multer';
import {
  createBulkJob,
  processBulkJob,
  getBulkJobStatus,
  getBulkJobResults,
} from '../../services/bulk_processor.js';
import { generateExcelTemplate } from '../../utils/excel_parser.js';
import { createBulkResultsZip } from '../../utils/zip_generator.js';
import logger from '../../utils/logger.js';

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept xlsx and xls files
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일만 업로드할 수 있습니다. (.xlsx, .xls)'), false);
    }
  },
});

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '입력값 검증 실패',
      errors: errors.array(),
    });
  }
  next();
};

// ============ T034: GET /bulk/template ============

/**
 * @route   GET /api/v1/bulk/template
 * @desc    Download Excel template for bulk generation
 * @access  Public
 */
router.get('/template', async (req, res) => {
  const requestId = `bulk-template-${Date.now()}`;
  logger.info('Bulk template download request', { requestId });

  try {
    const buffer = await generateExcelTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=talkstudio_bulk_template.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

    logger.info('Bulk template downloaded', { requestId });

  } catch (error) {
    logger.error('Failed to generate bulk template', {
      requestId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Excel 템플릿 생성에 실패했습니다.',
      error: error.message,
    });
  }
});

// ============ T035: POST /bulk/start ============

/**
 * @route   POST /api/v1/bulk/start
 * @desc    Start bulk generation from Excel file
 * @access  Public
 */
router.post('/start', upload.single('file'), async (req, res) => {
  const requestId = `bulk-start-${Date.now()}`;
  logger.info('Bulk generation start request', { requestId });

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel 파일이 필요합니다.',
      });
    }

    // Create bulk job
    const bulkJob = await createBulkJob(req.file.buffer, req.file.originalname);

    // Start processing in background (non-blocking)
    processBulkJob(bulkJob._id).catch((error) => {
      logger.error('Background bulk processing failed', {
        jobId: bulkJob._id,
        error: error.message,
      });
    });

    logger.info('Bulk job started', { requestId, jobId: bulkJob._id });

    res.status(202).json({
      success: true,
      message: '대량 생성이 시작되었습니다.',
      data: {
        job: {
          id: bulkJob._id,
          status: 'processing',
          totalScenarios: bulkJob.totalScenarios,
          completedScenarios: 0,
          failedScenarios: 0,
          progress: 0,
        },
      },
    });

  } catch (error) {
    logger.error('Failed to start bulk generation', {
      requestId,
      error: error.message,
      stack: error.stack,
    });

    res.status(400).json({
      success: false,
      message: error.message || '대량 생성 시작에 실패했습니다.',
    });
  }
});

// ============ T036: GET /bulk/:jobId/status ============

/**
 * @route   GET /api/v1/bulk/:jobId/status
 * @desc    Get bulk job status
 * @access  Public
 */
router.get(
  '/:jobId/status',
  [
    param('jobId')
      .isMongoId()
      .withMessage('유효하지 않은 Job ID입니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `bulk-status-${Date.now()}`;
    const { jobId } = req.params;

    logger.info('Bulk job status request', { requestId, jobId });

    try {
      const status = await getBulkJobStatus(jobId);

      if (!status) {
        logger.warn('Bulk job not found', { requestId, jobId });
        return res.status(404).json({
          success: false,
          message: 'Bulk job을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: { job: status },
      });

    } catch (error) {
      logger.error('Failed to get bulk job status', {
        requestId,
        jobId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: 'Bulk job 상태 조회에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

// ============ T037: GET /bulk/:jobId/download ============

/**
 * @route   GET /api/v1/bulk/:jobId/download
 * @desc    Download bulk job results as ZIP
 * @access  Public
 */
router.get(
  '/:jobId/download',
  [
    param('jobId')
      .isMongoId()
      .withMessage('유효하지 않은 Job ID입니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `bulk-download-${Date.now()}`;
    const { jobId } = req.params;

    logger.info('Bulk job download request', { requestId, jobId });

    try {
      // Get job with results
      const bulkJob = await getBulkJobResults(jobId);

      if (!bulkJob) {
        logger.warn('Bulk job not found', { requestId, jobId });
        return res.status(404).json({
          success: false,
          message: 'Bulk job을 찾을 수 없습니다.',
        });
      }

      if (bulkJob.status !== 'completed' && bulkJob.status !== 'failed') {
        return res.status(400).json({
          success: false,
          message: '아직 처리 중인 작업입니다. 완료 후 다운로드할 수 있습니다.',
          data: { status: bulkJob.status },
        });
      }

      // Generate ZIP file
      const zipBuffer = await createBulkResultsZip(bulkJob);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=talkstudio_bulk_${jobId}.zip`);
      res.setHeader('Content-Length', zipBuffer.length);

      res.send(zipBuffer);

      logger.info('Bulk results downloaded', { requestId, jobId });

    } catch (error) {
      logger.error('Failed to download bulk results', {
        requestId,
        jobId,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: '결과 다운로드에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

// Multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기가 5MB를 초과합니다.',
      });
    }
  }
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
});

export default router;
