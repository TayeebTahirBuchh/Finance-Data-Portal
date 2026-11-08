

import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import CreateWorkspaceForm from "./components/CreateWorkspaceForm";
import CreateAccountForm from "./components/CreateAccountForm";
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
  archiveAccount,
  type Account,
} from "./lib/account-api";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [archivingAccountId, setArchivingAccountId] = useState("");
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

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
      return;
    }

    let cancelled = false;

    async function loadAccounts() {
      setAccountsLoading(true);
      setError("");

      try {
        const result = await getAccounts(activeWorkspaceId);

        if (!cancelled) {
          setAccounts(result);
        }
      } catch (err) {
        if (!cancelled) {
          setAccounts([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load accounts."
          );
        }
      } finally {
        if (!cancelled) {
          setAccountsLoading(false);
        }
      }
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

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

  function handleAccountCreated(account: Account) {
    setAccounts((current) => [account, ...current]);
    setShowAccountForm(false);
    setError("");
  }

  async function handleArchiveAccount(account: Account) {
    const confirmed = window.confirm(
      `Archive "${account.name}"? It will no longer appear in your active accounts.`
    );

    if (!confirmed) {
      return;
    }

    setArchivingAccountId(account.id);
    setError("");

    try {
      await archiveAccount(activeWorkspaceId, account.id);

      setAccounts((current) =>
        current.filter((item) => item.id !== account.id)
      );
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
    setActiveWorkspaceId("");
    setShowCreateForm(false);
    setShowAccountForm(false);
    setError("");
  }

  const activeWorkspace = workspaces.find(
    (item) => item.workspaceId.id === activeWorkspaceId
  )?.workspaceId;

  function formatBalance(account: Account) {
    const decimalPlaces = account.currency === "JPY" ? 0 : 2;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: account.currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(
      account.openingBalanceMinorUnits /
        10 ** decimalPlaces
    );
  }

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
      <div className="max-w-4xl mx-auto">
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
              <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
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
                    {accounts.map((account) => (
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

                          <p className="font-semibold text-right">
                            {formatBalance(account)}
                          </p>
                        </div>

                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => void handleArchiveAccount(account)}
                            disabled={archivingAccountId === account.id}
                            className="text-sm text-red-600 font-medium disabled:opacity-50"
                          >
                            {archivingAccountId === account.id
                              ? "Archiving..."
                              : "Archive account"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
