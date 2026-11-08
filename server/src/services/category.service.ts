import Category from "../models/Category.js";
import Membership from "../models/Membership.js";
import type { CreateCategoryInput } from "../validators/category.validator.js";

export async function createCategory(
  userId: string,
  workspaceId: string,
  input: CreateCategoryInput
) {
  const membership = await Membership.exists({
    userId,
    workspaceId,
    status: "ACTIVE",
  });

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const existingCategory = await Category.findOne({
    workspaceId,
    name: input.name,
    type: input.type,
  });

  if (existingCategory) {
    throw new Error("CATEGORY_ALREADY_EXISTS");
  }

  try {
    const category = await Category.create({
      workspaceId,
      name: input.name,
      type: input.type,
      isDefault: false,
    });

    return {
      id: category._id.toString(),
      name: category.name,
      type: category.type,
      isDefault: category.isDefault,
      isArchived: category.isArchived,
      createdAt: category.createdAt,
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error("CATEGORY_ALREADY_EXISTS");
    }

    throw error;
  }
}
