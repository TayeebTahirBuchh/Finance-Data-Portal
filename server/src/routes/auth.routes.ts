
import { Router } from "express";

import { register } from "../controllers/auth.controller.js";
import { login } from "../controllers/login.controller.js";
import { getCurrentUser } from "../controllers/me.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getCurrentUser);

export default router;
