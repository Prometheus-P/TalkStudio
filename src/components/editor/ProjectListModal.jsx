/**
 * ProjectListModal - 프로젝트 목록 모달
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, FolderOpen, Clock, HardDrive } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import { getStorageUsage } from '../../utils/storage';

const ProjectListModal = ({ isOpen, onClose }) => {
  const projects = useChatStore((s) => s.projects);
  const currentProjectId = useChatStore((s) => s.currentProjectId);
  const loadProjects = useChatStore((s) => s.loadProjects);
  const loadProject = useChatStore((s) => s.loadProject);
  const createNewProject = useChatStore((s) => s.createNewProject);
  const deleteProject = useChatStore((s) => s.deleteProject);

  const [confirmDelete, setConfirmDelete] = useState(null);

  // Compute storage usage when modal opens or projects change
  const storageUsage = useMemo(() => {
    if (!isOpen) return { percentage: 0, usedMB: '0' };
    return getStorageUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projects]);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, loadProjects]);

  if (!isOpen) return null;

  const handleLoadProject = (projectId) => {
    loadProject(projectId);
    onClose();
  };

  const handleNewProject = () => {
    createNewProject();
    onClose();
  };

  const handleDelete = (projectId) => {
    if (confirmDelete === projectId) {
      deleteProject(projectId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(projectId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80vh] flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F4FF 100%)',
          borderRadius: '28px',
          boxShadow: '0px 16px 0px rgba(168, 85, 247, 0.2), 0px 32px 60px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderRadius: '28px 28px 0 0',
            background: 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <FolderOpen size={20} style={{ color: '#FFFFFF' }} />
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              프로젝트
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} style={{ color: '#FFFFFF' }} />
          </button>
        </div>

        {/* 새 프로젝트 버튼 */}
        <div className="px-4 py-3">
          <button
            onClick={handleNewProject}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              background: 'linear-gradient(145deg, #4ADE80 0%, #22C55E 100%)',
              color: '#FFFFFF',
              boxShadow: '0px 4px 0px rgba(34, 197, 94, 0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            새 프로젝트 만들기
          </button>
        </div>

        {/* 프로젝트 목록 */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-2"
          style={{ maxHeight: '400px' }}
        >
          {projects.length === 0 ? (
            <div
              className="text-center py-10"
              style={{ color: '#9CA3AF', fontSize: '14px' }}
            >
              저장된 프로젝트가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background:
                      project.id === currentProjectId
                        ? 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)'
                        : 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
                    boxShadow:
                      project.id === currentProjectId
                        ? '0px 4px 0px rgba(59, 130, 246, 0.2)'
                        : '0px 3px 0px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLoadProject(project.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        {project.title || '제목 없음'}
                      </span>
                      <div
                        className="flex items-center gap-2"
                        style={{ color: '#9CA3AF', fontSize: '11px' }}
                      >
                        <Clock size={12} />
                        <span>{formatDate(project.updatedAt)}</span>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: '#F3F4F6',
                            fontSize: '10px',
                            fontWeight: 500,
                          }}
                        >
                          {project.conversation?.platformSkin || 'kakao'}
                        </span>
                      </div>
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        background:
                          confirmDelete === project.id
                            ? 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)'
                            : 'linear-gradient(145deg, #FEE2E2 0%, #FECACA 100%)',
                        boxShadow:
                          confirmDelete === project.id
                            ? '0px 2px 0px rgba(220, 38, 38, 0.4)'
                            : '0px 2px 0px rgba(239, 68, 68, 0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        color: confirmDelete === project.id ? '#FFFFFF' : '#EF4444',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                      className="group-hover:opacity-100"
                      title={
                        confirmDelete === project.id
                          ? '다시 클릭하여 삭제 확인'
                          : '삭제'
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* 현재 프로젝트 표시 */}
                  {project.id === currentProjectId && (
                    <span
                      className="inline-block mt-2 px-2 py-1 rounded-full"
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)',
                        color: '#FFFFFF',
                      }}
                    >
                      현재 편집 중
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 스토리지 사용량 */}
        <div
          className="px-6 py-4"
          style={{
            borderTop: '2px solid rgba(168, 85, 247, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '12px' }}>
              <HardDrive size={14} />
              <span>저장 공간</span>
            </div>
            <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: 500 }}>
              {storageUsage.usedMB} MB 사용
            </span>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '3px',
              background: '#E5E7EB',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(storageUsage.percentage, 100)}%`,
                borderRadius: '3px',
                background:
                  storageUsage.percentage > 80
                    ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                    : 'linear-gradient(90deg, #A855F7, #8B5CF6)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectListModal;
