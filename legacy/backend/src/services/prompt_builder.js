/**
 * Prompt Builder - 대화 생성 프롬프트 빌더
 * AI에게 전달할 시스템/사용자 프롬프트 생성
 */

// Tone descriptions for prompt
const TONE_DESCRIPTIONS = {
  casual: '친근하고 편안한 말투. 반말 사용 가능. 이모티콘/축약어 자연스럽게 사용.',
  formal: '정중하고 예의 바른 말투. 존댓말 사용. 격식 있는 표현.',
  humorous: '유머러스하고 재치 있는 말투. 농담과 재미있는 표현 포함. 가벼운 분위기.',
};

// Platform-specific style hints
const PLATFORM_HINTS = {
  kakaotalk: '카카오톡 스타일. 짧은 메시지, 이모티콘 자주 사용, 답장 빠름.',
  discord: '디스코드 스타일. 캐주얼한 게이머 말투, 이모지 사용, 채널/서버 언급 가능.',
  telegram: '텔레그램 스타일. 간결한 메시지, 기술적인 대화 가능.',
  instagram: '인스타그램 DM 스타일. 친밀한 대화, 감성적인 표현.',
};

/**
 * Build system prompt for conversation generation
 * @param {Object} options - Options
 * @param {string} [options.tone='casual'] - Tone type
 * @param {string} [options.platform='kakaotalk'] - Platform type
 * @returns {string} - System prompt
 */
export const buildSystemPrompt = ({ tone = 'casual', platform = 'kakaotalk' } = {}) => {
  const toneDesc = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.casual;
  const platformHint = PLATFORM_HINTS[platform] || PLATFORM_HINTS.kakaotalk;

  return `You are a conversation generator that creates realistic chat conversations in Korean.

## Output Format
Return ONLY valid JSON with this exact structure:
{
  "participants": ["이름1", "이름2"],
  "messages": [
    {"sender": "이름1", "text": "메시지 내용", "timestamp": "14:30"},
    {"sender": "이름2", "text": "답장 내용", "timestamp": "14:31"}
  ]
}

## Rules
1. Generate natural Korean conversation that flows realistically
2. Each message should be 1-3 sentences (under 200 characters)
3. Timestamps should progress naturally (1-5 minutes between messages)
4. Use appropriate reactions, questions, and responses
5. Vary message lengths for realism
6. Participants should reference each other naturally

## Tone Style
${toneDesc}

## Platform Style
${platformHint}

## Content Guidelines
- Keep content appropriate and safe
- No violence, hate speech, or illegal content
- Focus on everyday realistic conversations`;
};

/**
 * Build user prompt for conversation generation
 * @param {Object} options - Options
 * @param {string} options.scenario - Scenario description
 * @param {number} options.participantCount - Number of participants
 * @param {number} options.messageCount - Target message count
 * @param {string[]} [options.participantNames] - Optional custom participant names
 * @returns {string} - User prompt
 */
export const buildUserPrompt = ({
  scenario,
  participantCount,
  messageCount,
  participantNames,
}) => {
  let prompt = `Generate a ${messageCount}-message Korean conversation about: "${scenario}"

Number of participants: ${participantCount}`;

  if (participantNames && participantNames.length > 0) {
    prompt += `\nParticipant names: ${participantNames.join(', ')}`;
  } else {
    prompt += `\nGenerate appropriate Korean names for ${participantCount} participants.`;
  }

  prompt += `

Requirements:
- Exactly ${messageCount} messages total
- Natural conversation flow
- Realistic timestamps starting from current time
- Each participant should speak multiple times`;

  return prompt;
};

/**
 * Build prompt for regenerating a specific message
 * @param {Object} options - Options
 * @param {Object} options.conversation - Existing conversation
 * @param {number} options.messageIndex - Index of message to regenerate
 * @param {string} [options.instruction] - Optional user instruction
 * @returns {{systemPrompt: string, userPrompt: string}}
 */
export const buildRegeneratePrompt = ({ conversation, messageIndex, instruction }) => {
  const { participants, messages } = conversation;
  const targetMessage = messages[messageIndex];

  const systemPrompt = `You are helping to regenerate a single message in an existing conversation.
Return ONLY the new message text (no JSON, no quotes, just the text).
Keep the same tone and style as the surrounding messages.`;

  const contextMessages = messages
    .slice(Math.max(0, messageIndex - 3), messageIndex)
    .map(m => `${m.sender}: ${m.text}`)
    .join('\n');

  const nextMessages = messages
    .slice(messageIndex + 1, messageIndex + 2)
    .map(m => `${m.sender}: ${m.text}`)
    .join('\n');

  let userPrompt = `Context (previous messages):
${contextMessages || '(conversation start)'}

Current message to regenerate:
Sender: ${targetMessage.sender}
Current text: "${targetMessage.text}"

${nextMessages ? `Following message:\n${nextMessages}` : '(conversation end)'}

Generate a new message for ${targetMessage.sender} that fits naturally in this context.`;

  if (instruction) {
    userPrompt += `\n\nUser instruction: ${instruction}`;
  }

  return { systemPrompt, userPrompt };
};

/**
 * Build prompt for adding a new message
 * @param {Object} options - Options
 * @param {Object} options.conversation - Existing conversation
 * @param {string} options.sender - Sender name
 * @param {string} [options.instruction] - Optional instruction
 * @returns {{systemPrompt: string, userPrompt: string}}
 */
export const buildAddMessagePrompt = ({ conversation, sender, instruction }) => {
  const { messages } = conversation;

  const systemPrompt = `You are helping to add a new message to an existing conversation.
Return ONLY the new message text (no JSON, no quotes, just the text).
Match the tone and style of the existing conversation.`;

  const recentMessages = messages
    .slice(-5)
    .map(m => `${m.sender}: ${m.text}`)
    .join('\n');

  let userPrompt = `Recent conversation:
${recentMessages}

Add a new message from: ${sender}`;

  if (instruction) {
    userPrompt += `\n\nInstruction: ${instruction}`;
  } else {
    userPrompt += `\n\nGenerate a natural continuation of the conversation.`;
  }

  return { systemPrompt, userPrompt };
};

export default {
  buildSystemPrompt,
  buildUserPrompt,
  buildRegeneratePrompt,
  buildAddMessagePrompt,
  TONE_DESCRIPTIONS,
  PLATFORM_HINTS,
};
