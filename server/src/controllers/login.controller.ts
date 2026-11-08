
import type { Request, Response } from "express";

import { loginSchema } from "../validators/login.validator.js";
import {
  loginUser,
  LoginError,
} from "../services/login.service.js";

export async function login(
  req: Request,
  res: Response
): Promise<void> {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: "Invalid login details",
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await loginUser(validation.data);

    req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error);
        res.status(500).json({
          error: "Unable to start a secure session",
        });
        return;
      }

      req.session.userId = user.userId;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);
          res.status(500).json({
            error: "Unable to save login session",
          });
          return;
        }

        res.status(200).json({
          message: "Login successful",
          user,
        });
      });
    });
  } catch (error: unknown) {
    if (error instanceof LoginError) {
      res.status(error.statusCode).json({
        error: error.message,
      });
      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      error: "Unable to log in. Please try again.",
    });
  }
}
