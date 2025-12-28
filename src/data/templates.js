/**
 * 시스템 템플릿 데이터
 * 백엔드 없이 프론트엔드에서 로컬로 관리
 */

export const TEMPLATE_CATEGORIES = {
  game_trade: '게임 거래',
  daily_chat: '일상 대화',
  business: '비즈니스',
  romantic: '연애/썸',
  funny: '유머/재미',
};

export const SYSTEM_TEMPLATES = [
  // 게임 거래
  {
    _id: 'tpl-game-trade-1',
    name: '게임 아이템 거래',
    category: 'game_trade',
    scenario: '메이플스토리에서 10만원 상당의 아이템을 거래하는 대화. 판매자가 아이템을 올리고 구매자가 확인 후 결제하는 과정',
    participants: 2,
    messageCount: 10,
    tone: 'casual',
    isSystem: true,
  },
  {
    _id: 'tpl-game-trade-2',
    name: '게임 계정 거래',
    category: 'game_trade',
    scenario: '리니지M 계정을 50만원에 거래하는 대화. 계정 정보 확인, 가격 협상, 결제 방법 논의',
    participants: 2,
    messageCount: 12,
    tone: 'casual',
    isSystem: true,
  },
  {
    _id: 'tpl-game-trade-3',
    name: '게임 대리 의뢰',
    category: 'game_trade',
    scenario: '롤 티어 올리기 대리 의뢰 대화. 현재 티어, 목표 티어, 가격, 소요 시간 협의',
    participants: 2,
    messageCount: 8,
    tone: 'casual',
    isSystem: true,
  },

  // 일상 대화
  {
    _id: 'tpl-daily-1',
    name: '친구와 약속 잡기',
    category: 'daily_chat',
    scenario: '주말에 친구와 영화 보러 가기로 약속을 잡는 대화. 시간, 장소, 영화 선택',
    participants: 2,
    messageCount: 8,
    tone: 'casual',
    isSystem: true,
  },
  {
    _id: 'tpl-daily-2',
    name: '맛집 추천받기',
    category: 'daily_chat',
    scenario: '친구에게 강남역 근처 맛집을 추천받는 대화. 메뉴 종류, 가격대, 분위기 질문',
    participants: 2,
    messageCount: 10,
    tone: 'casual',
    isSystem: true,
  },
  {
    _id: 'tpl-daily-3',
    name: '택배 배송 문의',
    category: 'daily_chat',
    scenario: '택배가 안 와서 판매자에게 문의하는 대화. 송장번호 확인, 배송 상태 질문',
    participants: 2,
    messageCount: 6,
    tone: 'casual',
    isSystem: true,
  },

  // 비즈니스
  {
    _id: 'tpl-business-1',
    name: '미팅 일정 조율',
    category: 'business',
    scenario: '다음 주 미팅 일정을 조율하는 업무 대화. 가능한 시간대 확인, 장소 결정',
    participants: 2,
    messageCount: 8,
    tone: 'formal',
    isSystem: true,
  },
  {
    _id: 'tpl-business-2',
    name: '프로젝트 진행상황 보고',
    category: 'business',
    scenario: '팀장에게 프로젝트 진행상황을 보고하는 대화. 완료 항목, 진행 중 항목, 이슈 공유',
    participants: 2,
    messageCount: 10,
    tone: 'formal',
    isSystem: true,
  },

  // 연애/썸
  {
    _id: 'tpl-romantic-1',
    name: '첫 데이트 약속',
    category: 'romantic',
    scenario: '썸 타는 상대와 첫 데이트 약속을 잡는 대화. 설렘이 묻어나는 대화',
    participants: 2,
    messageCount: 12,
    tone: 'romantic',
    isSystem: true,
  },
  {
    _id: 'tpl-romantic-2',
    name: '달달한 굿나잇 인사',
    category: 'romantic',
    scenario: '연인과 자기 전에 나누는 달달한 대화. 오늘 하루 이야기, 내일 일정, 잘자 인사',
    participants: 2,
    messageCount: 10,
    tone: 'romantic',
    isSystem: true,
  },

  // 유머/재미
  {
    _id: 'tpl-funny-1',
    name: '친구 놀리기',
    category: 'funny',
    scenario: '친구가 실수한 걸 가지고 놀리는 재미있는 대화',
    participants: 2,
    messageCount: 8,
    tone: 'funny',
    isSystem: true,
  },
  {
    _id: 'tpl-funny-2',
    name: '엉뚱한 대화',
    category: 'funny',
    scenario: '친구와 엉뚱하고 황당한 주제로 나누는 웃긴 대화',
    participants: 2,
    messageCount: 10,
    tone: 'funny',
    isSystem: true,
  },
];

/**
 * 카테고리별 템플릿 필터링
 * @param {string} category - 필터할 카테고리 (없으면 전체 반환)
 * @returns {Array} 템플릿 목록
 */
export const getTemplatesByCategory = (category) => {
  if (!category) return SYSTEM_TEMPLATES;
  return SYSTEM_TEMPLATES.filter((t) => t.category === category);
};
