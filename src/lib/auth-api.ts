const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message?: string;
  user?: AuthUser;
  userId?: string;
  workspaceId?: string;
  error?: string;
}

async function authRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth${path}`,
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
      data?.error || "Authentication request failed"
    );
  }

  return data as T;
}

export async function registerUser(
  input: RegisterInput
): Promise<{
  userId: string;
  workspaceId: string;
}> {
  const data = await authRequest<AuthResponse>(
    "/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.userId || !data.workspaceId) {
    throw new Error("Registration response was incomplete");
  }

  return {
    userId: data.userId,
    workspaceId: data.workspaceId,
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const data = await authRequest<AuthResponse>(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (!data.user) {
    throw new Error("Login response did not include a user");
  }

  return data.user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await authRequest<AuthResponse>("/me");

  if (!data.user) {
    throw new Error("User session was not found");
  }

  return data.user;
}

export async function logoutUser(): Promise<void> {
  await authRequest<AuthResponse>(
    "/logout",
    {
      method: "POST",
    }
  );
}
