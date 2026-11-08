import { Schema, model, type InferSchemaType } from "mongoose";

const budgetSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    amountMinorUnits: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value > 0,
        message: "Budget amount must be a positive safe integer",
      },
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: [
        "INR", "USD", "EUR", "GBP", "AED", "SAR", "PKR",
        "BDT", "LKR", "NPR", "CAD", "AUD", "NZD", "SGD",
        "JPY", "CNY", "CHF", "HKD", "MYR", "ZAR", "TRY",
      ],
    },
    period: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

budgetSchema.index({ workspaceId: 1, startDate: 1, endDate: 1 });

export type BudgetDocument = InferSchemaType<typeof budgetSchema>;

const Budget = model("Budget", budgetSchema);

export default Budget;
