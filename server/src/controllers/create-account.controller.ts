import type { Request, Response } from "express";

import { createAccountSchema } from "../validators/account.validator.js";
import { createAccount } from "../services/account.service.js";

export async function createAccountController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.session.userId;
  const workspaceId = req.params.workspaceId;

  if (!userId) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  if (!workspaceId) {
    res.status(400).json({
      error: "Workspace ID is required",
    });
    return;
  }

  const validation = createAccountSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid account details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const account = await createAccount(
      userId,
      workspaceId,
      validation.data
    );

    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        error: "You do not have access to this workspace",
      });
      return;
    }

    console.error("Account creation error:", error);

    res.status(500).json({
      error: "Unable to create account. Please try again.",
    });
  }
}
