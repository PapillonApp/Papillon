import React, {useState} from "react";
import type {Screen} from "@/router/helpers/types";
import {useTheme} from "@react-navigation/native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {Keyboard, KeyboardAvoidingView, StyleSheet, TextInput, TouchableWithoutFeedback, View} from "react-native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import {NativeItem, NativeList, NativeListHeader, NativeText,} from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import {extractActivationURL, tokenize} from "ezly";
import {AlertTriangle} from "lucide-react-native";
import {AccountService, IzlyAccount} from "@/stores/account/types";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import uuid from "@/utils/uuid-v4";

const IzlyActivation: Screen<"IzlyActivation"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const linkExistingExternalAccount = useCurrentAccount(store => store.linkExistingExternalAccount);
  const create = useAccounts(store => store.create);

  const [activationURL, setActivationURL] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secret = route.params?.password;
  const username = route.params?.username;

  const handleActivation = async (): Promise<void> => {
    Keyboard.dismiss();
    try {
      const URL = await extractActivationURL(activationURL);
      const { identification, configuration  } = await tokenize(URL);

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
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Une erreur est survenue lors de la connexion.");
      }    }
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
            message={"Tu viens de recevoir un lien par SMS, peux tu me l'indiquer ?"}
            width={270}
            numberOfLines={2}
            offsetTop={insets.top}
          />



          <View
            style={styles.list}
          >
            <View
              style={{ width: "100%" }}
            >
              {error && (
                <NativeList
                  style={{
                    backgroundColor: "#eb403422",
                  }}
                >
                  <NativeItem icon={<AlertTriangle />}>
                    <NativeText variant="subtitle">{error}</NativeText>
                  </NativeItem>
                </NativeList>
              )}
              <NativeListHeader label="URL" />
              <NativeList>
                <NativeItem>
                  <TextInput
                    value={activationURL}
                    onChangeText={setActivationURL}
                    onPress={() => {setError("");}}
                    placeholder={"https://..."}
                    placeholderTextColor={theme.colors.text + "55"}
                    keyboardType={"url"}
                    autoCapitalize="none"
                    style={{
                      fontSize: 16,
                      fontFamily: "medium",
                      color: theme.colors.text,
                    }}
                  />
                </NativeItem>
              </NativeList>
            </View>
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
            Papillon ne donnera jamais vos informations d'authentification à des tiers.
          </NativeText>


          <View style={styles.buttons}>
            <ButtonCta
              primary
              value="Confirmer"
              disabled={loading}
              onPress={() => handleActivation()}
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
