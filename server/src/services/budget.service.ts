import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import type { CreateBudgetInput } from "../validators/budget.validator.js";

export async function createBudget(
  workspaceId: string,
  input: CreateBudgetInput
) {
  const category = await Category.findOne({
    _id: input.categoryId,
    workspaceId,
    type: "EXPENSE",
    isArchived: false,
  }).lean();

  if (!category) {
    throw new Error("INVALID_BUDGET_CATEGORY");
  }

  const budget = await Budget.create({
    workspaceId,
    categoryId: category._id,
    name: input.name,
    amountMinorUnits: input.amountMinorUnits,
    currency: input.currency,
    period: input.period,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
  });

  return {
    id: budget._id.toString(),
    categoryId: budget.categoryId.toString(),
    name: budget.name,
    amountMinorUnits: budget.amountMinorUnits,
    currency: budget.currency,
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    isArchived: budget.isArchived,
    createdAt: budget.createdAt,
  };
}
