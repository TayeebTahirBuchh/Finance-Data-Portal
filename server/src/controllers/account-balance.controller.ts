import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
  getWorkspaceAccountBalances,
} from "../services/account-balance.service.js";

export async function accountBalanceController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;

  if (!workspaceId || !mongoose.isValidObjectId(workspaceId)) {
    res.status(400).json({
      error: "Invalid workspace ID",
    });
    return;
  }

  try {
    const accounts = await getWorkspaceAccountBalances(
      workspaceId
    );

    res.status(200).json({
      accounts,
    });
  } catch (error: unknown) {
    console.error("Account balance retrieval error:", error);

    res.status(500).json({
      error: "Unable to retrieve account balances",
    });
  }
}
