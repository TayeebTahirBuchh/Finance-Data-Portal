

import { z } from "zod";

const SUPPORTED_CURRENCIES = [
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

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must contain at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  type: z.enum(["PERSONAL", "BUSINESS"]),

  baseCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(SUPPORTED_CURRENCIES)),

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(100, "Timezone is too long")
    .refine(
      (value) => {
        try {
          Intl.DateTimeFormat("en-US", {
            timeZone: value,
          });
          return true;
        } catch {
          return false;
        }
      },
      "Enter a valid timezone"
    ),
});

export type CreateWorkspaceInput = z.infer<
  typeof createWorkspaceSchema
>;
