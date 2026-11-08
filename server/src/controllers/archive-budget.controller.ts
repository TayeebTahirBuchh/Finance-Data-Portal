import type { Request, Response } from "express";

import { archiveBudget } from "../services/archive-budget.service.js";

export async function archiveBudgetController(
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

  try {
    const budget = await archiveBudget(
      workspaceId,
      budgetId
    );

    res.status(200).json({
      message: "Budget archived successfully",
      budget,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "BUDGET_NOT_FOUND"
    ) {
      res.status(404).json({
        error: "Budget not found or already archived",
      });
      return;
    }

    console.error("Budget archive error:", error);

    res.status(500).json({
      error: "Unable to archive budget",
    });
  }
}
