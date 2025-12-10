// backend/jest.config.js
export default {
    testEnvironment: 'node',
    transform: {}, // Disable babel-jest or similar for plain ES Modules
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // For custom setup like mongo connection
    globalSetup: '<rootDir>/tests/globalSetup.js', // For global setup (e.g., starting MongoDB-Memory-Server)
    globalTeardown: '<rootDir>/tests/globalTeardown.js', // For global teardown
    // Enable Jest's ESM support
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^(\.{1,2}/.*)\.js$': '$1', // Helps with relative imports in ESM
    },
};
