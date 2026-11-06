import { t } from './translate';

/** A number in the viewer's locale, e.g. `1,234` in `en`, `1.234` in `de`. */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/** In-game money (Pokédollars), e.g. `₽1,234`. */
export function formatMoney(amount: number, locale: string): string {
  return t('money.amount', { amount }, locale);
}
