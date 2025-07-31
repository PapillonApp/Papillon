import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { Platform, StatusBar, View, useColorScheme } from "react-native";
import * as Linking from "expo-linking";
import screens from "@/router/screens";
import { PapillonDark, PapillonLight } from "@/router/helpers/themes";
import AlertProvider from "@/providers/AlertProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCurrentAccount } from "@/stores/account";
import { navigatorScreenOptions } from "./helpers/create-screen";
import { navigate } from "@/utils/logger/logger";
import { PapillonNavigation } from "./refs";
import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";

export const Stack = createNativeStackNavigator();

const Router: React.FC = () => {
  const scheme = useColorScheme();
  const { whatTheme } = useThemeSoundHaptics();
  const account = useCurrentAccount((store) => store.account!);

  const [theme, setTheme] = useState<Theme>(scheme === "dark" ? PapillonDark : PapillonLight);
  const [primaryColor, setPrimaryColor] = useState<string>(theme.colors.primary);

  useEffect(() => {
    async function setNavigationBar () {
      if (Platform.OS === "android") {
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync("#ffffff00");
      }
    }

    setNavigationBar();
  }, []);

  useEffect(() => {
    switch (whatTheme) {
      case 0:
        setTheme(scheme === "dark" ? PapillonDark : PapillonLight);
        break;
      case 1:
        setTheme(PapillonLight);
        break;
      default:
        setTheme(PapillonDark);
        break;
    }
  }, [scheme, whatTheme]);

  useEffect(() => {
    setPrimaryColor(account?.personalization?.color?.hex?.primary || theme.colors.primary);
  }, [account?.personalization, theme.colors.primary]);

  const prefix = Linking.createURL("/");

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        PronoteManualURL: "url",
        DevMenu: "dev",
      },
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: scheme === "dark" ? "#151515" : "#fff" }}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle={
            whatTheme === 0
              ? scheme === "dark"
                ? "light-content"
                : "dark-content"
              : whatTheme === 1
                ? "dark-content"
                : "light-content"
          }
        />
      )}
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer
            linking={linking}
            theme={{
              ...theme,
              colors: {
                ...theme.colors,
                primary: primaryColor,
              },
            }}
            ref={PapillonNavigation}
            onStateChange={(state) => {
              let str = "";
              let view = state;
              while (view?.routes) {
                str += "/" + view.routes[view.index].name;
                // @ts-ignore
                view = view.routes[view.index].state;
              }
              navigate(str);
            }}
          >
            <AlertProvider>
              <Stack.Navigator initialRouteName="AccountSelector" screenOptions={navigatorScreenOptions}>
                {screens.map((screen) => (
                  // @ts-ignore
                  <Stack.Screen key={screen.name} {...screen} />
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
