

import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";

import type { RegisterInput } from "../validators/auth.validator.js";

interface RegistrationResult {
  userId: string;
  workspaceId: string;
}

export async function registerUser(
  input: RegisterInput
): Promise<RegistrationResult> {
  const existingUser = await User.findOne({
    email: input.email,
  }).lean();

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const dbSession = await mongoose.startSession();

  try {
    let result: RegistrationResult | undefined;

    await dbSession.withTransaction(async () => {
      const [user] = await User.create(
        [
          {
            name: input.name,
            email: input.email,
            passwordHash,
          },
        ],
        { session: dbSession }
      );

      if (!user) {
        throw new Error("Failed to create user");
      }

      const [workspace] = await Workspace.create(
        [
          {
            name: "Personal Workspace",
            type: "PERSONAL",
            ownerId: user._id,
            baseCurrency: "INR",
            timezone: "Asia/Kolkata",
          },
        ],
        { session: dbSession }
      );

      if (!workspace) {
        throw new Error("Failed to create workspace");
      }

      await Membership.create(
        [
          {
            userId: user._id,
            workspaceId: workspace._id,
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session: dbSession }
      );

      result = {
        userId: user._id.toString(),
        workspaceId: workspace._id.toString(),
      };
    });

    if (!result) {
      throw new Error("Account registration failed");
    }

    return result;
  } finally {
    await dbSession.endSession();
  }
}
