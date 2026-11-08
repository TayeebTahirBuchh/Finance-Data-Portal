
import type { Request, Response } from "express";

import { updateBudget } from "../services/update-budget.service.js";
import { updateBudgetSchema } from "../validators/update-budget.validator.js";

export async function updateBudgetController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;
  const budgetId = req.params.budgetId;

  if (!workspaceId || !budgetId) {
    res.status(400).json({
      error: "Workspace ID and budget ID are required",
    });
    return;
  }

  if (!/^[0-9a-fA-F]{24}$/.test(budgetId)) {
    res.status(400).json({
      error: "Invalid budget ID",
    });
    return;
  }

  const validation = updateBudgetSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid budget data",
      details: validation.error.flatten(),
    });
    return;
  }

  try {
    const budget = await updateBudget(
      workspaceId,
      budgetId,
      validation.data
    );

    res.status(200).json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BUDGET_NOT_FOUND") {
        res.status(404).json({
          error: "Budget not found or already archived",
        });
        return;
      }

      if (error.message === "INVALID_CATEGORY") {
        res.status(400).json({
          error: "Category must be an active expense category in this workspace",
        });
        return;
      }

      if (error.message === "INVALID_DATE_RANGE") {
        res.status(400).json({
          error: "Start date must be before or equal to end date",
        });
        return;
      }
    }

    console.error("Budget update error:", error);

    res.status(500).json({
      error: "Unable to update budget",
    });
  }
}
