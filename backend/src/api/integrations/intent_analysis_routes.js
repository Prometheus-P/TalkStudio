// backend/src/api/integrations/intent_analysis_routes.js
import { Router } from 'express';
// import { getLatestIntentAnalysisResultForMessage } from '../../services/agent_system_service.js'; // Future integration

const router = Router();

// GET /integrations/discord/messages/{discordMessageId}/intent-analysis - Get intent analysis results for a message
router.get('/messages/:discordMessageId/intent-analysis', async (req, res) => {
  try {
    const { discordMessageId } = req.params;

    // TODO: Validate discordMessageId exists and user has permission
    // Placeholder: In a real app, this would query the AI Agent System
    // or a shared database for the intent analysis result.
    // const analysisResult = await getLatestIntentAnalysisResultForMessage(discordMessageId);
    
    // Dummy analysis result for now
    const dummyAnalysisResult = {
      discordMessageId: discordMessageId,
      extractedIntents: ['질문', '피드백'],
      keywords: ['기능', '버그', '개선'],
      sentiment: 'neutral',
      analysisModelVersion: 'v1.0',
      analysisTimestamp: new Date().toISOString(),
    };

    if (!dummyAnalysisResult) { // Simulate not found
      return res.status(404).json({ status: 'error', code: 'INTENT_ANALYSIS_NOT_FOUND', message: '의도 분석 결과를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      status: 'success',
      data: dummyAnalysisResult,
      message: '의도 분석 결과가 성공적으로 조회되었습니다.',
    });
  } catch (error) {
    console.error('Error fetching intent analysis result:', error);
    res.status(500).json({ status: 'error', code: 'INTENT_ANALYSIS_FETCH_FAILED', message: error.message });
  }
});

export default router;
