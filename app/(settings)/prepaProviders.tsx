import { Redirect } from "expo-router";
import React from "react";

import PrepaProviderSetup from "@/components/prepa/PrepaProviderSetup";
import { useAccountStore } from "@/stores/account";
import { isPrepaAccount } from "@/stores/account/prepaProviders";

export default function SettingsPrepaProviders() {
  const account = useAccountStore(state =>
    state.accounts.find(item => item.id === state.lastUsedAccount)
  );

  return account && isPrepaAccount(account) ? (
    <PrepaProviderSetup key={account.id} account={account} />
  ) : (
    <Redirect href="/(settings)/settings" />
  );
}
