
import type { Request, Response, NextFunction } from "express";

import Membership from "../models/Membership.js";

export async function requireWorkspaceAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;
  const workspaceId = req.params.workspaceId;

  if (!userId) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  if (
    !workspaceId ||
    !/^[0-9a-fA-F]{24}$/.test(workspaceId)
  ) {
    res.status(400).json({
      error: "Invalid workspace ID",
    });
    return;
  }

  try {
    const membership = await Membership.findOne({
      userId,
      workspaceId,
      status: "ACTIVE",
    }).lean();

    if (!membership) {
      res.status(403).json({
        error: "You do not have access to this workspace",
      });
      return;
    }

    next();
  } catch (error: unknown) {
    console.error("Workspace authorization error:", error);

    res.status(500).json({
      error: "Unable to verify workspace access",
    });
  }
}
