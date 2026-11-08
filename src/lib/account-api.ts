
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export type AccountType =
  | "CASH"
  | "BANK"
  | "SAVINGS"
  | "CURRENT"
  | "CREDIT_CARD"
  | "WALLET"
  | "INVESTMENT"
  | "OTHER";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalanceMinorUnits: number;
  institution?: string;
  lastFourDigits?: string;
  createdAt?: string;
}

export interface AccountBalance extends Account {
  incomeMinorUnits: number;
  expenseMinorUnits: number;
  currentBalanceMinorUnits: number;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
  openingBalanceMinorUnits: number;
  institution?: string;
  lastFourDigits?: string;
}

interface AccountResponse {
  message?: string;
  account?: Account;
  accounts?: Account[];
  error?: string;
}

async function accountRequest<T>(
  workspaceId: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${encodeURIComponent(
      workspaceId
    )}/accounts${path}`,
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
      data?.error || "Account request failed"
    );
  }

  return data as T;
}

export async function getAccounts(
  workspaceId: string
): Promise<Account[]> {
  const data = await accountRequest<AccountResponse>(
    workspaceId,
    ""
  );

  return data.accounts ?? [];
}

export async function getAccountBalances(
  workspaceId: string
): Promise<AccountBalance[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${encodeURIComponent(
      workspaceId
    )}/account-balances`,
    {
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || "Unable to retrieve account balances"
    );
  }

  return (data?.accounts ?? []) as AccountBalance[];
}

export async function createAccount(
  workspaceId: string,
  input: CreateAccountInput
): Promise<Account> {
  const data = await accountRequest<AccountResponse>(
    workspaceId,
    "",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.account) {
    throw new Error("Account was not returned by the server");
  }

  return data.account;
}

export async function archiveAccount(
  workspaceId: string,
  accountId: string
): Promise<void> {
  await accountRequest<AccountResponse>(
    workspaceId,
    `/${encodeURIComponent(accountId)}/archive`,
    {
      method: "PATCH",
    }
  );
}
