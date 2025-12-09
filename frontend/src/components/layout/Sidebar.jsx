import React from 'react';
import { MessageCircle, Send, Instagram, Hash } from 'lucide-react';
import useChatStore from '../../store/useChatStore';

const Sidebar = () => {
  const { config, setTheme } = useChatStore();
  
  const menus = [
    { id: 'kakao', icon: MessageCircle, color: 'bg-[#FEE500] text-black', label: '카카오' },
    { id: 'telegram', icon: Send, color: 'bg-[#2AABEE] text-white', label: '텔레그램' },
    { id: 'insta', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 to-purple-600 text-white', label: '인스타' },
    { id: 'discord', icon: Hash, color: 'bg-[#5865F2] text-white', label: '디스코드' },
  ];

  return (
    <nav className="w-20 bg-gray-900 flex flex-col items-center py-6 gap-6 shrink-0 z-50">
      {menus.map((menu) => {
        const Icon = menu.icon;
        const isActive = config.theme === menu.id;
        
        return (
          <button
            key={menu.id}
            onClick={() => setTheme(menu.id)}
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isActive ? `${menu.color} shadow-lg scale-110` : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}
            `}
            title={menu.label}
          >
            <Icon size={24} />
          </button>
        );
      })}
    </nav>
  );
};

export default Sidebar;