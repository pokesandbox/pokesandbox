const sharedConfig = {
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
};

export default {
  displayName: 'bot',
  // Coverage options are global, so they sit here rather than in the projects.
  coverageDirectory: '../../coverage/apps/bot',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  projects: [
    {
      ...sharedConfig,
      displayName: 'bot:unit',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['\\.integration\\.test\\.ts$'],
    },
    {
      // Menus driven through MenuHarness; see src/testing/integrationSetup.ts
      ...sharedConfig,
      displayName: 'bot:integration',
      testMatch: ['<rootDir>/src/**/*.integration.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/testing/integrationSetup.ts'],
    },
  ],
};
