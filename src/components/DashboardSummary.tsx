
import type { AccountBalance } from "../lib/account-api";

interface DashboardSummaryProps {
  balances: AccountBalance[];
}

export default function DashboardSummary({
  balances,
}: DashboardSummaryProps) {
  const currencyTotals = balances.reduce<
    Record<
      string,
      {
        income: number;
        expenses: number;
        balance: number;
      }
    >
  >((totals, account) => {
    const currency = account.currency;

    if (!totals[currency]) {
      totals[currency] = {
        income: 0,
        expenses: 0,
        balance: 0,
      };
    }

    totals[currency].income += account.incomeMinorUnits;
    totals[currency].expenses += account.expenseMinorUnits;
    totals[currency].balance += account.currentBalanceMinorUnits;

    return totals;
  }, {});

  function formatAmount(amountMinorUnits: number, currency: string) {
    const decimalPlaces = currency === "JPY" ? 0 : 2;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(amountMinorUnits / 10 ** decimalPlaces);
  }

  const currencies = Object.entries(currencyTotals);

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1C1917]">
          Financial Overview
        </h2>
        <p className="text-sm text-[#78716C] mt-1">
          Your income, expenses and account balances
        </p>
      </div>

      {currencies.length === 0 ? (
        <p className="text-sm text-[#78716C] py-6 text-center">
          Add a financial account to see your dashboard summary.
        </p>
      ) : (
        <div className="space-y-5">
          {currencies.map(([currency, totals]) => {
            const netCashFlow = totals.income - totals.expenses;

            return (
              <div
                key={currency}
                className="border border-[#E7E5E4] rounded-xl p-4"
              >
                <h3 className="font-semibold text-sm mb-4">
                  {currency} Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#78716C]">
                      Total Income
                    </p>
                    <p className="text-lg font-semibold text-green-700 mt-1">
                      {formatAmount(totals.income, currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#78716C]">
                      Total Expenses
                    </p>
                    <p className="text-lg font-semibold text-red-600 mt-1">
                      {formatAmount(totals.expenses, currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#78716C]">
                      Net Cash Flow
                    </p>
                    <p
                      className={`text-lg font-semibold mt-1 ${
                        netCashFlow >= 0
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {formatAmount(netCashFlow, currency)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E7E5E4] mt-4 pt-3">
                  <p className="text-xs text-[#78716C]">
                    Combined account balances
                  </p>
                  <p className="font-semibold mt-1">
                    {formatAmount(totals.balance, currency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
