import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {NavigationContainer, NavigationState, PartialState, Theme} from "@react-navigation/native";
import {Platform, StatusBar, View, useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import screens from "@/router/screens";
import type { RouteParameters } from "@/router/helpers/types";
import { PapillonDark, PapillonLight } from "@/router/helpers/themes";
import AlertProvider from "@/providers/AlertProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

import * as SystemUI from "expo-system-ui";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCurrentAccount } from "@/stores/account";
import { navigatorScreenOptions } from "./helpers/create-screen";
import {navigate} from "@/utils/logger/logger";
import { PapillonNavigation } from "./refs";

export const Stack = createNativeStackNavigator<RouteParameters>();

const Router: React.FC = () => {
  const scheme = useColorScheme();

  useEffect(() => {
    async function setNavigationBar () {
      await NavigationBar.setPositionAsync("absolute");
      await NavigationBar.setBackgroundColorAsync("#ffffff00");
    }

    if (Platform.OS === "android") {
      setNavigationBar();
    }
  }, []);

  const prefix = Linking.createURL("/");

  const config = {
    screens: {
      PronoteManualURL: "url",
      DevMenu: "dev",
    },
  };

  const linking = {
    prefixes: [prefix],
    config,
  };

  const theme: Theme = scheme === "dark" ? PapillonDark : PapillonLight;

  const account = useCurrentAccount(store => store.account!);
  if (account && account.personalization?.color !== undefined) {

    if (account.personalization?.color?.hex?.primary !== undefined) {
      theme.colors.primary = account.personalization.color.hex.primary;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: scheme === "dark" ? "#151515" : "#fff" }}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={"transparent"}
          translucent={true}
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        />
      )}

      <SafeAreaProvider>
        <GestureHandlerRootView>
          <NavigationContainer linking={linking} theme={theme} ref={PapillonNavigation}
            onStateChange={(state) => {
              let str = "";
              let view: NavigationState | PartialState<NavigationState> | undefined = state;
              while (view?.routes) {
                // @ts-expect-error (view is not undefined here bc of while condition, but ts think it can be)
                str += "/" + view.routes[view.index].name;
                // @ts-expect-error (same)
                view = view.routes[view.index].state;
              }
              navigate(str);
            }}
          >
            <AlertProvider>
              <Stack.Navigator initialRouteName="AccountSelector" screenOptions={navigatorScreenOptions}>
                {screens.map((screen) => (
                  // @ts-expect-error : type not compatible, but it works fine.
                  <Stack.Screen key={screen.name} {...screen}/>
                ))}
              </Stack.Navigator>
            </AlertProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>
  );
};



export default Router;
