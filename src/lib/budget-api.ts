
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export type BudgetPeriod = "MONTHLY" | "YEARLY";

export interface BudgetInput {
  categoryId: string;
  name: string;
  amountMinorUnits: number;
  currency: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface Budget {
  id: string;
  workspaceId: string;
  category: {
    id: string;
    name: string;
    type: string;
  } | null;
  name: string;
  amountMinorUnits: number;
  currency: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isArchived: boolean;
}

interface BudgetResponse {
  message?: string;
  budget?: Budget;
  budgets?: Budget[];
  error?: string;
}

async function budgetRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces${path}`,
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
      data?.error || "Budget request failed"
    );
  }

  return data as T;
}

export async function getBudgets(
  workspaceId: string
): Promise<Budget[]> {
  const data = await budgetRequest<BudgetResponse>(
    `/${encodeURIComponent(workspaceId)}/budgets`
  );

  return data.budgets ?? [];
}

export async function createBudget(
  workspaceId: string,
  input: BudgetInput
): Promise<Budget> {
  const data = await budgetRequest<BudgetResponse>(
    `/${encodeURIComponent(workspaceId)}/budgets`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.budget) {
    throw new Error("Budget was not returned by the server");
  }

  return data.budget;
}

export async function updateBudget(
  workspaceId: string,
  budgetId: string,
  input: Partial<BudgetInput>
): Promise<Budget> {
  const data = await budgetRequest<BudgetResponse>(
    `/${encodeURIComponent(workspaceId)}/budgets/${encodeURIComponent(budgetId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  if (!data.budget) {
    throw new Error("Updated budget was not returned by the server");
  }

  return data.budget;
}

export async function archiveBudget(
  workspaceId: string,
  budgetId: string
): Promise<void> {
  await budgetRequest<BudgetResponse>(
    `/${encodeURIComponent(workspaceId)}/budgets/${encodeURIComponent(budgetId)}/archive`,
    {
      method: "PATCH",
    }
  );
}
