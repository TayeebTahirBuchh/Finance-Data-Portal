import type { Request, Response } from "express";

import { archiveAccount } from "../services/archive-account.service.js";

export async function archiveAccountController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;
  const accountId = req.params.accountId;

  if (!workspaceId || !accountId) {
    res.status(400).json({
      error: "Workspace ID and account ID are required",
    });
    return;
  }

  if (!/^[0-9a-fA-F]{24}$/.test(accountId)) {
    res.status(400).json({
      error: "Invalid account ID",
    });
    return;
  }

  try {
    const account = await archiveAccount(workspaceId, accountId);

    if (!account) {
      res.status(404).json({
        error: "Account not found or already archived",
      });
      return;
    }

    res.status(200).json({
      message: "Account archived successfully",
      account,
    });
  } catch (error: unknown) {
    console.error("Account archive error:", error);

    res.status(500).json({
      error: "Unable to archive account",
    });
  }
}
