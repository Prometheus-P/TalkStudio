/**
 * Migration: 002_conversation_indexes
 * Creates indexes for Conversation, Template, and BulkJob collections
 * Includes TTL indexes for automatic data expiration
 */
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

/**
 * Run migration - create indexes
 */
export const up = async () => {
  const db = mongoose.connection.db;

  logger.info('Running migration: 002_conversation_indexes');

  try {
    // Conversation indexes
    const conversationsCollection = db.collection('conversations');

    await conversationsCollection.createIndex(
      { createdAt: -1 },
      { name: 'idx_conversations_createdAt' }
    );

    await conversationsCollection.createIndex(
      { status: 1 },
      { name: 'idx_conversations_status' }
    );

    await conversationsCollection.createIndex(
      { templateId: 1 },
      { name: 'idx_conversations_templateId' }
    );

    // TTL index for auto-deletion after expiresAt
    await conversationsCollection.createIndex(
      { expiresAt: 1 },
      { name: 'idx_conversations_ttl', expireAfterSeconds: 0 }
    );

    logger.info('Created indexes for conversations collection');

    // Template indexes
    const templatesCollection = db.collection('templates');

    await templatesCollection.createIndex(
      { category: 1 },
      { name: 'idx_templates_category' }
    );

    await templatesCollection.createIndex(
      { isSystem: 1 },
      { name: 'idx_templates_isSystem' }
    );

    await templatesCollection.createIndex(
      { name: 'text' },
      { name: 'idx_templates_name_text' }
    );

    await templatesCollection.createIndex(
      { category: 1, isSystem: 1 },
      { name: 'idx_templates_category_isSystem' }
    );

    logger.info('Created indexes for templates collection');

    // BulkJob indexes
    const bulkjobsCollection = db.collection('bulkjobs');

    await bulkjobsCollection.createIndex(
      { status: 1 },
      { name: 'idx_bulkjobs_status' }
    );

    await bulkjobsCollection.createIndex(
      { createdAt: -1 },
      { name: 'idx_bulkjobs_createdAt' }
    );

    // TTL index for auto-deletion after expiresAt (24 hours)
    await bulkjobsCollection.createIndex(
      { expiresAt: 1 },
      { name: 'idx_bulkjobs_ttl', expireAfterSeconds: 0 }
    );

    logger.info('Created indexes for bulkjobs collection');

    logger.info('Migration 002_conversation_indexes completed successfully');
    return true;

  } catch (error) {
    logger.error('Migration 002_conversation_indexes failed', { error: error.message });
    throw error;
  }
};

/**
 * Rollback migration - drop indexes
 */
export const down = async () => {
  const db = mongoose.connection.db;

  logger.info('Rolling back migration: 002_conversation_indexes');

  try {
    // Drop conversation indexes
    const conversationsCollection = db.collection('conversations');
    await conversationsCollection.dropIndex('idx_conversations_createdAt');
    await conversationsCollection.dropIndex('idx_conversations_status');
    await conversationsCollection.dropIndex('idx_conversations_templateId');
    await conversationsCollection.dropIndex('idx_conversations_ttl');

    // Drop template indexes
    const templatesCollection = db.collection('templates');
    await templatesCollection.dropIndex('idx_templates_category');
    await templatesCollection.dropIndex('idx_templates_isSystem');
    await templatesCollection.dropIndex('idx_templates_name_text');
    await templatesCollection.dropIndex('idx_templates_category_isSystem');

    // Drop bulkjob indexes
    const bulkjobsCollection = db.collection('bulkjobs');
    await bulkjobsCollection.dropIndex('idx_bulkjobs_status');
    await bulkjobsCollection.dropIndex('idx_bulkjobs_createdAt');
    await bulkjobsCollection.dropIndex('idx_bulkjobs_ttl');

    logger.info('Rollback 002_conversation_indexes completed successfully');
    return true;

  } catch (error) {
    logger.error('Rollback 002_conversation_indexes failed', { error: error.message });
    throw error;
  }
};

export default { up, down };
