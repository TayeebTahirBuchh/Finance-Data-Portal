


import { Router } from "express";
import { createAccountController } from "../controllers/create-account.controller.js";
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
router.get(
  "/:workspaceId/accounts",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceAccountsController
);
router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceById
);

export default router;
