// backend/tests/setup.js
// This file runs after the test environment is set up but before individual test files.
// For example, if you need custom matchers or helper functions for all tests.

// Custom Jest matchers for dates, e.g., to check if one date is after another
expect.extend({
  toBeAfter(received, argument) {
    const pass = received.getTime() > argument.getTime();
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be after ${argument}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be after ${argument}`,
        pass: false,
      };
    }
  },
});
