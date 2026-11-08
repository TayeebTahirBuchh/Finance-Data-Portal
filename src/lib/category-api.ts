
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isArchived: boolean;
  createdAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
}

interface CategoryResponse {
  message?: string;
  category?: Category;
  error?: string;
}

interface CategoryListResponse {
  categories: Category[];
}

async function categoryRequest<T>(
  workspaceId: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${encodeURIComponent(
      workspaceId
    )}/categories${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || "Category request failed."
    );
  }

  return data as T;
}

export async function getCategories(
  workspaceId: string
): Promise<Category[]> {
  const data = await categoryRequest<CategoryListResponse>(
    workspaceId,
    ""
  );

  return data.categories;
}

export async function createCategory(
  workspaceId: string,
  input: CreateCategoryInput
): Promise<Category> {
  const data = await categoryRequest<CategoryResponse>(
    workspaceId,
    "",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.category) {
    throw new Error(
      "Category was not returned by the server."
    );
  }

  return data.category;
}

export async function archiveCategory(
  workspaceId: string,
  categoryId: string
): Promise<void> {
  await categoryRequest(
    workspaceId,
    `/${encodeURIComponent(categoryId)}/archive`,
    {
      method: "PATCH",
    }
  );
}
