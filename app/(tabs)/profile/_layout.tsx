import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { useAccountStore } from "@/stores/account";

export default function Layout() {
  const { t } = useTranslation();

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Profile"),
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="custom"
        options={{
          headerShown: true,
          headerTitle: t("Tab_Custom_Profile"),
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackButtonDisplayMode: "minimal"
        }}
      />
    </Stack>
  );
}