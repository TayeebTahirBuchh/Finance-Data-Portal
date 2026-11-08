
import { Schema, model, Types, type InferSchemaType } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: ["PERSONAL", "BUSINESS"],
      default: "PERSONAL",
      required: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      default: "INR",
      minlength: 3,
      maxlength: 3,
    },

    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workspaceSchema.index({ ownerId: 1, createdAt: -1 });

export type WorkspaceDocument = InferSchemaType<typeof workspaceSchema>;

const Workspace = model("Workspace", workspaceSchema);

export default Workspace;
