import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { CircleDashed, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, View, StyleSheet, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useCurrentAccount } from "@/stores/account";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";

const ExternalAccountSelector: Screen<"ExternalAccountSelector"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);

  type Service = AccountService | "Other";

  const [service, setService] = useState<Service | null>(null);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <PapillonShineBubble
        message={"Pour commencer, quel est ton service de cantine ?"}
        width={250}
        numberOfLines={2}
        offsetTop={insets.top}
      />

      <Reanimated.View
        style={styles.list}
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
          entering={FlipInXDown.springify().delay(200)}
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
          entering={FlipInXDown.springify().delay(300)}
        >
          <DuoListPressable
            leading={<CircleDashed style={styles.image} />}
            text="Ne sais pas/N’est pas listé"
            enabled={service === "Other"}
            onPress={() => setService("Other")}
          />
        </Reanimated.View>
      </Reanimated.View>

      <View style={styles.buttons}>
        <ButtonCta
          primary
          value="Confirmer"
          disabled={!service || service === "Other"}
          onPress={() => {
            if (service) {
              navigation.navigate("ExternalAccountSelectMethod", { service });
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


export default ExternalAccountSelector;
