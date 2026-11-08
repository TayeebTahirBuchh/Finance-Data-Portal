import { useEffect, useState, type FormEvent } from "react";
import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  getSavingsGoals,
  type SavingsGoal,
} from "../lib/savings-goal-api";
import { getCurrencyDecimalPlaces, toMinorUnits } from "../lib/currency";

interface Props {
  workspaceId: string;
}

const currencies = [
  "INR", "USD", "EUR", "GBP", "AED", "SAR",
  "PKR", "BDT", "LKR", "NPR", "CAD", "AUD",
  "NZD", "SGD", "JPY", "CNY", "CHF", "HKD",
  "MYR", "ZAR", "TRY",
];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount / 10 ** getCurrencyDecimalPlaces(currency));
}

export default function SavingsGoalManager({ workspaceId }: Props) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [targetDate, setTargetDate] = useState("");
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadGoals() {
    try {
      setLoading(true);
      setGoals(await getSavingsGoals(workspaceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load savings goals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
  }, [workspaceId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const amount = Number(targetAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid target amount.");
      return;
    }

    try {
      setSaving(true);
      await createSavingsGoal(workspaceId, {
        name,
        description,
        targetAmountMinorUnits: toMinorUnits(amount, currency),
        currency,
        targetDate: targetDate
          ? new Date(`${targetDate}T00:00:00.000Z`).toISOString()
          : null,
      });

      setName("");
      setDescription("");
      setTargetAmount("");
      setTargetDate("");
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create goal");
    } finally {
      setSaving(false);
    }
  }

  async function handleContribution(goal: SavingsGoal) {
    const amount = Number(contributions[goal.id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid contribution amount.");
      return;
    }

    try {
      setError("");
      setSaving(true);
      await contributeToSavingsGoal(
        workspaceId,
        goal.id,
        toMinorUnits(amount, goal.currency)
      );

      setContributions((current) => ({
        ...current,
        [goal.id]: "",
      }));

      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add contribution");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(goalId: string) {
    if (!window.confirm("Archive this savings goal?")) return;

    try {
      setError("");
      setSaving(true);
      await archiveSavingsGoal(workspaceId, goalId);
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Savings Goals</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set targets and track how much you have saved.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-2">
        <input
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Goal name"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />

        <input
          required
          type="number"
          min="0.01"
          step={getCurrencyDecimalPlaces(currency) === 0 ? "1" : "0.01"}
          value={targetAmount}
          onChange={(event) => setTargetAmount(event.target.value)}
          placeholder="Target amount"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />

        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          {currencies.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          type="date"
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          placeholder="Description (optional)"
          className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-2"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50 sm:col-span-2"
        >
          {saving ? "Saving..." : "Create Savings Goal"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading savings goals...</p>
      ) : goals.length === 0 ? (
        <p className="text-sm text-slate-500">No savings goals yet.</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              (goal.currentAmountMinorUnits / goal.targetAmountMinorUnits) * 100
            );

            return (
              <article key={goal.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                    {goal.description && (
                      <p className="mt-1 text-sm text-slate-500">{goal.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {goal.isCompleted ? "Completed" : `${progress.toFixed(1)}%`}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {formatAmount(goal.currentAmountMinorUnits, goal.currency)}
                  {" saved of "}
                  {formatAmount(goal.targetAmountMinorUnits, goal.currency)}
                </p>

                {goal.targetDate && (
                  <p className="mt-1 text-xs text-slate-500">
                    Target date: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}

                {!goal.isCompleted && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step={getCurrencyDecimalPlaces(goal.currency) === 0 ? "1" : "0.01"}
                      value={contributions[goal.id] ?? ""}
                      onChange={(event) =>
                        setContributions((current) => ({
                          ...current,
                          [goal.id]: event.target.value,
                        }))
                      }
                      placeholder={`Add ${goal.currency}`}
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleContribution(goal)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Add Savings
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleArchive(goal.id)}
                  className="mt-3 text-sm text-red-600 disabled:opacity-50"
                >
                  Archive goal
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
