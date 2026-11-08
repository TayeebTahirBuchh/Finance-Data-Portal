
import { Schema, model, type InferSchemaType } from "mongoose";

const membershipSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "ACCOUNTANT", "EDITOR", "VIEWER"],
      default: "OWNER",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "SUSPENDED"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

membershipSchema.index(
  { userId: 1, workspaceId: 1 },
  { unique: true }
);

membershipSchema.index({ workspaceId: 1, role: 1 });

export type MembershipDocument = InferSchemaType<
  typeof membershipSchema
>;

const Membership = model("Membership", membershipSchema);

export default Membership;
