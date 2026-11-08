
import mongoose from "mongoose";

import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import type { UpdateBudgetInput } from "../validators/update-budget.validator.js";

export async function updateBudget(
  workspaceId: string,
  budgetId: string,
  input: UpdateBudgetInput
) {
  const existingBudget = await Budget.findOne({
    _id: budgetId,
    workspaceId,
    isArchived: false,
  }).lean();

  if (!existingBudget) {
    throw new Error("BUDGET_NOT_FOUND");
  }

  if (input.categoryId) {
    const category = await Category.findOne({
      _id: input.categoryId,
      workspaceId,
      type: "EXPENSE",
      isArchived: false,
    }).lean();

    if (!category) {
      throw new Error("INVALID_CATEGORY");
    }
  }

  const startDate = input.startDate
    ? new Date(input.startDate)
    : existingBudget.startDate;

  const endDate = input.endDate
    ? new Date(input.endDate)
    : existingBudget.endDate;

  if (startDate > endDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const updateData = {
    ...input,
    startDate,
    endDate,
  };

  const budget = await Budget.findOneAndUpdate(
    {
      _id: budgetId,
      workspaceId,
      isArchived: false,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("categoryId", "name type")
    .lean();

  if (!budget) {
    throw new Error("BUDGET_NOT_FOUND");
  }

  const category = budget.categoryId;

  return {
    id: budget._id.toString(),
    workspaceId: budget.workspaceId.toString(),
    category:
      category && typeof category === "object" && "_id" in category
        ? {
            id: String(category._id),
            name: "name" in category ? category.name : "",
            type: "type" in category ? category.type : "",
          }
        : null,
    name: budget.name,
    amountMinorUnits: budget.amountMinorUnits,
    currency: budget.currency,
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    isArchived: budget.isArchived,
  };
}
