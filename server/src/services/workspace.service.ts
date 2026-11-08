
import mongoose from "mongoose";

import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";

import type { CreateWorkspaceInput } from "../validators/workspace.validator.js";

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput
) {
  const dbSession = await mongoose.startSession();

  try {
    let result:
      | { workspaceId: string; name: string }
      | undefined;

    await dbSession.withTransaction(async () => {
      const [workspace] = await Workspace.create(
        [
          {
            name: input.name,
            type: input.type,
            ownerId: userId,
            baseCurrency: input.baseCurrency,
            timezone: input.timezone,
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
            userId,
            workspaceId: workspace._id,
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session: dbSession }
      );

      result = {
        workspaceId: workspace._id.toString(),
        name: workspace.name,
      };
    });

    if (!result) {
      throw new Error("Workspace creation failed");
    }

    return result;
  } finally {
    await dbSession.endSession();
  }
}
