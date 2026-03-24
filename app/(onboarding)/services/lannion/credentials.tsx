import { useTheme } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { authenticateWithCredentials, LannionAPI } from "@/services/lannion/module";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";

import LoginView from "../../components/LoginView";

const ANIMATION_DURATION = 170;

const upperFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function LannionCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();

  const alert = useAlert();
  const { t } = useTranslation();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const university = "IUT de Lannion";
  const color = "#e0001a";

  const keyboardListeners = useMemo(() => ({
    show: () => {
      "worklet";
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      "worklet";
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      scale.value = withTiming(1, { duration: ANIMATION_DURATION });
    },
  }), [opacity]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
    const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  async function handleLogin(password: string, username: string) {
    setIsLoggingIn(true);
    try {
      const store = useAccountStore.getState();

      const client = await authenticateWithCredentials(username, password);

      const api = new LannionAPI(client);
      const relevesResult = await api.getAllReleves();

      if (!relevesResult.success || !relevesResult.data || relevesResult.data.length === 0) {
        throw new Error(relevesResult.error || "Failed to fetch student data");
      }
      const firstReleve: any = relevesResult.data[0];
      const etudiant = firstReleve.relevé?.etudiant;

      const accountUUID = String(uuid());
      const studentName = upperFirst(etudiant?.nom) || "Unknown";
      const studentFirstName = upperFirst(etudiant?.prenom) || "Student";

      const account: Account = {
        id: accountUUID,
        firstName: studentFirstName,
        lastName: studentName,
        schoolName: university,
        services: [
          {
            id: uuid(),
            auth: {
              additionals: {
                username: username,
                password: password
              },
            },
            serviceId: Services.LANNION,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      };

      store.addAccount(account);
      store.setLastUsedAccount(accountUUID);

      const settingsStore = useSettingsStore.getState();
      const disabledTabs = settingsStore.personalization.disabledTabs || [];
      const newDisabledTabs = Array.from(new Set([...disabledTabs, "news", "tasks"]));

      settingsStore.mutateProperty("personalization", {
        disabledTabs: newDisabledTabs
      });

      setIsLoggingIn(false);

      const parent = navigation.getParent();
              if (parent) {
                parent.goBack();
                
                const parentsParent = parent.getParent();
                if (parentsParent) {
                  parentsParent.goBack();
                }
              }
      
              router.back();
              router.dismissAll();
              return router.push("/");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        Alert.alert("Erreur d'authentification", "Les identifiants que tu as saisis sont incorrects ou une erreur est survenue lors de la connexion.");
      }
      setIsLoggingIn(false);
    }
  }

  if (Platform.OS === 'android') {
    return (
      <Stack padding={20} gap={8} style={{ paddingTop: insets.top + 20 }}>
        <Typography variant="h3">
                    Lannion n'est pas encore disponible sur Android
        </Typography>
        <Typography variant="body1" color="secondary">
                    On travaille dur pour rendre les librairies nécessaires disponibles sur Android.
        </Typography>
        <View style={{ marginTop: 24 }} />
        <Button
          title="Retour"
          onPress={() => router.back()}
        />
      </Stack>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <LoginView
          color="#000091"
          serviceName="IUT de Lannion"
          serviceIcon={require('@/assets/images/univ_lannion.png')}
          loading={isLoggingIn}
          onSubmit={(values) => {
            if (!isLoggingIn && values.username && values.password) {
              handleLogin(values.password, values.username);
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}