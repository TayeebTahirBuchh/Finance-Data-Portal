
import bcrypt from "bcrypt";

import User from "../models/User.js";
import type { LoginInput } from "../validators/login.validator.js";

export class LoginError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "LoginError";
  }
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user) {
    throw new LoginError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new LoginError("Invalid email or password", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new LoginError("This account is unavailable", 403);
  }

  if (!user.emailVerified) {
    throw new LoginError("Please verify your email before logging in", 403);
  }

  return {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
