import type { Request, Response } from "express";

import { getWorkspaceAccounts } from "../services/account-list.service.js";

export async function getWorkspaceAccountsController(
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
    const accounts = await getWorkspaceAccounts(workspaceId);

    res.status(200).json({
      accounts,
    });
  } catch (error: unknown) {
    console.error("Account retrieval error:", error);

    res.status(500).json({
      error: "Unable to retrieve accounts",
    });
  }
}
