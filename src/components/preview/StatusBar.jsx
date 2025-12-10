/**
 * StatusBar - iOS 스타일 상태바
 * 시간, 배터리, 와이파이 표시
 */
import React from 'react';
import { Wifi, Signal, BatteryFull, BatteryMedium, BatteryLow } from 'lucide-react';

const StatusBar = ({ statusBar, theme }) => {
  const { time, battery, isWifi } = statusBar;

  // 배터리 아이콘 선택
  const BatteryIcon = battery > 60 ? BatteryFull : battery > 20 ? BatteryMedium : BatteryLow;
  const batteryColor = battery > 20 ? 'currentColor' : '#FF3B30';

  // 테마에 따른 텍스트 색상
  const isDarkHeader = ['kakao', 'telegram'].includes(theme.id);
  const textColor = isDarkHeader ? '#FFFFFF' : '#000000';

  return (
    <div
      className="h-11 px-6 flex items-center justify-between"
      style={{
        backgroundColor: theme.headerBg,
        color: textColor,
      }}
    >
      {/* 왼쪽 - 시간 */}
      <div className="text-sm font-semibold w-16">
        {time}
      </div>

      {/* 중앙 - 노치 공간 (아이폰 스타일) */}
      <div className="w-32 h-7 rounded-b-2xl" />

      {/* 오른쪽 - 아이콘들 */}
      <div className="flex items-center gap-1 w-16 justify-end">
        <Signal size={14} />
        {isWifi && <Wifi size={14} />}
        <BatteryIcon size={18} style={{ color: batteryColor }} />
      </div>
    </div>
  );
};

export default StatusBar;
