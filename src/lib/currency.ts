
export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "PKR",
  "BDT",
  "LKR",
  "NPR",
  "CAD",
  "AUD",
  "NZD",
  "SGD",
  "JPY",
  "CNY",
  "CHF",
  "HKD",
  "MYR",
  "ZAR",
  "TRY",
] as const;

export type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Returns the standard number of decimal places
 * used by a currency.
 */
export function getCurrencyDecimalPlaces(
  currency: string
): number {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    throw new Error(`Unsupported currency: ${currency}`);
  }
}

/**
 * Converts a normal monetary amount into minor units.
 * Example: INR 125.50 becomes 12550.
 */
export function toMinorUnits(
  amount: number,
  currency: string
): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Invalid monetary amount.");
  }

  const decimalPlaces = getCurrencyDecimalPlaces(currency);
  const multiplier = 10 ** decimalPlaces;
  const minorUnits = Math.round(amount * multiplier);

  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error("Monetary amount is too large.");
  }

  return minorUnits;
}

/**
 * Converts minor units back into a normal amount.
 * Example: 12550 becomes 125.50 INR.
 */
export function fromMinorUnits(
  amountMinorUnits: number,
  currency: string
): number {
  if (!Number.isSafeInteger(amountMinorUnits)) {
    throw new Error("Invalid minor-unit amount.");
  }

  const decimalPlaces = getCurrencyDecimalPlaces(currency);

  return amountMinorUnits / 10 ** decimalPlaces;
}

/**
 * Formats minor units as a currency value.
 */
export function formatCurrency(
  amountMinorUnits: number,
  currency: string,
  locale = "en-IN"
): string {
  const amount = fromMinorUnits(
    amountMinorUnits,
    currency
  );

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Checks whether a currency is supported by the portal.
 */
export function isSupportedCurrency(
  currency: string
): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(
    currency as SupportedCurrency
  );
}
