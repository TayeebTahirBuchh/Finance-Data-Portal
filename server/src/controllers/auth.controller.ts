
import type { Request, Response } from "express";

import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response
): Promise<void> {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid registration details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const result = await registerUser(validation.data);

    res.status(201).json({
      message: "Account created successfully",
      userId: result.userId,
      workspaceId: result.workspaceId,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        error: "An account with this email already exists",
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "An account with this email already exists"
    ) {
      res.status(409).json({ error: error.message });
      return;
    }

    console.error("Registration error:", error);

    res.status(500).json({
      error: "Unable to create account. Please try again.",
    });
  }
}
