# Performance Optimization Notes - Discord-Upstage Integration

**Feature**: 001-discord-upstage-integration
**Date**: 2025-12-11

## 1. Performance Requirements

| Metric | Target | Current Status |
|--------|--------|----------------|
| Message Capture (10K) | < 60 seconds | Pending validation |
| API Response Time (p95) | < 500ms | Pending validation |
| Capture Success Rate | > 95% | Pending validation |

## 2. Current Architecture Performance Characteristics

### Discord Message Capture

**Bottlenecks Identified:**
1. Discord API rate limits (50 requests/second)
2. Sequential message fetching
3. Database write operations

**Optimizations Implemented:**
- Exponential backoff for rate limit handling
- Batch database inserts (configurable batch size)
- Progress tracking with incremental updates

**Recommended Improvements:**
```python
# Current: Sequential fetch
messages = await channel.history(limit=limit).flatten()

# Recommended: Streaming with batch processing
async for message in channel.history(limit=limit):
    batch.append(message)
    if len(batch) >= BATCH_SIZE:
        await process_batch(batch)
        batch = []
```

### Intent Analysis (NLP Processing)

**Bottlenecks Identified:**
1. Model loading time (cold start)
2. Sequential processing of messages
3. Memory usage for large batches

**Optimizations Implemented:**
- Model caching (singleton pattern)
- Batch processing support

**Recommended Improvements:**
- [ ] Implement async processing queue
- [ ] Add model warm-up on service start
- [ ] Consider GPU acceleration for production

### Upstage API Integration

**Bottlenecks Identified:**
1. Network latency to API
2. Token generation time for long content
3. Rate limits on API calls

**Optimizations Implemented:**
- Retry logic with exponential backoff
- Usage tracking for cost management

**Recommended Improvements:**
- [ ] Implement response caching for similar prompts
- [ ] Add request queuing for burst traffic
- [ ] Consider async generation with webhooks

## 3. Database Performance

### MongoDB Indexes

**Recommended Indexes:**
```javascript
// Discord Messages Collection
db.discord_messages.createIndex({ captureJobId: 1 })
db.discord_messages.createIndex({ channelId: 1, timestamp: -1 })
db.discord_messages.createIndex({ serverId: 1, createdAt: -1 })

// Intent Analysis Results Collection
db.intent_analysis_results.createIndex({ discordMessageId: 1 })
db.intent_analysis_results.createIndex({ intent: 1, confidence: -1 })

// Generated Content Collection
db.generated_content.createIndex({ intentAnalysisId: 1 })
db.generated_content.createIndex({ contentType: 1, createdAt: -1 })

// Discord Configs Collection
db.discord_configs.createIndex({ serverId: 1 }, { unique: true })
```

### Query Optimization

**Current Issues:**
- Missing pagination on list endpoints
- No query result caching
- Full document fetches

**Recommendations:**
1. Add cursor-based pagination
2. Implement Redis caching layer
3. Use projection for partial document fetches

## 4. Frontend Performance

### Component Optimization

**Recommendations:**
- [ ] Implement virtualized lists for large message sets
- [ ] Add React.memo for pure components
- [ ] Lazy load Discord integration components

### API Call Optimization

**Recommendations:**
- [ ] Add request debouncing for search/filter
- [ ] Implement SWR or React Query for caching
- [ ] Add optimistic updates for better UX

## 5. Scalability Considerations

### Horizontal Scaling

**Backend API:**
- Stateless design allows horizontal scaling
- Load balancer ready (no session affinity needed)
- Consider containerization (Docker)

**AI Agent System:**
- Can run as separate microservice
- Message queue integration (Redis/RabbitMQ) recommended
- Consider worker pool for parallel processing

### Vertical Scaling Limits

| Component | Limit Factor | Recommendation |
|-----------|--------------|----------------|
| Discord Capture | API rate limits | Multiple bot tokens |
| NLP Processing | CPU/Memory | GPU acceleration |
| Upstage API | API quotas | Caching, queuing |
| MongoDB | Connection pool | Connection pooling |

## 6. Performance Testing

### k6 Test Configuration

Test file: `tests/performance/discord-capture-load-test.js`

**Test Scenarios:**
1. Single capture job with 10K messages
2. Concurrent capture status polling
3. API response time under load

**Running Tests:**
```bash
# Install k6
brew install k6

# Run performance test
k6 run tests/performance/discord-capture-load-test.js

# With custom parameters
k6 run -e BASE_URL=http://localhost:3000 \
       -e CONFIG_ID=your_config_id \
       tests/performance/discord-capture-load-test.js
```

### Expected Results

| Metric | Threshold | Pass Criteria |
|--------|-----------|---------------|
| capture_completion_time | p95 < 60s | 95% of captures complete in under 60s |
| api_response_time | p95 < 500ms | 95% of API calls respond in under 500ms |
| capture_success_rate | > 95% | At least 95% success rate |

## 7. Monitoring & Alerting

### Key Metrics to Monitor

**Backend:**
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database connection pool usage
- Memory and CPU usage

**AI Agent System:**
- Message capture rate
- NLP processing time
- Upstage API call latency
- Error rates by operation type

**Alerts to Configure:**
- Capture job taking > 120 seconds
- API error rate > 5%
- Database connection pool exhaustion
- Memory usage > 80%

## 8. Action Items

### Immediate (Before Production)
- [ ] Create MongoDB indexes
- [ ] Add pagination to list endpoints
- [ ] Run performance test suite
- [ ] Configure monitoring dashboards

### Short-term (Post-MVP)
- [ ] Implement Redis caching
- [ ] Add async job processing queue
- [ ] Optimize NLP model loading
- [ ] Frontend virtualization

### Long-term (Scale Phase)
- [ ] Multi-region deployment
- [ ] GPU-accelerated NLP
- [ ] CDN for static assets
- [ ] Database sharding strategy
