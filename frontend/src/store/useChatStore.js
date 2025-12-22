import { create } from 'zustand';

const useChatStore = create((set) => ({
  // 1. 기본 설정 (테마, 배경)
  config: {
    theme: 'discord', // 'kakao', 'telegram', 'insta', 'discord'
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
      name: '레전드킬러',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=MapleHero',
    },
    other: {
      id: 'other',
      name: '메이플상인',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=MapleTrader',
    },
  },

  // 4. 대화 내용 (초기 샘플 데이터)
  messages: [
    {
      id: 1,
      sender: 'other',
      type: 'text',
      text: '아케인셰이드 무기 팔아요?',
      time: '오후 3:42',
    },
    {
      id: 2,
      sender: 'me',
      type: 'text',
      text: '넵 아직 있어요 17성 3줄 공30짜리',
      time: '오후 3:43',
    },
    {
      id: 3,
      sender: 'other',
      type: 'text',
      text: '얼마에 파실 생각이세요?',
      time: '오후 3:43',
    },
    {
      id: 4,
      sender: 'me',
      type: 'text',
      text: '150메소 생각하고 있습니다',
      time: '오후 3:44',
    },
    {
      id: 5,
      sender: 'other',
      type: 'text',
      text: '130메소에 안될까요? ㅠㅠ',
      time: '오후 3:44',
    },
    {
      id: 6,
      sender: 'me',
      type: 'text',
      text: '음.. 140메소까지는 가능한데 그 이하는 힘들 것 같아요',
      time: '오후 3:45',
    },
    {
      id: 7,
      sender: 'other',
      type: 'text',
      text: '알겠습니다! 140에 할게요 어디서 거래해요?',
      time: '오후 3:46',
    },
    {
      id: 8,
      sender: 'me',
      type: 'text',
      text: '헤네시스 자유시장 1채널로 오세요!',
      time: '오후 3:46',
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
}));

export default useChatStore;