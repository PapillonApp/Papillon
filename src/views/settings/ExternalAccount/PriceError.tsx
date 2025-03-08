import React from "react";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { BadgeX, CircleHelp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {View, StyleSheet, Text, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccounts } from "@/stores/account";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import {ExternalAccount} from "@/stores/account/types";
import {detectMealPrice as ARDPriceDetector} from "@/views/settings/ExternalAccount/ARD";
import { useAlert } from "@/providers/AlertProvider";

type Props = {
  navigation: any;
  route: { params: { accountID: string } };
};

const PriceError: Screen<"PriceError"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const update = useAccounts(store => store.update);
  const account = route.params?.account;
  const accountId = route.params?.accountId;

  const { showAlert } = useAlert();

  const manualInput = () => {
    Alert.prompt(
      "Entre le prix d'un repas",
      "",
      [
        { text: "Annuler", onPress: () => {} },
        { text: "Soumettre", onPress: async (input) => {
          if (input) {
            const mealPrice = parseFloat(input.replace(",", ".")) * 100;
            update<ExternalAccount>(accountId, "authentication", {"mealPrice": mealPrice});
            navigation.pop();
            navigation.pop();
            navigation.pop();
            navigation.pop();
          }
        }},
      ],
      "plain-text",
      "2.00"
    );
  };

  const reloadMealPrice = async () => {
    const mealPrice = await ARDPriceDetector(account);
    if (!mealPrice) {
      return showAlert({
        title: "Erreur",
        message: "Impossible de déterminer le prix d'un repas",
        icon: <BadgeX />,
      });
    }
    update<ExternalAccount>(accountId, "authentication", { "mealPrice": mealPrice });
    navigation.pop();
    navigation.pop();
    navigation.pop();
    navigation.pop();
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={{width: "100%", alignItems: "center", justifyContent: "center", flex: 1}}>
        <CircleHelp color={colors.text + "55"} size={200}></CircleHelp>
      </View>
      <View style={{
        padding: 10,
        gap: 9
      }}>
        <Text
          style={{
            textAlign: "left",
            fontFamily: "semibold",
            color: colors.text,
            fontSize: 32,
            maxWidth: "90%"
          }}
        >Une erreur s'est produite</Text>
        <Text
          style={{
            textAlign: "left",
            fontFamily: "medium",
            color: colors.text + "75",
            fontSize: 17,
          }}
        >Nous n’avons pas réussi à déterminer le prix d’un repas</Text>
      </View>
      <View style={styles.buttons}>
        <ButtonCta
          primary
          value="Recommencer"
          disabled={false}
          onPress={() => reloadMealPrice()}
        />
        <ButtonCta
          style={{
            borderWidth: 0
          }}
          value="Saisir manuellement"
          disabled={false}
          onPress={() => manualInput()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
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
    marginBottom: 16,
  },

  image: {
    width: 32,
    height: 32,
    borderRadius: 80,
  },
});


export default PriceError;
