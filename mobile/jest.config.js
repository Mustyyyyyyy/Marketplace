module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 60000,
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, tsconfig: { esModuleInterop: true, moduleResolution: 'node', target: 'ES2022', jsx: 'react' } }] },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transformIgnorePatterns: ['/node_modules/(?!expo-constants|@react-native)'],
};
