module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 120000,
  globals: {
    'ts-jest': {
      tsconfig: { esModuleInterop: true, moduleResolution: 'node', target: 'ES2022', strict: true }
    }
  }
};