const API_URL = import.meta.env.VITE_API_URL;

export interface SavingsGoal {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  targetAmountMinorUnits: number;
  currentAmountMinorUnits: number;
  currency: string;
  targetDate: string | null;
  isArchived: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateSavingsGoalInput {
  name: string;
  description?: string;
  targetAmountMinorUnits: number;
  currency: string;
  targetDate?: string | null;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  description?: string;
  targetAmountMinorUnits?: number;
  targetDate?: string | null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export async function getSavingsGoals(
  workspaceId: string
): Promise<SavingsGoal[]> {
  const data = await request<{ goals: SavingsGoal[] }>(
    `/api/workspaces/${workspaceId}/savings-goals`
  );

  return data.goals;
}

export async function createSavingsGoal(
  workspaceId: string,
  input: CreateSavingsGoalInput
): Promise<SavingsGoal> {
  const data = await request<{ goal: SavingsGoal }>(
    `/api/workspaces/${workspaceId}/savings-goals`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  return data.goal;
}

export async function updateSavingsGoal(
  workspaceId: string,
  goalId: string,
  input: UpdateSavingsGoalInput
): Promise<SavingsGoal> {
  const data = await request<{ goal: SavingsGoal }>(
    `/api/workspaces/${workspaceId}/savings-goals/${goalId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  return data.goal;
}

export async function contributeToSavingsGoal(
  workspaceId: string,
  goalId: string,
  amountMinorUnits: number
): Promise<SavingsGoal> {
  const data = await request<{ goal: SavingsGoal }>(
    `/api/workspaces/${workspaceId}/savings-goals/${goalId}/contributions`,
    {
      method: "POST",
      body: JSON.stringify({ amountMinorUnits }),
    }
  );

  return data.goal;
}

export async function archiveSavingsGoal(
  workspaceId: string,
  goalId: string
): Promise<void> {
  await request<{ id: string }>(
    `/api/workspaces/${workspaceId}/savings-goals/${goalId}/archive`,
    { method: "PATCH" }
  );
}
