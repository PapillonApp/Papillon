import React, { useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabItem from "./atoms/TabItem";
import Reanimated from "react-native-reanimated";
var PapillonNavigatorTabs = function (_a) {
    var state = _a.state, descriptors = _a.descriptors, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var _b = useState({
        hideTabTitles: false,
        showTabBackground: false,
    }), settings = _b[0], setSettings = _b[1];
    useEffect(function () {
        var _a, _b;
        setSettings({
            hideTabTitles: ((_a = account === null || account === void 0 ? void 0 : account.personalization) === null || _a === void 0 ? void 0 : _a.hideTabTitles) || false,
            showTabBackground: ((_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.showTabBackground) || false,
        });
    }, [account === null || account === void 0 ? void 0 : account.personalization]);
    var allTabs = useMemo(function () { return state.routes; }, [state.routes]);
    var tabs = useMemo(function () {
        var _a;
        var enabledTabs = (_a = account === null || account === void 0 ? void 0 : account.personalization.tabs) === null || _a === void 0 ? void 0 : _a.filter(function (tab) { return tab.enabled; });
        return (enabledTabs === null || enabledTabs === void 0 ? void 0 : enabledTabs.map(function (tab) { return allTabs.find(function (route) { return route.name === tab.name; }); }).filter(Boolean)) || allTabs.slice(0, 5);
    }, [account === null || account === void 0 ? void 0 : account.personalization.tabs, allTabs]);
    return (<Reanimated.View style={[
            styles.tabBar,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                paddingBottom: insets.bottom + 10,
            },
            Platform.OS === "android" ? styles.tabBarAndroid : styles.tabBarIOS,
        ]}>
      {tabs.map(function (route, index) { return (<TabItem key={route === null || route === void 0 ? void 0 : route.key} route={route} descriptor={route ? descriptors[route.key] : undefined} navigation={navigation} isFocused={route ? allTabs.indexOf(route) === state.index : false} settings={settings}/>); })}
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingTop: 8,
        zIndex: 1000,
        borderTopWidth: 0.5,
    },
    tabBarAndroid: {
        elevation: 10,
    },
    tabBarIOS: {},
});
export default React.memo(PapillonNavigatorTabs);
