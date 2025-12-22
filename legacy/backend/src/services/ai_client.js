/**
 * AI Client - Upstage/OpenAI 통합 클라이언트
 * Primary: Upstage Solar Pro (한국어 최적화)
 * Fallback: OpenAI GPT-4o-mini (안정성)
 */
import OpenAI from 'openai';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// AI Providers enum
export const AIProvider = {
  UPSTAGE: 'upstage',
  OPENAI: 'openai',
};

// Default settings from config or fallback values
const DEFAULT_TEMPERATURE = parseFloat(process.env.AI_DEFAULT_TEMPERATURE) || 0.7;
const DEFAULT_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS) || 2000;
const DEFAULT_TIMEOUT = parseInt(process.env.AI_TIMEOUT_MS) || 30000;

/**
 * Create Upstage client (OpenAI SDK compatible)
 */
const createUpstageClient = () => {
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    logger.warn('UPSTAGE_API_KEY not configured');
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.upstage.ai/v1/solar',
    timeout: DEFAULT_TIMEOUT,
  });
};

/**
 * Create OpenAI client (fallback)
 */
const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY not configured');
    return null;
  }

  return new OpenAI({
    apiKey,
    timeout: DEFAULT_TIMEOUT,
  });
};

// Lazy-initialized clients
let upstageClient = null;
let openaiClient = null;

/**
 * Get Upstage client (lazy initialization)
 */
const getUpstageClient = () => {
  if (!upstageClient) {
    upstageClient = createUpstageClient();
  }
  return upstageClient;
};

/**
 * Get OpenAI client (lazy initialization)
 */
const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
};

/**
 * Generate chat completion with automatic fallback
 * @param {Object} options - Generation options
 * @param {string} options.systemPrompt - System prompt
 * @param {string} options.userPrompt - User prompt
 * @param {number} [options.temperature] - Temperature (0.0-1.0)
 * @param {number} [options.maxTokens] - Max tokens
 * @param {boolean} [options.jsonMode] - Request JSON response
 * @returns {Promise<{content: string, provider: string, model: string, usage: Object}>}
 */
export const generateCompletion = async ({
  systemPrompt,
  userPrompt,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
  jsonMode = false,
}) => {
  const providers = [
    { name: AIProvider.UPSTAGE, client: getUpstageClient(), model: 'solar-pro' },
    { name: AIProvider.OPENAI, client: getOpenAIClient(), model: 'gpt-4o-mini' },
  ];

  let lastError = null;

  for (const { name, client, model } of providers) {
    if (!client) {
      logger.debug(`Skipping ${name}: client not configured`);
      continue;
    }

    try {
      logger.info(`Attempting generation with ${name} (${model})`);

      const requestParams = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      };

      // Add JSON mode if supported and requested
      if (jsonMode && name === AIProvider.OPENAI) {
        requestParams.response_format = { type: 'json_object' };
      }

      const response = await client.chat.completions.create(requestParams);

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || {};

      logger.info(`Generation successful with ${name}`, {
        model,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
      });

      return {
        content,
        provider: name,
        model,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
      };
    } catch (error) {
      lastError = error;
      logger.error(`Generation failed with ${name}`, {
        error: error.message,
        code: error.code,
        status: error.status,
      });

      // Continue to next provider (fallback)
      continue;
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

/**
 * Parse JSON response from AI, handling potential markdown code blocks
 * @param {string} content - AI response content
 * @returns {Object} - Parsed JSON object
 */
export const parseJSONResponse = (content) => {
  let jsonStr = content.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }

  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  jsonStr = jsonStr.trim();

  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error('Failed to parse AI JSON response', { content: content.substring(0, 200) });
    throw new Error('Invalid JSON response from AI');
  }
};

/**
 * Check if AI providers are available
 * @returns {{upstage: boolean, openai: boolean}}
 */
export const checkAvailability = () => ({
  upstage: !!process.env.UPSTAGE_API_KEY,
  openai: !!process.env.OPENAI_API_KEY,
});

export default {
  generateCompletion,
  parseJSONResponse,
  checkAvailability,
  AIProvider,
};
