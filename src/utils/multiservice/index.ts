import {MultiServiceFeature} from "@/stores/multiService/types";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import {useMultiService} from "@/stores/multiService";
import {PrimaryAccount} from "@/stores/account/types";

export function getFeatureAccount (feature: MultiServiceFeature, spaceLocalID: string) {
  const accounts = useAccounts.getState().accounts;
  const accountId = useMultiService.getState().getFeatureAccountId(feature, spaceLocalID);
  const featureAccount = accounts.find(account => account.localID === accountId) as PrimaryAccount | undefined;
  if (featureAccount) {
    const linkedAccount = useCurrentAccount.getState().associatedAccounts.find(account => account.localID === accountId) as PrimaryAccount;
    featureAccount.instance = linkedAccount?.instance;
    featureAccount.authentication = linkedAccount?.authentication;
  }
  return featureAccount;
}
