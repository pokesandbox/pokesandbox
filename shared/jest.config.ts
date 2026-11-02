/* eslint-disable */
export default {
  displayName: 'shared',
  preset: '../jest.preset.js',
  // No unit tests yet; remove once the first spec lands.
  passWithNoTests: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/shared',
};
