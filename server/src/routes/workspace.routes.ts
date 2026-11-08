


import { Router } from "express";
import { createAccountController } from "../controllers/create-account.controller.js";
import { transactionListController } from "../controllers/transaction-list.controller.js";
import { createCategoryController } from "../controllers/create-category.controller.js";
import { categoryListController } from "../controllers/category-list.controller.js";
import { budgetListController } from "../controllers/budget-list.controller.js";
import { archiveBudgetController } from "../controllers/archive-budget.controller.js";
import { createBudgetController } from "../controllers/create-budget.controller.js";
import { archiveCategoryController } from "../controllers/archive-category.controller.js";
import { archiveAccountController } from "../controllers/archive-account.controller.js";
import { createTransactionController } from "../controllers/create-transaction.controller.js";
import { getWorkspaceAccountsController } from "../controllers/account-list.controller.js";



import {
  getWorkspaces,
  getWorkspaceById,
} from "../controllers/workspace.controller.js";

import { createWorkspaceController } from "../controllers/create-workspace.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceAccess } from "../middleware/requireWorkspaceAccess.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);

router.post("/", requireAuth, createWorkspaceController);

router.post(
  "/:workspaceId/accounts",
  requireAuth,
  requireWorkspaceAccess,
  createAccountController
);
router.patch(
  "/:workspaceId/accounts/:accountId/archive",
  requireAuth,
  requireWorkspaceAccess,
  archiveAccountController
);
router.get(
  "/:workspaceId/accounts",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceAccountsController
);
router.post(
  "/:workspaceId/transactions",
  requireAuth,
  requireWorkspaceAccess,
  createTransactionController
);
router.get(
  "/:workspaceId/transactions",
  requireAuth,
  requireWorkspaceAccess,
  transactionListController
);
router.post(
  "/:workspaceId/categories",
  requireAuth,
  requireWorkspaceAccess,
  createCategoryController
);
router.get(
  "/:workspaceId/categories",
  requireAuth,
  requireWorkspaceAccess,
  categoryListController
);
router.patch(
  "/:workspaceId/categories/:categoryId/archive",
  requireAuth,
  requireWorkspaceAccess,
  archiveCategoryController
);
router.post(
  "/:workspaceId/budgets",
  requireAuth,
  requireWorkspaceAccess,
  createBudgetController
);
router.get(
  "/:workspaceId/budgets",
  requireAuth,
  requireWorkspaceAccess,
  budgetListController
);
router.patch(
  "/:workspaceId/budgets/:budgetId/archive",
  requireAuth,
  requireWorkspaceAccess,
  archiveBudgetController
);
router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceById
);

export default router;
