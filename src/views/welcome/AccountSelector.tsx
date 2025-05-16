import { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import React, { useEffect } from "react";
import { Image, useColorScheme } from "react-native";

import * as SplashScreen from "expo-splash-screen";
import { PrimaryAccount } from "@/stores/account/types";
import { PapillonNavigation } from "@/router/refs";
import { isExpoGo } from "@/utils/native/expoGoAlert";

const AccountSelector: Screen<"AccountSelector"> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const accounts = useAccounts((store) => store.accounts);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const lastOpenedAccountID = useAccounts((store) => store.lastOpenedAccountID);

  const checkInitialNotification = async () => {
    const notifee = (await import("@notifee/react-native")).default;
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      await handleNotificationPress(initialNotification.notification);
    } else {
      connectToAccount();
    }
  };

  const handleNotificationPress = async (notification: any) => {
    if (notification?.data) {
      const accountID = notification.data.accountID;
      if (accountID) {
        const account = accounts.find((account) => account.localID === accountID);

        if (account) {
          await switchTo(account as PrimaryAccount);

          navigation.reset({
            index: 0,
            routes: [{ name: "AccountStack" }],
          });
          setTimeout(() => {
            PapillonNavigation.current?.navigate(
              notification.data.page,
              notification.data.parameters,
            );
          }, 1000);
        }
      }
    }
  };

  const connectToAccount = async () => {
    if (!useAccounts.persist.hasHydrated()) return;

    // If there are no accounts, redirect the user to the first installation page.
    if (accounts.filter((account) => !account.isExternal).length === 0) {
      // Use the `reset` method to clear the navigation stack.
      navigation.reset({
        index: 0,
        routes: [{ name: "FirstInstallation" }],
      });

      SplashScreen.hideAsync();
    }

    const selectedAccount =
      accounts.find((account) => account.localID === lastOpenedAccountID)
      ?? accounts.find((account) => !account.isExternal);
    await switchTo(selectedAccount as PrimaryAccount);

    navigation.reset({
      index: 0,
      routes: [{ name: "AccountStack" }],
    });
  };

  useEffect(() => {
    if (!isExpoGo()) {
      checkInitialNotification();
    } else {
      connectToAccount();
    }
  }, []);

  return (
    <Image
      source={colorScheme === "dark" ? require("../../../assets/launch/splash-dark.png") : require("../../../assets/launch/splash.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
    />
  );
};

export default AccountSelector;