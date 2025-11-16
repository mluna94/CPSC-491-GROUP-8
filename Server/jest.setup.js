// Setup file for Jest tests
require('dotenv').config({ path: '.env.test' });

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};