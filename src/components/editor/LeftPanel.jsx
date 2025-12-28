/**
 * LeftPanel - 왼쪽 컨트롤 패널
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState } from 'react';
import { MessageSquare, Users, Palette } from 'lucide-react';
import MessageEditor from './MessageEditor';
import ProfileEditor from './ProfileEditor';
import ThemeControls from './ThemeControls';
import UnifiedExportButton from './UnifiedExportButton';

const tabs = [
  { id: 'messages', label: '메시지', icon: MessageSquare, color: '#FF6B9D' },
  { id: 'profile', label: '프로필', icon: Users, color: '#4ADE80' },
  { id: 'theme', label: '스타일', icon: Palette, color: '#22D3EE' },
];

const LeftPanel = () => {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 - Clay Tabs */}
      <div
        className="flex gap-2 px-4 py-4"
        style={{
          background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '13px',
                background: isActive
                  ? `linear-gradient(145deg, ${tab.color} 0%, ${tab.color}dd 100%)`
                  : 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
                color: isActive ? '#FFFFFF' : '#6B7280',
                boxShadow: isActive
                  ? `0px 4px 0px ${tab.color}80`
                  : '0px 3px 0px rgba(0, 0, 0, 0.08)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-2">
        {activeTab === 'messages' && <MessageEditor />}
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'theme' && <ThemeControls />}
      </div>

      {/* Export 버튼 (하단 고정) */}
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(168, 85, 247, 0.05) 100%)',
        }}
      >
        <UnifiedExportButton />
      </div>
    </div>
  );
};

export default LeftPanel;
