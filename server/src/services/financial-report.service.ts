import { Types } from "mongoose";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

interface FinancialReportOptions {
  startDate?: Date;
  endDate?: Date;
}

export async function getFinancialReport(
  workspaceId: string,
  options: FinancialReportOptions = {}
) {
  const workspaceObjectId = new Types.ObjectId(workspaceId);

  const match: Record<string, unknown> = {
    workspaceId: workspaceObjectId,
  };

  if (options.startDate || options.endDate) {
    const dateFilter: Record<string, Date> = {};

    if (options.startDate) {
      dateFilter.$gte = options.startDate;
    }

    if (options.endDate) {
      dateFilter.$lte = options.endDate;
    }

    match.transactionDate = dateFilter;
  }

  const [currencyTotals, monthlyTotals, categoryTotals] =
    await Promise.all([
      Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: { currency: "$currency", type: "$type" },
            totalMinorUnits: { $sum: "$amountMinorUnits" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.currency": 1, "_id.type": 1 } },
      ]),

      Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$transactionDate" },
              month: { $month: "$transactionDate" },
              currency: "$currency",
              type: "$type",
            },
            totalMinorUnits: { $sum: "$amountMinorUnits" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      Transaction.aggregate([
        {
          $match: {
            ...match,
            type: "EXPENSE",
            categoryId: { $ne: null },
          },
        },
        {
          $group: {
            _id: {
              categoryId: "$categoryId",
              currency: "$currency",
            },
            totalMinorUnits: { $sum: "$amountMinorUnits" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalMinorUnits: -1 } },
      ]),
    ]);

  const categoryIds = categoryTotals.map(
    (item) => item._id.categoryId
  );

  const categories = await Category.find({
    _id: { $in: categoryIds },
    workspaceId: workspaceObjectId,
  })
    .select("_id name type")
    .lean();

  const categoryMap = new Map(
    categories.map((category) => [
      category._id.toString(),
      category.name,
    ])
  );

  const totalsByCurrency = new Map<
    string,
    {
      currency: string;
      incomeMinorUnits: number;
      expenseMinorUnits: number;
      incomeCount: number;
      expenseCount: number;
    }
  >();

  for (const item of currencyTotals) {
    const currency = item._id.currency;

    if (!totalsByCurrency.has(currency)) {
      totalsByCurrency.set(currency, {
        currency,
        incomeMinorUnits: 0,
        expenseMinorUnits: 0,
        incomeCount: 0,
        expenseCount: 0,
      });
    }

    const totals = totalsByCurrency.get(currency)!;

    if (item._id.type === "INCOME") {
      totals.incomeMinorUnits = item.totalMinorUnits;
      totals.incomeCount = item.count;
    } else {
      totals.expenseMinorUnits = item.totalMinorUnits;
      totals.expenseCount = item.count;
    }
  }

  return {
    summary: Array.from(totalsByCurrency.values()).map((item) => ({
      ...item,
      netCashFlowMinorUnits:
        item.incomeMinorUnits - item.expenseMinorUnits,
    })),

    monthly: monthlyTotals.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      currency: item._id.currency,
      type: item._id.type,
      totalMinorUnits: item.totalMinorUnits,
    })),

    expensesByCategory: categoryTotals.map((item) => ({
      categoryId: item._id.categoryId.toString(),
      categoryName:
        categoryMap.get(item._id.categoryId.toString()) ??
        "Uncategorized",
      currency: item._id.currency,
      totalMinorUnits: item.totalMinorUnits,
      count: item.count,
    })),
  };
}
