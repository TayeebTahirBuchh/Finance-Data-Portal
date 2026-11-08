
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";

import type { RegisterInput } from "../validators/auth.validator.js";

export async function registerUser(input: RegisterInput) {
  const existingUser = await User.findOne({
    email: input.email,
  }).lean();

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const session = await mongoose.startSession();

  try {
    let result: {
      userId: string;
      workspaceId: string;
    } | null = null;

    await session.withTransaction(async () => {
      const [user] = await User.create(
        [
          {
            name: input.name,
            email: input.email,
            passwordHash,
          },
        ],
        { session }
      );

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
        { session }
      );

      await Membership.create(
        [
          {
            userId: user._id,
            workspaceId: workspace._id,
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session }
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
    await session.endSession();
  }
}
