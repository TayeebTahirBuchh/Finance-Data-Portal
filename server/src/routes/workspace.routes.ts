

import { Router } from "express";

import {
  getWorkspaces,
  getWorkspaceById,
} from "../controllers/workspace.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { requireWorkspaceAccess } from "../middleware/requireWorkspaceAccess.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);

router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAccess,
  getWorkspaceById
);

export default router;
