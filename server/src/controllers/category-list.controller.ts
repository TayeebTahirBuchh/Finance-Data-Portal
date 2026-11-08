import type { Request, Response } from "express";

import { listCategories } from "../services/category-list.service.js";

export async function categoryListController(
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
    const categories = await listCategories(workspaceId);

    res.status(200).json({
      categories,
    });
  } catch (error: unknown) {
    console.error("Category listing error:", error);

    res.status(500).json({
      error: "Unable to retrieve categories",
    });
  }
}
