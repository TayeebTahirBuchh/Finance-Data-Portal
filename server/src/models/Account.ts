
import { Schema, model, type InferSchemaType } from "mongoose";

const accountSchema = new Schema(
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

    type: {
      type: String,
      enum: [
        "CASH",
        "BANK",
        "SAVINGS",
        "CURRENT",
        "CREDIT_CARD",
        "WALLET",
        "INVESTMENT",
        "OTHER",
      ],
      required: true,
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

    openingBalanceMinorUnits: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Opening balance must be a safe integer",
      },
    },

    institution: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    lastFourDigits: {
      type: String,
      match: /^\d{4}$/,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

accountSchema.index({
  workspaceId: 1,
  createdAt: -1,
});

export type AccountDocument = InferSchemaType<
  typeof accountSchema
>;

const Account = model("Account", accountSchema);

export default Account;
