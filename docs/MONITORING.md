# Monitoring Strategy

This document defines the monitoring and observability strategy for the Discord-Upstage integration feature.

## Logging

### Application Logs
- **Backend (Node.js)**: Winston with JSON format
- **AI Agent System (Python)**: structlog with JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG

### Log Aggregation
- Development: Console output
- Production: CloudWatch Logs (AWS) or ELK Stack (self-hosted)

## Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Discord capture throughput | 10,000 msg/min | < 5,000 msg/min |
| API response time (p95) | < 200ms | > 500ms |
| Intent analysis latency | < 2s | > 5s |
| Upstage API call duration | < 3s | > 10s |
| Error rate | < 1% | > 5% |

### Infrastructure Metrics
- CPU utilization
- Memory usage
- Database connection pool
- Queue depth (if using message queue)

## Alerts

### Critical Alerts (Page immediately)
- Service down (health check failure)
- Database connection failure
- Discord bot disconnection
- Error rate > 10% over 5 minutes

### Warning Alerts (Notify during business hours)
- Error rate > 5% over 5 minutes
- Capture job failure
- Upstage API quota > 80%
- Response time p95 > 500ms

## Health Checks

### Endpoints
- `GET /health` - Basic liveness check
- `GET /health/ready` - Readiness check (DB, external services)

### External Service Checks
- Discord API connectivity
- Upstage API connectivity
- Database connection

## Dashboards

### Recommended Panels
1. Request rate and error rate over time
2. Response time percentiles (p50, p95, p99)
3. Discord capture job status
4. Upstage API usage and cost tracking
5. Active connections and queue depth

## Cost Monitoring

### Upstage API
- Track tokens used per request
- Daily/monthly spend aggregation
- Alert at 80% of budget threshold

### Infrastructure
- Compute costs
- Database storage
- Network egress
