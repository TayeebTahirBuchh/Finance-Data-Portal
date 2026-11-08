import { z } from "zod";

const supportedCurrencies = [
  "INR", "USD", "EUR", "GBP", "AED", "SAR",
  "PKR", "BDT", "LKR", "NPR", "CAD", "AUD",
  "NZD", "SGD", "JPY", "CNY", "CHF", "HKD",
  "MYR", "ZAR", "TRY",
] as const;

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(2).max(100),

  description: z.string().trim().max(500).optional(),

  targetAmountMinorUnits: z
    .number()
    .int()
    .positive()
    .safe(),

  currency: z.enum(supportedCurrencies),

  targetDate: z.iso.datetime().nullable().optional(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),

  description: z.string().trim().max(500).optional(),

  targetAmountMinorUnits: z
    .number()
    .int()
    .positive()
    .safe()
    .optional(),

  targetDate: z.iso.datetime().nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const contributeSavingsGoalSchema = z.object({
  amountMinorUnits: z
    .number()
    .int()
    .positive()
    .safe(),
});

export type CreateSavingsGoalInput =
  z.infer<typeof createSavingsGoalSchema>;

export type UpdateSavingsGoalInput =
  z.infer<typeof updateSavingsGoalSchema>;

export type ContributeSavingsGoalInput =
  z.infer<typeof contributeSavingsGoalSchema>;
