import { MultiServiceFeature } from "@/stores/multiService/types";
import { useCurrentAccount } from "@/stores/account";
import { useMultiService } from "@/stores/multiService";
import { PrimaryAccount } from "@/stores/account/types";

export function getFeatureAccount (feature: MultiServiceFeature, spaceLocalID: string) {
  const accountId = useMultiService.getState().getFeatureAccountId(feature, spaceLocalID);
  return useCurrentAccount.getState().associatedAccounts.find((account) => account.localID === accountId) as PrimaryAccount | undefined;
}

export function hasFeatureAccountSetup (feature: MultiServiceFeature, spaceLocalID: string) {
  return useMultiService.getState().getFeatureAccountId(feature, spaceLocalID) != undefined;
}
