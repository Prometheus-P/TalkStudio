/**
 * TalkStudio - Storage Utilities
 * localStorage를 사용한 프로젝트 저장/불러오기
 */

const STORAGE_KEY = 'talkstudio_projects';
const MAX_STORAGE_MB = 5; // localStorage 최대 용량 (브라우저마다 다름)

/**
 * 프로젝트 ID 생성
 */
export const generateProjectId = () => {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 모든 프로젝트 목록 불러오기
 */
export const loadProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const projects = JSON.parse(data);
    return Array.isArray(projects) ? projects : [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

/**
 * 특정 프로젝트 불러오기
 */
export const loadProject = (projectId) => {
  try {
    const projects = loadProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
    }

    return { success: true, project };
  } catch (error) {
    return { success: false, error: 'LOAD_ERROR', message: error.message };
  }
};

/**
 * 프로젝트 저장
 */
export const saveProject = (project) => {
  try {
    if (!project || !project.id) {
      return { success: false, error: 'INVALID_PROJECT', message: '유효하지 않은 프로젝트입니다.' };
    }

    const projects = loadProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    const projectToSave = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = projectToSave;
    } else {
      projectToSave.createdAt = new Date().toISOString();
      projects.unshift(projectToSave);
    }

    // 저장 시도
    const dataStr = JSON.stringify(projects);

    // 용량 체크
    const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
    if (sizeInMB > MAX_STORAGE_MB) {
      return {
        success: false,
        error: 'STORAGE_FULL',
        message: '저장 공간이 부족합니다. 일부 프로젝트를 삭제해 주세요.'
      };
    }

    localStorage.setItem(STORAGE_KEY, dataStr);

    return { success: true, project: projectToSave };
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'STORAGE_FULL',
        message: '저장 공간이 부족합니다.'
      };
    }
    return { success: false, error: 'SAVE_ERROR', message: error.message };
  }
};

/**
 * 프로젝트 삭제
 */
export const deleteProject = (projectId) => {
  try {
    const projects = loadProjects();
    const filtered = projects.filter((p) => p.id !== projectId);

    if (filtered.length === projects.length) {
      return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    return { success: false, error: 'DELETE_ERROR', message: error.message };
  }
};

/**
 * 새 프로젝트 생성
 */
export const createNewProject = (title = '새 프로젝트') => {
  return {
    id: generateProjectId(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    conversation: {
      platformSkin: 'kakao',
      title: '',
      messages: [],
    },
    profiles: {
      me: { name: '나', avatar: null },
      other: { name: '상대방', avatar: null },
    },
    statusBar: {
      time: '9:41',
      carrier: 'TalkStudio',
      battery: 100,
      isWifi: true,
    },
  };
};

/**
 * 프로젝트 유효성 검사
 */
export const validateProject = (project) => {
  if (!project || typeof project !== 'object') {
    return { valid: false, errors: ['프로젝트 데이터가 없습니다.'] };
  }

  const errors = [];

  if (!project.id) errors.push('프로젝트 ID가 없습니다.');
  if (!project.conversation) errors.push('대화 데이터가 없습니다.');
  if (!project.profiles) errors.push('프로필 데이터가 없습니다.');

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 스토리지 사용량 확인
 */
export const getStorageUsage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const usedBytes = new Blob([data]).size;
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
    const percentage = (usedBytes / (MAX_STORAGE_MB * 1024 * 1024)) * 100;

    return {
      usedBytes,
      usedMB,
      maxMB: MAX_STORAGE_MB,
      percentage: Math.min(percentage, 100),
    };
  } catch {
    return { usedBytes: 0, usedMB: '0', maxMB: MAX_STORAGE_MB, percentage: 0 };
  }
};

/**
 * 손상된 프로젝트 복구 시도
 */
export const repairProject = (project) => {
  const defaults = createNewProject();

  return {
    ...defaults,
    ...project,
    id: project.id || defaults.id,
    conversation: {
      ...defaults.conversation,
      ...(project.conversation || {}),
    },
    profiles: {
      ...defaults.profiles,
      ...(project.profiles || {}),
    },
    statusBar: {
      ...defaults.statusBar,
      ...(project.statusBar || {}),
    },
  };
};

export default {
  generateProjectId,
  loadProjects,
  loadProject,
  saveProject,
  deleteProject,
  createNewProject,
  validateProject,
  getStorageUsage,
  repairProject,
};
