
import { z } from "zod";

const SUPPORTED_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "AED", "SAR",
  "PKR", "BDT", "LKR", "NPR", "CAD", "AUD",
  "NZD", "SGD", "JPY", "CNY", "CHF", "HKD",
  "MYR", "ZAR", "TRY",
] as const;

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Account name must contain at least 2 characters")
    .max(100, "Account name cannot exceed 100 characters"),

  type: z.enum([
    "CASH",
    "BANK",
    "SAVINGS",
    "CURRENT",
    "CREDIT_CARD",
    "WALLET",
    "INVESTMENT",
    "OTHER",
  ]),

  currency: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(SUPPORTED_CURRENCIES)),

  openingBalanceMinorUnits: z
    .number()
    .int("Opening balance must be a whole number in minor units")
    .safe("Opening balance is too large"),

  institution: z
    .string()
    .trim()
    .max(100, "Institution name is too long")
    .optional(),

  lastFourDigits: z
    .string()
    .regex(/^\d{4}$/, "Enter exactly four digits")
    .optional(),
});

export type CreateAccountInput = z.infer<
  typeof createAccountSchema
>;
