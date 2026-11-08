import { z } from "zod";

const SUPPORTED_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "AED", "SAR", "PKR",
  "BDT", "LKR", "NPR", "CAD", "AUD", "NZD", "SGD",
  "JPY", "CNY", "CHF", "HKD", "MYR", "ZAR", "TRY",
] as const;

export const createBudgetSchema = z.object({
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),

  name: z.string()
    .trim()
    .min(2, "Budget name must contain at least 2 characters")
    .max(100, "Budget name cannot exceed 100 characters"),

  amountMinorUnits: z.number()
    .int()
    .positive()
    .safe(),

  currency: z.string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(SUPPORTED_CURRENCIES)),

  period: z.enum(["MONTHLY", "YEARLY"]),

  startDate: z.iso.datetime({
    message: "Enter a valid start date",
  }),

  endDate: z.iso.datetime({
    message: "Enter a valid end date",
  }),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
