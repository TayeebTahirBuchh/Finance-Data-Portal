import Account from "../models/Account.js";

export async function getWorkspaceAccounts(workspaceId: string) {
  const accounts = await Account.find({
    workspaceId,
    isArchived: false,
  })
    .select(
      "name type currency openingBalanceMinorUnits institution lastFourDigits createdAt"
    )
    .sort({ createdAt: -1 })
    .lean();

  return accounts.map((account) => ({
    id: account._id.toString(),
    name: account.name,
    type: account.type,
    currency: account.currency,
    openingBalanceMinorUnits: account.openingBalanceMinorUnits,
    institution: account.institution,
    lastFourDigits: account.lastFourDigits,
    createdAt: account.createdAt,
  }));
}
