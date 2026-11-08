import type { Request, Response } from "express";

import { createTransactionSchema } from "../validators/transaction.validator.js";
import { createTransaction } from "../services/transaction.service.js";

export async function createTransactionController(
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

  const validation = createTransactionSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid transaction details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const transaction = await createTransaction(
      workspaceId,
      validation.data
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "ACCOUNT_NOT_FOUND") {
      res.status(404).json({
        error: "Account not found or archived",
      });
      return;
    }

    if (error instanceof Error && error.message === "CURRENCY_MISMATCH") {
      res.status(400).json({
        error: "Transaction currency must match the account currency",
      });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_CATEGORY") {
  res.status(400).json({
    error: "Invalid category for this workspace or transaction type",
  });
  return;
}

    console.error("Transaction creation error:", error);

    res.status(500).json({
      error: "Unable to create transaction",
    });
  }
}
