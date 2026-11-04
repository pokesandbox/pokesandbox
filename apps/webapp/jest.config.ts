/* eslint-disable */
export default {
  displayName: 'webapp',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  // Auth.js and its OAuth client ship ESM only, so Jest has to transform them.
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@auth/core|oauth4webapi)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/webapp',
};
