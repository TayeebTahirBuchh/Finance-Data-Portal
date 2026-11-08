import { useState, type FormEvent } from "react";
import {
  createAccount,
  type Account,
  type AccountType,
} from "../lib/account-api";

interface CreateAccountFormProps {
  workspaceId: string;
  defaultCurrency: string;
  onCreated: (account: Account) => void;
  onCancel: () => void;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "BANK", label: "Bank Account" },
  { value: "SAVINGS", label: "Savings Account" },
  { value: "CURRENT", label: "Current Account" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "WALLET", label: "Digital Wallet" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "OTHER", label: "Other" },
];

const currencies = [
  "INR", "USD", "EUR", "GBP", "AED",
  "SAR", "PKR", "BDT", "LKR", "NPR",
  "CAD", "AUD", "NZD", "SGD", "JPY",
  "CNY", "CHF", "HKD", "MYR", "ZAR", "TRY",
];

export default function CreateAccountForm({
  workspaceId,
  defaultCurrency,
  onCreated,
  onCancel,
}: CreateAccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("BANK");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [balance, setBalance] = useState("0");
  const [institution, setInstitution] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const numericBalance = Number(balance);

    if (!Number.isFinite(numericBalance)) {
      setError("Enter a valid opening balance.");
      return;
    }

    const decimalPlaces = currency === "JPY" ? 0 : 2;
const multiplier = 10 ** decimalPlaces;
const minorUnits = Math.round(numericBalance * multiplier);

    if (!Number.isSafeInteger(minorUnits)) {
      setError("Opening balance is too large.");
      return;
    }

    if (lastFourDigits && !/^\d{4}$/.test(lastFourDigits)) {
      setError("Enter exactly four digits for the last four digits.");
      return;
    }

    setLoading(true);

    try {
      const account = await createAccount(workspaceId, {
        name: name.trim(),
        type,
        currency,
        openingBalanceMinorUnits: minorUnits,
        ...(institution.trim()
          ? { institution: institution.trim() }
          : {}),
        ...(lastFourDigits
          ? { lastFourDigits }
          : {}),
      });

      onCreated(account);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
      <h2 className="text-xl font-semibold">
        Add financial account
      </h2>

      <p className="text-sm text-[#78716C] mt-1 mb-6">
        Add a bank account, cash wallet or other financial account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Account name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Savings Account"
            minLength={2}
            maxLength={100}
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Account type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm bg-white"
          >
            {accountTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm bg-white"
          >
            {currencies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Opening balance
          </label>
          <input
            type="number"
            step={currency === "JPY" ? "1" : "0.01"}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
          <p className="text-xs text-[#78716C] mt-1">
            Enter the current starting balance in the selected currency.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Bank or institution (optional)
          </label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            maxLength={100}
            placeholder="e.g. SBI"
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Last four digits (optional)
          </label>
          <input
            value={lastFourDigits}
            onChange={(e) =>
              setLastFourDigits(
                e.target.value.replace(/\D/g, "").slice(0, 4)
              )
            }
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
          <p className="text-xs text-[#78716C] mt-1">
            Never enter your full card or bank account number.
          </p>
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
            disabled={loading}
            className="flex-1 p-3 rounded-xl bg-[#1C1917] text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save account"}
          </button>
        </div>
      </form>
    </section>
  );
}
