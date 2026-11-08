import { z } from "zod";

const SUPPORTED_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "AED", "SAR",
  "PKR", "BDT", "LKR", "NPR", "CAD", "AUD",
  "NZD", "SGD", "JPY", "CNY", "CHF", "HKD",
  "MYR", "ZAR", "TRY",
] as const;

export const createTransactionSchema = z.object({
  accountId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid account ID"
  ),

  type: z.enum(["INCOME", "EXPENSE"]),

  amountMinorUnits: z.number()
    .int("Amount must be a whole number in minor units")
    .positive("Amount must be greater than zero")
    .safe("Amount is too large"),

  currency: z.string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(SUPPORTED_CURRENCIES)),

  description: z.string()
    .trim()
    .max(250, "Description is too long")
    .optional(),

  categoryId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    .optional(),

  transactionDate: z.iso.datetime({
    message: "Enter a valid ISO date and time",
  }),

  notes: z.string()
    .trim()
    .max(1000, "Notes are too long")
    .optional(),
});

export type CreateTransactionInput =
  z.infer<typeof createTransactionSchema>;
