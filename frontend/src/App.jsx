import React from 'react';
import Sidebar from './components/layout/Sidebar';
import useChatStore from './store/useChatStore';
import Chat from './components/Chat';

function App() {
  const { config } = useChatStore();

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans">
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 에디터 영역 (중앙) */}
      <div className="flex-1 flex flex-col min-w-[350px] bg-white border-r border-gray-200 z-10 shadow-sm">
        <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">TalkStudio</h1>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">v0.1</span>
        </header>
        <Chat />
      </div>

      {/* 3. 미리보기 영역 (우측) */}
      <div className="flex-[1.2] bg-gray-100 flex items-center justify-center relative">
        <div className="absolute top-6 text-gray-400 text-sm font-medium">
          현재 테마: <span className="uppercase text-gray-600">{config.theme}</span>
        </div>
        
        {/* 폰 프레임 (껍데기) */}
        <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative transform transition-all">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
             
             {/* 내용물 들어갈 곳 */}
             <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">대화창 미리보기</span>
             </div>
        </div>
      </div>
    </div>
  );
}

export default App;