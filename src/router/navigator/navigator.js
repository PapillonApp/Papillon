var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import { BottomTabView } from "@react-navigation/bottom-tabs";
import { createNavigatorFactory, TabRouter, useNavigationBuilder } from "@react-navigation/native";
import PapillonNavigatorTabs from "./tabs";
import { View } from "react-native";
import PapillonNavigatorMenu from "./menu";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var BottomTabNavigator = function (_a) {
    var initialRouteName = _a.initialRouteName, backBehavior = _a.backBehavior, children = _a.children, screenOptions = _a.screenOptions, rest = __rest(_a, ["initialRouteName", "backBehavior", "children", "screenOptions"]);
    var isTablet = useScreenDimensions().isTablet;
    var _b = useNavigationBuilder(TabRouter, {
        initialRouteName: initialRouteName,
        backBehavior: backBehavior,
        children: children,
        screenOptions: screenOptions,
    }), state = _b.state, descriptors = _b.descriptors, navigation = _b.navigation, NavigationContent = _b.NavigationContent;
    return (<NavigationContent>
      <View style={[{ flex: 1 }, isTablet && { flexDirection: "row" }]}>
        {isTablet && (<PapillonNavigatorMenu state={state} descriptors={descriptors} navigation={navigation}/>)}
        <BottomTabView {...rest} state={state} navigation={navigation} descriptors={descriptors}/>
        {!isTablet && (<PapillonNavigatorTabs state={state} descriptors={descriptors} navigation={navigation}/>)}
      </View>
    </NavigationContent>);
};
export default createNavigatorFactory(BottomTabNavigator);
