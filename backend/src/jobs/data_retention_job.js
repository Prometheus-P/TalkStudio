// backend/src/jobs/data_retention_job.js
import cron from 'node-cron';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import GeneratedContent from '../models/generated_content_model.js';

/**
 * Data Retention Job (US7/NFR-8)
 * Deletes data older than the configured retention period (default: 90 days)
 */

/**
 * Calculate the cutoff date based on retention period
 * @returns {Date} Cutoff date - documents older than this will be deleted
 */
function getCutoffDate() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.dataRetention.retentionDays);
  return cutoffDate;
}

/**
 * Delete expired generated content documents
 * @returns {Promise<{deletedCount: number}>} Result with deleted count
 */
async function deleteExpiredGeneratedContent() {
  const cutoffDate = getCutoffDate();

  try {
    const result = await GeneratedContent.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    logger.error('Failed to delete expired GeneratedContent:', error);
    throw error;
  }
}

/**
 * Main cleanup function that runs all retention tasks
 * @returns {Promise<Object>} Summary of all cleanup operations
 */
async function runCleanup() {
  const startTime = Date.now();
  const summary = {
    startedAt: new Date().toISOString(),
    retentionDays: config.dataRetention.retentionDays,
    cutoffDate: getCutoffDate().toISOString(),
    results: {},
    errors: [],
    duration: 0
  };

  logger.info(`Data retention job started. Retention period: ${config.dataRetention.retentionDays} days`);
  logger.info(`Cutoff date: ${summary.cutoffDate}`);

  // Delete expired GeneratedContent
  try {
    const generatedContentResult = await deleteExpiredGeneratedContent();
    summary.results.generatedContent = generatedContentResult;
    logger.info(`Deleted ${generatedContentResult.deletedCount} expired GeneratedContent documents`);
  } catch (error) {
    summary.errors.push({
      collection: 'GeneratedContent',
      error: error.message
    });
  }

  // Add more model cleanup here as needed (future: DiscordCapturedMessages, etc.)

  summary.duration = Date.now() - startTime;
  logger.info(`Data retention job completed in ${summary.duration}ms`);

  if (summary.errors.length > 0) {
    logger.warn(`Data retention job completed with ${summary.errors.length} error(s)`);
  }

  return summary;
}

/**
 * Start the scheduled data retention job
 * @returns {cron.ScheduledTask|null} The scheduled task or null if disabled
 */
function startRetentionJob() {
  if (!config.dataRetention.enabled) {
    logger.info('Data retention job is disabled');
    return null;
  }

  const cronSchedule = config.dataRetention.cleanupCronSchedule;

  // Validate cron expression
  if (!cron.validate(cronSchedule)) {
    logger.error(`Invalid cron expression: ${cronSchedule}`);
    return null;
  }

  const task = cron.schedule(cronSchedule, async () => {
    try {
      await runCleanup();
    } catch (error) {
      logger.error('Data retention job failed:', error);
    }
  });

  logger.info(`Data retention job scheduled: ${cronSchedule}`);
  return task;
}

/**
 * Stop the scheduled data retention job
 * @param {cron.ScheduledTask} task The task to stop
 */
function stopRetentionJob(task) {
  if (task) {
    task.stop();
    logger.info('Data retention job stopped');
  }
}

export {
  runCleanup,
  startRetentionJob,
  stopRetentionJob,
  deleteExpiredGeneratedContent,
  getCutoffDate
};
