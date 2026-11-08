import Category from "../models/Category.js";

export async function archiveCategory(
  workspaceId: string,
  categoryId: string
) {
  const category = await Category.findOneAndUpdate(
    {
      _id: categoryId,
      workspaceId,
      isArchived: false,
      isDefault: false,
    },
    {
      $set: {
        isArchived: true,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return {
    id: category._id.toString(),
    name: category.name,
    type: category.type,
    isArchived: category.isArchived,
  };
}
