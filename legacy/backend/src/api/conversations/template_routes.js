/**
 * Template Routes - 템플릿 API 엔드포인트
 * T026, T027, T028 구현
 */
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Template from '../../models/template_model.js';
import logger from '../../utils/logger.js';

const router = Router();

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

// ============ T026: GET /templates ============

/**
 * @route   GET /api/v1/templates
 * @desc    Get all templates (system + custom)
 * @query   category - Filter by category (optional)
 * @query   isSystem - Filter by system/custom (optional)
 * @access  Public
 */
router.get(
  '/',
  [
    query('category')
      .optional()
      .isIn(['game_trade', 'daily_chat', 'customer_service', 'friend_chat', 'custom'])
      .withMessage('유효하지 않은 카테고리입니다.'),
    query('isSystem')
      .optional()
      .isBoolean()
      .withMessage('isSystem은 boolean 값이어야 합니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `tmpl-list-${Date.now()}`;
    logger.info('Template list request', { requestId, query: req.query });

    try {
      // Build filter
      const filter = {};

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.isSystem !== undefined) {
        filter.isSystem = req.query.isSystem === 'true';
      }

      // Fetch templates
      const templates = await Template.find(filter)
        .sort({ isSystem: -1, category: 1, name: 1 }) // System templates first
        .lean();

      logger.info('Templates fetched', { requestId, count: templates.length });

      res.json({
        success: true,
        data: {
          templates,
          total: templates.length,
        },
      });

    } catch (error) {
      logger.error('Failed to fetch templates', {
        requestId,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: '템플릿 목록 조회에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/v1/templates/:id
 * @desc    Get single template by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('유효하지 않은 템플릿 ID입니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `tmpl-get-${Date.now()}`;
    logger.info('Template get request', { requestId, templateId: req.params.id });

    try {
      const template = await Template.findById(req.params.id).lean();

      if (!template) {
        logger.warn('Template not found', { requestId, templateId: req.params.id });
        return res.status(404).json({
          success: false,
          message: '템플릿을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: { template },
      });

    } catch (error) {
      logger.error('Failed to fetch template', {
        requestId,
        templateId: req.params.id,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: '템플릿 조회에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

// ============ T027: POST /templates ============

/**
 * @route   POST /api/v1/templates
 * @desc    Create a new custom template
 * @access  Public
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('템플릿 이름은 필수입니다.')
      .isLength({ max: 100 })
      .withMessage('템플릿 이름은 100자 이내여야 합니다.'),
    body('category')
      .optional()
      .isIn(['game_trade', 'daily_chat', 'customer_service', 'friend_chat', 'custom'])
      .withMessage('유효하지 않은 카테고리입니다.'),
    body('scenario')
      .trim()
      .notEmpty()
      .withMessage('시나리오는 필수입니다.')
      .isLength({ min: 10, max: 1000 })
      .withMessage('시나리오는 10자 이상 1000자 이내여야 합니다.'),
    body('participants')
      .optional()
      .isInt({ min: 2, max: 5 })
      .withMessage('참여자 수는 2~5명이어야 합니다.'),
    body('messageCount')
      .optional()
      .isInt({ min: 5, max: 50 })
      .withMessage('메시지 수는 5~50개여야 합니다.'),
    body('tone')
      .optional()
      .isIn(['casual', 'formal', 'humorous'])
      .withMessage('유효하지 않은 톤입니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `tmpl-create-${Date.now()}`;
    logger.info('Template create request', { requestId, body: req.body });

    try {
      const { name, category, scenario, participants, messageCount, tone } = req.body;

      // Check for duplicate name
      const existingTemplate = await Template.findOne({ name: name.trim() });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: '동일한 이름의 템플릿이 이미 존재합니다.',
        });
      }

      // Create template (always custom, never system)
      const template = new Template({
        name: name.trim(),
        category: category || 'custom',
        scenario: scenario.trim(),
        participants: participants || 2,
        messageCount: messageCount || 10,
        tone: tone || 'casual',
        isSystem: false, // User templates are never system templates
      });

      await template.save();

      logger.info('Template created', { requestId, templateId: template._id });

      res.status(201).json({
        success: true,
        message: '템플릿이 생성되었습니다.',
        data: { template },
      });

    } catch (error) {
      logger.error('Failed to create template', {
        requestId,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: '템플릿 생성에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

// ============ T028: DELETE /templates/:id ============

/**
 * @route   DELETE /api/v1/templates/:id
 * @desc    Delete a custom template (system templates cannot be deleted)
 * @access  Public
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('유효하지 않은 템플릿 ID입니다.'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const requestId = `tmpl-delete-${Date.now()}`;
    logger.info('Template delete request', { requestId, templateId: req.params.id });

    try {
      const template = await Template.findById(req.params.id);

      if (!template) {
        logger.warn('Template not found', { requestId, templateId: req.params.id });
        return res.status(404).json({
          success: false,
          message: '템플릿을 찾을 수 없습니다.',
        });
      }

      // Prevent deletion of system templates
      if (template.isSystem) {
        logger.warn('Attempted to delete system template', {
          requestId,
          templateId: req.params.id,
          templateName: template.name,
        });
        return res.status(403).json({
          success: false,
          message: '시스템 템플릿은 삭제할 수 없습니다.',
        });
      }

      await Template.findByIdAndDelete(req.params.id);

      logger.info('Template deleted', { requestId, templateId: req.params.id });

      res.json({
        success: true,
        message: '템플릿이 삭제되었습니다.',
      });

    } catch (error) {
      logger.error('Failed to delete template', {
        requestId,
        templateId: req.params.id,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        message: '템플릿 삭제에 실패했습니다.',
        error: error.message,
      });
    }
  }
);

export default router;
