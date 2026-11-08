const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface FinancialReportSummary {
  currency: string;
  incomeMinorUnits: number;
  expenseMinorUnits: number;
  netCashFlowMinorUnits: number;
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlyFinancialTotal {
  year: number;
  month: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  totalMinorUnits: number;
}

export interface CategoryExpenseTotal {
  categoryId: string;
  categoryName: string;
  currency: string;
  totalMinorUnits: number;
  count: number;
}

export interface FinancialReport {
  summary: FinancialReportSummary[];
  monthly: MonthlyFinancialTotal[];
  expensesByCategory: CategoryExpenseTotal[];
}

interface FinancialReportResponse {
  report: FinancialReport;
}

export async function getFinancialReport(
  workspaceId: string,
  filters: {
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<FinancialReport> {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();
  const url =
    `${API_BASE_URL}/api/workspaces/${workspaceId}/financial-reports` +
    (query ? `?${query}` : "");

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const data = (await response.json()) as
    | FinancialReportResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "Unable to load financial reports"
    );
  }

  return (data as FinancialReportResponse).report;
}
