
import type { Request, Response } from "express";

export function logout(
  req: Request,
  res: Response
): void {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      res.status(500).json({
        error: "Unable to log out. Please try again.",
      });
      return;
    }

    res.clearCookie("fdp.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  });
}
