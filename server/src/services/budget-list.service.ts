import Budget from "../models/Budget.js";

export async function listBudgets(workspaceId: string) {
  const budgets = await Budget.find({
    workspaceId,
    isArchived: false,
  })
    .populate("categoryId", "name type")
    .sort({ startDate: -1, createdAt: -1 })
    .lean();

  return budgets.map((budget) => {
    const category = budget.categoryId as unknown as {
      _id: { toString(): string };
      name: string;
      type: string;
    } | null;

    return {
      id: budget._id.toString(),
      category: category
        ? {
            id: category._id.toString(),
            name: category.name,
            type: category.type,
          }
        : null,
      name: budget.name,
      amountMinorUnits: budget.amountMinorUnits,
      currency: budget.currency,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      createdAt: budget.createdAt,
    };
  });
}
