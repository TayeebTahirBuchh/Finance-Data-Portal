import type { Request, Response } from "express";

import { listBudgets } from "../services/budget-list.service.js";

export async function budgetListController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;

  if (!workspaceId) {
    res.status(400).json({
      error: "Workspace ID is required",
    });
    return;
  }

  try {
    const budgets = await listBudgets(workspaceId);

    res.status(200).json({
      budgets,
    });
  } catch (error: unknown) {
    console.error("Budget listing error:", error);

    res.status(500).json({
      error: "Unable to retrieve budgets",
    });
  }
}
