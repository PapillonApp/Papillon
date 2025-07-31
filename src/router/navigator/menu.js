import React, { useMemo, useState } from "react";
import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated from "react-native-reanimated";
import MenuItem from "./atoms/MenuItem";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import AccountSwitcher from "@/components/Home/AccountSwitcher";
var PapillonNavigatorMenu = function (_a) {
    var _b;
    var state = _a.state, descriptors = _a.descriptors, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var allTabs = useMemo(function () { return state.routes; }, [state.routes]);
    var tabs = ((_b = account === null || account === void 0 ? void 0 : account.personalization.tabs) === null || _b === void 0 ? void 0 : _b.map(function (tab) { return allTabs.find(function (route) { return route.name === tab.name; }); }).filter(Boolean)) || allTabs;
    var _c = useState(false), shouldOpenContextMenu = _c[0], setShouldOpenContextMenu = _c[1];
    return (<Reanimated.View style={[
            styles.menuBar,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
            },
            Platform.OS === "android" ? styles.menuBarAndroid : styles.menuBarIOS,
        ]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"}/>
      <Reanimated.ScrollView style={[
            styles.menuBarContent,
            {
                backgroundColor: theme.colors.primary + "10",
                paddingTop: insets.top + 10,
                paddingHorizontal: 10,
            }
        ]} contentContainerStyle={{
            gap: 0,
        }}>
        <ContextMenu shouldOpenContextMenu={shouldOpenContextMenu} menuStyles={{
            position: "absolute",
            top: 40,
        }} style={[
            {
                paddingBottom: 4,
            }
        ]}>
          <AccountSwitcher loading={!(account === null || account === void 0 ? void 0 : account.instance)} translationY={undefined}/>
        </ContextMenu>

        {tabs.map(function (route, index) { return (<MenuItem key={route === null || route === void 0 ? void 0 : route.key} route={route} descriptor={route ? descriptors[route.key] : undefined} navigation={navigation} isFocused={route ? allTabs.indexOf(route) === state.index : false}/>); })}
      </Reanimated.ScrollView>
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    menuBar: {
        width: 320,
        maxWidth: "35%",
        borderRightWidth: 1,
        overflow: "visible",
    },
    menuBarContent: {
        flex: 1,
        overflow: "visible",
    },
    menuBarAndroid: {
        elevation: 10,
    },
    menuBarIOS: {},
});
export default PapillonNavigatorMenu;
