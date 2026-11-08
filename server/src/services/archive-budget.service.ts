import Budget from "../models/Budget.js";

export async function archiveBudget(
  workspaceId: string,
  budgetId: string
) {
  const budget = await Budget.findOneAndUpdate(
    {
      _id: budgetId,
      workspaceId,
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!budget) {
    throw new Error("BUDGET_NOT_FOUND");
  }

  return {
    id: budget._id.toString(),
    name: budget.name,
    isArchived: budget.isArchived,
  };
}
