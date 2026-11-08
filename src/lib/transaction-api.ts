
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amountMinorUnits: number;
  currency: string;
  description?: string | null;
  categoryId?: string | null;
  transactionDate: string;
  notes?: string | null;
  createdAt?: string;
}

export interface CreateTransactionInput {
  accountId: string;
  type: TransactionType;
  amountMinorUnits: number;
  currency: string;
  description?: string;
  categoryId?: string;
  transactionDate: string;
  notes?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface TransactionResponse {
  message?: string;
  transaction?: Transaction;
  error?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

async function transactionRequest<T>(
  workspaceId: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${encodeURIComponent(
      workspaceId
    )}/transactions${path}`,
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
      data?.error || "Transaction request failed"
    );
  }

  return data as T;
}

export async function createTransaction(
  workspaceId: string,
  input: CreateTransactionInput
): Promise<Transaction> {
  const data = await transactionRequest<TransactionResponse>(
    workspaceId,
    "",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  if (!data.transaction) {
    throw new Error(
      "Transaction was not returned by the server"
    );
  }

  return data.transaction;
}

export async function getTransactions(
  workspaceId: string,
  filters: TransactionFilters = {}
): Promise<TransactionListResponse> {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.accountId) {
    params.set("accountId", filters.accountId);
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();
  const path = query ? `?${query}` : "";

  return transactionRequest<TransactionListResponse>(
    workspaceId,
    path
  );
}
