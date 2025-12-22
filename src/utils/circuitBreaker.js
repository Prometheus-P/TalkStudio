/**
 * TalkStudio - Circuit Breaker Pattern
 * Prevents cascade failures by temporarily blocking requests to failing services.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failures exceeded threshold, requests are blocked
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 */

const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  /**
   * @param {Object} options Configuration options
   * @param {number} options.failureThreshold - Failures before opening (default: 5)
   * @param {number} options.resetTimeout - Time in ms before trying half-open (default: 30000)
   * @param {number} options.halfOpenRequests - Requests allowed in half-open (default: 1)
   * @param {Function} options.onStateChange - Callback when state changes
   * @param {Function} options.onFailure - Callback on request failure
   * @param {string} options.name - Circuit breaker name for logging
   */
  constructor(options = {}) {
    this.name = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenRequests = options.halfOpenRequests || 1;
    this.onStateChange = options.onStateChange || null;
    this.onFailure = options.onFailure || null;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }

  /**
   * Get current circuit state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Check if circuit allows requests
   */
  canRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this._transitionTo(CircuitState.HALF_OPEN);
        return true;
      }
      return false;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      return this.halfOpenAttempts < this.halfOpenRequests;
    }

    return false;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of the function
   * @throws {CircuitOpenError} When circuit is open
   */
  async call(fn) {
    if (!this.canRequest()) {
      const error = new CircuitOpenError(
        `Circuit ${this.name} is OPEN. Retry after ${this._getRemainingTimeout()}ms`,
        this._getRemainingTimeout()
      );
      throw error;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onError(error);
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  _onSuccess() {
    this.successCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      // Service recovered, close the circuit
      this._transitionTo(CircuitState.CLOSED);
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed request
   */
  _onError(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.onFailure) {
      this.onFailure(error, this.getState());
    }

    if (this.state === CircuitState.HALF_OPEN) {
      // Service still failing, reopen circuit
      this._transitionTo(CircuitState.OPEN);
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.failureThreshold
    ) {
      // Threshold exceeded, open circuit
      this._transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Transition to new state
   */
  _transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;

    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts = 0;
    }

    console.log(`[${this.name}] State: ${oldState} -> ${newState}`);

    if (this.onStateChange) {
      this.onStateChange(oldState, newState, this.getState());
    }
  }

  /**
   * Get remaining timeout before circuit tries half-open
   */
  _getRemainingTimeout() {
    if (this.state !== CircuitState.OPEN || !this.lastFailureTime) {
      return 0;
    }
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.resetTimeout - elapsed);
  }

  /**
   * Manually reset the circuit breaker
   */
  reset() {
    this._transitionTo(CircuitState.CLOSED);
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Force circuit to open state (for testing or manual intervention)
   */
  trip() {
    this.lastFailureTime = Date.now();
    this._transitionTo(CircuitState.OPEN);
  }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message, retryAfter = 0) {
    super(message);
    this.name = 'CircuitOpenError';
    this.retryAfter = retryAfter;
    this.isCircuitOpen = true;
  }
}

/**
 * Create a circuit breaker wrapped function
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Circuit breaker options
 * @returns {Function} Wrapped function with circuit breaker
 */
export const withCircuitBreaker = (fn, options = {}) => {
  const breaker = new CircuitBreaker(options);

  const wrapped = async (...args) => {
    return breaker.call(() => fn(...args));
  };

  // Expose circuit breaker for monitoring
  wrapped.circuitBreaker = breaker;
  wrapped.getState = () => breaker.getState();
  wrapped.reset = () => breaker.reset();

  return wrapped;
};

/**
 * Circuit breaker registry for managing multiple circuits
 */
class CircuitBreakerRegistry {
  constructor() {
    this.circuits = new Map();
  }

  /**
   * Get or create a circuit breaker
   */
  get(name, options = {}) {
    if (!this.circuits.has(name)) {
      this.circuits.set(
        name,
        new CircuitBreaker({ ...options, name })
      );
    }
    return this.circuits.get(name);
  }

  /**
   * Get all circuit states
   */
  getAll() {
    const states = {};
    for (const [name, circuit] of this.circuits) {
      states[name] = circuit.getState();
    }
    return states;
  }

  /**
   * Reset all circuits
   */
  resetAll() {
    for (const circuit of this.circuits.values()) {
      circuit.reset();
    }
  }
}

// Global registry singleton
export const circuitRegistry = new CircuitBreakerRegistry();

// Pre-configured circuit breakers for common use cases
export const apiCircuit = circuitRegistry.get('api', {
  failureThreshold: 5,
  resetTimeout: 30000,
  onStateChange: (oldState, newState) => {
    if (newState === CircuitState.OPEN) {
      console.warn('[API] Circuit opened - API calls will be blocked');
    } else if (newState === CircuitState.CLOSED) {
      console.log('[API] Circuit closed - API calls resumed');
    }
  },
});

export const aiCircuit = circuitRegistry.get('ai', {
  failureThreshold: 3,
  resetTimeout: 60000, // Longer timeout for AI services
  onStateChange: (oldState, newState) => {
    if (newState === CircuitState.OPEN) {
      console.warn('[AI] Circuit opened - AI generation will be blocked');
    }
  },
});

export default {
  CircuitBreaker,
  CircuitOpenError,
  withCircuitBreaker,
  circuitRegistry,
  apiCircuit,
  aiCircuit,
};
