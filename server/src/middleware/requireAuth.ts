
import type { Request, Response, NextFunction } from "express";

import User from "../models/User.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  try {
    const user = await User.findById(userId)
      .select("status emailVerified")
      .lean();

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.emailVerified
    ) {
      req.session.destroy(() => undefined);

      res.status(401).json({
        error: "Your session is no longer valid",
      });
      return;
    }

    next();
  } catch (error: unknown) {
    console.error("Authentication middleware error:", error);

    res.status(500).json({
      error: "Unable to verify authentication",
    });
  }
}
