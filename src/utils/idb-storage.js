/**
 * TalkStudio - IndexedDB Storage Module
 * High-capacity storage with automatic migration from localStorage.
 * Provides O(1) lookup performance and 50MB+ capacity.
 */

import { openDB } from 'idb';

const DB_NAME = 'talkstudio';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const LEGACY_STORAGE_KEY = 'talkstudio_projects';

/**
 * Database instance (singleton)
 */
let dbInstance = null;

/**
 * Initialize and get database connection
 */
export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create projects store with id as keyPath
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        // Create indexes for common queries
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('title', 'title');
      }
    },
  });

  // Migrate from localStorage on first open
  await migrateFromLocalStorage();

  return dbInstance;
};

/**
 * Migrate existing projects from localStorage to IndexedDB
 */
const migrateFromLocalStorage = async () => {
  try {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyData) return;

    const projects = JSON.parse(legacyData);
    if (!Array.isArray(projects) || projects.length === 0) return;

    const db = await getDB();

    // Check if migration already done
    const existingCount = await db.count(PROJECTS_STORE);
    if (existingCount > 0) {
      console.log('[IDB] Migration skipped: projects already exist');
      return;
    }

    // Migrate all projects
    const tx = db.transaction(PROJECTS_STORE, 'readwrite');
    const store = tx.objectStore(PROJECTS_STORE);

    for (const project of projects) {
      if (project && project.id) {
        await store.put(project);
      }
    }

    await tx.done;

    // Mark migration complete (keep localStorage as backup for 30 days)
    localStorage.setItem(`${LEGACY_STORAGE_KEY}_migrated`, new Date().toISOString());

    console.log(`[IDB] Migrated ${projects.length} projects from localStorage`);
  } catch (error) {
    console.error('[IDB] Migration failed:', error);
  }
};

/**
 * Generate unique project ID
 */
export const generateProjectId = () => {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Load all projects (sorted by updatedAt desc)
 */
export const loadProjectsAsync = async () => {
  try {
    const db = await getDB();
    const projects = await db.getAll(PROJECTS_STORE);

    // Sort by updatedAt descending
    return projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('[IDB] Failed to load projects:', error);
    return [];
  }
};

/**
 * Load single project by ID - O(1) lookup
 */
export const loadProjectAsync = async (projectId) => {
  try {
    const db = await getDB();
    const project = await db.get(PROJECTS_STORE, projectId);

    if (!project) {
      return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
    }

    return { success: true, project };
  } catch (error) {
    return { success: false, error: 'LOAD_ERROR', message: error.message };
  }
};

/**
 * Save project to IndexedDB
 */
export const saveProjectAsync = async (project) => {
  try {
    if (!project || !project.id) {
      return { success: false, error: 'INVALID_PROJECT', message: '유효하지 않은 프로젝트입니다.' };
    }

    const db = await getDB();

    // Check if project exists to preserve createdAt
    const existing = await db.get(PROJECTS_STORE, project.id);

    const projectToSave = {
      ...project,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || project.createdAt || new Date().toISOString(),
    };

    await db.put(PROJECTS_STORE, projectToSave);

    return { success: true, project: projectToSave };
  } catch (error) {
    return { success: false, error: 'SAVE_ERROR', message: error.message };
  }
};

/**
 * Delete project from IndexedDB
 */
export const deleteProjectAsync = async (projectId) => {
  try {
    const db = await getDB();

    // Check if exists
    const existing = await db.get(PROJECTS_STORE, projectId);
    if (!existing) {
      return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
    }

    await db.delete(PROJECTS_STORE, projectId);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'DELETE_ERROR', message: error.message };
  }
};

/**
 * Create new project template
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
 * Validate project data
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
 * Get storage usage statistics
 */
export const getStorageUsageAsync = async () => {
  try {
    const db = await getDB();
    const count = await db.count(PROJECTS_STORE);

    // Estimate storage usage
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
      const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(2);

      return {
        projectCount: count,
        usedMB,
        quotaMB,
        percentage: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(1) : 0,
        backend: 'IndexedDB',
      };
    }

    return {
      projectCount: count,
      usedMB: 'unknown',
      quotaMB: 'unknown',
      percentage: 0,
      backend: 'IndexedDB',
    };
  } catch (error) {
    return {
      projectCount: 0,
      usedMB: '0',
      quotaMB: 'unknown',
      percentage: 0,
      backend: 'IndexedDB',
      error: error.message,
    };
  }
};

