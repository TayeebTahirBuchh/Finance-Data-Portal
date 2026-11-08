
import type { Request, Response } from "express";

import { createWorkspaceSchema } from "../validators/workspace.validator.js";
import { createWorkspace } from "../services/workspace.service.js";

export async function createWorkspaceController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  const validation = createWorkspaceSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid workspace details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const workspace = await createWorkspace(
      userId,
      validation.data
    );

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error: unknown) {
    console.error("Workspace creation error:", error);

    res.status(500).json({
      error: "Unable to create workspace. Please try again.",
    });
  }
}
