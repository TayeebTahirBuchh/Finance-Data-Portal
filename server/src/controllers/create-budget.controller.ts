import type { Request, Response } from "express";

import { createBudgetSchema } from "../validators/budget.validator.js";
import { createBudget } from "../services/budget.service.js";

export async function createBudgetController(
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

  const validation = createBudgetSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid budget details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const budget = await createBudget(
      workspaceId,
      validation.data
    );

    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "INVALID_BUDGET_CATEGORY"
    ) {
      res.status(400).json({
        error: "Budget must use an active expense category in this workspace",
      });
      return;
    }

    console.error("Budget creation error:", error);

    res.status(500).json({
      error: "Unable to create budget",
    });
  }
}
