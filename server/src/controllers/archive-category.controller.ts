import type { Request, Response } from "express";

import { archiveCategory } from "../services/archive-category.service.js";

export async function archiveCategoryController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;
  const categoryId = req.params.categoryId;

  if (!workspaceId || !categoryId) {
    res.status(400).json({
      error: "Workspace ID and category ID are required",
    });
    return;
  }

  if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
    res.status(400).json({
      error: "Invalid category ID",
    });
    return;
  }

  try {
    const category = await archiveCategory(
      workspaceId,
      categoryId
    );

    res.status(200).json({
      message: "Category archived successfully",
      category,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "CATEGORY_NOT_FOUND"
    ) {
      res.status(404).json({
        error: "Category not found or cannot be archived",
      });
      return;
    }

    console.error("Category archive error:", error);

    res.status(500).json({
      error: "Unable to archive category",
    });
  }
}
