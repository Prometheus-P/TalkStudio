/**
 * AIGenerator - AI 대화 생성기 메인 페이지
 * 시나리오 입력 → AI 대화 생성 → 편집 → 내보내기 워크플로우
 */
import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, Check, ArrowRight, Layout, PenSquare, FileSpreadsheet } from 'lucide-react';
import ScenarioInput from '../components/ConversationGenerator/ScenarioInput';
import ParameterPanel from '../components/ConversationGenerator/ParameterPanel';
import TemplateSelector from '../components/ConversationGenerator/TemplateSelector';
import ExcelUploader from '../components/BulkGeneration/ExcelUploader';
import ProgressTracker from '../components/BulkGeneration/ProgressTracker';
import { generateConversation } from '../services/conversationApi';
import useChatStore from '../store/useChatStore';

const AIGenerator = ({ onClose, onGenerated }) => {
  // Tab state: 'template' | 'custom' | 'bulk'
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Bulk generation state
  const [bulkJobId, setBulkJobId] = useState(null);

  // Form state
  const [scenario, setScenario] = useState('');
  const [participants, setParticipants] = useState(2);
  const [messageCount, setMessageCount] = useState(10);
  const [tone, setTone] = useState('casual');
  const [platform, setPlatform] = useState('kakaotalk');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // TalkStudio store
  const setMessages = useChatStore((s) => s.setMessages);
  const setTheme = useChatStore((s) => s.setPlatform);
  const updateAuthor = useChatStore((s) => s.updateAuthor);

  // Handle template selection
  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    setScenario(template.scenario);
    setParticipants(template.participants || 2);
    setMessageCount(template.messageCount || 10);
    setTone(template.tone || 'casual');
  }, []);

  // Switch to custom mode for manual input (reserved for future use)
  const _handleSwitchToCustom = useCallback(() => {
    setActiveTab('custom');
    setSelectedTemplate(null);
  }, []);

  // Handle bulk job started
  const handleBulkJobStarted = useCallback((job) => {
    setBulkJobId(job.id);
  }, []);

  // Validate form
  const isValid = activeTab === 'template'
    ? selectedTemplate !== null
    : activeTab === 'custom'
    ? scenario.trim().length >= 10
    : false; // bulk tab doesn't use generate button

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!isValid || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const params = {
        scenario,
        participants,
        messageCount,
        tone,
        platform,
      };

      // Include templateId if using a template
      if (activeTab === 'template' && selectedTemplate) {
        params.templateId = selectedTemplate._id;
      }

      const conversation = await generateConversation(params);

      // Convert to TalkStudio format
      const talkStudioMessages = conversation.messages.map((msg, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        sender: msg.sender === conversation.participants[0] ? 'me' : 'other',
        type: 'text',
        text: msg.text,
        time: msg.timestamp,
      }));

      // Update TalkStudio store
      setMessages(talkStudioMessages);
      setTheme(platform);

      // Update author names
      if (conversation.participants.length >= 1) {
        updateAuthor('me', { name: conversation.participants[0] });
      }
      if (conversation.participants.length >= 2) {
        updateAuthor('other', { name: conversation.participants[1] });
      }

      setSuccess(true);

      // Callback
      if (onGenerated) {
        onGenerated(conversation);
      }

      // Auto close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || '대화 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }, [scenario, participants, messageCount, tone, platform, isValid, isGenerating, setMessages, setTheme, updateAuthor, onGenerated, onClose, activeTab, selectedTemplate]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 16px',
            borderBottom: '1px solid #E5E7EB',
            background: 'linear-gradient(145deg, #F3E8FF 0%, #EDE9FE 100%)',
            borderRadius: '24px 24px 0 0',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
              }}
            >
              <Sparkles size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>
                AI 대화 생성
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                시나리오를 입력하면 AI가 대화를 만들어 드려요
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E5E7EB',
            background: '#F9FAFB',
          }}
        >
          <button
            onClick={() => setActiveTab('template')}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              background: activeTab === 'template' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'template' ? '#7C3AED' : '#6B7280',
              fontWeight: activeTab === 'template' ? 600 : 500,
              fontSize: '14px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              borderBottom: activeTab === 'template' ? '2px solid #A855F7' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <Layout size={16} />
            템플릿 선택
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              background: activeTab === 'custom' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'custom' ? '#7C3AED' : '#6B7280',
              fontWeight: activeTab === 'custom' ? 600 : 500,
              fontSize: '14px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              borderBottom: activeTab === 'custom' ? '2px solid #A855F7' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <PenSquare size={16} />
            직접 입력
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              background: activeTab === 'bulk' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'bulk' ? '#7C3AED' : '#6B7280',
              fontWeight: activeTab === 'bulk' ? 600 : 500,
              fontSize: '14px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              borderBottom: activeTab === 'bulk' ? '2px solid #A855F7' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <FileSpreadsheet size={16} />
            대량 생성
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '50vh', overflowY: 'auto' }} className="space-y-6">
          {activeTab === 'template' ? (
            <>
              {/* Template Selector */}
              <TemplateSelector
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?._id}
                disabled={isGenerating}
              />

              {/* Selected Template Preview */}
              {selectedTemplate && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <p className="text-sm text-green-700 font-medium mb-1">
                    선택된 템플릿: {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {selectedTemplate.participants}명 참여 · {selectedTemplate.messageCount}개 메시지 · {
                      selectedTemplate.tone === 'casual' ? '캐주얼' :
                      selectedTemplate.tone === 'formal' ? '정중' : '유머'
                    } 톤
                  </p>
                </div>
              )}

              {/* Platform Selection for Template Mode */}
              <ParameterPanel
                participants={participants}
                onParticipantsChange={setParticipants}
                messageCount={messageCount}
                onMessageCountChange={setMessageCount}
                tone={tone}
                onToneChange={setTone}
                platform={platform}
                onPlatformChange={setPlatform}
                disabled={isGenerating}
                showOnlyPlatform={true}
              />
            </>
          ) : activeTab === 'custom' ? (
            <>
              {/* Scenario Input */}
              <ScenarioInput
                value={scenario}
                onChange={setScenario}
                disabled={isGenerating}
                error={scenario.length > 0 && scenario.length < 10 ? '최소 10자 이상 입력해 주세요.' : null}
              />

              {/* Parameter Panel */}
              <ParameterPanel
                participants={participants}
                onParticipantsChange={setParticipants}
                messageCount={messageCount}
                onMessageCountChange={setMessageCount}
                tone={tone}
                onToneChange={setTone}
                platform={platform}
                onPlatformChange={setPlatform}
                disabled={isGenerating}
              />
            </>
          ) : activeTab === 'bulk' ? (
            <>
              {/* Bulk Generation */}
              {bulkJobId ? (
                <ProgressTracker
                  jobId={bulkJobId}
                  onComplete={() => {
                    // Job completed - could show success message
                  }}
                  onError={(err) => {
                    setError(err.message);
                  }}
                />
              ) : (
                <ExcelUploader
                  onJobStarted={handleBulkJobStarted}
                  disabled={isGenerating}
                />
              )}

              {/* Bulk Generation Info */}
              {!bulkJobId && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(145deg, #F3E8FF 0%, #EDE9FE 100%)',
                    fontSize: '13px',
                    color: '#6B21A8',
                  }}
                >
                  <strong>대량 생성 안내</strong>
                  <ul className="mt-2 space-y-1 text-xs" style={{ color: '#7C3AED' }}>
                    <li>• Excel 템플릿을 다운로드하여 시나리오를 입력하세요</li>
                    <li>• 한 번에 최대 100개 시나리오까지 처리 가능</li>
                    <li>• 완료 후 ZIP 파일로 결과를 다운로드할 수 있습니다</li>
                  </ul>
                </div>
              )}
            </>
          ) : null}

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#DC2626',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#16A34A',
                fontSize: '14px',
              }}
            >
              <Check size={18} />
              대화가 생성되었습니다! 에디터로 이동합니다...
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px 24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#374151',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {activeTab === 'bulk' && bulkJobId ? '닫기' : '취소'}
          </button>
          {activeTab !== 'bulk' && (
            <button
              onClick={handleGenerate}
              disabled={!isValid || isGenerating}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: isValid && !isGenerating
                  ? 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)'
                  : '#E5E7EB',
                color: isValid && !isGenerating ? '#FFFFFF' : '#9CA3AF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: isValid && !isGenerating ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isValid && !isGenerating
                  ? '0 4px 12px rgba(168, 85, 247, 0.3)'
                  : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  대화 생성
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
