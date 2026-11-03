import { MenuHarness } from '@flowcord/testing';

// Runs before every *.integration.test.ts (see jest.config.ts), so each test
// starts from blank mocks and never leaves a menu session running.
beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

afterEach(async () => {
  await MenuHarness.endAll();
});
