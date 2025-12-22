/**
 * Conversation Generator - AI 대화 생성 핵심 서비스
 * 시나리오 기반 대화 생성 로직
 */
import { generateCompletion, parseJSONResponse, AIProvider } from './ai_client.js';
import { buildSystemPrompt, buildUserPrompt, buildRegeneratePrompt, buildAddMessagePrompt } from './prompt_builder.js';
import { preFilter, postFilter, validateParticipants } from './content_filter.js';
import Conversation from '../models/conversation_model.js';
import logger from '../utils/logger.js';

/**
 * Generate a new conversation based on scenario
 * @param {Object} options - Generation options
 * @param {string} options.scenario - Scenario description
 * @param {number} [options.participants=2] - Number of participants
 * @param {number} [options.messageCount=10] - Target message count
 * @param {string} [options.tone='casual'] - Tone type
 * @param {string} [options.platform='kakaotalk'] - Platform type
 * @param {string[]} [options.participantNames] - Optional custom participant names
 * @param {string} [options.templateId] - Optional template reference
 * @returns {Promise<Conversation>}
 */
export const generateConversation = async ({
  scenario,
  participants = 2,
  messageCount = 10,
  tone = 'casual',
  platform = 'kakaotalk',
  participantNames,
  templateId,
}) => {
  logger.info('Starting conversation generation', {
    scenario: scenario.substring(0, 50),
    participants,
    messageCount,
    tone,
    platform,
  });

  // Pre-filter input scenario
  const preFilterResult = preFilter(scenario);
  if (!preFilterResult.safe) {
    throw new Error(preFilterResult.reason);
  }

  // Validate participant names if provided
  if (participantNames && participantNames.length > 0) {
    const nameValidation = validateParticipants(participantNames);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.reason);
    }
  }

  // Create conversation document (status: generating)
  // Note: Initially save with placeholder data to avoid validation errors
  const placeholderParticipants = participantNames?.length >= 2
    ? participantNames
    : ['참여자1', '참여자2'];
  const placeholderMessage = {
    sender: placeholderParticipants[0],
    text: '대화 생성 중...',
    timestamp: '12:00',
    type: 'text',
  };

  const conversation = new Conversation({
    templateId: templateId || null,
    scenario,
    participants: placeholderParticipants,
    messages: [placeholderMessage],
    tone,
    platform,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
    },
    status: 'generating',
  });

  await conversation.save();

  try {
    // Build prompts
    const systemPrompt = buildSystemPrompt({ tone, platform });
    const userPrompt = buildUserPrompt({
      scenario,
      participantCount: participants,
      messageCount,
      participantNames,
    });

    // Generate conversation via AI
    const aiResult = await generateCompletion({
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    // Parse AI response
    const generatedData = parseJSONResponse(aiResult.content);

    // Validate generated content
    if (!generatedData.participants || !Array.isArray(generatedData.participants)) {
      throw new Error('AI response missing participants');
    }

    if (!generatedData.messages || !Array.isArray(generatedData.messages)) {
      throw new Error('AI response missing messages');
    }

    // Post-filter generated content
    const postFilterResult = postFilter(generatedData.messages);
    if (!postFilterResult.safe) {
      // Mark as failed if content is inappropriate
      conversation.status = 'failed';
      await conversation.save();
      throw new Error(postFilterResult.reason);
    }

    // Update conversation with generated content
    conversation.participants = generatedData.participants;
    conversation.messages = generatedData.messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp || generateTimestamp(),
      type: 'text',
    }));
    conversation.aiProvider = aiResult.provider;
    conversation.parameters.model = aiResult.model;
    conversation.status = 'completed';

    await conversation.save();

    logger.info('Conversation generation completed', {
      conversationId: conversation._id,
      messageCount: conversation.messages.length,
      provider: aiResult.provider,
    });

    return conversation;

  } catch (error) {
    logger.error('Conversation generation failed', {
      conversationId: conversation._id,
      error: error.message,
    });

    // Update status to failed
    conversation.status = 'failed';
    await conversation.save();

    throw error;
  }
};

