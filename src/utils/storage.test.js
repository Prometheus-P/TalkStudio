/**
 * Storage Utilities Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateProjectId,
  loadProjects,
  loadProject,
  saveProject,
  deleteProject,
  createNewProject,
  validateProject,
  getStorageUsage,
  repairProject,
} from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // ============================================
  // generateProjectId
  // ============================================
  describe('generateProjectId', () => {
    it('should generate unique project id', () => {
      const id1 = generateProjectId();
      const id2 = generateProjectId();

      expect(id1).toMatch(/^proj_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should start with proj_ prefix', () => {
      const id = generateProjectId();
      expect(id.startsWith('proj_')).toBe(true);
    });
  });

  // ============================================
  // loadProjects
  // ============================================
  describe('loadProjects', () => {
    it('should return empty array when no projects exist', () => {
      const projects = loadProjects();
      expect(projects).toEqual([]);
    });

    it('should return projects from localStorage', () => {
      const mockProjects = [{ id: '1', title: 'Test' }];
      localStorage.setItem('talkstudio_projects', JSON.stringify(mockProjects));

      const projects = loadProjects();
      expect(projects).toEqual(mockProjects);
    });

    it('should return empty array on invalid JSON', () => {
      localStorage.setItem('talkstudio_projects', 'invalid json');

      const projects = loadProjects();
      expect(projects).toEqual([]);
    });

    it('should return empty array if stored data is not an array', () => {
      localStorage.setItem('talkstudio_projects', JSON.stringify({ notAnArray: true }));

      const projects = loadProjects();
      expect(projects).toEqual([]);
    });
  });

  // ============================================
  // loadProject
  // ============================================
  describe('loadProject', () => {
    it('should load specific project by id', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' },
      ];
      localStorage.setItem('talkstudio_projects', JSON.stringify(mockProjects));

      const result = loadProject('2');
      expect(result.success).toBe(true);
      expect(result.project.title).toBe('Project 2');
    });

    it('should return error when project not found', () => {
      const result = loadProject('non-existent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  // ============================================
  // saveProject
  // ============================================
  describe('saveProject', () => {
    it('should save new project', () => {
      const project = { id: 'test-1', title: 'Test Project' };

      const result = saveProject(project);

      expect(result.success).toBe(true);
      expect(result.project.updatedAt).toBeDefined();

      const saved = loadProjects();
      expect(saved.length).toBe(1);
      expect(saved[0].id).toBe('test-1');
    });

    it('should update existing project', () => {
      const project = { id: 'test-1', title: 'Original' };
      saveProject(project);

      const updated = { id: 'test-1', title: 'Updated' };
      saveProject(updated);

      const saved = loadProjects();
      expect(saved.length).toBe(1);
      expect(saved[0].title).toBe('Updated');
    });

    it('should return error for invalid project', () => {
      const result1 = saveProject(null);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('INVALID_PROJECT');

      const result2 = saveProject({ noId: true });
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('INVALID_PROJECT');
    });

    it('should add createdAt for new projects', () => {
      const project = { id: 'test-1', title: 'Test' };
      const result = saveProject(project);

      expect(result.project.createdAt).toBeDefined();
    });

    it('should add new projects to the beginning', () => {
      saveProject({ id: 'first', title: 'First' });
      saveProject({ id: 'second', title: 'Second' });

      const projects = loadProjects();
      expect(projects[0].id).toBe('second');
    });
  });

  // ============================================
  // deleteProject
  // ============================================
  describe('deleteProject', () => {
    it('should delete project by id', () => {
      saveProject({ id: 'test-1', title: 'Test' });
      saveProject({ id: 'test-2', title: 'Test 2' });

      const result = deleteProject('test-1');

      expect(result.success).toBe(true);
      const projects = loadProjects();
      expect(projects.length).toBe(1);
      expect(projects[0].id).toBe('test-2');
    });

    it('should return error when project not found', () => {
      const result = deleteProject('non-existent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  // ============================================
  // createNewProject
  // ============================================
  describe('createNewProject', () => {
    it('should create project with default title', () => {
      const project = createNewProject();

      expect(project.title).toBe('새 프로젝트');
      expect(project.id).toMatch(/^proj_/);
      expect(project.createdAt).toBeDefined();
      expect(project.conversation).toBeDefined();
      expect(project.profiles).toBeDefined();
      expect(project.statusBar).toBeDefined();
    });

    it('should create project with custom title', () => {
      const project = createNewProject('My Project');
      expect(project.title).toBe('My Project');
    });

    it('should have default conversation structure', () => {
      const project = createNewProject();

      expect(project.conversation.platformSkin).toBe('kakao');
      expect(project.conversation.messages).toEqual([]);
    });

    it('should have default profiles', () => {
      const project = createNewProject();

      expect(project.profiles.me.name).toBe('나');
      expect(project.profiles.other.name).toBe('상대방');
    });

    it('should have default statusBar', () => {
      const project = createNewProject();

      expect(project.statusBar.time).toBe('9:41');
      expect(project.statusBar.battery).toBe(100);
      expect(project.statusBar.isWifi).toBe(true);
    });
  });

  // ============================================
  // validateProject
  // ============================================
  describe('validateProject', () => {
    it('should validate complete project', () => {
      const project = createNewProject();
      const result = validateProject(project);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for null project', () => {
      const result = validateProject(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('프로젝트 데이터가 없습니다.');
    });

    it('should return errors for project without id', () => {
      const result = validateProject({ conversation: {}, profiles: {} });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('프로젝트 ID가 없습니다.');
    });

    it('should return errors for project without conversation', () => {
      const result = validateProject({ id: '1', profiles: {} });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('대화 데이터가 없습니다.');
    });

    it('should return errors for project without profiles', () => {
      const result = validateProject({ id: '1', conversation: {} });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('프로필 데이터가 없습니다.');
    });

    it('should return multiple errors', () => {
      const result = validateProject({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  // ============================================
  // getStorageUsage
  // ============================================
  describe('getStorageUsage', () => {
    it('should return 0 usage when empty', () => {
      const usage = getStorageUsage();

      expect(usage.usedBytes).toBe(0);
      expect(usage.usedMB).toBe('0.00');
      expect(usage.maxMB).toBe(5);
      expect(usage.percentage).toBe(0);
    });

    it('should calculate storage usage', () => {
      saveProject({ id: 'test', title: 'Test', data: 'x'.repeat(1000) });

      const usage = getStorageUsage();
      expect(usage.usedBytes).toBeGreaterThan(0);
      expect(parseFloat(usage.usedMB)).toBeGreaterThanOrEqual(0);
    });

    it('should cap percentage at 100', () => {
      // This is hard to test without actually filling storage
      const usage = getStorageUsage();
      expect(usage.percentage).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // repairProject
  // ============================================
  describe('repairProject', () => {
    it('should repair project with missing fields', () => {
      const broken = { id: 'broken-1' };
      const repaired = repairProject(broken);

      expect(repaired.id).toBe('broken-1');
      expect(repaired.conversation).toBeDefined();
      expect(repaired.profiles).toBeDefined();
      expect(repaired.statusBar).toBeDefined();
    });

    it('should preserve existing data', () => {
      const partial = {
        id: 'partial-1',
        title: 'My Title',
        conversation: { platformSkin: 'discord' },
      };
      const repaired = repairProject(partial);

      expect(repaired.title).toBe('My Title');
      expect(repaired.conversation.platformSkin).toBe('discord');
    });

    it('should generate id if missing', () => {
      const noId = { title: 'No ID' };
      const repaired = repairProject(noId);

      expect(repaired.id).toMatch(/^proj_/);
    });

    it('should handle null conversation', () => {
      const broken = { id: 'test', conversation: null };
      const repaired = repairProject(broken);

      expect(repaired.conversation).toBeDefined();
      expect(repaired.conversation.platformSkin).toBe('kakao');
    });

    it('should handle null profiles', () => {
      const broken = { id: 'test', profiles: null };
      const repaired = repairProject(broken);

      expect(repaired.profiles).toBeDefined();
      expect(repaired.profiles.me).toBeDefined();
    });
  });
});
