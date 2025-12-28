/**
 * Circuit Breaker Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CircuitBreaker,
  CircuitOpenError,
  withCircuitBreaker,
  circuitRegistry,
} from './circuitBreaker';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // CircuitBreaker Class
  // ============================================
  describe('CircuitBreaker', () => {
    it('should initialize with default options', () => {
      const breaker = new CircuitBreaker();
      const state = breaker.getState();
      expect(state.state).toBe('CLOSED');
      expect(state.failureCount).toBe(0);
    });

    it('should initialize with custom options', () => {
      const breaker = new CircuitBreaker({
        name: 'test',
        failureThreshold: 3,
        resetTimeout: 10000,
      });
      expect(breaker.name).toBe('test');
      expect(breaker.failureThreshold).toBe(3);
    });

    it('should allow requests when closed', () => {
      const breaker = new CircuitBreaker();
      expect(breaker.canRequest()).toBe(true);
    });

    it('should execute successful calls', async () => {
      const breaker = new CircuitBreaker();
      const result = await breaker.call(() => Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('should track failure count', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 5 });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(breaker.getState().failureCount).toBe(1);
    });

    it('should open circuit after threshold', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 2 });

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.call(() => Promise.reject(new Error('fail')));
        } catch {
          // Expected
        }
      }

      expect(breaker.getState().state).toBe('OPEN');
    });

    it('should block requests when open', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1 });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(breaker.canRequest()).toBe(false);
    });

    it('should throw CircuitOpenError when open', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1 });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      await expect(breaker.call(() => Promise.resolve())).rejects.toThrow(CircuitOpenError);
    });

    it('should transition to half-open after timeout', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000,
      });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      vi.advanceTimersByTime(1000);
      expect(breaker.canRequest()).toBe(true);
      expect(breaker.getState().state).toBe('HALF_OPEN');
    });

    it('should close circuit on successful half-open request', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000,
      });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      vi.advanceTimersByTime(1000);
      await breaker.call(() => Promise.resolve('success'));

      expect(breaker.getState().state).toBe('CLOSED');
    });

    it('should reopen circuit on half-open failure', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000,
      });

      try {
        await breaker.call(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      vi.advanceTimersByTime(1000);

      try {
        await breaker.call(() => Promise.reject(new Error('fail again')));
      } catch {
        // Expected
      }

      expect(breaker.getState().state).toBe('OPEN');
    });

    it('should reset circuit', () => {
      const breaker = new CircuitBreaker();
      breaker.trip();
      expect(breaker.getState().state).toBe('OPEN');

      breaker.reset();
      expect(breaker.getState().state).toBe('CLOSED');
    });

    it('should trip circuit manually', () => {
      const breaker = new CircuitBreaker();
      breaker.trip();
      expect(breaker.getState().state).toBe('OPEN');
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        onStateChange,
      });

      breaker.trip();
      expect(onStateChange).toHaveBeenCalledWith('CLOSED', 'OPEN', expect.any(Object));
    });

    it('should call onFailure callback', async () => {
      const onFailure = vi.fn();
      const breaker = new CircuitBreaker({ onFailure });

      try {
        await breaker.call(() => Promise.reject(new Error('test')));
      } catch {
        // Expected
      }

      expect(onFailure).toHaveBeenCalled();
    });
  });

  // ============================================
  // CircuitOpenError
  // ============================================
  describe('CircuitOpenError', () => {
    it('should create error with retry after', () => {
      const error = new CircuitOpenError('test', 5000);
      expect(error.message).toBe('test');
      expect(error.name).toBe('CircuitOpenError');
      expect(error.retryAfter).toBe(5000);
      expect(error.isCircuitOpen).toBe(true);
    });
  });

  // ============================================
  // withCircuitBreaker
  // ============================================
  describe('withCircuitBreaker', () => {
    it('should wrap function with circuit breaker', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const wrapped = withCircuitBreaker(fn);

      const result = await wrapped();
      expect(result).toBe('result');
    });

    it('should expose circuit breaker state', () => {
      const wrapped = withCircuitBreaker(() => Promise.resolve());
      expect(wrapped.getState()).toBeDefined();
      expect(wrapped.getState().state).toBe('CLOSED');
    });

    it('should expose reset method', () => {
      const wrapped = withCircuitBreaker(() => Promise.resolve());
      expect(typeof wrapped.reset).toBe('function');
    });
  });

  // ============================================
  // CircuitBreakerRegistry
  // ============================================
  describe('circuitRegistry', () => {
    it('should get or create circuit', () => {
      const circuit = circuitRegistry.get('test-circuit');
      expect(circuit).toBeInstanceOf(CircuitBreaker);
    });

    it('should return same circuit for same name', () => {
      const circuit1 = circuitRegistry.get('same-name');
      const circuit2 = circuitRegistry.get('same-name');
      expect(circuit1).toBe(circuit2);
    });

    it('should get all circuit states', () => {
      circuitRegistry.get('circuit-a');
      circuitRegistry.get('circuit-b');
      const states = circuitRegistry.getAll();
      expect(states['circuit-a']).toBeDefined();
      expect(states['circuit-b']).toBeDefined();
    });

    it('should reset all circuits', () => {
      const circuitA = circuitRegistry.get('reset-a');
      const circuitB = circuitRegistry.get('reset-b');
      circuitA.trip();
      circuitB.trip();

      circuitRegistry.resetAll();

      expect(circuitA.getState().state).toBe('CLOSED');
      expect(circuitB.getState().state).toBe('CLOSED');
    });
  });
});
