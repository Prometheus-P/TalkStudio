// backend/tests/globalTeardown.js
// No direct explicit stop needed for MongoMemoryServer in Jest 27+ as it cleans up on process exit.
// If globalSetup stores the instance, it would be accessed via `global.__MONGO_SERVER__`
// For simplicity, we rely on its automatic cleanup.
export default async function globalTeardown() {
  console.log('MongoDB Memory Server teardown completed (relying on automatic cleanup).');
}