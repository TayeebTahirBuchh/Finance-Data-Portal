
import mongoose from "mongoose";

import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";
import Category from "../models/Category.js";

import type { CreateWorkspaceInput } from "../validators/workspace.validator.js";

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "INCOME" },
  { name: "Freelancing", type: "INCOME" },
  { name: "Business", type: "INCOME" },
  { name: "Investments", type: "INCOME" },
  { name: "Other Income", type: "INCOME" },

  { name: "Food", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Transport", type: "EXPENSE" },
  { name: "Rent", type: "EXPENSE" },
  { name: "Bills", type: "EXPENSE" },
  { name: "Education", type: "EXPENSE" },
  { name: "Healthcare", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Other Expense", type: "EXPENSE" },
] as const;

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput
) {
  const dbSession = await mongoose.startSession();

  try {
    let result:
      | { workspaceId: string; name: string }
      | undefined;

    await dbSession.withTransaction(async () => {
      const [workspace] = await Workspace.create(
        [
          {
            name: input.name,
            type: input.type,
            ownerId: userId,
            baseCurrency: input.baseCurrency,
            timezone: input.timezone,
          },
        ],
        { session: dbSession }
      );

      if (!workspace) {
        throw new Error("Failed to create workspace");
      }

      await Membership.create(
        [
          {
            userId,
            workspaceId: workspace._id,
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session: dbSession }
      );

      await Category.insertMany(
        DEFAULT_CATEGORIES.map((category) => ({
          workspaceId: workspace._id,
          name: category.name,
          type: category.type,
          isDefault: true,
        })),
        { session: dbSession }
      );

      result = {
        workspaceId: workspace._id.toString(),
        name: workspace.name,
      };
    });

    if (!result) {
      throw new Error("Workspace creation failed");
    }

    return result;
  } finally {
    await dbSession.endSession();
  }
}
