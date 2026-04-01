import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Data Models & Mock Database ---

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

// In-memory storage
const users: User[] = [
  { id: "1", username: "admin", role: Role.ADMIN, status: UserStatus.ACTIVE },
  { id: "2", username: "analyst", role: Role.ANALYST, status: UserStatus.ACTIVE },
  { id: "3", username: "viewer", role: Role.VIEWER, status: UserStatus.ACTIVE },
];

const transactions: Transaction[] = [
  { id: "1", amount: 5000, type: TransactionType.INCOME, category: "Salary", date: "2024-03-01", description: "Monthly salary", createdBy: "1" },
  { id: "2", amount: 1200, type: TransactionType.EXPENSE, category: "Rent", date: "2024-03-05", description: "Monthly rent", createdBy: "1" },
  { id: "3", amount: 200, type: TransactionType.EXPENSE, category: "Groceries", date: "2024-03-10", description: "Weekly groceries", createdBy: "1" },
  { id: "4", amount: 1500, type: TransactionType.INCOME, category: "Freelance", date: "2024-03-15", description: "Project payment", createdBy: "1" },
];

// --- Validation Schemas ---

const UserSchema = z.object({
  username: z.string().min(3),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
});

const TransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional().default(""),
});

// --- Middleware ---

// Mock Auth Middleware (for simplicity, we'll use a header X-User-ID)
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing X-User-ID header" });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: User not found" });
  }

  if (user.status === UserStatus.INACTIVE) {
    return res.status(403).json({ error: "Forbidden: User account is inactive" });
  }

  (req as any).user = user;
  next();
};

// RBAC Middleware
const authorize = (roles: Role[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user as User;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(", ")}` });
    }
    next();
  };
};

// --- API Routes ---

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // 1. User Management
  app.get("/api/users", authMiddleware, authorize([Role.ADMIN]), (req, res) => {
    res.json(users);
  });

  app.post("/api/users", authMiddleware, authorize([Role.ADMIN]), (req, res) => {
    try {
      const data = UserSchema.parse(req.body);
      const newUser: User = {
        id: (users.length + 1).toString(),
        ...data,
      };
      users.push(newUser);
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(400).json({ error: err.errors || "Invalid input" });
    }
  });

  app.patch("/api/users/:id", authMiddleware, authorize([Role.ADMIN]), (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });

    try {
      const data = UserSchema.partial().parse(req.body);
      users[userIndex] = { ...users[userIndex], ...data };
      res.json(users[userIndex]);
    } catch (err: any) {
      res.status(400).json({ error: err.errors || "Invalid input" });
    }
  });

  // 2. Financial Records Management
  app.get("/api/transactions", authMiddleware, (req, res) => {
    const { type, category, startDate, endDate } = req.query;
    let filtered = [...transactions];

    if (type) filtered = filtered.filter((t) => t.type === type);
    if (category) filtered = filtered.filter((t) => t.category === category);
    if (startDate) filtered = filtered.filter((t) => t.date >= (startDate as string));
    if (endDate) filtered = filtered.filter((t) => t.date <= (endDate as string));

    res.json(filtered);
  });

  app.post("/api/transactions", authMiddleware, authorize([Role.ADMIN]), (req, res) => {
    try {
      const data = TransactionSchema.parse(req.body);
      const user = (req as any).user as User;
      const newTx: Transaction = {
        id: (transactions.length + 1).toString(),
        ...data,
        createdBy: user.id,
      };
      transactions.push(newTx);
      res.status(201).json(newTx);
    } catch (err: any) {
      res.status(400).json({ error: err.errors || "Invalid input" });
    }
  });

  app.delete("/api/transactions/:id", authMiddleware, authorize([Role.ADMIN]), (req, res) => {
    const { id } = req.params;
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).json({ error: "Transaction not found" });
    
    transactions.splice(index, 1);
    res.status(204).send();
  });

  // 3. Dashboard Summary APIs
  app.get("/api/summary", authMiddleware, authorize([Role.ADMIN, Role.ANALYST]), (req, res) => {
    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const categoryTotals: Record<string, number> = {};
    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.type === TransactionType.INCOME ? t.amount : -t.amount);
    });

    const recentActivity = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
      categoryTotals,
      recentActivity,
    });
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
