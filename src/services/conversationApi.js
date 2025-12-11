/**
 * Conversation API Client - 대화 생성 API 클라이언트
 * Backend API와 통신하는 프론트엔드 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Make API request with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
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

// ============ Bulk Generation API ============

/**
 * Download Excel template
 */
export const downloadBulkTemplate = async () => {
  const response = await fetch(`${API_BASE_URL}/bulk/template`);

  if (!response.ok) {
    throw new Error('Failed to download template');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'talkstudio_bulk_template.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Start bulk generation job
 * @param {File} file - Excel file
 */
export const startBulkGeneration = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/bulk/start`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to start bulk generation');
  }

  return data.data.job;
};

/**
 * Get bulk job status
 * @param {string} jobId - Job ID
 */
export const getBulkJobStatus = async (jobId) => {
  const response = await apiRequest(`/bulk/${jobId}/status`);
  return response.data.job;
};

/**
 * Download bulk job results
 * @param {string} jobId - Job ID
 */
export const downloadBulkResults = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/bulk/${jobId}/download`);

  if (!response.ok) {
    throw new Error('Failed to download results');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `talkstudio_bulk_${jobId}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

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
  // Bulk
  downloadBulkTemplate,
  startBulkGeneration,
  getBulkJobStatus,
  downloadBulkResults,
};
