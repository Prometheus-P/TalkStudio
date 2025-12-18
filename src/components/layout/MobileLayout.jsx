import React, { useState } from 'react';
import BottomTabBar from './BottomTabBar';
import ChatPreview from '../preview/ChatPreview';
import LeftPanel from '../editor/LeftPanel';
import Sidebar from './Sidebar';

const MobileLayout = () => {
  const [activeView, setActiveView] = useState('preview');

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        {activeView === 'preview' ? (
          <div className="p-4">
            <ChatPreview />
          </div>
        ) : (
          <div>
            <Sidebar />
            <LeftPanel />
          </div>
        )}
      </div>
      <BottomTabBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default MobileLayout;
