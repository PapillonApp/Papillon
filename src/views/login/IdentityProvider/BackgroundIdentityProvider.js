import { useCurrentAccount } from "@/stores/account";
import { useEffect } from "react";
var BackgroundIdentityProvider = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    useEffect(function () {
        if (!account) {
            navigation.goBack();
        }
        var identityProvider = account.identityProvider;
        if (identityProvider) {
            var identifier = identityProvider.identifier, rawData = identityProvider.rawData;
            if (identifier === "iut-lannion") {
                navigation.goBack();
                navigation.navigate("BackgroundIUTLannion");
            }
            else {
                navigation.goBack();
            }
        }
        else {
            navigation.goBack();
        }
    }, [account]);
    return null;
};
export default BackgroundIdentityProvider;
