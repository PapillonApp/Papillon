import type { RouteParameters, RouterScreenProps, Screen } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import React, { useEffect } from "react";
import { useCurrentAccount } from "@/stores/account";
import { Text } from "react-native";

const ProtectedScreen: React.FC<{
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>;
  children: React.JSX.Element;
}> = ({ navigation, children }) => {
  const account = useCurrentAccount(store => store.account);
  useEffect(() => {
    if (account === null)
      navigation.reset({ index: 0, routes: [{ name: "AccountSelector" }] });
  }, [account]);

  // We show a placeholder screen while the redirection is happening.
  if (account === null) return (
    <Text>
      Déconnexion en cours...
    </Text>
  );

  return children;
};

export const protectScreenComponent = <ScreenName extends keyof RouteParameters>(
  Component: React.ComponentType<RouterScreenProps<ScreenName>>
): Screen<ScreenName> => ({ navigation, route}) => (
  <ProtectedScreen navigation={navigation}>
    <Component
      navigation={navigation}
      route={route}
    />
  </ProtectedScreen>
);
