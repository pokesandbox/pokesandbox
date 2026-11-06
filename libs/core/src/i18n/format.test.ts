import { formatMoney, formatNumber } from './format';

describe('formatNumber', () => {
  it("groups digits by the viewer's locale", () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(1234.5, 'de')).toBe('1.234,5');
  });

  it('passes Intl options through', () => {
    expect(formatNumber(0.25, 'en', { style: 'percent' })).toBe('25%');
  });
});

describe('formatMoney', () => {
  it('formats Pokédollars as whole numbers', () => {
    expect(formatMoney(1500, 'en')).toBe('₽1,500');
  });
});