/**
 * Regenerate a specific message in an existing conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} messageIndex - Index of message to regenerate
 * @param {string} [instruction] - Optional user instruction
 * @returns {Promise<Conversation>}
 */
export const regenerateMessage = async (conversationId, messageIndex, instruction) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (messageIndex < 0 || messageIndex >= conversation.messages.length) {
    throw new Error('Invalid message index');
  }

  logger.info('Regenerating message', {
    conversationId,
    messageIndex,
    hasInstruction: !!instruction,
  });

  // Build regenerate prompts
  const { systemPrompt, userPrompt } = buildRegeneratePrompt({
    conversation: conversation.toObject(),
    messageIndex,
    instruction,
  });

  // Generate new message text
  const aiResult = await generateCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.8, // Slightly higher for variety
    maxTokens: 500,
  });

  const newText = aiResult.content.trim();

  // Validate new content
  const postFilterResult = postFilter([{ text: newText }]);
  if (!postFilterResult.safe) {
    throw new Error('Generated content is inappropriate');
  }

  // Update message
  conversation.messages[messageIndex].text = newText;
  conversation.status = 'edited';

  await conversation.save();

  logger.info('Message regenerated successfully', { conversationId, messageIndex });

  return conversation;
};

/**
 * Add a new message to an existing conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} sender - Sender name
 * @param {string} [text] - Optional message text (if not provided, AI generates)
 * @param {string} [instruction] - Optional AI instruction
 * @returns {Promise<Conversation>}
 */
export const addMessage = async (conversationId, sender, text, instruction) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Validate sender is a participant
  if (!conversation.participants.includes(sender)) {
    throw new Error('Sender must be a participant');
  }

  let messageText = text;

  // Generate message text if not provided
  if (!messageText) {
    const { systemPrompt, userPrompt } = buildAddMessagePrompt({
      conversation: conversation.toObject(),
      sender,
      instruction,
    });

    const aiResult = await generateCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 500,
    });

    messageText = aiResult.content.trim();
  }

  // Validate content
  const postFilterResult = postFilter([{ text: messageText }]);
  if (!postFilterResult.safe) {
    throw new Error('Message content is inappropriate');
  }

  // Calculate next timestamp
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const newTimestamp = incrementTimestamp(lastMessage?.timestamp || '14:00');

  // Add new message
  conversation.messages.push({
    sender,
    text: messageText,
    timestamp: newTimestamp,
    type: 'text',
  });

  conversation.status = 'edited';
  await conversation.save();

  logger.info('Message added successfully', { conversationId, sender });

  return conversation;
};

/**
 * Get conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Conversation>}
 */
export const getConversation = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  return conversation;
};

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>}
 */
export const deleteConversation = async (conversationId) => {
  const result = await Conversation.findByIdAndDelete(conversationId);

  if (!result) {
    throw new Error('Conversation not found');
  }

  logger.info('Conversation deleted', { conversationId });
  return true;
};

/**
 * Update conversation (edit messages, platform, etc.)
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Conversation>}
 */
export const updateConversation = async (conversationId, updates) => {
  const allowedFields = ['messages', 'platform', 'participants'];

  const updateData = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // Always mark as edited when updating
  updateData.status = 'edited';

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  logger.info('Conversation updated', { conversationId });

  return conversation;
};

// Helper: Generate timestamp (HH:MM)
const generateTimestamp = () => {
  const hours = Math.floor(Math.random() * 12) + 9; // 09:00 - 20:00
  const minutes = Math.floor(Math.random() * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper: Increment timestamp by 1-5 minutes
const incrementTimestamp = (timestamp) => {
  const [hours, minutes] = timestamp.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + Math.floor(Math.random() * 5) + 1;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

export default {
  generateConversation,
  regenerateMessage,
  addMessage,
  getConversation,
  deleteConversation,
  updateConversation,
};
