import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, View, StyleSheet } from "react-native";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { AccountService } from "@/stores/account/types";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAlert } from "@/providers/AlertProvider";
import { Check, WifiOff } from "lucide-react-native";

const ExternalAccountSelector: Screen<"ExternalAccountSelector"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const { isOnline } = useOnlineStatus();
  const { showAlert } = useAlert();

  type Service = AccountService | "Other";

  const [service, setService] = useState<Service | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <PapillonShineBubble
        message="Pour commencer, quel est ton service de cantine ?"
        numberOfLines={2}
        width={260}
        offsetTop={"15%"}
      />

      <Reanimated.ScrollView
        style={styles.list}
        contentContainerStyle={{
          alignItems: "center",
          gap: 9,
          paddingHorizontal: 20,
          paddingTop: 30,
          paddingBottom: 60,
        }}
        layout={LinearTransition}
      >
        <Reanimated.View
          style={{ width: "100%" }}
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(100)}
        >
          <DuoListPressable
            leading={<Image source={require("../../../../assets/images/service_turboself.png")} style={styles.image} />}
            text="Turboself"
            enabled={service === AccountService.Turboself}
            onPress={() => setService(AccountService.Turboself)}
          />
        </Reanimated.View>

        <Reanimated.View
          style={{ width: "100%" }}
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(200)}
        >
          <DuoListPressable
            leading={<Image source={require("../../../../assets/images/service_ard.png")} style={styles.image} />}
            text="ARD"
            enabled={service === AccountService.ARD}
            onPress={() => setService(AccountService.ARD)}
          />
        </Reanimated.View>

        <Reanimated.View
          style={{ width: "100%" }}
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(300)}
        >
          <DuoListPressable
            leading={<Image source={require("../../../../assets/images/service_izly.png")} style={styles.image} />}
            text="Izly"
            enabled={service === AccountService.Izly}
            onPress={() => setService(AccountService.Izly)}
          />
        </Reanimated.View>
        <Reanimated.View
          style={{ width: "100%" }}
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(400)}
        >
          <DuoListPressable
            leading={<Image source={require("../../../../assets/images/service_alise.jpg")} style={styles.image} />}
            text="Alise"
            enabled={service === AccountService.Alise}
            onPress={() => setService(AccountService.Alise)}
          />
        </Reanimated.View>
      </Reanimated.ScrollView>

      <View style={styles.buttons}>
        <ButtonCta
          primary
          value="Confirmer"
          disabled={!service || service === "Other"}
          onPress={() => {
            if (service) {
              if (isOnline) {
                navigation.navigate("ExternalAccountSelectMethod", { service });
              } else {
                showAlert({
                  title: "Information",
                  message: "Pour poursuivre la connexion, tu dois être connecté à Internet. Vérifie ta connexion Internet et réessaie",
                  icon: <WifiOff />,
                  actions: [
                    {
                      title: "OK",
                      icon: <Check />,
                    },
                  ],
                });
              }
            }
          }}
        />
      </View>
    </SafeAreaView>
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


export default ExternalAccountSelector;
