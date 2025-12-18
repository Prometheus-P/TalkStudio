// backend/src/api/data_io_routes.js
// Data import/export API endpoints (FR-6)

import { Router } from 'express';
import multer from 'multer';
import { parseMessagesFromExcel, getTemplateInfo } from '../services/excel_parser.js';
import { validateAllRows, formatValidationResponse } from '../services/excel_validator.js';
import { createModuleLogger } from '../utils/logger.js';

const router = Router();
const logger = createModuleLogger('data-io');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일(.xlsx, .xls)만 업로드 가능합니다'), false);
    }
  },
});

/**
 * @swagger
 * /data/import/excel:
 *   post:
 *     summary: Import messages from Excel file
 *     tags: [Data IO]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               validateOnly:
 *                 type: boolean
 *                 description: If true, only validate without importing
 *     responses:
 *       200:
 *         description: Import successful or validation result
 *       400:
 *         description: Validation failed or invalid file
 */
router.post('/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다',
      });
    }

    const validateOnly = req.body.validateOnly === 'true';

    logger.info('Excel import started', {
      filename: req.file.originalname,
      size: req.file.size,
      validateOnly,
    });

    // Parse Excel file
    const { messages, errors: parseErrors } = parseMessagesFromExcel(req.file.buffer);

    // Check for parsing errors
    if (parseErrors.length > 0 && parseErrors.some((e) => e.type === 'header')) {
      return res.status(400).json({
        success: false,
        error: '필수 컬럼이 누락되었습니다',
        details: parseErrors,
      });
    }

    // Validate all rows
    const validationResult = validateAllRows(messages);
    const formattedResult = formatValidationResponse(validationResult);

    // If validation only or validation failed, return result
    if (validateOnly || !validationResult.valid) {
      return res.status(validationResult.valid ? 200 : 400).json({
        success: validationResult.valid,
        mode: 'validation',
        ...formattedResult,
      });
    }

    // TODO: Save valid messages to database
    // For now, return success with message count
    const importedCount = messages.length;

    logger.info('Excel import completed', {
      importedCount,
      filename: req.file.originalname,
    });

    res.json({
      success: true,
      mode: 'import',
      importedCount,
      message: `${importedCount}개의 메시지가 성공적으로 가져왔습니다`,
    });
  } catch (error) {
    logger.error('Excel import failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /data/export/json:
 *   get:
 *     summary: Export generated content as JSON
 *     tags: [Data IO]
 *     parameters:
 *       - in: query
 *         name: contentType
 *         schema:
 *           type: string
 *           enum: [summary, faq, idea_list, all]
 *         description: Type of content to export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of items
 *     responses:
 *       200:
 *         description: JSON export
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export/json', async (req, res) => {
  try {
    const {
      contentType = 'all',
      startDate,
      endDate,
      limit = 100,
    } = req.query;

    logger.info('JSON export requested', {
      contentType,
      startDate,
      endDate,
      limit,
    });

    // Build query filters
    const filters = {};
    if (contentType !== 'all') {
      filters.contentType = contentType;
    }
    if (startDate) {
      filters.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filters.createdAt = { ...filters.createdAt, $lte: new Date(endDate) };
    }

    // TODO: Fetch from database
    // For now, return mock data structure
    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: {
        contentType,
        startDate: startDate || null,
        endDate: endDate || null,
        limit: parseInt(limit),
      },
      count: 0,
      items: [],
    };

    // Set headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="talkstudio-export-${Date.now()}.json"`
    );

    res.json(exportData);
  } catch (error) {
    logger.error('JSON export failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /data/template/info:
 *   get:
 *     summary: Get Excel template column information
 *     tags: [Data IO]
 *     responses:
 *       200:
 *         description: Template information
 */
router.get('/template/info', (req, res) => {
  const templateInfo = getTemplateInfo();
  res.json({
    success: true,
    template: templateInfo,
    downloadUrl: '/templates/message_template.xlsx',
  });
});

export default router;
