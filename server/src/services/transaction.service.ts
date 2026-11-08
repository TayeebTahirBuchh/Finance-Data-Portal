import Account from "../models/Account.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

import type { CreateTransactionInput } from "../validators/transaction.validator.js";

export async function createTransaction(
  workspaceId: string,
  input: CreateTransactionInput
) {
  const account = await Account.findOne({
    _id: input.accountId,
    workspaceId,
    isArchived: false,
  }).lean();

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  if (account.currency !== input.currency) {
    throw new Error("CURRENCY_MISMATCH");
  }

  if (input.categoryId) {
    const category = await Category.findOne({
      _id: input.categoryId,
      workspaceId,
      type: input.type,
      isArchived: false,
    }).lean();

    if (!category) {
      throw new Error("INVALID_CATEGORY");
    }
  }

  const transaction = await Transaction.create({
    workspaceId,
    accountId: account._id,
    type: input.type,
    amountMinorUnits: input.amountMinorUnits,
    currency: input.currency,
    description: input.description,
    categoryId: input.categoryId ?? null,
    transactionDate: new Date(input.transactionDate),
    notes: input.notes,
  });

  return {
    id: transaction._id.toString(),
    accountId: transaction.accountId.toString(),
    type: transaction.type,
    amountMinorUnits: transaction.amountMinorUnits,
    currency: transaction.currency,
    description: transaction.description,
    categoryId: transaction.categoryId?.toString() ?? null,
    transactionDate: transaction.transactionDate,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
  };
}
