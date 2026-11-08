
import { useEffect, useState, type FormEvent } from "react";
import {
  getCategories,
  createCategory,
  archiveCategory,
  type Category,
  type CategoryType,
} from "../lib/category-api";

interface CategoryManagerProps {
  workspaceId: string;
}

export default function CategoryManager({
  workspaceId,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const result = await getCategories(workspaceId);
      setCategories(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

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
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Category name cannot exceed 50 characters.");
      return;
    }

    setSaving(true);

    try {
      const category = await createCategory(workspaceId, {
        name: trimmedName,
        type,
      });

      setCategories((current) =>
        [...current, category].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setName("");
      setSuccess("Category created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(category: Category) {
    if (category.isDefault) return;

    const confirmed = window.confirm(
      `Archive the "${category.name}" category? Existing transactions will remain unchanged.`
    );

    if (!confirmed) return;

    setArchivingId(category.id);
    setError("");
    setSuccess("");

    try {
      await archiveCategory(workspaceId, category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );

      setSuccess("Category archived successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive category."
      );
    } finally {
      setArchivingId("");
    }
  }

  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME"
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE"
  );

  function renderCategoryList(items: Category[]) {
    if (items.length === 0) {
      return (
        <p className="text-sm text-[#78716C] py-4">
          No categories found.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-3 border border-[#E7E5E4] rounded-xl p-3"
          >
            <div>
              <p className="text-sm font-medium">
                {category.name}
              </p>

              {category.isDefault && (
                <p className="text-xs text-[#78716C] mt-1">
                  Default category
                </p>
              )}
            </div>

            {category.isDefault ? (
              <span className="text-xs text-[#78716C]">
                Protected
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleArchive(category)}
                disabled={archivingId === category.id}
                className="text-sm text-red-600 font-medium disabled:opacity-50"
              >
                {archivingId === category.id
                  ? "Archiving..."
                  : "Archive"}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Category Management
        </h2>

        <p className="text-sm text-[#78716C] mt-1">
          Organise your income and expenses with categories.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">
            Category type
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
            Category name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={50}
            placeholder="e.g. Salary, Groceries, Transport"
            required
            className="w-full p-3 border border-[#E7E5E4] rounded-xl text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full p-3 rounded-xl bg-[#1C1917] text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Creating..." : "+ Create category"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-xl mb-4">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#78716C]">
          Loading categories...
        </p>
      ) : (
        <div className="space-y-7">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-700">
                Income Categories
              </h3>

              <span className="text-xs text-[#78716C]">
                {incomeCategories.length} categories
              </span>
            </div>

            {renderCategoryList(incomeCategories)}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-red-600">
                Expense Categories
              </h3>

              <span className="text-xs text-[#78716C]">
                {expenseCategories.length} categories
              </span>
            </div>

            {renderCategoryList(expenseCategories)}
          </div>

          <button
            type="button"
            onClick={() => void loadCategories()}
            className="text-sm font-medium underline text-[#57534E]"
          >
            Refresh categories
          </button>
        </div>
      )}
    </section>
  );
}
