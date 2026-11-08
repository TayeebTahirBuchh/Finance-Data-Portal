import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "./lib/auth-api";
import {
  getWorkspaces,
  type WorkspaceMembership,
} from "./lib/workspace-api";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUserData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const memberships = await getWorkspaces();
      setWorkspaces(memberships);
    } catch {
      setUser(null);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUserData();
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      setError("Unable to sign out. Please try again.");
      return;
    }

    setUser(null);
    setWorkspaces([]);
    setError("");
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
      <AuthForm onAuthenticated={() => {
        setLoading(true);
        void loadUserData();
      }} />
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F4] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
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
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6">
          <h2 className="text-lg font-semibold mb-4">
            Your Workspaces
          </h2>

          {workspaces.length === 0 ? (
            <p className="text-sm text-[#78716C]">
              No workspaces found.
            </p>
          ) : (
            <div className="space-y-3">
              {workspaces.map((membership) => (
                <div
                  key={membership.workspaceId.id}
                  className="border border-[#E7E5E4] rounded-xl p-4"
                >
                  <h3 className="font-medium">
                    {membership.workspaceId.name}
                  </h3>

                  <p className="text-sm text-[#78716C] mt-1">
                    {membership.workspaceId.type} ·{" "}
                    {membership.workspaceId.baseCurrency} ·{" "}
                    {membership.role}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
