


import { Router } from "express";
import { createAccountController } from "../controllers/create-account.controller.js";
import { transactionListController } from "../controllers/transaction-list.controller.js";
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
router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceById
);

export default router;
