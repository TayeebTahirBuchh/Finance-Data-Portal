
import { z } from "zod";

const currencyCodes = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "SGD",
  "JPY",
  "CNY",
  "CHF",
  "NZD",
  "HKD",
  "SEK",
  "NOK",
  "DKK",
  "ZAR",
  "BDT",
  "PKR",
  "LKR",
] as const;

export const updateBudgetSchema = z
  .object({
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
      .optional(),

    name: z
      .string()
      .trim()
      .min(1, "Budget name is required")
      .max(80, "Budget name is too long")
      .optional(),

    amountMinorUnits: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER)
      .optional(),

    currency: z.enum(currencyCodes).optional(),

    period: z.enum(["MONTHLY", "YEARLY"]).optional(),

    startDate: z
      .string()
      .datetime({ offset: true })
      .optional(),

    endDate: z
      .string()
      .datetime({ offset: true })
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  )
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.startDate) <= new Date(data.endDate),
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

export type UpdateBudgetInput = z.infer<
  typeof updateBudgetSchema
>;
