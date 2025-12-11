// backend/tests/globalSetup.js
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export default async function globalSetup() {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  
  // Set global variables so tests can access them
  global.__MONGO_URI__ = uri; // Use global instead of process.env for better Jest integration
  global.__MONGO_DB_NAME__ = mongo.instanceInfo.dbName;
  
  console.log(`MongoDB Memory Server started at: ${uri}`);
}
