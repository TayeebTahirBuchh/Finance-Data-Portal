import Account from "../models/Account.js";
import Membership from "../models/Membership.js";
import type { CreateAccountInput } from "../validators/account.validator.js";

export async function createAccount(
  userId: string,
  workspaceId: string,
  input: CreateAccountInput
) {
  const membership = await Membership.findOne({
    userId,
    workspaceId,
    status: "ACTIVE",
  }).lean();

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  const account = await Account.create({
    workspaceId,
    name: input.name,
    type: input.type,
    currency: input.currency,
    openingBalanceMinorUnits: input.openingBalanceMinorUnits,
    institution: input.institution,
    lastFourDigits: input.lastFourDigits,
  });

  return {
    id: account._id.toString(),
    name: account.name,
    type: account.type,
    currency: account.currency,
    openingBalanceMinorUnits: account.openingBalanceMinorUnits,
    institution: account.institution,
    lastFourDigits: account.lastFourDigits,
    createdAt: account.createdAt,
  };
}
