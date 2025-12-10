import { create } from 'zustand';

const useChatStore = create((set) => ({
  // 1. 기본 설정 (테마, 배경)
  config: {
    theme: 'kakao', // 'kakao', 'telegram', 'insta', 'discord'
    capturedImage: null,
  },
  
  // 2. 상단바 설정 (시간, 배터리 등)
  statusBar: {
    time: '12:30',
    battery: 85,
    isWifi: true,
  },

  // 3. 프로필 (나 & 상대방)
  profiles: {
    me: {
      id: 'me',
      name: '나',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', // 기본 아바타
    },
    other: {
      id: 'other',
      name: '상대방',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    },
  },

  // 4. 대화 내용 (초기 샘플 데이터)
  messages: [
    {
      id: 1,
      sender: 'other', // 'me' or 'other'
      type: 'text',
      text: '안녕하세요! TalkStudio입니다.',
      time: '오후 12:30',
    },
    {
      id: 2,
      sender: 'me',
      type: 'text',
      text: '우와, 진짜 카톡 같네요!',
      time: '오후 12:31',
      readCount: 1, // 읽음 숫자 (카톡용)
    },
  ],

  // ▼ 액션 (데이터 변경 함수들)
  
  // 테마 변경
  setTheme: (theme) => set((state) => ({ 
    config: { ...state.config, theme } 
  })),

  // 메시지 추가
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: Date.now() }] 
  })),

  // 메시지 삭제
  removeMessage: (id) => set((state) => ({
    messages: state.messages.filter((m) => m.id !== id)
  })),

  // 설정 업데이트 (통합 함수)
  updateConfig: (key, value) => set((state) => ({
    config: { ...state.config, [key]: value }
  })),

  // 프리셋 저장 (localStorage)
  saveState: () => set((state) => {
    const stateToSave = {
      config: state.config,
      statusBar: state.statusBar,
      profiles: state.profiles,
      messages: state.messages,
    };
    localStorage.setItem('talkStudioPreset', JSON.stringify(stateToSave));
    return {}; // 상태 변경 없음
  }),

  // 프리셋 불러오기 (localStorage)
  loadState: () => set(() => {
    const savedState = localStorage.getItem('talkStudioPreset');
    if (savedState) return JSON.parse(savedState);
    return {}; // 저장된 상태가 없으면 변경 없음
  }),
}));

export default useChatStore;