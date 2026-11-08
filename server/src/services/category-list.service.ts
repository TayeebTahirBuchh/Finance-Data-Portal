import Category from "../models/Category.js";

export async function listCategories(workspaceId: string) {
  const categories = await Category.find({
    workspaceId,
    isArchived: false,
  })
    .sort({ type: 1, name: 1 })
    .lean();

  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    type: category.type,
    isDefault: category.isDefault,
    isArchived: category.isArchived,
    createdAt: category.createdAt,
  }));
}
