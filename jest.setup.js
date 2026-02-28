// jest.setup.js
// jest.setup.js
require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.TEST_DB_URI); // no deprecated options
});

afterEach(async () => {
  // Clean all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Drop the DB and disconnect
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

//after this setup this code was add to package.json so that question.test.js and auth.tes.js uses one direct route
// "jest": {
//   "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
//   "testEnvironment": "node"
// }