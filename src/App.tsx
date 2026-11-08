
import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import CreateWorkspaceForm from "./components/CreateWorkspaceForm";
import CreateAccountForm from "./components/CreateAccountForm";
import CreateTransactionForm from "./components/CreateTransactionForm";
import CategoryManager from "./components/CategoryManager";
import DashboardSummary from "./components/DashboardSummary";
import BudgetManager from "./components/BudgetManager";
import SavingsGoalManager from "./components/SavingsGoalManager";

import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "./lib/auth-api";

import {
  getWorkspaces,
  type Workspace,
  type WorkspaceMembership,
} from "./lib/workspace-api";

import {
  getAccounts,
  getAccountBalances,
  archiveAccount,
  type Account,
  type AccountBalance,
} from "./lib/account-api";

import {
  getTransactions,
  type Transaction,
  type TransactionType,
} from "./lib/transaction-api";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [archivingAccountId, setArchivingAccountId] = useState("");

  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const [transactionFilter, setTransactionFilter] = useState<
    "ALL" | TransactionType
  >("ALL");

  async function loadUserData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const memberships = await getWorkspaces();
      setWorkspaces(memberships);

      setActiveWorkspaceId((current) => {
        if (
          current &&
          memberships.some(
            (item) => item.workspaceId.id === current
          )
        ) {
          return current;
        }

        return memberships[0]?.workspaceId.id ?? "";
      });
    } catch {
      setUser(null);
      setWorkspaces([]);
      setAccounts([]);
      setAccountBalances([]);
      setTransactions([]);
      setActiveWorkspaceId("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUserData();
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setAccounts([]);
      setAccountBalances([]);
      setTransactions([]);
      return;
    }

    let cancelled = false;

    async function loadWorkspaceData() {
      setAccountsLoading(true);
      setTransactionsLoading(true);
      setError("");

      try {
        const [
          accountResult,
          balanceResult,
          transactionResult,
        ] = await Promise.all([
          getAccounts(activeWorkspaceId),
          getAccountBalances(activeWorkspaceId),
          getTransactions(activeWorkspaceId, {
            page: 1,
            limit: 20,
          }),
        ]);

        if (!cancelled) {
          setAccounts(accountResult);
          setAccountBalances(balanceResult);
          setTransactions(transactionResult.transactions);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load workspace data."
          );
        }
      } finally {
        if (!cancelled) {
          setAccountsLoading(false);
          setTransactionsLoading(false);
        }
      }
    }

    void loadWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

  async function refreshTransactions() {
    if (!activeWorkspaceId) return;

    try {
      const [transactionResult, balanceResult] = await Promise.all([
        getTransactions(activeWorkspaceId, {
          page: 1,
          limit: 20,
        }),
        getAccountBalances(activeWorkspaceId),
      ]);

      setTransactions(transactionResult.transactions);
      setAccountBalances(balanceResult);
    } catch {
      setError("Transaction saved, but the dashboard could not refresh.");
    }
  }

  async function handleWorkspaceCreated(workspace: Workspace) {
    try {
      const memberships = await getWorkspaces();
      setWorkspaces(memberships);
      setActiveWorkspaceId(workspace.id);
      setShowCreateForm(false);
      setError("");
    } catch {
      setError(
        `Workspace "${workspace.name}" was created, but the list could not be refreshed.`
      );
    }
  }

  async function handleAccountCreated(account: Account) {
    setAccounts((current) => [account, ...current]);
    setShowAccountForm(false);
    setError("");

    try {
      const balances = await getAccountBalances(activeWorkspaceId);
      setAccountBalances(balances);
    } catch {
      setError("Account created, but balances could not be refreshed.");
    }
  }

  async function handleTransactionCreated() {
    setShowTransactionForm(false);
    setError("");
    await refreshTransactions();
  }

  async function handleArchiveAccount(account: Account) {
    const confirmed = window.confirm(
      `Archive "${account.name}"? It will no longer appear in your active accounts.`
    );

    if (!confirmed) return;

    setArchivingAccountId(account.id);
    setError("");

    try {
      await archiveAccount(activeWorkspaceId, account.id);

      setAccounts((current) =>
        current.filter((item) => item.id !== account.id)
      );

      const balances = await getAccountBalances(activeWorkspaceId);
      setAccountBalances(balances);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive this account."
      );
    } finally {
      setArchivingAccountId("");
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      setError("Unable to sign out. Please try again.");
      return;
    }

    setUser(null);
    setWorkspaces([]);
    setAccounts([]);
    setAccountBalances([]);
    setTransactions([]);
    setActiveWorkspaceId("");
    setShowCreateForm(false);
    setShowAccountForm(false);
    setShowTransactionForm(false);
    setShowCategoryManager(false);
    setError("");
  }

  const activeWorkspace = workspaces.find(
    (item) => item.workspaceId.id === activeWorkspaceId
  )?.workspaceId;

  function formatAmount(
    amountMinorUnits: number,
    currency: string
  ) {
    const decimalPlaces = currency === "JPY" ? 0 : 2;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(
      amountMinorUnits / 10 ** decimalPlaces
    );
  }

  function formatTransactionDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const visibleTransactions = transactions.filter(
    (transaction) =>
      transactionFilter === "ALL" ||
      transaction.type === transactionFilter
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F5F4]">
        <p className="text-sm text-[#78716C]">
          Loading your Finance Portal...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthForm
        onAuthenticated={() => {
          setLoading(true);
          void loadUserData();
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F4] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1917]">
              Finance Data Portal
            </h1>
            <p className="text-sm text-[#78716C] mt-1">
              Welcome, {user.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-white border border-[#E7E5E4] text-sm font-medium"
          >
            Sign out
          </button>
        </header>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        {showCreateForm ? (
          <CreateWorkspaceForm
            onCreated={handleWorkspaceCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : (
          <>
            <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-semibold">
                  Your Workspaces
                </h2>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-sm font-medium"
                >
                  + Create workspace
                </button>
              </div>

              {workspaces.length === 0 ? (
                <p className="text-sm text-[#78716C]">
                  No workspaces found. Create your first workspace.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {workspaces.map((membership) => {
                    const workspace = membership.workspaceId;
                    const selected =
                      activeWorkspaceId === workspace.id;

                    return (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          setActiveWorkspaceId(workspace.id);
                          setShowAccountForm(false);
                          setShowTransactionForm(false);
                          setShowCategoryManager(false);
                          setTransactionFilter("ALL");
                        }}
                        className={`text-left border rounded-xl p-4 transition ${
                          selected
                            ? "border-[#1C1917] bg-[#F5F5F4]"
                            : "border-[#E7E5E4] bg-white"
                        }`}
                      >
                        <h3 className="font-medium">
                          {workspace.name}
                        </h3>

                        <p className="text-sm text-[#78716C] mt-1">
                          {workspace.type} · {workspace.baseCurrency}
                        </p>

                        <p className="text-xs text-[#78716C] mt-2">
                          Role: {membership.role}
                        </p>

                        {selected && (
                          <p className="text-xs font-semibold mt-2">
                            Selected workspace
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {activeWorkspace && (
              <>
                <DashboardSummary balances={accountBalances} />

                <BudgetManager
                  workspaceId={activeWorkspaceId}
                  defaultCurrency={activeWorkspace.baseCurrency}
                />

                <SavingsGoalManager
                  workspaceId={activeWorkspaceId}
                />
              </>
            )}

            {activeWorkspace && (
              <>
                <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Financial Accounts
                      </h2>
                      <p className="text-sm text-[#78716C] mt-1">
                        {activeWorkspace.name}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAccountForm(true)}
                      className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-sm font-medium"
                    >
                      + Add account
                    </button>
                  </div>

                  {showAccountForm ? (
                    <CreateAccountForm
                      workspaceId={activeWorkspaceId}
                      defaultCurrency={activeWorkspace.baseCurrency}
                      onCreated={handleAccountCreated}
                      onCancel={() => setShowAccountForm(false)}
                    />
                  ) : accountsLoading ? (
                    <p className="text-sm text-[#78716C]">
                      Loading accounts...
                    </p>
                  ) : accounts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-medium">
                        No accounts yet
                      </p>
                      <p className="text-sm text-[#78716C] mt-1">
                        Add your first bank account, cash wallet or card.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accounts.map((account) => {
                        const balance = accountBalances.find(
                          (item) => item.id === account.id
                        );

                        return (
                          <div
                            key={account.id}
                            className="border border-[#E7E5E4] rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-medium">
                                  {account.name}
                                </h3>

                                <p className="text-sm text-[#78716C] mt-1">
                                  {account.type.replace("_", " ")}
                                  {account.institution
                                    ? ` · ${account.institution}`
                                    : ""}
                                </p>

                                {account.lastFourDigits && (
                                  <p className="text-xs text-[#78716C] mt-1">
                                    Ending in {account.lastFourDigits}
                                  </p>
                                )}
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-[#78716C]">
                                  Current balance
                                </p>
                                <p className="font-semibold">
                                  {formatAmount(
                                    balance?.currentBalanceMinorUnits ??
                                      account.openingBalanceMinorUnits,
                                    account.currency
                                  )}
                                </p>
                                <p className="text-xs text-[#78716C] mt-1">
                                  Opening:{" "}
                                  {formatAmount(
                                    account.openingBalanceMinorUnits,
                                    account.currency
                                  )}
                                </p>
                              </div>
                            </div>

                            {balance && (
                              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#E7E5E4]">
                                <div>
                                  <p className="text-xs text-[#78716C]">
                                    Total income
                                  </p>
                                  <p className="text-sm font-medium text-green-700">
                                    {formatAmount(
                                      balance.incomeMinorUnits,
                                      account.currency
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#78716C]">
                                    Total expenses
                                  </p>
                                  <p className="text-sm font-medium text-red-600">
                                    {formatAmount(
                                      balance.expenseMinorUnits,
                                      account.currency
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end mt-3">
                              <button
                                onClick={() =>
                                  void handleArchiveAccount(account)
                                }
                                disabled={
                                  archivingAccountId === account.id
                                }
                                className="text-sm text-red-600 font-medium disabled:opacity-50"
                              >
                                {archivingAccountId === account.id
                                  ? "Archiving..."
                                  : "Archive account"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Categories
                      </h2>
                      <p className="text-sm text-[#78716C] mt-1">
                        Manage your income and expense categories.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setShowCategoryManager((current) => !current)
                      }
                      className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-sm font-medium"
                    >
                      {showCategoryManager
                        ? "Close"
                        : "Manage categories"}
                    </button>
                  </div>

                  {showCategoryManager && (
                    <div className="mt-6">
                      <CategoryManager
                        workspaceId={activeWorkspaceId}
                      />
                    </div>
                  )}
                </section>

                <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Transactions
                      </h2>
                      <p className="text-sm text-[#78716C] mt-1">
                        Recent income and expenses
                      </p>
                    </div>

                    <button
                      onClick={() => setShowTransactionForm(true)}
                      disabled={accounts.length === 0}
                      className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-sm font-medium disabled:opacity-50"
                    >
                      + Add transaction
                    </button>
                  </div>

                  {showTransactionForm ? (
                    <CreateTransactionForm
                      workspaceId={activeWorkspaceId}
                      accounts={accounts}
                      onCreated={handleTransactionCreated}
                      onCancel={() =>
                        setShowTransactionForm(false)
                      }
                    />
                  ) : transactionsLoading ? (
                    <p className="text-sm text-[#78716C]">
                      Loading transactions...
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {(["ALL", "INCOME", "EXPENSE"] as const).map(
                          (filter) => (
                            <button
                              key={filter}
                              onClick={() =>
                                setTransactionFilter(filter)
                              }
                              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                                transactionFilter === filter
                                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                                  : "bg-white border-[#E7E5E4]"
                              }`}
                            >
                              {filter === "ALL"
                                ? "All"
                                : filter === "INCOME"
                                ? "Income"
                                : "Expenses"}
                            </button>
                          )
                        )}
                      </div>

                      {visibleTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="font-medium">
                            No transactions found
                          </p>
                          <p className="text-sm text-[#78716C] mt-1">
                            Add your first income or expense transaction.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visibleTransactions.map((transaction) => {
                            const account = accounts.find(
                              (item) =>
                                item.id === transaction.accountId
                            );

                            return (
                              <div
                                key={transaction.id}
                                className="border border-[#E7E5E4] rounded-xl p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="font-medium">
                                      {transaction.description ||
                                        (transaction.type === "INCOME"
                                          ? "Income"
                                          : "Expense")}
                                    </h3>

                                    <p className="text-xs text-[#78716C] mt-1">
                                      {account?.name || "Account"} ·{" "}
                                      {formatTransactionDate(
                                        transaction.transactionDate
                                      )}
                                    </p>
                                  </div>

                                  <p
                                    className={`font-semibold text-right ${
                                      transaction.type === "INCOME"
                                        ? "text-green-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {transaction.type === "INCOME"
                                      ? "+"
                                      : "-"}
                                    {formatAmount(
                                      transaction.amountMinorUnits,
                                      transaction.currency
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-xs text-[#78716C] mt-5">
                        Showing up to 20 recent transactions.
                      </p>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
