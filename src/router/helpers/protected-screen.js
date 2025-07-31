import React, { useEffect } from "react";
import { useCurrentAccount } from "@/stores/account";
import { Text } from "react-native";
var ProtectedScreen = function (_a) {
    var navigation = _a.navigation, children = _a.children;
    var account = useCurrentAccount(function (store) { return store.account; });
    useEffect(function () {
        if (account === null)
            navigation.reset({ index: 0, routes: [{ name: "AccountSelector" }] });
    }, [account]);
    // We show a placeholder screen while the redirection is happening.
    if (account === null)
        return (<Text>
      Déconnexion en cours...
    </Text>);
    return children;
};
export var protectScreenComponent = function (Component) { return function (_a) {
    var navigation = _a.navigation, route = _a.route;
    return (<ProtectedScreen navigation={navigation}>
    <Component navigation={navigation} route={route}/>
  </ProtectedScreen>);
}; };
