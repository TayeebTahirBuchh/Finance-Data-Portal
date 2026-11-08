import { Schema, model, type InferSchemaType } from "mongoose";

const savingsGoalSchema = new Schema(
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
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    targetAmountMinorUnits: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value > 0,
        message: "Target amount must be a positive safe integer",
      },
    },

    currentAmountMinorUnits: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value >= 0,
        message: "Current amount must be a non-negative safe integer",
      },
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: [
        "INR", "USD", "EUR", "GBP", "AED", "SAR",
        "PKR", "BDT", "LKR", "NPR", "CAD", "AUD",
        "NZD", "SGD", "JPY", "CNY", "CHF", "HKD",
        "MYR", "ZAR", "TRY",
      ],
    },

    targetDate: {
      type: Date,
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

savingsGoalSchema.index({
  workspaceId: 1,
  isArchived: 1,
  targetDate: 1,
});

export type SavingsGoalDocument =
  InferSchemaType<typeof savingsGoalSchema>;

const SavingsGoal = model("SavingsGoal", savingsGoalSchema);

export default SavingsGoal;
