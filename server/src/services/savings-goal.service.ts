import SavingsGoal from "../models/SavingsGoal.js";
import type {
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
} from "../validators/savings-goal.validator.js";

export async function createSavingsGoal(
  workspaceId: string,
  input: CreateSavingsGoalInput
) {
  const goal = await SavingsGoal.create({
    workspaceId,
    name: input.name,
    description: input.description ?? "",
    targetAmountMinorUnits: input.targetAmountMinorUnits,
    currentAmountMinorUnits: 0,
    currency: input.currency,
    targetDate: input.targetDate
      ? new Date(input.targetDate)
      : null,
  });

  return {
    id: goal._id.toString(),
    workspaceId: goal.workspaceId.toString(),
    name: goal.name,
    description: goal.description,
    targetAmountMinorUnits: goal.targetAmountMinorUnits,
    currentAmountMinorUnits: goal.currentAmountMinorUnits,
    currency: goal.currency,
    targetDate: goal.targetDate,
    isArchived: goal.isArchived,
    isCompleted: goal.isCompleted,
    createdAt: goal.createdAt,
  };
}

export async function getSavingsGoals(workspaceId: string) {
  const goals = await SavingsGoal.find({
    workspaceId,
    isArchived: false,
  })
    .sort({ createdAt: -1 })
    .lean();

  return goals.map((goal) => ({
    id: goal._id.toString(),
    workspaceId: goal.workspaceId.toString(),
    name: goal.name,
    description: goal.description,
    targetAmountMinorUnits: goal.targetAmountMinorUnits,
    currentAmountMinorUnits: goal.currentAmountMinorUnits,
    currency: goal.currency,
    targetDate: goal.targetDate,
    isArchived: goal.isArchived,
    isCompleted: goal.isCompleted,
    createdAt: goal.createdAt,
  }));
}

export async function updateSavingsGoal(
  workspaceId: string,
  goalId: string,
  input: UpdateSavingsGoalInput
) {
  const goal = await SavingsGoal.findOne({
    _id: goalId,
    workspaceId,
    isArchived: false,
  });

  if (!goal) {
    throw new Error("SAVINGS_GOAL_NOT_FOUND");
  }

  if (input.name !== undefined) goal.name = input.name;
  if (input.description !== undefined) {
    goal.description = input.description;
  }
  if (input.targetAmountMinorUnits !== undefined) {
    if (input.targetAmountMinorUnits < goal.currentAmountMinorUnits) {
      throw new Error("TARGET_BELOW_SAVED_AMOUNT");
    }

    goal.targetAmountMinorUnits = input.targetAmountMinorUnits;
    goal.isCompleted =
      goal.currentAmountMinorUnits >= goal.targetAmountMinorUnits;
  }
  if (input.targetDate !== undefined) {
    goal.targetDate = input.targetDate
      ? new Date(input.targetDate)
      : null;
  }

  await goal.save();

  return {
    id: goal._id.toString(),
    workspaceId: goal.workspaceId.toString(),
    name: goal.name,
    description: goal.description,
    targetAmountMinorUnits: goal.targetAmountMinorUnits,
    currentAmountMinorUnits: goal.currentAmountMinorUnits,
    currency: goal.currency,
    targetDate: goal.targetDate,
    isArchived: goal.isArchived,
    isCompleted: goal.isCompleted,
    createdAt: goal.createdAt,
  };
}

export async function contributeToSavingsGoal(
  workspaceId: string,
  goalId: string,
  amountMinorUnits: number
) {
  const goal = await SavingsGoal.findOne({
    _id: goalId,
    workspaceId,
    isArchived: false,
  });

  if (!goal) {
    throw new Error("SAVINGS_GOAL_NOT_FOUND");
  }

  if (goal.isCompleted) {
    throw new Error("SAVINGS_GOAL_ALREADY_COMPLETED");
  }

  const newAmount =
    goal.currentAmountMinorUnits + amountMinorUnits;

  if (!Number.isSafeInteger(newAmount)) {
    throw new Error("INVALID_SAVINGS_AMOUNT");
  }

  if (newAmount > goal.targetAmountMinorUnits) {
    throw new Error("CONTRIBUTION_EXCEEDS_TARGET");
  }

  goal.currentAmountMinorUnits = newAmount;
  goal.isCompleted =
    newAmount >= goal.targetAmountMinorUnits;

  await goal.save();

  return {
    id: goal._id.toString(),
    workspaceId: goal.workspaceId.toString(),
    name: goal.name,
    description: goal.description,
    targetAmountMinorUnits: goal.targetAmountMinorUnits,
    currentAmountMinorUnits: goal.currentAmountMinorUnits,
    currency: goal.currency,
    targetDate: goal.targetDate,
    isArchived: goal.isArchived,
    isCompleted: goal.isCompleted,
    createdAt: goal.createdAt,
  };
}

export async function archiveSavingsGoal(
  workspaceId: string,
  goalId: string
) {
  const goal = await SavingsGoal.findOneAndUpdate(
    {
      _id: goalId,
      workspaceId,
      isArchived: false,
    },
    {
      $set: { isArchived: true },
    },
    { new: true }
  );

  if (!goal) {
    throw new Error("SAVINGS_GOAL_NOT_FOUND");
  }

  return { id: goal._id.toString() };
}
