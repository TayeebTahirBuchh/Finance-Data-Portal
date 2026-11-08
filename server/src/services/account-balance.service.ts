import { Types } from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

interface TransactionTotals {
  _id: Types.ObjectId;
  incomeMinorUnits: number;
  expenseMinorUnits: number;
}

export async function getWorkspaceAccountBalances(
  workspaceId: string
) {
  const workspaceObjectId = new Types.ObjectId(workspaceId);

  const [accounts, transactionTotals] = await Promise.all([
    Account.find({
      workspaceId: workspaceObjectId,
      isArchived: false,
    })
      .select(
        "name type currency openingBalanceMinorUnits institution lastFourDigits"
      )
      .sort({ createdAt: -1 })
      .lean(),

    Transaction.aggregate<TransactionTotals>([
      {
        $match: {
          workspaceId: workspaceObjectId,
        },
      },
      {
        $group: {
          _id: "$accountId",
          incomeMinorUnits: {
            $sum: {
              $cond: [
                { $eq: ["$type", "INCOME"] },
                "$amountMinorUnits",
                0,
              ],
            },
          },
          expenseMinorUnits: {
            $sum: {
              $cond: [
                { $eq: ["$type", "EXPENSE"] },
                "$amountMinorUnits",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const totalsByAccount = new Map(
    transactionTotals.map((item) => [
      item._id.toString(),
      item,
    ])
  );

  return accounts.map((account) => {
    const totals = totalsByAccount.get(
      account._id.toString()
    );

    const income = totals?.incomeMinorUnits ?? 0;
    const expenses = totals?.expenseMinorUnits ?? 0;

    const currentBalanceMinorUnits =
      account.type === "CREDIT_CARD"
        ? account.openingBalanceMinorUnits +
          expenses -
          income
        : account.openingBalanceMinorUnits +
          income -
          expenses;

    return {
      id: account._id.toString(),
      name: account.name,
      type: account.type,
      currency: account.currency,
      openingBalanceMinorUnits:
        account.openingBalanceMinorUnits,
      incomeMinorUnits: income,
      expenseMinorUnits: expenses,
      currentBalanceMinorUnits,
      institution: account.institution,
      lastFourDigits: account.lastFourDigits,
    };
  });
}
