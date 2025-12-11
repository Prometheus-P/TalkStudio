/**
 * k6 Performance Test: Discord Message Capture
 *
 * Target: Verify 10,000 Discord messages can be captured in < 60 seconds
 *
 * Prerequisites:
 * - Install k6: brew install k6 (macOS) or see https://k6.io/docs/getting-started/installation/
 * - Backend server running on localhost:3000
 * - Valid Discord config registered
 *
 * Run:
 *   k6 run tests/performance/discord-capture-load-test.js
 *
 * With environment variables:
 *   k6 run -e BASE_URL=http://localhost:3000 -e CONFIG_ID=your_config_id tests/performance/discord-capture-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const captureSuccessRate = new Rate('capture_success_rate');
const captureCompletionTime = new Trend('capture_completion_time');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  scenarios: {
    capture_test: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '120s',
    },
  },
  thresholds: {
    'capture_completion_time': ['p(95)<60000'], // 95th percentile < 60 seconds
    'api_response_time': ['p(95)<500'],          // API response < 500ms
    'capture_success_rate': ['rate>0.95'],       // 95% success rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const CONFIG_ID = __ENV.CONFIG_ID || 'test_config_id';
const API_PREFIX = '/api/v1';

// Helper function to poll capture status
function pollCaptureStatus(captureJobId, maxWaitMs = 60000) {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const statusRes = http.get(`${BASE_URL}${API_PREFIX}/integrations/discord/capture/${captureJobId}/status`);
    apiResponseTime.add(statusRes.timings.duration);

    if (statusRes.status !== 200) {
      console.log(`Status check failed: ${statusRes.status}`);
      sleep(pollInterval / 1000);
      continue;
    }

    const statusData = JSON.parse(statusRes.body);
    const status = statusData.data?.status;
    const messagesCaptured = statusData.data?.messagesCaptured || 0;
    const progress = statusData.data?.progress || 0;

    console.log(`Progress: ${progress}% - Messages captured: ${messagesCaptured}`);

    if (status === 'completed') {
      return {
        success: true,
        messagesCaptured: messagesCaptured,
        durationMs: Date.now() - startTime,
      };
    }

    if (status === 'failed') {
      return {
        success: false,
        error: statusData.data?.errorMessage || 'Capture failed',
        durationMs: Date.now() - startTime,
      };
    }

    sleep(pollInterval / 1000);
  }

  return {
    success: false,
    error: 'Timeout waiting for capture completion',
    durationMs: maxWaitMs,
  };
}

export default function () {
  console.log('Starting Discord capture performance test...');

  // Step 1: Start capture job
  const capturePayload = JSON.stringify({
    limitMessages: 10000, // Target: 10,000 messages
  });

  const captureStartRes = http.post(
    `${BASE_URL}${API_PREFIX}/integrations/discord/config/${CONFIG_ID}/capture/start`,
    capturePayload,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  apiResponseTime.add(captureStartRes.timings.duration);

  const startCheck = check(captureStartRes, {
    'capture start status is 200': (r) => r.status === 200,
    'capture job ID returned': (r) => {
      const body = JSON.parse(r.body);
      return body.data?.captureJobId !== undefined;
    },
  });

  if (!startCheck) {
    captureSuccessRate.add(false);
    console.log(`Failed to start capture: ${captureStartRes.body}`);
    return;
  }

  const captureJobId = JSON.parse(captureStartRes.body).data.captureJobId;
  console.log(`Capture job started: ${captureJobId}`);

  // Step 2: Poll for completion
  const result = pollCaptureStatus(captureJobId, 60000);

  // Record metrics
  captureCompletionTime.add(result.durationMs);
  captureSuccessRate.add(result.success);

  // Step 3: Verify results
  check(result, {
    'capture completed successfully': (r) => r.success === true,
    'captured 10,000+ messages': (r) => r.messagesCaptured >= 10000,
    'completed within 60 seconds': (r) => r.durationMs < 60000,
  });

  if (result.success) {
    console.log(`SUCCESS: Captured ${result.messagesCaptured} messages in ${result.durationMs}ms`);
  } else {
    console.log(`FAILED: ${result.error}`);
  }
}

export function handleSummary(data) {
  return {
    'tests/performance/results/discord-capture-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ' }),
  };
}

function textSummary(data, { indent = '' } = {}) {
  const checks = data.root_group?.checks || [];
  const metrics = data.metrics || {};

  let output = `
${indent}Discord Capture Performance Test Results
${indent}========================================

${indent}Thresholds:
${indent}  - Capture completion time (p95): ${metrics.capture_completion_time?.thresholds?.['p(95)<60000']?.ok ? 'PASS' : 'FAIL'}
${indent}  - API response time (p95): ${metrics.api_response_time?.thresholds?.['p(95)<500']?.ok ? 'PASS' : 'FAIL'}
${indent}  - Success rate: ${metrics.capture_success_rate?.thresholds?.['rate>0.95']?.ok ? 'PASS' : 'FAIL'}

${indent}Metrics:
${indent}  - Capture completion time (avg): ${metrics.capture_completion_time?.values?.avg?.toFixed(2) || 'N/A'}ms
${indent}  - Capture completion time (p95): ${metrics.capture_completion_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
${indent}  - API response time (avg): ${metrics.api_response_time?.values?.avg?.toFixed(2) || 'N/A'}ms
${indent}  - Success rate: ${(metrics.capture_success_rate?.values?.rate * 100 || 0).toFixed(2)}%
`;

  return output;
}
