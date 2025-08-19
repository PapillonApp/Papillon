import { useRouter } from "expo-router";
import * as pronote from "pawnote";
import { useState } from "react";
import React, { Alert, ScrollView, StyleSheet } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { initializeAccountManager } from "@/services/shared";
import { ARD } from "@/services/ard";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Typography from "@/ui/components/Typography";
import { Colors } from "@/app/(onboarding)/end/color";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(false);
  const [ardLoading, setArdLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const router = useRouter();

  const accounts = useAccountStore.getState().accounts;

  if (accounts.length === 0) {
    router.replace("/(onboarding)/welcome");
    return null;
  }

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
        selectedColor: Colors.PINK,
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

  const testArdConnection = async () => {
    try {
      setArdLoading(true);

      const ard = new ARD("sus");

      const credentials = {
        additionals: {
          username: "xxxx",
          password: "xxxx",
          schoolId: "xxxx",
        }
      };

      console.log("Tentative de connexion ARD...");

      await ard.refreshAccount(credentials);
      console.log("Connexion ARD réussie !");

      await new Promise(resolve => setTimeout(resolve, 5000));

      const balances = await ard.getCanteenBalances();
      console.log("Soldes ARD:", balances);

      Alert.alert(
        "ARD Réussi",
        `\nSoldes trouvés: ${balances.length}`
      );

      setArdLoading(false);
    } catch (error) {
      setArdLoading(false);
      console.error("Erreur ARD:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert("Erreur ARD", `Échec de la connexion: ${errorMessage}`);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <UnderConstructionNotice />

      <List>
        <Item
          onPress={() => router.navigate("/demo")}
        >
          <Typography variant="title" color="text">
            Demo components
          </Typography>
        </Item>
        <Item
          onPress={() => router.navigate("/devmode")}
        >
          <Typography variant="title" color="text">
            Papillon DevMode
          </Typography>
        </Item>
        <Item
          onPress={() => loginDemoAccount()}
        >
          <Typography variant="title" color="text">
            Login to Papillon Demo Account
          </Typography>
        </Item>
        <Item
          onPress={() => {
            const accounts = useAccountStore.getState().accounts
            for (const account of accounts) {
              useAccountStore.getState().removeAccount(account)
            }
            Alert.alert("Succès!", "Store des comptes remis à zéro...")
          }}
        >
          <Typography variant="title" color="text">
            Reset Account Store
          </Typography>
        </Item>
        <Item
          onPress={() => InitManager()}
        >
          <Typography variant="title" color="text">
            Init Manager
          </Typography>
        </Item>
        <Item
          onPress={() => router.navigate("/(onboarding)/welcome")}
        >
          <Typography variant="title" color="text">
            Onboarding
          </Typography>
        </Item>
        <Item
          onPress={() => router.navigate("/(onboarding)/end/color")}
        >
          <Typography variant="title" color="text">
            Color Picker
          </Typography>
        </Item>
      </List>
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
