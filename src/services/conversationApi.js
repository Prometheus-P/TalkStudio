/**
 * Conversation API Client - 대화 생성 API 클라이언트
 * Backend API와 통신하는 프론트엔드 서비스
 */

import { getErrorMessage } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const REQUEST_TIMEOUT = 120000; // 120초 타임아웃 (배치 처리용)

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

// ============ Batch Generation API ============

/**
 * Download batch Excel template
 */
export const downloadBatchTemplate = async () => {
  const response = await fetch(`${API_BASE_URL}/generate/batch-template`);

  if (!response.ok) {
    throw new ApiError('DOWNLOAD_ERROR', '템플릿 다운로드에 실패했습니다.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'talkstudio_batch_template.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Process batch generation (synchronous)
 * @param {File} file - Excel file with prompts
 * @returns {Promise<Object>} BatchResponse with results
 */
export const processBatch = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/generate/batch`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail?.message || data.message || '배치 처리에 실패했습니다.';
      throw new ApiError(data.detail?.error || 'BATCH_ERROR', errorMessage, data.detail);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('TIMEOUT_ERROR', '배치 처리 시간이 초과되었습니다. 프롬프트 수를 줄여주세요.');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('BATCH_ERROR', error.message || '배치 처리 중 오류가 발생했습니다.');
  }
};

/**
 * Generate single conversation (synchronous)
 * @param {Object} params - Generation parameters
 */
export const generateSingleConversation = async (params) => {
  const response = await apiRequest('/generate/conversation', {
    method: 'POST',
    body: JSON.stringify({
      prompt: params.scenario || params.prompt,
      message_count: params.messageCount || 10,
      style: params.tone || 'casual',
      language: params.language || 'ko',
      provider: params.provider || 'upstage',
      theme: params.platform || 'kakao',
    }),
  });
  return response;
};

/**
 * Generate demo conversation (no API key required)
 */
export const generateDemoConversation = async () => {
  const response = await apiRequest('/generate/demo', {
    method: 'POST',
  });
  return response;
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
