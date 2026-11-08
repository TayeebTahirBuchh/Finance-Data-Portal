import type { Request, Response } from "express";

import { listTransactions } from "../services/transaction-list.service.js";

export async function transactionListController(
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

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    res.status(400).json({
      error: "Invalid pagination parameters",
    });
    return;
  }

  try {
    const result = await listTransactions(workspaceId, {
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Transaction listing error:", error);

    res.status(500).json({
      error: "Unable to retrieve transactions",
    });
  }
}
