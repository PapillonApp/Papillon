import React, { useLayoutEffect } from "react";
import screens from ".";
import PapillonTabNavigator from "@/router/navigator/navigator";
import * as SplashScreen from "expo-splash-screen";
var AccountStack = PapillonTabNavigator();
var screenOptions = {
    headerBackTitleStyle: { fontFamily: "medium" },
    headerTitleStyle: { fontFamily: "semibold" },
    headerBackTitle: "Retour",
    // @ts-expect-error
    tabBarStyle: { position: "absolute" },
};
var AccountStackScreen = function () {
    useLayoutEffect(function () {
        SplashScreen.hideAsync();
    }, []);
    return (<AccountStack.Navigator screenOptions={screenOptions} tabBar={function () { return null; }}>
      {screens.map(function (_a) {
            var name = _a.name, component = _a.component, options = _a.options;
            return (<AccountStack.Screen key={name} name={name} component={component} options={options}/>);
        })}
    </AccountStack.Navigator>);
};
export default AccountStackScreen;
