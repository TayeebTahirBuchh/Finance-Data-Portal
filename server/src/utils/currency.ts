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
export function toMinorUnits(
  amount: number,
  currency: string
): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Invalid monetary amount");
  }

  const decimals = getCurrencyDecimals(currency);
  const multiplier = 10 ** decimals;

  if (Number(amount.toFixed(decimals)) !== amount) {
    throw new Error(
      `Amount cannot have more than ${decimals} decimal places`
    );
  }

  const minorUnits = Math.round(amount * multiplier);

  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error("Monetary amount is too large");
  }

  return minorUnits;
}

export function fromMinorUnits(
  minorUnits: number,
  currency: string
): number {
  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error("Invalid minor unit amount");
  }

  return minorUnits / getCurrencyMultiplier(currency);
}
