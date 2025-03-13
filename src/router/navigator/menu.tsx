import React, { useMemo, useState } from "react";
import { useCurrentAccount } from "@/stores/account";
import { useNavigationBuilder, useTheme } from "@react-navigation/native";
import { StyleSheet, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Reanimated from "react-native-reanimated";
import MenuItem from "./atoms/MenuItem";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import AccountSwitcher from "@/components/Home/AccountSwitcher";

const PapillonNavigatorMenu: React.FC<Omit<ReturnType<typeof useNavigationBuilder>, "NavigationContent">> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount((store) => store.account);

  const allTabs = useMemo(() => state.routes, [state.routes]);
  const tabs = account?.personalization.tabs
    ?.map((tab) => allTabs.find((route) => route.name === tab.name))
    .filter(Boolean) || allTabs;

  const [shouldOpenContextMenu, setShouldOpenContextMenu] = useState(false);

  return (
    <Reanimated.View
      style={[
        styles.menuBar,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        Platform.OS === "android" ? styles.menuBarAndroid : styles.menuBarIOS,
      ]}
    >
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <Reanimated.ScrollView
        style={[
          styles.menuBarContent,
          {
            backgroundColor: theme.colors.primary + "10",
            paddingTop: insets.top + 10,
            paddingHorizontal: 10,
          }
        ]}
        contentContainerStyle={{
          gap: 0,
        }}
      >
        <ContextMenu
          shouldOpenContextMenu={shouldOpenContextMenu}
          menuStyles={{
            position: "absolute",
            top: 40,
          }}
          style={[
            {
              paddingBottom: 4,
            }
          ]}
        >
          <AccountSwitcher loading={!account?.instance} />
        </ContextMenu>

        {tabs.map((route, index) => (
          <MenuItem
            key={route?.key}
            route={route}
            descriptor={route ? descriptors[route.key] : undefined}
            navigation={navigation}
            isFocused={route ? allTabs.indexOf(route) === state.index : false}
          />
        ))}
      </Reanimated.ScrollView>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
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
