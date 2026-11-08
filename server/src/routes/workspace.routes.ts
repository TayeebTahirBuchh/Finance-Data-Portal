
import { Router } from "express";

import { getWorkspaces } from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getWorkspaces);

export default router;
