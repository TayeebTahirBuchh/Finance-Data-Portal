const CURRENCY_DECIMALS: Record<string, number> = {
  INR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  SAR: 2,
  PKR: 2,
  BDT: 2,
  LKR: 2,
  NPR: 2,
  CAD: 2,
  AUD: 2,
  NZD: 2,
  SGD: 2,
  JPY: 0,
  CNY: 2,
  CHF: 2,
  HKD: 2,
  MYR: 2,
  ZAR: 2,
  TRY: 2,
};

export function getCurrencyDecimals(currency: string): number {
  const decimals = CURRENCY_DECIMALS[currency.toUpperCase()];

  if (decimals === undefined) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return decimals;
}

export function getCurrencyMultiplier(currency: string): number {
  return 10 ** getCurrencyDecimals(currency);
}
