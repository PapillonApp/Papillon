import React, { useState } from "react";
import type {Screen} from "@/router/helpers/types";
import {useTheme} from "@react-navigation/native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import { Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, View} from "react-native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { NativeText } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import Reanimated, { FlipInXDown, LinearTransition } from "react-native-reanimated";
import {AccountService, TurboselfAccount} from "@/stores/account/types";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import uuid from "@/utils/uuid-v4";

import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { authenticateWithCredentials } from "turboself-api";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowRightFromLine, BadgeHelp, BadgeX, Undo2 } from "lucide-react-native";

const TurboselfAccountSelector: Screen<"TurboselfAccountSelector"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);
  const [loading, setLoading] = useState(false);

  const account = route.params.accounts;
  const username = route.params.username;
  const password = route.params.password;
  const [choosenHostId, setChoosenHostId] = useState(account[0].id);

  const { showAlert } = useAlert();

  const handleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      const session = await authenticateWithCredentials(username, password, true, false, choosenHostId);
      const new_account: TurboselfAccount = {
        instance: undefined,
        service: AccountService.Turboself,
        username,
        authentication: {
          session, username, password
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
          message: "Une erreur est survenue lors de la connexion.",
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
            message={loading ? "Chargement en cours..." : "Tu as plusieurs comptes TurboSelf, choisis le tien :"}
            width={270}
            numberOfLines={loading ? 1 : 2}
            offsetTop={insets.top}
          />
          <View style={{
            padding: 10,
            gap: 10
          }}>
            {account.map((item, index) => (
              <Reanimated.View
                style={{ width: "100%" }}
                layout={LinearTransition}
                entering={FlipInXDown.springify().delay(200)}
              >
                <DuoListPressable
                  text={`${item.firstName} ${item.lastName} (${item.division})`}
                  enabled={choosenHostId === item.id}
                  onPress={() => setChoosenHostId(item.id)}
                />
              </Reanimated.View>
            ))}
          </View>
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
              primary
              value="Continuer"
              disabled={choosenHostId === 0}
              onPress={() => handleLogin()}
            />
            <ButtonCta
              primary={false}
              value="Annuler"
              disabled={loading}
              onPress={() => {
                showAlert({
                  title: "Annuler",
                  message: "Es-tu sûr de vouloir annuler la connexion ?",
                  icon: <BadgeHelp />,
                  actions: [
                    {
                      title: "Continuer la connexion",
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


export default TurboselfAccountSelector;
