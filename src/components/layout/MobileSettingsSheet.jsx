/**
 * MobileSettingsSheet - 모바일용 설정 바텀시트
 * 상태바, 데이터 관리, 앱 정보
 * CLAYMORPHISM DESIGN STYLE
 */
import React, { useState } from 'react';
import {
  Clock,
  Battery,
  Wifi,
  WifiOff,
  Trash2,
  RefreshCw,
  Info,
  AlertTriangle,
} from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import useChatStore from '../../store/useChatStore';

// 설정 섹션 헤더
const SectionHeader = ({ title }) => (
  <div className="px-6 py-2">
    <span
      className="text-xs font-semibold uppercase"
      style={{ color: '#9CA3AF' }}
    >
      {title}
    </span>
  </div>
);

// 토글 스위치
const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative w-12 h-7 rounded-full transition-all duration-200"
    style={{
      background: value
        ? 'linear-gradient(145deg, #10B981 0%, #059669 100%)'
        : 'linear-gradient(145deg, #D1D5DB 0%, #9CA3AF 100%)',
      boxShadow: value
        ? '0px 2px 0px rgba(5, 150, 105, 0.3)'
        : '0px 2px 0px rgba(156, 163, 175, 0.3)',
    }}
  >
    <div
      className="absolute top-1 w-5 h-5 rounded-full transition-all duration-200"
      style={{
        left: value ? '26px' : '4px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F3F4F6 100%)',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    />
  </button>
);

// 설정 아이템
const SettingItem = ({ icon, label, children, description }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
        style={{
          background: 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
        }}
      >
        <IconComponent size={20} style={{ color: '#6B7280' }} />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="font-medium block"
          style={{ color: '#374151', fontSize: '15px' }}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-gray-400">{description}</span>
        )}
      </div>
      {children}
    </div>
  );
};

// 입력 필드
const SettingInput = ({ value, onChange, type = 'text', min, max, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    min={min}
    max={max}
    placeholder={placeholder}
    className="w-24 px-3 py-2 text-right rounded-xl outline-none"
    style={{
      background: 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
      border: '2px solid transparent',
      color: '#374151',
      fontSize: '14px',
      fontWeight: 500,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = '#A855F7';
    }}
    onBlur={(e) => {
      e.target.style.borderColor = 'transparent';
    }}
  />
);

// 버튼 아이템
const ButtonItem = ({ icon, label, onClick, danger = false, description }) => {
  const IconComponent = icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 transition-colors"
      style={{ background: 'transparent' }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
        style={{
          background: danger
            ? 'linear-gradient(145deg, #FEE2E2 0%, #FECACA 100%)'
            : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
        }}
      >
        <IconComponent
          size={20}
          style={{ color: danger ? '#EF4444' : '#6B7280' }}
        />
      </div>
      <div className="flex-1 text-left">
        <span
          className="font-medium block"
          style={{
            color: danger ? '#EF4444' : '#374151',
            fontSize: '15px',
          }}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-gray-400">{description}</span>
        )}
      </div>
    </button>
  );
};

const MobileSettingsSheet = ({ isOpen, onClose }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const statusBar = useChatStore((s) => s.statusBar);
  const updateStatusBar = useChatStore((s) => s.updateStatusBar);
  const resetStore = useChatStore((s) => s.resetStore);

  // 시간 업데이트
  const handleTimeChange = (time) => {
    // HH:MM 형식 검증
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time) || time === '') {
      updateStatusBar({ time });
    }
  };

  // 배터리 업데이트
  const handleBatteryChange = (value) => {
    const battery = parseInt(value, 10);
    if (!isNaN(battery) && battery >= 0 && battery <= 100) {
      updateStatusBar({ battery });
    }
  };

  // WiFi 토글
  const handleWifiToggle = (isWifi) => {
    updateStatusBar({ isWifi });
  };

  // 데이터 초기화
  const handleReset = () => {
    if (showResetConfirm) {
      // localStorage 클리어
      localStorage.removeItem('talkstudio_projects');
      localStorage.removeItem('talkstudio_guide_completed');
      // 스토어 리셋
      if (resetStore) {
        resetStore();
      }
      // 페이지 새로고침
      window.location.reload();
    } else {
      setShowResetConfirm(true);
      // 3초 후 확인 상태 초기화
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  // 온보딩 다시 보기
  const handleResetOnboarding = () => {
    localStorage.removeItem('talkstudio_guide_completed');
    window.location.reload();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="설정"
      maxHeight="85vh"
    >
      <div className="pb-6">
        {/* 상태바 설정 */}
        <SectionHeader title="상태바" />

        <SettingItem icon={Clock} label="시간" description="HH:MM 형식">
          <SettingInput
            value={statusBar.time}
            onChange={handleTimeChange}
            placeholder="12:30"
          />
        </SettingItem>

        <SettingItem icon={Battery} label="배터리" description="0-100%">
          <SettingInput
            type="number"
            value={statusBar.battery}
            onChange={handleBatteryChange}
            min={0}
            max={100}
          />
        </SettingItem>

        <SettingItem
          icon={statusBar.isWifi ? Wifi : WifiOff}
          label="WiFi"
          description={statusBar.isWifi ? '연결됨' : '연결 안됨'}
        >
          <ToggleSwitch
            value={statusBar.isWifi}
            onChange={handleWifiToggle}
          />
        </SettingItem>

        <div className="h-px bg-gray-200 my-2 mx-6" />

        {/* 데이터 관리 */}
        <SectionHeader title="데이터 관리" />

        <ButtonItem
          icon={RefreshCw}
          label="온보딩 가이드 다시 보기"
          description="처음 사용자 가이드를 다시 봅니다"
          onClick={handleResetOnboarding}
        />

        <ButtonItem
          icon={showResetConfirm ? AlertTriangle : Trash2}
          label={showResetConfirm ? '정말 초기화하시겠습니까?' : '모든 데이터 초기화'}
          description={showResetConfirm ? '한 번 더 탭하면 초기화됩니다' : '모든 프로젝트와 설정이 삭제됩니다'}
          onClick={handleReset}
          danger
        />

        <div className="h-px bg-gray-200 my-2 mx-6" />

        {/* 앱 정보 */}
        <SectionHeader title="정보" />

        <SettingItem icon={Info} label="버전">
          <span className="text-sm text-gray-400">0.1.0</span>
        </SettingItem>

        <div className="px-6 py-4 text-center">
          <p className="text-xs text-gray-400">
            TalkStudio - 대화 스크린샷 생성기
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Made with love
          </p>
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileSettingsSheet;
