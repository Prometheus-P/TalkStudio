// backend/src/api/content_generation_routes.js
import { Router } from 'express';
// import { triggerContentGenerationInAgentSystem } from '../../services/agent_system_service.js'; // Future integration
import GeneratedContent from '../../models/generated_content_model.js'; // Assuming a Node.js model

const router = Router();

// POST /content/generate - Request content generation
router.post('/generate', async (req, res) => {
  try {
    const { discordMessageIds, contentType, generationParameters } = req.body;

    // TODO: Validate input, ensure discordMessageIds are valid, user has permission

    // Placeholder: In a real app, this would make an internal call
    // to the AI Agent System to start the content generation process.
    // const generatedContent = await triggerContentGenerationInAgentSystem(
    //   discordMessageIds, contentType, generationParameters
    // );
    const generatedContentId = `gen_${Date.now()}_${contentType}`; // Dummy ID

    res.status(200).json({
      status: 'success',
      data: {
        generatedContentId: generatedContentId,
        status: 'pending', // Or 'generating' once agent system acknowledges
        previewText: '콘텐츠 생성이 요청되었습니다.'
      },
      message: '콘텐츠 생성 요청이 접수되었습니다.',
    });
  } catch (error) {
    console.error('Error requesting content generation:', error);
    res.status(500).json({ status: 'error', code: 'CONTENT_GENERATION_FAILED', message: error.message });
  }
});

// GET /content/generated/{generatedContentId} - Get generated content by ID
router.get('/generated/:generatedContentId', async (req, res) => {
  try {
    const { generatedContentId } = req.params;

    // TODO: Validate generatedContentId, user permissions

    // Placeholder: In a real app, this would fetch from a database.
    // Assuming GeneratedContent model (Node.js) is available
    // const generatedContent = await GeneratedContent.findById(generatedContentId);

    // Dummy content for now
    const dummyGeneratedContent = {
      generatedContentId: generatedContentId,
      relatedDiscordMessageIds: ['dummy_msg_1', 'dummy_msg_2'],
      contentType: 'summary',
      generatedText: `This is a dummy summary for content ID ${generatedContentId}. It was generated based on the provided Discord messages.`,
      upstageModelUsed: 'llama-2-70b-chat',
      promptUsed: 'Summarize the following conversation...',
      temperature: 0.7,
      generatedAt: new Date().toISOString(),
      status: 'completed',
    };

    if (!dummyGeneratedContent) { // Simulate not found
      return res.status(404).json({ status: 'error', code: 'GENERATED_CONTENT_NOT_FOUND', message: '생성된 콘텐츠를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      status: 'success',
      data: dummyGeneratedContent,
      message: '생성된 콘텐츠가 성공적으로 조회되었습니다.',
    });
  } catch (error) {
    console.error('Error fetching generated content:', error);
    res.status(500).json({ status: 'error', code: 'GENERATED_CONTENT_FETCH_FAILED', message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/content/compare:
 *   post:
 *     summary: Compare AI responses from Upstage and OpenAI (US5)
 *     tags: [Content Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to both AI providers
 *               temperature:
 *                 type: number
 *                 default: 0.7
 *               maxTokens:
 *                 type: integer
 *                 default: 500
 *     responses:
 *       200:
 *         description: Comparison results from both providers
 */
router.post('/compare', async (req, res) => {
  try {
    const { prompt, temperature = 0.7, maxTokens = 500 } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PROMPT',
        message: '프롬프트를 입력해주세요.'
      });
    }

    // TODO: In production, this would call the AI Agent System's ai_comparator
    // For now, return a mock comparison result structure
    // Real implementation would use: POST to AI Agent System /compare endpoint

    const mockComparisonResult = {
      prompt: prompt.trim(),
      timestamp: new Date().toISOString(),
      upstage_response: {
        text: `[Upstage Response] This is a simulated response for: "${prompt.substring(0, 50)}..."`,
        provider: 'upstage',
        model: 'solar-pro',
        success: true,
        error: null,
        metrics: {
          response_length: 80,
          word_count: 12,
          latency_ms: 850.5,
          estimated_tokens: 16
        }
      },
      openai_response: {
        text: `[OpenAI Response] This is a simulated response for: "${prompt.substring(0, 50)}..."`,
        provider: 'openai',
        model: 'gpt-4o-mini',
        success: true,
        error: null,
        metrics: {
          response_length: 78,
          word_count: 11,
          latency_ms: 720.3,
          estimated_tokens: 14
        }
      },
      comparison_summary: {
        both_succeeded: true,
        latency_difference_ms: 130.2,
        length_difference: 2,
        winner_reason: 'OpenAI was faster with similar quality'
      },
      winner: 'openai'
    };

    res.status(200).json({
      status: 'success',
      data: mockComparisonResult,
      message: 'AI 비교가 완료되었습니다.'
    });
  } catch (error) {
    console.error('Error comparing AI responses:', error);
    res.status(500).json({
      status: 'error',
      code: 'AI_COMPARISON_FAILED',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/content/compare/batch:
 *   post:
 *     summary: Batch compare multiple prompts (US5)
 *     tags: [Content Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompts
 *             properties:
 *               prompts:
 *                 type: array
 *                 items:
 *                   type: string
 *               temperature:
 *                 type: number
 *                 default: 0.7
 *               maxTokens:
 *                 type: integer
 *                 default: 500
 *     responses:
 *       200:
 *         description: Batch comparison results with summary report
 */
router.post('/compare/batch', async (req, res) => {
  try {
    const { prompts, temperature = 0.7, maxTokens = 500 } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PROMPTS',
        message: '프롬프트 배열을 입력해주세요.'
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        status: 'error',
        code: 'TOO_MANY_PROMPTS',
        message: '최대 10개의 프롬프트만 비교할 수 있습니다.'
      });
    }

    // Mock batch results
    const results = prompts.map((prompt, index) => ({
      prompt: prompt,
      timestamp: new Date().toISOString(),
      winner: index % 3 === 0 ? 'upstage' : index % 3 === 1 ? 'openai' : 'tie'
    }));

    const upstageWins = results.filter(r => r.winner === 'upstage').length;
    const openaiWins = results.filter(r => r.winner === 'openai').length;
    const ties = results.filter(r => r.winner === 'tie').length;

    const report = {
      total_comparisons: prompts.length,
      upstage_wins: upstageWins,
      openai_wins: openaiWins,
      ties: ties,
      failures: 0,
      upstage_win_rate: Math.round(upstageWins / prompts.length * 100),
      openai_win_rate: Math.round(openaiWins / prompts.length * 100)
    };

    res.status(200).json({
      status: 'success',
      data: {
        results: results,
        report: report
      },
      message: `${prompts.length}개 프롬프트 비교가 완료되었습니다.`
    });
  } catch (error) {
    console.error('Error in batch comparison:', error);
    res.status(500).json({
      status: 'error',
      code: 'BATCH_COMPARISON_FAILED',
      message: error.message
    });
  }
});

export default router;