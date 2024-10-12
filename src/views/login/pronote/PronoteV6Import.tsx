import React from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Screen } from "@/router/helpers/types";
import { ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { Info } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import pronote from "pawnote";
import { Account, AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/pronote/default-personalization";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import extract_pronote_name from "@/utils/format/extract_pronote_name";

const PronoteV6Import: Screen<"PronoteV6Import"> = ({ route, navigation }) => {
  const { data } = route.params;

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const [loading, setLoading] = React.useState(false);

  const ResetImport = () => {
    navigation.pop();
  };

  const TryLogin = async () => {
    try {
      setLoading(true);

      const session = pronote.createSessionHandle();
      const refresh = await pronote.loginToken(session, {
        url: data.instanceUrl,
        kind: pronote.AccountKind.STUDENT,
        username: data.username,
        token: data.nextTimeToken,
        deviceUUID: data.deviceUUID
      }).catch((error) => {
        if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          navigation.navigate("Pronote2FA_Auth", {
            session,
            error,
            accountID: data.deviceUUID
          });
        } else {
          throw error;
        }
      });

      if (!refresh) throw pronote.AuthenticateError;

      const user = session.user.resources[0];
      const name = user.name;

      const account: Account = {
        instance: session,

        localID: data.deviceUUID,
        service: AccountService.Pronote,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name,
        className: user.className,
        schoolName: user.establishmentName,
        studentName: {
          first: extract_pronote_name(name).givenName,
          last: extract_pronote_name(name).familyName
        },

        authentication: { ...refresh, deviceUUID: data.deviceUUID },
        personalization: await defaultPersonalization(session)
      };

      pronote.startPresenceInterval(session);
      createStoredAccount(account);
      setLoading(false);
      switchTo(account);

      await AsyncStorage.setItem("pronote:imported", "true");

      // We need to wait a tick to make sure the account is set before navigating.
      queueMicrotask(() => {
        navigation.pop();

        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
    catch (error) {
      setLoading(false);
      Alert.alert(
        "Impossible de vous reconnecter automatiquement",
        "Vous pouvez cepedant vous connecter manuellement en indiquant votre identifiant et mot de passe.",
        [
          {
            text: "Se connecter manuellement",
            onPress: async () => {
              navigation.pop();
              await AsyncStorage.setItem("pronote:imported", "true");
              navigation.navigate("PronoteManualURL", { url: data.instanceUrl });
            }
          },
          {
            text: "Annuler",
            style: "cancel",
            onPress: ResetImport
          }
        ]
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <NativeList inline>
        <NativeItem
          icon={<Info />}
        >
          <NativeText variant="subtitle">
            Il semblerait que vous ayez déjà utilisé l'application Papillon. Voulez-vous importer vos données ?
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem>
          <NativeText variant="subtitle">
            Compte trouvé d'une ancienne installation
          </NativeText>
          <NativeText variant="title">
            {data.username.toUpperCase()}
          </NativeText>
        </NativeItem>
      </NativeList>

      <View
        style={{
          gap: 9,
          marginTop: 24,
        }}
      >
        <ButtonCta
          primary
          value="Me reconnecter"
          onPress={() => TryLogin()}
          icon={loading ? <ActivityIndicator />: undefined}
        />

        <ButtonCta
          value="Plus tard"
          onPress={() => ResetImport()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PronoteV6Import;
