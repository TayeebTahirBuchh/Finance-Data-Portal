
import type { Request, Response } from "express";

import User from "../models/User.js";

export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  try {
    const user = await User.findById(userId)
      .select("name email status emailVerified")
      .lean();

    if (!user || user.status !== "ACTIVE" || !user.emailVerified) {
      req.session.destroy(() => undefined);

      res.status(401).json({
        error: "Session is no longer valid",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("Current user lookup error:", error);

    res.status(500).json({
      error: "Unable to retrieve account details",
    });
  }
}
