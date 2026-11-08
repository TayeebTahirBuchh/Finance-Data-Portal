import type { Request, Response } from "express";
import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from "../services/savings-goal.service.js";
import {
  contributeSavingsGoalSchema,
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
} from "../validators/savings-goal.validator.js";

function handleError(error: unknown, res: Response) {
  const message =
    error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";

  const status =
    message === "SAVINGS_GOAL_NOT_FOUND" ? 404 :
    message === "TARGET_BELOW_SAVED_AMOUNT" ||
    message === "SAVINGS_GOAL_ALREADY_COMPLETED" ||
    message === "CONTRIBUTION_EXCEEDS_TARGET" ||
    message === "INVALID_SAVINGS_AMOUNT" ? 400 : 500;

  return res.status(status).json({
    message:
      status === 500 ? "Something went wrong" : message,
  });
}

export async function createSavingsGoalController(
  req: Request,
  res: Response
) {
  const parsed = createSavingsGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid savings goal details",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const goal = await createSavingsGoal(
      req.params.workspaceId as string,
      parsed.data
    );

    return res.status(201).json({ goal });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getSavingsGoalsController(
  req: Request,
  res: Response
) {
  try {
    const goals = await getSavingsGoals(
      req.params.workspaceId as string
    );

    return res.status(200).json({ goals });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function updateSavingsGoalController(
  req: Request,
  res: Response
) {
  const parsed = updateSavingsGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid savings goal details",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const goal = await updateSavingsGoal(
      req.params.workspaceId as string,
      req.params.goalId as string,
      parsed.data
    );

    return res.status(200).json({ goal });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function contributeToSavingsGoalController(
  req: Request,
  res: Response
) {
  const parsed = contributeSavingsGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid contribution amount",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const goal = await contributeToSavingsGoal(
      req.params.workspaceId as string,
      req.params.goalId as string,
      parsed.data.amountMinorUnits
    );

    return res.status(200).json({ goal });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function archiveSavingsGoalController(
  req: Request,
  res: Response
) {
  try {
    const result = await archiveSavingsGoal(
      req.params.workspaceId as string,
      req.params.goalId as string
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
}
