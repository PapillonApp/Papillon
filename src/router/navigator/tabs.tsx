import React, { useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@/stores/account";
import { useNavigationBuilder, useTheme } from "@react-navigation/native";
import { StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabItem from "./atoms/TabItem";
import Reanimated from "react-native-reanimated";

const PapillonNavigatorTabs: React.FC<Omit<ReturnType<typeof useNavigationBuilder>, "NavigationContent">> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount((store) => store.account);

  const [settings, setSettings] = useState({
    hideTabTitles: false,
    showTabBackground: false,
  });

  useEffect(() => {
    setSettings({
      hideTabTitles: account?.personalization?.hideTabTitles || false,
      showTabBackground: account?.personalization?.showTabBackground || false,
    });
  }, [account?.personalization]);

  const allTabs = useMemo(() => state.routes, [state.routes]);
  const tabs = useMemo(() => {
    const enabledTabs = account?.personalization.tabs?.filter((tab) => tab.enabled);
    return enabledTabs
      ?.map((tab) => allTabs.find((route) => route.name === tab.name))
      .filter(Boolean) || allTabs.slice(0, 5);
  }, [account?.personalization.tabs, allTabs]);

  return (
    <Reanimated.View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          paddingBottom: insets.bottom + 10,
        },
        Platform.OS === "android" ? styles.tabBarAndroid : styles.tabBarIOS,
      ]}
    >
      {tabs.map((route, index) => (
        <TabItem
          key={route?.key}
          route={route}
          descriptor={route ? descriptors[route.key] : undefined}
          navigation={navigation}
          isFocused={route ? allTabs.indexOf(route) === state.index : false}
          settings={settings}
        />
      ))}
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
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
