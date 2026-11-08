const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export type WorkspaceType = "PERSONAL" | "BUSINESS";

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  baseCurrency: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMembership {
  workspaceId: Workspace;
  role: "OWNER" | "ADMIN" | "ACCOUNTANT" | "EDITOR" | "VIEWER";
}

export interface CreateWorkspaceInput {
  name: string;
  type: WorkspaceType;
  baseCurrency: string;
  timezone: string;
}

interface WorkspaceResponse {
  message?: string;
  workspace?: Workspace;
  workspaces?: WorkspaceMembership[];
  error?: string;
}

async function workspaceRequest<T>(
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
      data?.error || "Workspace request failed"
    );
  }

  return data as T;
}

export async function getWorkspaces(): Promise<WorkspaceMembership[]> {
  const data = await workspaceRequest<WorkspaceResponse>("");

  return data.workspaces ?? [];
}

export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<Workspace> {
  const data = await workspaceRequest<WorkspaceResponse>(
    "",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.workspace) {
    throw new Error("Workspace was not returned by the server");
  }

  return data.workspace;
}

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace> {
  const data = await workspaceRequest<WorkspaceResponse>(
    `/${encodeURIComponent(workspaceId)}`
  );

  if (!data.workspace) {
    throw new Error("Workspace details were not returned by the server");
  }

  return data.workspace;
}
