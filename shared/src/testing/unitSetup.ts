// Runs before every test file (see jest.config.ts), so each test starts from
// blank mocks and spies never leak between tests.
afterEach(() => {
  jest.restoreAllMocks();
});
