// backend/src/api/integrations/discord_config_routes.js
import { Router } from 'express';
import DiscordConfig from '../../models/discord_config_model.js';
import logger from '../../utils/logger.js'; // Import custom logger
// import config from '../../config/index.js'; // For botToken encryption in a real app - not used directly here

const router = Router();

// POST /integrations/discord/config - Register or Update Discord configuration
router.post('/config', async (req, res) => {
  try {
    const { serverId, serverName, botToken, enabledChannels, captureStartDate } = req.body;

    let discordConfig = await DiscordConfig.findOne({ serverId });

    if (discordConfig) {
      discordConfig.serverName = serverName || discordConfig.serverName;
      // Only update botToken if provided, as it might be encrypted
      if (botToken) {
        discordConfig.botToken = botToken; 
      }
      discordConfig.enabledChannels = enabledChannels || discordConfig.enabledChannels;
      discordConfig.captureStartDate = captureStartDate || discordConfig.captureStartDate;
      discordConfig.updatedAt = Date.now();
      logger.info(`Discord config updated for serverId: ${serverId}`);
    } else {
      discordConfig = new DiscordConfig({
        serverId,
        serverName,
        botToken,
        enabledChannels,
        captureStartDate,
      });
      logger.info(`New Discord config created for serverId: ${serverId}`);
    }

    await discordConfig.save();

    res.status(discordConfig._id ? 200 : 201).json({
      status: 'success',
      data: {
        configId: discordConfig._id,
        serverId: discordConfig.serverId,
        serverName: discordConfig.serverName,
        enabledChannels: discordConfig.enabledChannels,
      },
      message: discordConfig._id ? 'Discord 설정이 성공적으로 업데이트되었습니다.' : 'Discord 설정이 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    logger.error('Error saving Discord config:', error); // Using logger.error
    res.status(500).json({ status: 'error', code: 'DISCORD_CONFIG_SAVE_FAILED', message: error.message });
  }
});

// GET /integrations/discord/config/{configId} - Get Discord configuration
router.get('/config/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    const discordConfig = await DiscordConfig.findById(configId);

    if (!discordConfig) {
      logger.warn(`Discord config not found for configId: ${configId}`); // Using logger.warn
      return res.status(404).json({ status: 'error', code: 'DISCORD_CONFIG_NOT_FOUND', message: 'Discord 설정을 찾을 수 없습니다.' });
    }

    // Explicitly exclude botToken from the response for security
    const configResponse = discordConfig.toObject();
    delete configResponse.botToken; // Remove encrypted token from direct response

    logger.info(`Discord config fetched for configId: ${configId}`); // Using logger.info

    res.status(200).json({
      status: 'success',
      data: configResponse, // Send config without botToken
      message: 'Discord 설정이 성공적으로 조회되었습니다.',
    });
  } catch (error) {
    logger.error('Error fetching Discord config:', error); // Using logger.error
    res.status(500).json({ status: 'error', code: 'DISCORD_CONFIG_FETCH_FAILED', message: error.message });
  }
});

// DELETE /integrations/discord/config/{configId} - Delete Discord configuration
router.delete('/config/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    const result = await DiscordConfig.findByIdAndDelete(configId);

    if (!result) {
      logger.warn(`Discord config not found for deletion with configId: ${configId}`); // Using logger.warn
      return res.status(404).json({ status: 'error', code: 'DISCORD_CONFIG_NOT_FOUND', message: 'Discord 설정을 찾을 수 없습니다.' });
    }
    logger.info(`Discord config deleted for configId: ${configId}`); // Using logger.info
    res.status(200).json({
      status: 'success',
      message: 'Discord 설정이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    logger.error('Error deleting Discord config:', error); // Using logger.error
    res.status(500).json({ status: 'error', code: 'DISCORD_CONFIG_DELETE_FAILED', message: error.message });
  }
});

export default router;
