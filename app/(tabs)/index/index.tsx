import { useRouter } from "expo-router";
import * as pronote from "pawnote";
import { useState } from "react";
import React, { Alert, ScrollView, StyleSheet } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import { getSubjectEmoji } from "@/utils/subjects/emoji";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateUUID = () => {
    // Generate a random UUID (version 4)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const InitManager = async () => {
    getSubjectEmoji("français")
  }

  const loginDemoAccount = async () => {
    try {
      setLoading(true);
      const accounts = useAccountStore.getState().accounts;
      for (const account of accounts) {
        useAccountStore.getState().removeAccount(account)
      }
      const uuid = generateUUID();

      const session = pronote.createSessionHandle();
      const auth = await pronote.loginCredentials(session, {
        url: "https://pronote.papillon.bzh/",
        deviceUUID: uuid,
        kind: pronote.AccountKind.STUDENT,
        username: "demonstration",
        password: "E2hgDv918W33",
      });
      console.log("First logged in successfully:", auth);
      useAccountStore.getState().setLastUsedAccount(uuid);
      useAccountStore.getState().addAccount({
        id: uuid,
        firstName: "Demo",
        lastName: "Unknown",
        services: [{
          id: uuid,
          auth: {
            accessToken: auth.token,
            refreshToken: auth.token,
            additionals: {
              instanceURL: auth.url,
              kind: auth.kind,
              username: auth.username,
              deviceUUID: uuid,
            },
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      });
      await initializeAccountManager();
      Alert.alert("Success", "You are now logged in to the Papillon demo account!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to log in:", error);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <Stack gap={16} hAlign="center">
        <UnderConstructionNotice />

        <Button
          title="Click Me"
          onPress={() => router.navigate("/demo")}
        />

        <Button
          title="Papillon DevMode"
          onPress={() => router.navigate("/devmode")}
        />

        <Button
          title="Login to Papillon Demo Account"
          inline
          loading={loading}
          variant="outline"
          onPress={() => loginDemoAccount()}
        />
        <Button
          title="Test"
          inline
          loading={loading}
          variant="outline"
          onPress={() => InitManager()}
        />
      </Stack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});
