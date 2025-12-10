// backend/src/api/integrations/discord_capture_routes.js
import { Router } from 'express';
// import { getCaptureJobStatusFromAgentSystem } from '../../services/agent_system_service.js'; // Future integration

const router = Router();

// POST /integrations/discord/config/{configId}/capture/start - Start/Resume Discord message capture
router.post('/config/:configId/capture/start', async (req, res) => {
  try {
    const { configId } = req.params;
    const { fromTimestamp, limitMessages } = req.body;

    // TODO: Validate configId exists and user has permission

    // Placeholder: In a real app, this would make an internal call
    // to the AI Agent System to start the capture process.
    // const captureJob = await triggerCaptureInAgentSystem(configId, fromTimestamp, limitMessages);
    const captureJobId = `capture_${Date.now()}_${configId}`; // Dummy Job ID

    res.status(200).json({
      status: 'success',
      data: {
        captureJobId: captureJobId,
        status: 'pending', // Or 'started' once agent system acknowledges
      },
      message: '메시지 캡쳐 작업 요청이 접수되었습니다.',
    });
  } catch (error) {
    console.error('Error starting Discord capture:', error);
    res.status(500).json({ status: 'error', code: 'DISCORD_CAPTURE_START_FAILED', message: error.message });
  }
});

// GET /integrations/discord/capture/{captureJobId}/status - Get Discord capture job status
router.get('/capture/:captureJobId/status', async (req, res) => {
  try {
    const { captureJobId } = req.params;

    // TODO: Placeholder: In a real app, this would query the AI Agent System
    // or a shared database for the actual status of the capture job.
    // const jobStatus = await getCaptureJobStatusFromAgentSystem(captureJobId);
    
    // Dummy status for now
    const dummyJobStatus = {
      captureJobId: captureJobId,
      configId: 'test_config_123', // Example
      status: 'running', // Can be 'running', 'completed', 'failed'
      messagesCaptured: 1500,
      totalMessagesExpected: 5000,
      progress: 30,
      startTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      endTime: null,
      errorMessage: null,
    };

    res.status(200).json({
      status: 'success',
      data: dummyJobStatus,
      message: '캡쳐 작업 상태가 성공적으로 조회되었습니다.',
    });
  } catch (error) {
    console.error('Error fetching Discord capture status:', error);
    res.status(500).json({ status: 'error', code: 'DISCORD_CAPTURE_STATUS_FETCH_FAILED', message: error.message });
  }
});


export default router;