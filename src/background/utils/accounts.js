import { useAccounts, useCurrentAccount } from "@/stores/account";
export var getAccounts = function () {
    return useAccounts
        .getState()
        .accounts.filter(function (account) { return !account.isExternal; });
};
export var getSwitchToFunction = function () {
    return useCurrentAccount.getState().switchTo;
};
export var getCurrentAccount = function () {
    return useCurrentAccount.getState().account;
};
export var findAccountByID = function (accountID) {
    var account = getAccounts().find(function (acc) { return acc.localID === accountID; });
    return account !== null && account !== void 0 ? account : null;
};
