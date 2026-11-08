
import type { Request, Response } from "express";

import Membership from "../models/Membership.js";

export async function getWorkspaces(
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

  try {
    const workspaces = await Membership.find({
      userId,
      status: "ACTIVE",
    })
      .select("workspaceId role")
      .populate(
        "workspaceId",
        "name type baseCurrency timezone createdAt"
      )
      .lean();

    res.status(200).json({
      workspaces,
    });
  } catch (error: unknown) {
    console.error("Workspace retrieval error:", error);

    res.status(500).json({
      error: "Unable to retrieve workspaces",
    });
  }
}
