// backend/src/api/metrics_routes.js
// Metrics API endpoints (NFR-9)

import { Router } from 'express';
import { getMetrics, getPrometheusMetrics } from '../middleware/metrics.js';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get server metrics in JSON format
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Server metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime_seconds:
 *                   type: number
 *                 requests:
 *                   type: object
 *                 latency_ms:
 *                   type: object
 *                 memory:
 *                   type: object
 */
router.get('/', (req, res) => {
  const metrics = getMetrics();
  res.json(metrics);
});

/**
 * @swagger
 * /metrics/prometheus:
 *   get:
 *     summary: Get server metrics in Prometheus format
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Prometheus-compatible metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/prometheus', (req, res) => {
  const metrics = getPrometheusMetrics();
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});

/**
 * @swagger
 * /metrics/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
