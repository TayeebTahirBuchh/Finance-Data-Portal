import { useState, type FormEvent } from "react";
import {
  createWorkspace,
  type Workspace,
  type WorkspaceType,
} from "../lib/workspace-api";

interface CreateWorkspaceFormProps {
  onCreated: (workspace: Workspace) => void;
  onCancel: () => void;
}

const currencies = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "JPY",
];

export default function CreateWorkspaceForm({
  onCreated,
  onCancel,
}: CreateWorkspaceFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<WorkspaceType>("PERSONAL");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        type,
        baseCurrency,
        timezone,
      });

      onCreated(workspace);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-[#1C1917]">
        Create workspace
      </h2>

      <p className="text-sm text-[#78716C] mt-1 mb-6">
        Create a separate space to manage your finances.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">
            Workspace name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Personal Finance"
            minLength={2}
            maxLength={80}
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1C1917]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Workspace type
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("PERSONAL")}
              className={`p-4 rounded-xl border text-sm font-medium ${
                type === "PERSONAL"
                  ? "border-[#1C1917] bg-[#F5F5F4]"
                  : "border-[#E7E5E4]"
              }`}
            >
              Personal
            </button>

            <button
              type="button"
              onClick={() => setType("BUSINESS")}
              className={`p-4 rounded-xl border text-sm font-medium ${
                type === "BUSINESS"
                  ? "border-[#1C1917] bg-[#F5F5F4]"
                  : "border-[#E7E5E4]"
              }`}
            >
              Business
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Base currency
          </label>

          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm bg-white"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Timezone
          </label>

          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
            placeholder="Asia/Kolkata"
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex gap-3">
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
            {loading ? "Creating..." : "Create workspace"}
          </button>
        </div>
      </form>
    </section>
  );
}
