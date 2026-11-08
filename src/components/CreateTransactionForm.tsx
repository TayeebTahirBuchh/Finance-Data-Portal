

import { useEffect, useState, type FormEvent } from "react";
import {
  createTransaction,
  type Transaction,
  type TransactionType,
} from "../lib/transaction-api";
import type { Account } from "../lib/account-api";
import {
  getCategories,
  type Category,
} from "../lib/category-api";

interface CreateTransactionFormProps {
  workspaceId: string;
  accounts: Account[];
  onCreated: (transaction: Transaction) => void;
  onCancel: () => void;
}

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CreateTransactionForm({
  workspaceId,
  accounts,
  onCreated,
  onCancel,
}: CreateTransactionFormProps) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [accountId, setAccountId] = useState(
    accounts[0]?.id ?? ""
  );
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    getLocalDate()
  );
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAccount = accounts.find(
    (account) => account.id === accountId
  );

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const result = await getCategories(workspaceId);

        if (!cancelled) {
          setCategories(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load categories."
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    setCategoryId("");
  }, [type]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!selectedAccount) {
      setError("Please select a financial account.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    const decimalPlaces =
      selectedAccount.currency === "JPY" ? 0 : 2;

    const multiplier = 10 ** decimalPlaces;
    const amountMinorUnits = Math.round(
      numericAmount * multiplier
    );

    if (
      !Number.isSafeInteger(amountMinorUnits) ||
      amountMinorUnits <= 0
    ) {
      setError("The transaction amount is too large or invalid.");
      return;
    }

    if (!transactionDate) {
      setError("Please select a transaction date.");
      return;
    }

    setLoading(true);

    try {
      const transaction = await createTransaction(workspaceId, {
        accountId,
        type,
        amountMinorUnits,
        currency: selectedAccount.currency,
        transactionDate: new Date(
          `${transactionDate}T12:00:00`
        ).toISOString(),
        ...(description.trim()
          ? { description: description.trim() }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      onCreated(transaction);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save transaction."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
      <h2 className="text-xl font-semibold">
        Add transaction
      </h2>

      <p className="text-sm text-[#78716C] mt-1 mb-6">
        Record money coming in or going out.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction type
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`p-3 rounded-xl border text-sm font-medium ${
                type === "INCOME"
                  ? "bg-green-50 border-green-600 text-green-700"
                  : "border-[#E7E5E4]"
              }`}
            >
              Income
            </button>

            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`p-3 rounded-xl border text-sm font-medium ${
                type === "EXPENSE"
                  ? "bg-red-50 border-red-600 text-red-700"
                  : "border-[#E7E5E4]"
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Financial account
          </label>

          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm bg-white"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Amount
          </label>

          <input
            type="number"
            min="0"
            step={
              selectedAccount?.currency === "JPY"
                ? "1"
                : "0.01"
            }
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />

          {selectedAccount && (
            <p className="text-xs text-[#78716C] mt-1">
              Currency: {selectedAccount.currency}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Category (optional)
          </label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categoriesLoading}
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm bg-white"
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select category"}
            </option>

            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {!categoriesLoading &&
            filteredCategories.length === 0 && (
              <p className="text-xs text-[#78716C] mt-1">
                No categories available for this transaction type.
              </p>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction date
          </label>

          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description (optional)
          </label>

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={250}
            placeholder="e.g. Grocery shopping"
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notes (optional)
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Additional details..."
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 p-3 rounded-xl border border-[#E7E5E4] text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || accounts.length === 0}
            className="flex-1 p-3 rounded-xl bg-[#1C1917] text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save transaction"}
          </button>
        </div>
      </form>
    </section>
  );
}
