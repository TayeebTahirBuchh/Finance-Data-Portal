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

  const type = req.query.type;
  const accountId = req.query.accountId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

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

  if (
    type !== undefined &&
    type !== "INCOME" &&
    type !== "EXPENSE"
  ) {
    res.status(400).json({
      error: "Type must be INCOME or EXPENSE",
    });
    return;
  }

  if (
    accountId !== undefined &&
    (typeof accountId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(accountId))
  ) {
    res.status(400).json({
      error: "Invalid account ID",
    });
    return;
  }

  if (
    (startDate !== undefined &&
      (typeof startDate !== "string" ||
        Number.isNaN(Date.parse(startDate)))) ||
    (endDate !== undefined &&
      (typeof endDate !== "string" ||
        Number.isNaN(Date.parse(endDate))))
  ) {
    res.status(400).json({
      error: "Invalid date filter",
    });
    return;
  }

  const parsedStartDate =
    typeof startDate === "string" ? new Date(startDate) : undefined;

  const parsedEndDate =
    typeof endDate === "string" ? new Date(endDate) : undefined;

  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedStartDate > parsedEndDate
  ) {
    res.status(400).json({
      error: "Start date cannot be after end date",
    });
    return;
  }

  try {
    const result = await listTransactions(workspaceId, {
      page,
      limit,
      type: type as "INCOME" | "EXPENSE" | undefined,
      accountId: accountId as string | undefined,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Transaction listing error:", error);

    res.status(500).json({
      error: "Unable to retrieve transactions",
    });
  }
}
