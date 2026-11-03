import { shouldAutoIndex } from './connectDb';

describe('shouldAutoIndex', () => {
  it('is off in production only', () => {
    expect(shouldAutoIndex('production')).toBe(false);
    expect(shouldAutoIndex('development')).toBe(true);
    expect(shouldAutoIndex(undefined)).toBe(true);
  });
});
