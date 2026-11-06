/* eslint-disable */
export default {
  displayName: 'battle',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/battle',
  // Types only until BattleService lands in M1.
  passWithNoTests: true,
};
