import { Schema, model, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },

    amountMinorUnits: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value > 0,
        message: "Transaction amount must be a positive safe integer",
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

    description: {
      type: String,
      trim: true,
      maxlength: 250,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({
  workspaceId: 1,
  transactionDate: -1,
});

transactionSchema.index({
  accountId: 1,
  transactionDate: -1,
});

export type TransactionDocument =
  InferSchemaType<typeof transactionSchema>;

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
