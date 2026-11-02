const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  // lcov feeds SonarCloud (see sonar-project.properties); text-summary prints in CI logs.
  coverageReporters: ['html', 'lcov', 'text-summary'],
};
