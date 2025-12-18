/**
 * Conversation Routes - 대화 생성 API 엔드포인트
 * POST /conversations/generate - 새 대화 생성
 * GET /conversations/:id - 대화 조회
 * DELETE /conversations/:id - 대화 삭제
 * PATCH /conversations/:id - 대화 수정
 * POST /conversations/:id/regenerate - 메시지 재생성
 */
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  generateConversation,
  getConversation,
  deleteConversation,
  updateConversation,
  regenerateMessage,
  addMessage,
} from '../../services/conversation_generator.js';
import logger from '../../utils/logger.js';

const router = Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @swagger
 * /api/v1/conversations/generate:
 *   post:
 *     summary: Generate a new conversation
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenario
 *             properties:
 *               scenario:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               participants:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 5
 *               messageCount:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 50
 *               tone:
 *                 type: string
 *                 enum: [casual, formal, humorous]
 *               platform:
 *                 type: string
 *                 enum: [kakaotalk, discord, telegram, instagram]
 *               participantNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               templateId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation generated successfully
 *       400:
 *         description: Validation error
 *       422:
 *         description: Content policy violation
 */
router.post(
  '/generate',
  [
    body('scenario')
      .isString()
      .isLength({ min: 10, max: 500 })
      .withMessage('시나리오는 10-500자 사이여야 합니다.'),
    body('participants')
      .optional()
      .isInt({ min: 2, max: 5 })
      .withMessage('참여자 수는 2-5 사이여야 합니다.'),
    body('messageCount')
      .optional()
      .isInt({ min: 5, max: 50 })
      .withMessage('메시지 수는 5-50 사이여야 합니다.'),
    body('tone')
      .optional()
      .isIn(['casual', 'formal', 'humorous'])
      .withMessage('톤은 casual, formal, humorous 중 하나여야 합니다.'),
    body('platform')
      .optional()
      .isIn(['kakaotalk', 'discord', 'telegram', 'instagram'])
      .withMessage('플랫폼은 kakaotalk, discord, telegram, instagram 중 하나여야 합니다.'),
    body('participantNames')
      .optional()
      .isArray({ max: 5 })
      .withMessage('참여자 이름은 최대 5개까지 가능합니다.'),
    body('templateId')
      .optional()
      .isMongoId()
      .withMessage('유효하지 않은 템플릿 ID입니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        scenario,
        participants = 2,
        messageCount = 10,
        tone = 'casual',
        platform = 'kakaotalk',
        participantNames,
        templateId,
      } = req.body;

      logger.info('Generating conversation', { scenario: scenario.substring(0, 50) });

      const conversation = await generateConversation({
        scenario,
        participants,
        messageCount,
        tone,
        platform,
        participantNames,
        templateId,
      });

      res.status(201).json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      logger.error('Generate conversation failed', { error: error.message });

      // Check if it's a content policy violation
      if (error.message.includes('부적절') || error.message.includes('콘텐츠')) {
        return res.status(422).json({
          status: 'error',
          code: 'CONTENT_POLICY_VIOLATION',
          message: error.message,
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'GENERATION_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/conversations/{id}:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation found
 *       404:
 *         description: Conversation not found
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('유효하지 않은 대화 ID입니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      const conversation = await getConversation(req.params.id);

      res.json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '대화를 찾을 수 없습니다.',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'FETCH_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted
 *       404:
 *         description: Conversation not found
 */
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('유효하지 않은 대화 ID입니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      await deleteConversation(req.params.id);

      res.json({
        status: 'success',
        message: '대화가 삭제되었습니다.',
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '대화를 찾을 수 없습니다.',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'DELETE_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/conversations/{id}:
 *   patch:
 *     summary: Update a conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *               platform:
 *                 type: string
 *               participants:
 *                 type: array
 *     responses:
 *       200:
 *         description: Conversation updated
 *       404:
 *         description: Conversation not found
 */
router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('유효하지 않은 대화 ID입니다.'),
    body('messages')
      .optional()
      .isArray()
      .withMessage('메시지는 배열이어야 합니다.'),
    body('platform')
      .optional()
      .isIn(['kakaotalk', 'discord', 'telegram', 'instagram'])
      .withMessage('유효하지 않은 플랫폼입니다.'),
    body('participants')
      .optional()
      .isArray({ min: 2, max: 5 })
      .withMessage('참여자는 2-5명이어야 합니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      const conversation = await updateConversation(req.params.id, req.body);

      res.json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '대화를 찾을 수 없습니다.',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'UPDATE_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/conversations/{id}/regenerate:
 *   post:
 *     summary: Regenerate a specific message
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIndex
 *             properties:
 *               messageIndex:
 *                 type: integer
 *               instruction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message regenerated
 *       404:
 *         description: Conversation not found
 */
router.post(
  '/:id/regenerate',
  [
    param('id').isMongoId().withMessage('유효하지 않은 대화 ID입니다.'),
    body('messageIndex')
      .isInt({ min: 0 })
      .withMessage('유효하지 않은 메시지 인덱스입니다.'),
    body('instruction')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('지시사항은 200자 이하여야 합니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      const { messageIndex, instruction } = req.body;
      const conversation = await regenerateMessage(req.params.id, messageIndex, instruction);

      res.json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '대화를 찾을 수 없습니다.',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'REGENERATE_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/conversations/{id}/messages:
 *   post:
 *     summary: Add a new message to conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *             properties:
 *               sender:
 *                 type: string
 *               text:
 *                 type: string
 *               instruction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message added
 */
router.post(
  '/:id/messages',
  [
    param('id').isMongoId().withMessage('유효하지 않은 대화 ID입니다.'),
    body('sender')
      .isString()
      .isLength({ min: 1, max: 20 })
      .withMessage('발신자 이름은 1-20자 사이여야 합니다.'),
    body('text')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('메시지는 500자 이하여야 합니다.'),
    body('instruction')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('지시사항은 200자 이하여야 합니다.'),
  ],
  validate,
  async (req, res) => {
    try {
      const { sender, text, instruction } = req.body;
      const conversation = await addMessage(req.params.id, sender, text, instruction);

      res.json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: '대화를 찾을 수 없습니다.',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'ADD_MESSAGE_FAILED',
        message: error.message,
      });
    }
  }
);

export default router;
