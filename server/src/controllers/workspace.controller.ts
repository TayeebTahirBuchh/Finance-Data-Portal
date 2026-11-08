

import type { Request, Response } from "express";

import Membership from "../models/Membership.js";
import Workspace from "../models/Workspace.js";

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

export async function getWorkspaceById(
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
    const workspace = await Workspace.findById(workspaceId)
      .select("name type baseCurrency timezone createdAt updatedAt")
      .lean();

    if (!workspace) {
      res.status(404).json({
        error: "Workspace not found",
      });
      return;
    }

    res.status(200).json({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        type: workspace.type,
        baseCurrency: workspace.baseCurrency,
        timezone: workspace.timezone,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Workspace detail error:", error);

    res.status(500).json({
      error: "Unable to retrieve workspace details",
    });
  }
}
