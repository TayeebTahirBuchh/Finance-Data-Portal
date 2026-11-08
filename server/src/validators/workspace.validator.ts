
import { z } from "zod";

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
    .regex(/^[A-Z]{3}$/, "Currency must be a valid 3-letter code"),

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
