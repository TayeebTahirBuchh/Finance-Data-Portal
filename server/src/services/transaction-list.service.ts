import Transaction from "../models/Transaction.js";

interface ListTransactionsOptions {
  page?: number;
  limit?: number;
  type?: "INCOME" | "EXPENSE";
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function listTransactions(
  workspaceId: string,
  options: ListTransactionsOptions = {}
) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));

  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { workspaceId };

  if (options.type) {
    filter.type = options.type;
  }

  if (options.accountId) {
    filter.accountId = options.accountId;
  }

  if (options.startDate || options.endDate) {
    const dateFilter: Record<string, Date> = {};

    if (options.startDate) {
      dateFilter.$gte = options.startDate;
    }

    if (options.endDate) {
      dateFilter.$lte = options.endDate;
    }

    filter.transactionDate = dateFilter;
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Transaction.countDocuments(filter),
  ]);

  return {
    transactions: transactions.map((transaction) => ({
      id: transaction._id.toString(),
      accountId: transaction.accountId.toString(),
      type: transaction.type,
      amountMinorUnits: transaction.amountMinorUnits,
      currency: transaction.currency,
      description: transaction.description ?? null,
      categoryId: transaction.categoryId?.toString() ?? null,
      transactionDate: transaction.transactionDate,
      notes: transaction.notes ?? null,
      createdAt: transaction.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + transactions.length < total,
      hasPreviousPage: page > 1,
    },
  };
}
