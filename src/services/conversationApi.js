/**
 * Conversation API Client - 대화 생성 API 클라이언트
 *
 * 변경사항:
 * - 백엔드 API → Vercel Edge Function (/api/generate)
 * - Excel 처리는 excelParser.js로 이전됨
 */

import { getErrorMessage } from '../utils/errorHandler';

// Vercel Edge Function 엔드포인트 (개발 시에는 Vite proxy 사용)
const API_BASE_URL = '/api';
const REQUEST_TIMEOUT = 60000; // 60초 타임아웃

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(code, message, details = null, retryAfter = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

/**
 * Make API request with error handling and timeout
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    clearTimeout(timeoutId);

    // JSON 파싱 시도
    let data;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError('UNKNOWN_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }
      return { status: 'success' };
    }

    if (!response.ok) {
      // API 에러 응답 파싱
      const errorCode = data.code || 'UNKNOWN_ERROR';
      const errorMessage = data.message || getErrorMessage(errorCode);
      const retryAfter = response.headers.get('Retry-After');

      throw new ApiError(errorCode, errorMessage, data.details, retryAfter ? parseInt(retryAfter) : null);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError (타임아웃)
    if (error.name === 'AbortError') {
      throw new ApiError('TIMEOUT_ERROR', '요청 시간이 초과되었습니다. 다시 시도해 주세요.');
    }

    // TypeError (네트워크 에러)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new ApiError('NETWORK_ERROR', '네트워크 연결을 확인해 주세요.');
    }

    // ApiError는 그대로 전달
    if (error instanceof ApiError) {
      throw error;
    }

    // 기타 에러
    throw new ApiError('UNKNOWN_ERROR', error.message || '알 수 없는 오류가 발생했습니다.');
  }
};

// ============ Conversation API ============

/**
 * Generate a new conversation
 * @param {Object} params - Generation parameters
 * @param {string} params.scenario - Scenario description
 * @param {number} [params.participants=2] - Number of participants
 * @param {number} [params.messageCount=10] - Target message count
 * @param {string} [params.tone='casual'] - Tone type
 * @param {string} [params.platform='kakaotalk'] - Platform type
 * @param {string[]} [params.participantNames] - Custom participant names
 * @param {string} [params.templateId] - Template ID
 */
export const generateConversation = async (params) => {
  const response = await apiRequest('/conversations/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.data.conversation;
};

/**
 * Get conversation by ID
 * @param {string} id - Conversation ID
 */
export const getConversation = async (id) => {
  const response = await apiRequest(`/conversations/${id}`);
  return response.data.conversation;
};

/**
 * Delete conversation
 * @param {string} id - Conversation ID
 */
export const deleteConversation = async (id) => {
  await apiRequest(`/conversations/${id}`, { method: 'DELETE' });
  return true;
};

/**
 * Update conversation
 * @param {string} id - Conversation ID
 * @param {Object} updates - Fields to update
 */
export const updateConversation = async (id, updates) => {
  const response = await apiRequest(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data.conversation;
};

/**
 * Regenerate a specific message
 * @param {string} id - Conversation ID
 * @param {number} messageIndex - Message index to regenerate
 * @param {string} [instruction] - Optional instruction
 */
export const regenerateMessage = async (id, messageIndex, instruction) => {
  const response = await apiRequest(`/conversations/${id}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ messageIndex, instruction }),
  });
  return response.data.conversation;
};

/**
 * Add a new message to conversation
 * @param {string} id - Conversation ID
 * @param {string} sender - Sender name
 * @param {string} [text] - Optional message text
 * @param {string} [instruction] - Optional AI instruction
 */
export const addMessage = async (id, sender, text, instruction) => {
  const response = await apiRequest(`/conversations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ sender, text, instruction }),
  });
  return response.data.conversation;
};

// ============ Template API ============

/**
 * Get all templates
 * @param {string} [category] - Filter by category
 */
export const getTemplates = async (category) => {
  const params = category ? `?category=${category}` : '';
  const response = await apiRequest(`/templates${params}`);
  return response.data.templates;
};

/**
 * Create a custom template
 * @param {Object} template - Template data
 */
export const createTemplate = async (template) => {
  const response = await apiRequest('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
  return response.data.template;
};

/**
 * Delete a template
 * @param {string} id - Template ID
 */
export const deleteTemplate = async (id) => {
  await apiRequest(`/templates/${id}`, { method: 'DELETE' });
  return true;
};

// ============ Batch Generation (Deprecated - 프론트엔드 excelParser.js 사용) ============

/**
 * @deprecated excelParser.js의 downloadTemplate() 사용
 */
export const downloadBatchTemplate = async () => {
  console.warn('downloadBatchTemplate is deprecated. Use excelParser.downloadTemplate() instead.');
  const { downloadTemplate } = await import('./excelParser');
  return downloadTemplate();
};

/**
 * @deprecated excelParser.js의 parseExcel() 사용
 */
export const processBatch = async (file) => {
  console.warn('processBatch is deprecated. Use excelParser.parseExcel() instead.');
  const { parseExcel } = await import('./excelParser');
  return parseExcel(file);
};

/**
 * Generate single conversation (Vercel Edge Function 사용)
 * @param {Object} params - Generation parameters
 */
export const generateSingleConversation = async (params) => {
  const response = await apiRequest('/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: params.scenario || params.prompt,
      messageCount: params.messageCount || 10,
      style: params.tone || 'casual',
      language: params.language || 'ko',
    }),
  });
  return response;
};

/**
 * Generate demo conversation (하드코딩된 예시 반환)
 * API 키 없이 사용 가능
 */
export const generateDemoConversation = async () => {
  // 데모용 하드코딩된 대화 반환
  return {
    success: true,
    data: {
      messages: [
        { id: 'demo-1', role: 'other', authorId: 'other', text: '안녕! 요즘 어떻게 지내?', datetime: '오후 2:30' },
        { id: 'demo-2', role: 'me', authorId: 'me', text: '나 요즘 TalkStudio 써보고 있는데 대박이야 ㅋㅋ', datetime: '오후 2:31' },
        { id: 'demo-3', role: 'other', authorId: 'other', text: '오 그거 카톡 스크린샷 만드는 거?', datetime: '오후 2:31' },
        { id: 'demo-4', role: 'me', authorId: 'me', text: '응응 진짜 카톡이랑 똑같아서 놀람', datetime: '오후 2:32' },
        { id: 'demo-5', role: 'other', authorId: 'other', text: '나도 한번 써봐야겠다! 링크 좀 보내줘', datetime: '오후 2:32' },
      ],
      metadata: { model: 'demo', generatedAt: new Date().toISOString() },
    },
  };
};

// Legacy aliases for backward compatibility
export const downloadBulkTemplate = downloadBatchTemplate;
export const startBulkGeneration = processBatch;

export default {
  // Conversation
  generateConversation,
  getConversation,
  deleteConversation,
  updateConversation,
  regenerateMessage,
  addMessage,
  // Template
  getTemplates,
  createTemplate,
  deleteTemplate,
  // Batch
  downloadBatchTemplate,
  processBatch,
  generateSingleConversation,
  generateDemoConversation,
  // Legacy aliases
  downloadBulkTemplate,
  startBulkGeneration,
};
