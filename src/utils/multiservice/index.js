import { useCurrentAccount } from "@/stores/account";
import { useMultiService } from "@/stores/multiService";
export function getFeatureAccount(feature, spaceLocalID) {
    var accountId = useMultiService.getState().getFeatureAccountId(feature, spaceLocalID);
    return useCurrentAccount.getState().associatedAccounts.find(function (account) { return account.localID === accountId; });
}
export function hasFeatureAccountSetup(feature, spaceLocalID) {
    return useMultiService.getState().getFeatureAccountId(feature, spaceLocalID) != undefined;
}
