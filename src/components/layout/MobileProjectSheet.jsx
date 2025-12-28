/**
 * MobileProjectSheet - 모바일용 프로젝트 관리 바텀시트
 * 프로젝트 목록 표시, 생성, 삭제, 전환
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Check, MessageSquare } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import useChatStore from '../../store/useChatStore';

// 프로젝트 카드 컴포넌트
const ProjectCard = ({
  project,
  isActive,
  onSelect,
  onDelete,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (showConfirm) {
      onDelete(project.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // 3초 후 확인 상태 초기화
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <button
      onClick={() => onSelect(project.id)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
      style={{
        background: isActive
          ? 'linear-gradient(145deg, #EDE9FE 0%, #DDD6FE 100%)'
          : 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
        boxShadow: isActive
          ? '0px 4px 0px rgba(139, 92, 246, 0.3)'
          : '0px 2px 0px rgba(0, 0, 0, 0.05)',
        border: isActive ? '2px solid #A855F7' : '2px solid transparent',
      }}
    >
      {/* 아이콘 */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0"
        style={{
          background: isActive
            ? 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)'
            : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
        }}
      >
        <FolderOpen
          size={20}
          style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
        />
      </div>

      {/* 프로젝트 정보 */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold truncate"
            style={{ color: '#374151', fontSize: '15px' }}
          >
            {project.title}
          </span>
          {isActive && (
            <Check size={16} style={{ color: '#A855F7' }} />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <MessageSquare size={12} style={{ color: '#9CA3AF' }} />
          <span className="text-xs text-gray-400">
            {project.messageCount || 0}개 메시지
          </span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>

      {/* 삭제 버튼 */}
      {!isActive && (
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl transition-all duration-200"
          style={{
            background: showConfirm
              ? 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)'
              : 'transparent',
          }}
        >
          <Trash2
            size={18}
            style={{ color: showConfirm ? '#FFFFFF' : '#9CA3AF' }}
          />
        </button>
      )}
    </button>
  );
};

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

const MobileProjectSheet = ({ isOpen, onClose }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  const projects = useChatStore((s) => s.projects);
  const currentProjectId = useChatStore((s) => s.currentProjectId);
  const loadProjects = useChatStore((s) => s.loadProjects);
  const loadProject = useChatStore((s) => s.loadProject);
  const deleteProject = useChatStore((s) => s.deleteProject);
  const createNewProject = useChatStore((s) => s.createNewProject);

  // 프로젝트 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, loadProjects]);

  // 프로젝트 선택
  const handleSelect = (projectId) => {
    if (projectId !== currentProjectId) {
      loadProject(projectId);
    }
    onClose();
  };

  // 프로젝트 삭제
  const handleDelete = (projectId) => {
    deleteProject(projectId);
  };

  // 새 프로젝트 생성
  const handleCreate = () => {
    if (showNewInput) {
      const title = newProjectName.trim() || '새 프로젝트';
      createNewProject(title);
      setNewProjectName('');
      setShowNewInput(false);
    } else {
      setShowNewInput(true);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="프로젝트 관리"
    >
      <div className="p-4 space-y-3">
        {/* 새 프로젝트 생성 */}
        {showNewInput ? (
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '2px solid #22C55E',
            }}
          >
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="프로젝트 이름"
              autoFocus
              className="flex-1 bg-transparent outline-none font-medium"
              style={{ color: '#374151', fontSize: '15px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowNewInput(false);
                  setNewProjectName('');
                }
              }}
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl font-semibold text-white"
              style={{
                background: 'linear-gradient(145deg, #22C55E 0%, #16A34A 100%)',
                boxShadow: '0px 2px 0px rgba(22, 163, 74, 0.3)',
              }}
            >
              생성
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreate}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.05)',
              border: '2px dashed #D1D5DB',
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
              }}
            >
              <Plus size={20} style={{ color: '#FFFFFF' }} />
            </div>
            <span
              className="font-semibold"
              style={{ color: '#10B981', fontSize: '15px' }}
            >
              새 프로젝트 만들기
            </span>
          </button>
        )}

        {/* 프로젝트 목록 */}
        {projects.length > 0 ? (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium text-gray-400 px-2">
              저장된 프로젝트 ({projects.length})
            </span>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={project.id === currentProjectId}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
            <p>저장된 프로젝트가 없습니다</p>
            <p className="text-sm mt-1">새 프로젝트를 만들어보세요!</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default MobileProjectSheet;
