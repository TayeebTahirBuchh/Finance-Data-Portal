import Account from "../models/Account.js";

export async function archiveAccount(
  workspaceId: string,
  accountId: string
) {
  const account = await Account.findOneAndUpdate(
    {
      _id: accountId,
      workspaceId,
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("_id name isArchived updatedAt")
    .lean();

  if (!account) {
    return null;
  }

  return {
    id: account._id.toString(),
    name: account.name,
    isArchived: account.isArchived,
    updatedAt: account.updatedAt,
  };
}
