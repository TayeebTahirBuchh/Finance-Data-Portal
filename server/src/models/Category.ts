import { Schema, model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.index(
  { workspaceId: 1, name: 1, type: 1 },
  { unique: true }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

const Category = model("Category", categorySchema);

export default Category;
