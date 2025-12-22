/**
 * T060 Performance Test Script
 * - Single generation: < 5 seconds
 * - Bulk 100 items: < 5 minutes
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { generateConversation } from '../src/services/conversation_generator.js';
// bulk_processor uses file-based input, not used in this test
import logger from '../src/utils/logger.js';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

// Test scenarios (minimum 10 characters)
const TEST_SCENARIOS = [
  '친구와 주말 계획을 세우는 대화입니다. 토요일에 영화를 보고 저녁을 먹으려고 합니다.',
  '온라인 게임에서 레어 아이템을 거래하는 협상 대화입니다. 가격과 거래 방법에 대해 논의합니다.',
  '맛있는 음식점을 추천해주는 대화입니다. 이탈리안 레스토랑과 한식당 중에서 고민하고 있습니다.',
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected for performance test');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Test 1: Single conversation generation (<5s)
 */
async function testSingleGeneration() {
  console.log('\n========================================');
  console.log('TEST 1: Single Conversation Generation');
  console.log('Requirement: < 5 seconds');
  console.log('========================================\n');

  const results = [];

  for (const scenario of TEST_SCENARIOS) {
    const startTime = Date.now();

    try {
      const conversation = await generateConversation({
        scenario,
        participants: 2,
        messageCount: 10,
        tone: 'casual',
        platform: 'kakaotalk',
      });

      const elapsed = (Date.now() - startTime) / 1000;
      const passed = elapsed < 5;

      results.push({
        scenario: scenario.substring(0, 30) + '...',
        elapsed: elapsed.toFixed(2) + 's',
        messageCount: conversation.messages.length,
        status: passed ? 'PASS' : 'FAIL',
      });

      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${scenario.substring(0, 40)}...`);
      console.log(`  - Time: ${elapsed.toFixed(2)}s`);
      console.log(`  - Messages: ${conversation.messages.length}`);
      console.log(`  - ID: ${conversation._id}`);
      console.log('');

    } catch (error) {
      const elapsed = (Date.now() - startTime) / 1000;
      results.push({
        scenario: scenario.substring(0, 30) + '...',
        elapsed: elapsed.toFixed(2) + 's',
        status: 'ERROR',
        error: error.message,
      });
      console.log(`[ERROR] ${scenario.substring(0, 40)}...`);
      console.log(`  - Error: ${error.message}`);
      console.log(`  - Stack: ${error.stack?.split('\n').slice(0, 5).join('\n    ')}`);
      console.log('');
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status !== 'PASS').length;
  const avgTime = results
    .filter(r => r.status !== 'ERROR')
    .reduce((sum, r) => sum + parseFloat(r.elapsed), 0) / results.length;

  console.log('----------------------------------------');
  console.log(`SUMMARY: ${passed}/${results.length} passed`);
  console.log(`Average time: ${avgTime.toFixed(2)}s`);
  console.log(`Requirement: < 5s → ${avgTime < 5 ? 'PASS' : 'FAIL'}`);
  console.log('----------------------------------------\n');

  return { passed: passed === results.length, avgTime };
}

/**
 * Test 2: Bulk generation (100 items < 5min)
 */
async function testBulkGeneration() {
  console.log('\n========================================');
  console.log('TEST 2: Bulk Generation (100 items)');
  console.log('Requirement: < 5 minutes (300 seconds)');
  console.log('========================================\n');

  // Generate 100 scenarios
  const scenarios = [];
  const baseScenarios = [
    '친구와 영화 추천',
    '맛집 정보 공유',
    '게임 팀 구성',
    '스터디 일정 조율',
    '쇼핑 아이템 추천',
    '여행 계획 세우기',
    '운동 파트너 찾기',
    '책 추천 대화',
    '요리 레시피 공유',
    '취미 활동 계획',
  ];

  for (let i = 0; i < 100; i++) {
    scenarios.push({
      scenario: `${baseScenarios[i % 10]} #${i + 1}`,
      participants: 2,
      messageCount: 5, // Reduced for bulk test
      tone: 'casual',
      platform: 'kakaotalk',
    });
  }

  console.log(`Prepared ${scenarios.length} scenarios for bulk generation`);
  console.log('Starting bulk generation...\n');

  const startTime = Date.now();

  try {
    // Process in batches of 10 (to avoid rate limiting)
    const BATCH_SIZE = 10;
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < scenarios.length; i += BATCH_SIZE) {
      const batch = scenarios.slice(i, i + BATCH_SIZE);
      const batchStartTime = Date.now();

      // Process batch concurrently
      const results = await Promise.allSettled(
        batch.map(s => generateConversation(s))
      );

      const batchCompleted = results.filter(r => r.status === 'fulfilled').length;
      const batchFailed = results.filter(r => r.status === 'rejected').length;
      completed += batchCompleted;
      failed += batchFailed;

      const batchTime = (Date.now() - batchStartTime) / 1000;
      const totalTime = (Date.now() - startTime) / 1000;
      const progress = ((i + BATCH_SIZE) / scenarios.length * 100).toFixed(0);

      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(scenarios.length / BATCH_SIZE)}: ${batchCompleted}/${batch.length} success | ${batchTime.toFixed(1)}s | Total: ${totalTime.toFixed(1)}s (${progress}%)`);

      // Rate limit delay (to avoid API throttling)
      if (i + BATCH_SIZE < scenarios.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const passed = totalTime < 300; // 5 minutes

    console.log('\n----------------------------------------');
    console.log(`Completed: ${completed}/${scenarios.length}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total time: ${totalTime.toFixed(2)}s (${(totalTime / 60).toFixed(2)} min)`);
    console.log(`Requirement: < 5min → ${passed ? 'PASS' : 'FAIL'}`);
    console.log('----------------------------------------\n');

    return { passed, totalTime, completed, failed };

  } catch (error) {
    console.error('Bulk generation failed:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  T060 Performance Test                 ║');
  console.log('║  AI Conversation Generator             ║');
  console.log('╚════════════════════════════════════════╝\n');

  await connectDB();

  // Test 1: Single generation
  const singleResult = await testSingleGeneration();

  // Test 2: Bulk generation (optional - takes time)
  const args = process.argv.slice(2);
  let bulkResult = { skipped: true };

  if (args.includes('--bulk') || args.includes('-b')) {
    bulkResult = await testBulkGeneration();
  } else {
    console.log('\n[INFO] Bulk test skipped. Use --bulk or -b flag to run.\n');
  }

  // Final summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  FINAL RESULTS                         ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Single Generation: ${singleResult.passed ? 'PASS ✓' : 'FAIL ✗'}              ║`);
  console.log(`║    Average: ${singleResult.avgTime.toFixed(2)}s (req: <5s)          ║`);
  if (!bulkResult.skipped) {
    console.log(`║  Bulk Generation:   ${bulkResult.passed ? 'PASS ✓' : 'FAIL ✗'}              ║`);
    console.log(`║    Time: ${(bulkResult.totalTime / 60).toFixed(2)}min (req: <5min)      ║`);
  } else {
    console.log('║  Bulk Generation:   SKIPPED            ║');
  }
  console.log('╚════════════════════════════════════════╝\n');

  // Cleanup
  await mongoose.disconnect();
  logger.info('Performance test completed');
}

main().catch(console.error);
