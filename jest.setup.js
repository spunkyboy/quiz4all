// jest.setup.js 
require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

// Connect to test database
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up collections between test files (not drop the entire DB)
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
});


//after this setup this code was add to package.json so that question.test.js and auth.tes.js uses one direct route
// "jest": {
//   "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
//   "testEnvironment": "node"
// }