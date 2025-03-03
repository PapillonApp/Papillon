import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const HomeStack = createNativeStackNavigator<RouteParameters>();

export const screenOptions: NativeStackNavigationOptions = {
  headerBackTitleStyle: {
    fontFamily: "medium",
  },
  headerTitleStyle: {
    fontFamily: "semibold",
  },
  headerBackTitle: "Retour",
};

import * as SplashScreen from "expo-splash-screen";

import { useCurrentAccount } from "@/stores/account";
import createScreen from "@/router/helpers/create-screen";
import Home from "@/views/account/Home/Home";
import type { RouteParameters } from "@/router/helpers/types";
import { Platform } from "react-native";
import { useEffect } from "react";

const HomeStackScreen = ({ accountScreens }: {
  accountScreens: Array<ReturnType<typeof createScreen>>
}) => {
  const account = useCurrentAccount(store => store.account);
  let newAccountScreens = accountScreens;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (account?.personalization.tabs) {
    let newTabs = account.personalization.tabs;
    newTabs = newTabs.filter(tab => !tab.enabled);

    newAccountScreens = newTabs.map(tab => {
      const tabData = accountScreens.find(t => t.name === tab.name);
      if (tabData) {
        tabData.options = {
          ...tabData.options,
          tabEnabled: tab.enabled,
          presentation: "formSheet",
          animation: Platform.OS === "android" ? "slide_from_bottom" : "default",

          sheetCornerRadius: 24,
        };

        return tabData;
      }
    }).filter(Boolean) as Array<ReturnType<typeof createScreen>>; // filter out undefined
  }
  else {
    for (const screen of newAccountScreens) {
      screen.options.tabEnabled = true;
    }
  }

  // Add Home as the first tab.
  newAccountScreens.unshift(
    createScreen("HomeScreen", Home, {
      headerShown: false,
      animation: Platform.OS === "android" ? "slide_from_right" : "default",
    }) as ReturnType<typeof createScreen>
  );

  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      {newAccountScreens.map((screen) => (
        <HomeStack.Screen
          key={screen.name}
          {...screen}
          initialParams={{
            outsideNav: true
          }}
        />
      ))}
    </HomeStack.Navigator>
  );
};

export default HomeStackScreen;