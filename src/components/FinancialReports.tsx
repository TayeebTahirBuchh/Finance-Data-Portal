import { useEffect, useMemo, useState } from "react";
import {
  getFinancialReport,
  type FinancialReport,
} from "../lib/financial-report-api";
import { formatCurrency } from "../lib/currency";

interface FinancialReportsProps {
  workspaceId: string;
}

export default function FinancialReports({
  workspaceId,
}: FinancialReportsProps) {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [currency, setCurrency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      const result = await getFinancialReport(workspaceId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setReport(result);

      setCurrency((current) =>
        current && result.summary.some(
          (item) => item.currency === current
        )
          ? current
          : result.summary[0]?.currency ?? ""
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load financial reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [workspaceId]);

  const selectedSummary = report?.summary.find(
    (item) => item.currency === currency
  );

  const monthlyData = useMemo(() => {
    if (!report) return [];

    const grouped = new Map<
      string,
      {
        label: string;
        income: number;
        expenses: number;
        sortKey: number;
      }
    >();

    report.monthly
      .filter((item) => item.currency === currency)
      .forEach((item) => {
        const key = `${item.year}-${item.month}`;
        const label = new Date(
          item.year,
          item.month - 1
        ).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        });

        if (!grouped.has(key)) {
          grouped.set(key, {
            label,
            income: 0,
            expenses: 0,
            sortKey: item.year * 100 + item.month,
          });
        }

        const entry = grouped.get(key)!;

        if (item.type === "INCOME") {
          entry.income = item.totalMinorUnits;
        } else {
          entry.expenses = item.totalMinorUnits;
        }
      });

    return Array.from(grouped.values()).sort(
      (a, b) => a.sortKey - b.sortKey
    );
  }, [report, currency]);

  const categoryData = useMemo(
    () =>
      report?.expensesByCategory.filter(
        (item) => item.currency === currency
      ) ?? [],
    [report, currency]
  );

  const maximumMonthlyValue = Math.max(
    1,
    ...monthlyData.flatMap((item) => [
      item.income,
      item.expenses,
    ])
  );

  const maximumCategoryValue = Math.max(
    1,
    ...categoryData.map((item) => item.totalMinorUnits)
  );

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1C1917]">
          Charts & Financial Reports
        </h2>
        <p className="text-sm text-[#78716C] mt-1">
          Understand your income, spending and financial trends.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadReport();
        }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
      >
        <div>
          <label className="block text-xs font-medium text-[#78716C] mb-1">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#78716C] mb-1">
            End date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1C1917] text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply filters"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">
          {error}
        </p>
      )}

      {loading && !report ? (
        <p className="text-sm text-[#78716C] text-center py-8">
          Loading financial reports...
        </p>
      ) : !report || report.summary.length === 0 ? (
        <p className="text-sm text-[#78716C] text-center py-8">
          No financial data is available for this date range yet.
        </p>
      ) : (
        <>
          <div className="mb-5">
            <label className="block text-xs font-medium text-[#78716C] mb-2">
              Report currency
            </label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full sm:w-48 border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm bg-white"
            >
              {report.summary.map((item) => (
                <option key={item.currency} value={item.currency}>
                  {item.currency}
                </option>
              ))}
            </select>
          </div>

          {selectedSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-xs text-green-800">
                  Total income
                </p>
                <p className="text-lg font-semibold text-green-700 mt-1">
                  {formatCurrency(
                    selectedSummary.incomeMinorUnits,
                    currency
                  )}
                </p>
                <p className="text-xs text-green-800 mt-1">
                  {selectedSummary.incomeCount} transactions
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-800">
                  Total expenses
                </p>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {formatCurrency(
                    selectedSummary.expenseMinorUnits,
                    currency
                  )}
                </p>
                <p className="text-xs text-red-800 mt-1">
                  {selectedSummary.expenseCount} transactions
                </p>
              </div>

              <div className="rounded-xl bg-[#F5F5F4] p-4">
                <p className="text-xs text-[#78716C]">
                  Net cash flow
                </p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    selectedSummary.netCashFlowMinorUnits >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    selectedSummary.netCashFlowMinorUnits,
                    currency
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="border border-[#E7E5E4] rounded-xl p-4 mb-5">
            <h3 className="font-semibold text-sm mb-1">
              Monthly income vs expenses
            </h3>
            <p className="text-xs text-[#78716C] mb-5">
              Monthly totals in {currency}
            </p>

            <div className="flex gap-4 text-xs mb-4">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-600" />
                Income
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                Expenses
              </span>
            </div>

            {monthlyData.length === 0 ? (
              <p className="text-sm text-[#78716C] py-6 text-center">
                No monthly data available.
              </p>
            ) : (
              <div className="space-y-5">
                {monthlyData.map((item) => (
                  <div key={item.sortKey}>
                    <p className="text-xs font-medium mb-2">
                      {item.label}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 rounded-full bg-[#F5F5F4] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{
                              width: `${(item.income / maximumMonthlyValue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#78716C] w-28 text-right">
                          {formatCurrency(item.income, currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 rounded-full bg-[#F5F5F4] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${(item.expenses / maximumMonthlyValue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#78716C] w-28 text-right">
                          {formatCurrency(item.expenses, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[#E7E5E4] rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-1">
              Expenses by category
            </h3>
            <p className="text-xs text-[#78716C] mb-5">
              Spending distribution in {currency}
            </p>

            {categoryData.length === 0 ? (
              <p className="text-sm text-[#78716C] py-6 text-center">
                No categorized expenses available.
              </p>
            ) : (
              <div className="space-y-4">
                {categoryData.map((item) => (
                  <div key={`${item.categoryId}-${item.currency}`}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-medium">
                        {item.categoryName}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          item.totalMinorUnits,
                          currency
                        )}
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-[#F5F5F4] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#57534E]"
                        style={{
                          width: `${(item.totalMinorUnits / maximumCategoryValue) * 100}%`,
                        }}
                      />
                    </div>

                    <p className="text-xs text-[#78716C] mt-1">
                      {item.count} transactions
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
