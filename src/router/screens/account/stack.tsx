import React, { useLayoutEffect } from "react";
import screens from ".";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Screen } from "@/router/helpers/types";
import PapillonTabNavigator from "@/router/navigator/navigator";
import * as SplashScreen from "expo-splash-screen";

const AccountStack = PapillonTabNavigator();

const screenOptions: NativeStackNavigationOptions = {
  headerBackTitleStyle: { fontFamily: "medium" },
  headerTitleStyle: { fontFamily: "semibold" },
  headerBackTitle: "Retour",
  // @ts-expect-error
  tabBarStyle: { position: "absolute" },
};

const AccountStackScreen: Screen<"AccountStack"> = () => {
  useLayoutEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AccountStack.Navigator screenOptions={screenOptions} tabBar={() => null}>
      {screens.map(({ name, component, options }) => (
        <AccountStack.Screen key={name} name={name} component={component} options={options} />
      ))}
    </AccountStack.Navigator>
  );
};

export default AccountStackScreen;
