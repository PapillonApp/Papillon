import React, {useState, useEffect} from "react";
import type {Screen} from "@/router/helpers/types";
import {useTheme} from "@react-navigation/native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import { Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, View} from "react-native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { NativeText,} from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { tokenize} from "ezly";
import {AccountService, IzlyAccount} from "@/stores/account/types";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import uuid from "@/utils/uuid-v4";

import * as Linking from "expo-linking";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowRightFromLine, BadgeHelp, BadgeX, Undo2 } from "lucide-react-native";

const IzlyActivation: Screen<"IzlyActivation"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);
  const [loading, setLoading] = useState(false);

  const secret = route.params?.password;
  const username = route.params?.username;

  const { showAlert } = useAlert();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const scheme = url.split(":")[0];
      if (scheme === "izly") {
        console.log("[IzlyActivation] Activation link received:", url);
        handleActivation(url);
      } else {
        console.log("[IzlyActivation] Ignoring link:", url);
      }
    };
    Linking.addEventListener("url", handleDeepLink);
  }, []);

  const handleActivation = async (activationLink: string): Promise<void> => {
    Keyboard.dismiss();
    try {
      setLoading(true);
      const { identification, configuration } = await tokenize(activationLink);

      const new_account: IzlyAccount = {
        service: AccountService.Izly,
        username: username,
        instance: identification,
        authentication: {
          secret: secret,
          identification: identification,
          configuration: configuration
        },
        isExternal: true,
        localID: uuid(),
        data: {}
      };

      create(new_account);
      linkExistingExternalAccount(new_account);

      navigation.pop();
      navigation.pop();
      navigation.pop();
      navigation.pop();
    } catch (error) {
      if (error instanceof Error) {
        showAlert({
          title: "Erreur",
          message: error.message,
          icon: <BadgeX />,
        });
      }
      else {
        showAlert({
          title: "Erreur",
          message: "Une erreur est survenue lors de l'activation.",
          icon: <BadgeX />,
        });
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={insets.top + 64}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          overflow: "visible",
        }}
      >
        <SafeAreaView
          style={styles.container}
        >
          <PapillonShineBubble
            message={loading ? "Activation en cours..." : "Tu viens de recevoir un lien par SMS, peux tu me cliquer sur le lien pour activer ton compte ?"}
            width={270}
            numberOfLines={loading ? 1 : 3}
            offsetTop={insets.top}
          />

          <NativeText
            style={{
              width: "100%",
              paddingHorizontal: 16,
              fontSize: 14,
              color: colors.text + "55",
              textAlign: "center",
            }}
          >
            Papillon ne donnera jamais tes informations d'authentification à des tiers.
          </NativeText>

          <View style={styles.buttons}>
            <ButtonCta
              value="Annuler"
              disabled={loading}
              onPress={() => {
                showAlert({
                  title: "Annuler",
                  message: "Es-tu sûr de vouloir annuler l'activation ?",
                  icon: <BadgeHelp />,
                  actions: [
                    {
                      title: "Continuer l'activation",
                      icon: <ArrowRightFromLine />,
                      primary: false,
                    },
                    {
                      title: "Confirmer",
                      icon: <Undo2 />,
                      onPress: () => navigation.pop(),
                      danger: true,
                    }
                  ]
                });
              }}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  list: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  image: {
    width: 32,
    height: 32,
    borderRadius: 80,
  },
});


export default IzlyActivation;
