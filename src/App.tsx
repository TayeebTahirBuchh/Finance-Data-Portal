import { useState, useEffect, FormEvent } from "react";
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---

enum Role {
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
  ADMIN = "ADMIN",
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

interface User {
  id: string;
  username: string;
  role: Role;
  status: UserStatus;
}

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  createdBy: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: Record<string, number>;
  recentActivity: Transaction[];
}

// --- Components ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "users">("dashboard");
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newTx, setNewTx] = useState({ amount: 0, type: TransactionType.EXPENSE, category: "", date: new Date().toISOString().split('T')[0], description: "" });

  const fetchSummary = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/summary", {
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/transactions", {
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== Role.ADMIN) return;
    try {
      const res = await fetch("/api/users", {
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSummary();
      fetchTransactions();
      if (currentUser.role === Role.ADMIN) fetchUsers();
      setError(null);
    }
  }, [currentUser]);

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser.id 
        },
        body: JSON.stringify(newTx)
      });
      if (res.ok) {
        fetchTransactions();
        fetchSummary();
        setNewTx({ amount: 0, type: TransactionType.EXPENSE, category: "", date: new Date().toISOString().split('T')[0], description: "" });
      } else {
        const err = await res.json();
        setError(Array.isArray(err.error) ? err.error[0].message : err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        fetchTransactions();
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-[#E7E5E4] w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#1C1917] rounded-xl flex items-center justify-center">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1C1917]">Finance Portal</h1>
          </div>
          
          <p className="text-[#57534E] mb-6 text-sm">Select a role to preview the dashboard experience.</p>
          
          <div className="space-y-3">
            {[
              { id: "1", name: "Admin User", role: Role.ADMIN, icon: ShieldCheck, color: "text-emerald-600" },
              { id: "2", name: "Analyst User", role: Role.ANALYST, icon: Shield, color: "text-blue-600" },
              { id: "3", name: "Viewer User", role: Role.VIEWER, icon: ShieldAlert, color: "text-amber-600" },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setCurrentUser({ id: u.id, username: u.name, role: u.role, status: UserStatus.ACTIVE })}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <u.icon className={`w-5 h-5 ${u.color}`} />
                  <div className="text-left">
                    <div className="font-medium text-[#1C1917]">{u.name}</div>
                    <div className="text-xs text-[#78716C] uppercase tracking-wider font-semibold">{u.role}</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E7E5E4] group-hover:bg-[#D6D3D1] flex items-center justify-center transition-colors">
                  <PlusCircle className="w-4 h-4 text-[#44403C]" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F4] flex font-sans text-[#1C1917]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E7E5E4] flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom border-[#E7E5E4]">
          <div className="w-8 h-8 bg-[#1C1917] rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">FINANCE.IO</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-[#F5F5F4] text-[#1C1917] font-medium" : "text-[#78716C] hover:bg-[#FAFAF9]"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "transactions" ? "bg-[#F5F5F4] text-[#1C1917] font-medium" : "text-[#78716C] hover:bg-[#FAFAF9]"}`}
          >
            <ArrowUpCircle className="w-5 h-5" />
            Records
          </button>
          {currentUser.role === Role.ADMIN && (
            <button 
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "users" ? "bg-[#F5F5F4] text-[#1C1917] font-medium" : "text-[#78716C] hover:bg-[#FAFAF9]"}`}
            >
              <Users className="w-5 h-5" />
              Users
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[#E7E5E4]">
          <div className="flex items-center gap-3 p-3 bg-[#F5F5F4] rounded-2xl mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#E7E5E4]">
              <UserIcon className="w-5 h-5 text-[#44403C]" />
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-sm truncate">{currentUser.username}</div>
              <div className="text-[10px] text-[#78716C] uppercase tracking-widest font-bold">{currentUser.role}</div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-center gap-2 p-3 text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">
              {activeTab === "dashboard" && "Overview"}
              {activeTab === "transactions" && "Financial Records"}
              {activeTab === "users" && "User Management"}
            </h2>
            <p className="text-[#78716C] text-sm">
              {activeTab === "dashboard" && "Real-time financial health summary."}
              {activeTab === "transactions" && "Manage and track all transactions."}
              {activeTab === "users" && "Control system access and roles."}
            </p>
          </div>
          <div className="text-sm text-[#78716C] font-mono bg-white px-3 py-1 rounded-full border border-[#E7E5E4]">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {summary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                      <div className="text-[#78716C] text-xs font-bold uppercase tracking-widest mb-4">Net Balance</div>
                      <div className="text-4xl font-light tracking-tight">${summary.netBalance.toLocaleString()}</div>
                      <div className="mt-4 h-1 w-full bg-[#F5F5F4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1C1917]" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                      <div className="text-[#78716C] text-xs font-bold uppercase tracking-widest mb-4">Total Income</div>
                      <div className="text-4xl font-light tracking-tight text-emerald-600">${summary.totalIncome.toLocaleString()}</div>
                      <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
                        <ArrowUpCircle className="w-3 h-3" /> +12.5% from last month
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                      <div className="text-[#78716C] text-xs font-bold uppercase tracking-widest mb-4">Total Expenses</div>
                      <div className="text-4xl font-light tracking-tight text-rose-600">${summary.totalExpenses.toLocaleString()}</div>
                      <div className="flex items-center gap-1 mt-2 text-rose-600 text-xs font-medium">
                        <ArrowDownCircle className="w-3 h-3" /> -4.2% from last month
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                      <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Category Breakdown
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(summary.categoryTotals).map(([cat, val]) => {
                          const value = val as number;
                          return (
                            <div key={cat} className="flex items-center justify-between">
                              <div className="text-sm text-[#44403C]">{cat}</div>
                              <div className={`text-sm font-mono ${value >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {value >= 0 ? "+" : ""}{value.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                      <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        {summary.recentActivity.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F5F5F4] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === TransactionType.INCOME ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                {tx.type === TransactionType.INCOME ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{tx.description || tx.category}</div>
                                <div className="text-[10px] text-[#78716C] uppercase tracking-wider">{tx.date}</div>
                              </div>
                            </div>
                            <div className={`text-sm font-mono font-medium ${tx.type === TransactionType.INCOME ? "text-emerald-600" : "text-rose-600"}`}>
                              {tx.type === TransactionType.INCOME ? "+" : "-"}${tx.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-[#78716C]">
                  <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Summary data restricted for your role.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {currentUser.role === Role.ADMIN && (
                <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm">
                  <h3 className="font-semibold mb-6 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    New Entry
                  </h3>
                  <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={newTx.amount || ""} 
                      onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                      className="p-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent"
                    />
                    <select 
                      value={newTx.type} 
                      onChange={(e) => setNewTx({ ...newTx, type: e.target.value as TransactionType })}
                      className="p-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent"
                    >
                      <option value={TransactionType.INCOME}>Income</option>
                      <option value={TransactionType.EXPENSE}>Expense</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Category" 
                      value={newTx.category} 
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      className="p-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent"
                    />
                    <input 
                      type="date" 
                      value={newTx.date} 
                      onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                      className="p-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent"
                    />
                    <button type="submit" className="bg-[#1C1917] text-white p-3 rounded-xl text-sm font-medium hover:bg-[#44403C] transition-colors">
                      Add Record
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Date</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Category</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Type</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Amount</th>
                      {currentUser.role === Role.ADMIN && <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#F5F5F4] hover:bg-[#FAFAF9] transition-colors">
                        <td className="p-4 text-sm text-[#44403C] font-mono">{tx.date}</td>
                        <td className="p-4 text-sm font-medium">{tx.category}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${tx.type === TransactionType.INCOME ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-mono font-medium ${tx.type === TransactionType.INCOME ? "text-emerald-600" : "text-rose-600"}`}>
                          {tx.type === TransactionType.INCOME ? "+" : "-"}${tx.amount.toLocaleString()}
                        </td>
                        {currentUser.role === Role.ADMIN && (
                          <td className="p-4">
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-rose-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && currentUser.role === Role.ADMIN && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">User</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Role</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Status</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#78716C]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#F5F5F4] hover:bg-[#FAFAF9] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#F5F5F4] rounded-lg flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-[#78716C]" />
                            </div>
                            <div className="text-sm font-medium">{u.username}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#44403C]">
                            {u.role === Role.ADMIN && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                            {u.role === Role.ANALYST && <Shield className="w-3 h-3 text-blue-600" />}
                            {u.role === Role.VIEWER && <ShieldAlert className="w-3 h-3 text-amber-600" />}
                            {u.role}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${u.status === UserStatus.ACTIVE ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-sm font-medium text-[#1C1917] hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
