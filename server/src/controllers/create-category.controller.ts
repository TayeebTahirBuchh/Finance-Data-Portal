import type { Request, Response } from "express";

import { createCategorySchema } from "../validators/category.validator.js";
import { createCategory } from "../services/category.service.js";

export async function createCategoryController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;
  const userId = req.session.userId;

  if (!workspaceId || !userId) {
    res.status(400).json({
      error: "Workspace ID and authenticated user are required",
    });
    return;
  }

  const validation = createCategorySchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid category details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const category = await createCategory(
      userId,
      workspaceId,
      validation.data
    );

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "WORKSPACE_ACCESS_DENIED") {
        res.status(403).json({
          error: "You do not have access to this workspace",
        });
        return;
      }

      if (error.message === "CATEGORY_ALREADY_EXISTS") {
        res.status(409).json({
          error: "This category already exists",
        });
        return;
      }
    }

    console.error("Category creation error:", error);

    res.status(500).json({
      error: "Unable to create category",
    });
  }
}
