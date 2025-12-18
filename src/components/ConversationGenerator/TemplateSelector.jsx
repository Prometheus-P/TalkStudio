/**
 * TemplateSelector - 템플릿 선택 컴포넌트
 * 시스템/커스텀 템플릿을 카테고리별로 표시하고 선택
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Sparkles, MessageSquare, Users, Briefcase, Gamepad2, Plus, Trash2, Loader2 } from 'lucide-react';
import { getTemplates, deleteTemplate } from '../../services/conversationApi';

// Category configuration
const CATEGORIES = {
  game_trade: { label: '게임/거래', icon: Gamepad2, color: '#8B5CF6' },
  daily_chat: { label: '일상 대화', icon: MessageSquare, color: '#10B981' },
  customer_service: { label: '고객 서비스', icon: Briefcase, color: '#F59E0B' },
  friend_chat: { label: '친구 대화', icon: Users, color: '#EC4899' },
  custom: { label: '커스텀', icon: Plus, color: '#6B7280' },
};

const TemplateSelector = ({
  onSelect,
  onCreateNew,
  disabled = false,
  selectedTemplateId = null,
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all
  const [deletingId, setDeletingId] = useState(null);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedTemplates = await getTemplates(selectedCategory);
      setTemplates(fetchedTemplates);
    } catch (err) {
      setError(err.message || '템플릿을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle template selection
  const handleSelect = (template) => {
    if (disabled) return;
    if (onSelect) {
      onSelect(template);
    }
  };

  // Handle template deletion
  const handleDelete = async (e, templateId) => {
    e.stopPropagation();
    if (deletingId) return;

    const confirmDelete = window.confirm('이 템플릿을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    setDeletingId(templateId);
    try {
      await deleteTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t._id !== templateId));
    } catch (err) {
      alert(err.message || '템플릿 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'custom';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Layout size={16} />
          템플릿 선택
          <Sparkles size={14} className="text-purple-500" />
        </label>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#6B7280',
              fontSize: '12px',
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={14} />
            새 템플릿
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: selectedCategory === null ? '2px solid #A855F7' : '1px solid #E5E7EB',
            background: selectedCategory === null ? '#F3E8FF' : '#FFFFFF',
            color: selectedCategory === null ? '#7C3AED' : '#6B7280',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          전체
        </button>
        {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: selectedCategory === key ? `2px solid ${color}` : '1px solid #E5E7EB',
              background: selectedCategory === key ? `${color}15` : '#FFFFFF',
              color: selectedCategory === key ? color : '#6B7280',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#9CA3AF',
          }}
        >
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          <p className="text-sm">템플릿 불러오는 중...</p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {error}
          <button
            onClick={fetchTemplates}
            style={{
              marginLeft: '8px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#9CA3AF',
            background: '#F9FAFB',
            borderRadius: '12px',
            border: '1px dashed #E5E7EB',
          }}
        >
          <Layout size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">템플릿이 없습니다.</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              첫 템플릿 만들기
            </button>
          )}
        </div>
      ) : selectedCategory ? (
        // Flat list for filtered view
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              isSelected={selectedTemplateId === template._id}
              onSelect={() => handleSelect(template)}
              onDelete={template.isSystem ? null : (e) => handleDelete(e, template._id)}
              isDeleting={deletingId === template._id}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        // Grouped view
        <div className="space-y-4">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
            const categoryConfig = CATEGORIES[category] || CATEGORIES.custom;
            const Icon = categoryConfig.icon;

            return (
              <div key={category}>
                <h4
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: categoryConfig.color }}
                >
                  <Icon size={14} />
                  {categoryConfig.label}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template._id}
                      template={template}
                      isSelected={selectedTemplateId === template._id}
                      onSelect={() => handleSelect(template)}
                      onDelete={template.isSystem ? null : (e) => handleDelete(e, template._id)}
                      isDeleting={deletingId === template._id}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard = ({
  template,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
  disabled,
}) => {
  const categoryConfig = CATEGORIES[template.category] || CATEGORIES.custom;

  return (
    <div
      onClick={disabled ? undefined : onSelect}
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        border: isSelected ? '2px solid #A855F7' : '1px solid #E5E7EB',
        background: isSelected ? '#FAF5FF' : '#FFFFFF',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className="font-medium text-sm truncate"
              style={{ color: isSelected ? '#7C3AED' : '#1F2937' }}
            >
              {template.name}
            </h5>
            {template.isSystem && (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#E5E7EB',
                  color: '#6B7280',
                  fontSize: '10px',
                  fontWeight: 500,
                }}
              >
                시스템
              </span>
            )}
          </div>
          <p
            className="text-xs text-gray-500 line-clamp-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {template.scenario}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{template.participants}명</span>
            <span>{template.messageCount}개 메시지</span>
            <span
              style={{
                padding: '1px 6px',
                borderRadius: '4px',
                background: `${categoryConfig.color}15`,
                color: categoryConfig.color,
                fontSize: '10px',
              }}
            >
              {template.tone === 'casual' ? '캐주얼' : template.tone === 'formal' ? '정중' : '유머'}
            </span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting || disabled}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#9CA3AF',
              cursor: isDeleting || disabled ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
