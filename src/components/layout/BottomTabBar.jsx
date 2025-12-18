import React from 'react';
import { Eye, Edit } from 'lucide-react';

const BottomTabBar = ({ activeView, setActiveView }) => {
  const tabs = [
    { name: 'preview', icon: Eye },
    { name: 'editor', icon: Edit },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm shadow-lg flex justify-around items-center rounded-t-3xl">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveView(tab.name)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeView === tab.name
              ? 'text-violet-600 scale-110'
              : 'text-gray-400'
          }`}
        >
          <tab.icon size={24} />
          <span className="text-xs font-bold capitalize">{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomTabBar;
