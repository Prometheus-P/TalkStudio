/**
 * Seed: System Templates
 * Creates default system templates for conversation generation
 */
import Template from '../../models/template_model.js';
import logger from '../../utils/logger.js';

// System template definitions
const SYSTEM_TEMPLATES = [
  {
    name: '게임 아이템 거래',
    category: 'game_trade',
    scenario: '온라인 게임에서 아이템을 거래하는 두 플레이어의 대화. 가격 협상과 거래 방법 논의 포함.',
    participants: 2,
    messageCount: 10,
    tone: 'casual',
    isSystem: true,
  },
  {
    name: '게임 파티 모집',
    category: 'game_trade',
    scenario: '온라인 게임에서 던전/레이드 파티를 모집하는 대화. 역할 분배와 출발 시간 조율.',
    participants: 3,
    messageCount: 12,
    tone: 'casual',
    isSystem: true,
  },
  {
    name: '일상 안부 인사',
    category: 'daily_chat',
    scenario: '오랜만에 연락하는 친구들의 안부 인사 대화. 근황 공유와 만남 약속.',
    participants: 2,
    messageCount: 8,
    tone: 'casual',
    isSystem: true,
  },
  {
    name: '점심 메뉴 고르기',
    category: 'daily_chat',
    scenario: '동료들이 점심 메뉴를 정하는 대화. 여러 의견을 조율하여 최종 결정.',
    participants: 3,
    messageCount: 10,
    tone: 'casual',
    isSystem: true,
  },
  {
    name: '고객 문의 응대',
    category: 'customer_service',
    scenario: '제품 문의에 대한 고객 서비스 담당자와 고객의 대화. 문제 해결 과정.',
    participants: 2,
    messageCount: 12,
    tone: 'formal',
    isSystem: true,
  },
  {
    name: '배송 지연 문의',
    category: 'customer_service',
    scenario: '배송 지연에 대해 문의하는 고객과 상담원의 대화. 현황 확인 및 해결책 제시.',
    participants: 2,
    messageCount: 10,
    tone: 'formal',
    isSystem: true,
  },
  {
    name: '그룹 약속 잡기',
    category: 'friend_chat',
    scenario: '친구들이 모임 일정을 정하는 그룹 채팅. 시간과 장소 조율.',
    participants: 4,
    messageCount: 15,
    tone: 'casual',
    isSystem: true,
  },
  {
    name: '여행 계획 세우기',
    category: 'friend_chat',
    scenario: '친구들이 함께 여행 계획을 세우는 대화. 목적지, 숙소, 일정 등 논의.',
    participants: 3,
    messageCount: 20,
    tone: 'casual',
    isSystem: true,
  },
];

/**
 * Seed system templates
 * @param {Object} options - Options
 * @param {boolean} [options.force=false] - Force re-seed (delete existing system templates)
 */
export const seed = async ({ force = false } = {}) => {
  logger.info('Seeding system templates', { force });

  try {
    // Check existing system templates
    const existingCount = await Template.countDocuments({ isSystem: true });

    if (existingCount > 0 && !force) {
      logger.info('System templates already exist, skipping seed', { count: existingCount });
      return { created: 0, skipped: existingCount };
    }

    // If force, delete existing system templates
    if (force && existingCount > 0) {
      await Template.deleteMany({ isSystem: true });
      logger.info('Deleted existing system templates', { count: existingCount });
    }

    // Insert system templates
    const result = await Template.insertMany(SYSTEM_TEMPLATES);

    logger.info('System templates seeded successfully', { count: result.length });
    return { created: result.length, skipped: 0 };

  } catch (error) {
    logger.error('Failed to seed system templates', { error: error.message });
    throw error;
  }
};

/**
 * Remove all system templates
 */
export const unseed = async () => {
  logger.info('Removing system templates');

  try {
    const result = await Template.deleteMany({ isSystem: true });
    logger.info('System templates removed', { count: result.deletedCount });
    return { deleted: result.deletedCount };

  } catch (error) {
    logger.error('Failed to remove system templates', { error: error.message });
    throw error;
  }
};

export default { seed, unseed, SYSTEM_TEMPLATES };