/**
 * Search projects by title
 */
export const searchProjectsAsync = async (query) => {
  try {
    const db = await getDB();
    const allProjects = await db.getAll(PROJECTS_STORE);

    const searchLower = query.toLowerCase();
    return allProjects.filter((p) =>
      p.title?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('[IDB] Search failed:', error);
    return [];
  }
};

/**
 * Repair corrupted project data
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

/**
 * Export all projects as JSON (for backup)
 */
export const exportProjectsAsync = async () => {
  try {
    const projects = await loadProjectsAsync();
    return JSON.stringify(projects, null, 2);
  } catch (error) {
    console.error('[IDB] Export failed:', error);
    return null;
  }
};

/**
 * Import projects from JSON backup
 */
export const importProjectsAsync = async (jsonString, options = { overwrite: false }) => {
  try {
    const projects = JSON.parse(jsonString);
    if (!Array.isArray(projects)) {
      throw new Error('Invalid backup format');
    }

    const db = await getDB();
    const tx = db.transaction(PROJECTS_STORE, 'readwrite');
    const store = tx.objectStore(PROJECTS_STORE);

    let imported = 0;
    let skipped = 0;

    for (const project of projects) {
      if (!project || !project.id) continue;

      const existing = await store.get(project.id);
      if (existing && !options.overwrite) {
        skipped++;
        continue;
      }

      await store.put(project);
      imported++;
    }

    await tx.done;

    return { success: true, imported, skipped };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Clear all localStorage legacy data after successful migration
 */
export const clearLegacyStorage = () => {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(`${LEGACY_STORAGE_KEY}_migrated`);
    console.log('[IDB] Legacy localStorage data cleared');
    return true;
  } catch {
    return false;
  }
};

// Backward-compatible sync wrappers (deprecated, use async versions)
// These maintain compatibility with existing code during migration

let projectsCache = null;

export const loadProjects = () => {
  if (projectsCache) return projectsCache;

  // Fall back to localStorage for sync calls
  try {
    const data = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!data) return [];
    const projects = JSON.parse(data);
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
};

export const loadProject = (projectId) => {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
  }

  return { success: true, project };
};

export const saveProject = (project) => {
  // Use sync localStorage for backward compatibility
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

    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(projects));

    // Also save to IndexedDB asynchronously
    saveProjectAsync(projectToSave).catch(console.error);

    return { success: true, project: projectToSave };
  } catch (error) {
    return { success: false, error: 'SAVE_ERROR', message: error.message };
  }
};

export const deleteProject = (projectId) => {
  try {
    const projects = loadProjects();
    const filtered = projects.filter((p) => p.id !== projectId);

    if (filtered.length === projects.length) {
      return { success: false, error: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다.' };
    }

    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(filtered));

    // Also delete from IndexedDB asynchronously
    deleteProjectAsync(projectId).catch(console.error);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'DELETE_ERROR', message: error.message };
  }
};

export const getStorageUsage = () => {
  try {
    const data = localStorage.getItem(LEGACY_STORAGE_KEY) || '';
    const usedBytes = new Blob([data]).size;
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
    const maxMB = 5;
    const percentage = (usedBytes / (maxMB * 1024 * 1024)) * 100;

    return {
      usedBytes,
      usedMB,
      maxMB,
      percentage: Math.min(percentage, 100),
    };
  } catch {
    return { usedBytes: 0, usedMB: '0', maxMB: 5, percentage: 0 };
  }
};

export default {
  // Async (recommended)
  loadProjectsAsync,
  loadProjectAsync,
  saveProjectAsync,
  deleteProjectAsync,
  getStorageUsageAsync,
  searchProjectsAsync,
  exportProjectsAsync,
  importProjectsAsync,
  clearLegacyStorage,

  // Sync (backward compatible)
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
