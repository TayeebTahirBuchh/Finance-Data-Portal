
import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  archiveBudget,
  type Budget,
  type BudgetPeriod,
} from "../lib/budget-api";
import { getCategories, type Category } from "../lib/category-api";
import {
  getCurrencyDecimalPlaces,
  toMinorUnits,
  SUPPORTED_CURRENCIES,
} from "../lib/currency";

interface BudgetManagerProps {
  workspaceId: string;
  defaultCurrency: string;
}

function getMonthDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function formatAmount(amount: number, currency: string) {
  const decimalPlaces = getCurrencyDecimalPlaces(currency);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount / 10 ** decimalPlaces);
}

export default function BudgetManager({
  workspaceId,
  defaultCurrency,
}: BudgetManagerProps) {
  const initialDates = getMonthDates();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [period, setPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [budgetResult, categoryResult] = await Promise.all([
        getBudgets(workspaceId),
        getCategories(workspaceId),
      ]);

      setBudgets(budgetResult);
      setCategories(
        categoryResult.filter(
          (category) =>
            category.type === "EXPENSE" && !category.isArchived
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load budgets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [workspaceId]);

  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  async function handleCreateBudget(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!categoryId) {
      setError("Please select an expense category.");
      return;
    }

    if (!name.trim() || Number(amount) <= 0) {
      setError("Enter a valid budget name and amount.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after the start date.");
      return;
    }

    setSaving(true);

    try {
      const budget = await createBudget(workspaceId, {
        categoryId,
        name: name.trim(),
        amountMinorUnits: toMinorUnits(Number(amount), currency),
        currency,
        period,
        startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
      });

      setBudgets((current) => [budget, ...current]);
      setName("");
      setAmount("");
      setSuccess("Budget created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create budget."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveBudget(budgetId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this budget?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await archiveBudget(workspaceId, budgetId);
      setBudgets((current) =>
        current.filter((budget) => budget.id !== budgetId)
      );
      setSuccess("Budget archived successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive budget."
      );
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1C1917]">
          Budgets
        </h2>
        <p className="text-sm text-[#78716C] mt-1">
          Set spending limits for your expense categories.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <form onSubmit={handleCreateBudget} className="space-y-4 mb-8">
        <h3 className="font-semibold text-sm">Create a budget</h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            Budget name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Monthly groceries"
            required
            minLength={2}
            maxLength={100}
            className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Expense category
          </label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm bg-white"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-[#78716C] mt-1">
              Create an expense category before creating a budget.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Budget amount
            </label>
            <input
              type="number"
              min="0.01"
              step={1 / 10 ** getCurrencyDecimalPlaces(currency)}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
              className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm bg-white"
            >
              {SUPPORTED_CURRENCIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Budget period
          </label>
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as BudgetPeriod)
            }
            className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm bg-white"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
              className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
              className="w-full rounded-xl border border-[#E7E5E4] p-3 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || categories.length === 0}
          className="w-full rounded-xl bg-[#1C1917] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create budget"}
        </button>
      </form>

      <div className="border-t border-[#E7E5E4] pt-6">
        <h3 className="font-semibold text-sm mb-4">
          Your budgets
        </h3>

        {loading ? (
          <p className="text-sm text-[#78716C]">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-[#78716C] text-center py-6">
            No budgets yet. Create your first budget above.
          </p>
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="rounded-xl border border-[#E7E5E4] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium">{budget.name}</h4>
                    <p className="text-xs text-[#78716C] mt-1">
                      {budget.category?.name ?? "Category unavailable"} ·{" "}
                      {budget.period.toLowerCase()}
                    </p>
                  </div>
                  <p className="font-semibold text-right">
                    {formatAmount(
                      budget.amountMinorUnits,
                      budget.currency
                    )}
                  </p>
                </div>

                <p className="text-xs text-[#78716C] mt-3">
                  {new Date(budget.startDate).toLocaleDateString("en-IN")} –{" "}
                  {new Date(budget.endDate).toLocaleDateString("en-IN")}
                </p>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => void handleArchiveBudget(budget.id)}
                    className="text-sm font-medium text-red-600"
                  >
                    Archive budget
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
