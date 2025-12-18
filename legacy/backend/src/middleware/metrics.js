// backend/src/middleware/metrics.js
// Request metrics collection middleware (NFR-9)

/**
 * In-memory metrics store
 * In production, consider using Prometheus client or external metrics service
 */
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byPath: {},
    byStatus: {},
  },
  latency: {
    samples: [],
    maxSamples: 1000, // Rolling window
  },
  startTime: Date.now(),
};

/**
 * Record a request metric
 */
const recordRequest = (method, path, statusCode, durationMs) => {
  // Total requests
  metrics.requests.total++;

  // By method
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;

  // By path (normalize to avoid cardinality explosion)
  const normalizedPath = normalizePath(path);
  metrics.requests.byPath[normalizedPath] = (metrics.requests.byPath[normalizedPath] || 0) + 1;

  // By status code category
  const statusCategory = `${Math.floor(statusCode / 100)}xx`;
  metrics.requests.byStatus[statusCategory] = (metrics.requests.byStatus[statusCategory] || 0) + 1;

  // Latency samples (rolling window)
  metrics.latency.samples.push(durationMs);
  if (metrics.latency.samples.length > metrics.latency.maxSamples) {
    metrics.latency.samples.shift();
  }
};

/**
 * Normalize path to avoid high cardinality
 * e.g., /users/123 -> /users/:id
 */
const normalizePath = (path) => {
  return path
    .replace(/\/[0-9a-fA-F-]{24,}/g, '/:id') // MongoDB ObjectId
    .replace(/\/\d+/g, '/:id') // Numeric IDs
    .split('?')[0]; // Remove query string
};

/**
 * Calculate latency percentiles
 */
const calculatePercentiles = (samples) => {
  if (samples.length === 0) {
    return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const len = sorted.length;

  return {
    p50: sorted[Math.floor(len * 0.5)] || 0,
    p90: sorted[Math.floor(len * 0.9)] || 0,
    p95: sorted[Math.floor(len * 0.95)] || 0,
    p99: sorted[Math.floor(len * 0.99)] || 0,
    avg: Math.round((samples.reduce((a, b) => a + b, 0) / len) * 100) / 100,
  };
};

/**
 * Metrics collection middleware
 */
export const metricsMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  // Override res.send to capture metrics
  const originalSend = res.send;
  res.send = function (body) {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    recordRequest(req.method, req.path, res.statusCode, durationMs);

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Get current metrics snapshot
 */
export const getMetrics = () => {
  const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
  const latencyStats = calculatePercentiles(metrics.latency.samples);

  return {
    uptime_seconds: uptimeSeconds,
    requests: {
      total: metrics.requests.total,
      by_method: metrics.requests.byMethod,
      by_path: metrics.requests.byPath,
      by_status: metrics.requests.byStatus,
    },
    latency_ms: latencyStats,
    memory: {
      heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      heap_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
    },
  };
};

/**
 * Get metrics in Prometheus format
 */
export const getPrometheusMetrics = () => {
  const m = getMetrics();
  const lines = [];

  // Uptime
  lines.push('# HELP talkstudio_uptime_seconds Server uptime in seconds');
  lines.push('# TYPE talkstudio_uptime_seconds counter');
  lines.push(`talkstudio_uptime_seconds ${m.uptime_seconds}`);

  // Total requests
  lines.push('# HELP talkstudio_requests_total Total number of requests');
  lines.push('# TYPE talkstudio_requests_total counter');
  lines.push(`talkstudio_requests_total ${m.requests.total}`);

  // Requests by method
  lines.push('# HELP talkstudio_requests_by_method Requests by HTTP method');
  lines.push('# TYPE talkstudio_requests_by_method counter');
  for (const [method, count] of Object.entries(m.requests.by_method)) {
    lines.push(`talkstudio_requests_by_method{method="${method}"} ${count}`);
  }

  // Requests by status
  lines.push('# HELP talkstudio_requests_by_status Requests by status code category');
  lines.push('# TYPE talkstudio_requests_by_status counter');
  for (const [status, count] of Object.entries(m.requests.by_status)) {
    lines.push(`talkstudio_requests_by_status{status="${status}"} ${count}`);
  }

  // Latency
  lines.push('# HELP talkstudio_request_duration_ms Request latency in milliseconds');
  lines.push('# TYPE talkstudio_request_duration_ms summary');
  lines.push(`talkstudio_request_duration_ms{quantile="0.5"} ${m.latency_ms.p50}`);
  lines.push(`talkstudio_request_duration_ms{quantile="0.9"} ${m.latency_ms.p90}`);
  lines.push(`talkstudio_request_duration_ms{quantile="0.95"} ${m.latency_ms.p95}`);
  lines.push(`talkstudio_request_duration_ms{quantile="0.99"} ${m.latency_ms.p99}`);

  // Memory
  lines.push('# HELP talkstudio_memory_heap_used_mb Heap memory used in MB');
  lines.push('# TYPE talkstudio_memory_heap_used_mb gauge');
  lines.push(`talkstudio_memory_heap_used_mb ${m.memory.heap_used_mb}`);

  return lines.join('\n');
};

export default metricsMiddleware;
