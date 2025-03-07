import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { MapPinIcon, SearchIcon, LockIcon } from "lucide-react-native";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useTheme } from "@react-navigation/native";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { NativeText } from "@/components/Global/NativeComponents";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const SkolengoAuthenticationSelector: Screen<"SkolengoAuthenticationSelector"> = ({ navigation }) => {
  const theme = useTheme();

  type Methods = "geolocation" | "manual-location" | "manual-url" | "qr-code";
  const [method, setMethod] = useState<Methods | null>(null);

  const { playSound } = useSoundHapticsWrapper();
  const LEson = require("@/../assets/sound/2.wav");

  const handleConfirmation = () => {
    switch (method) {
      case "geolocation":
        navigation.navigate("SkolengoGeolocation");
        break;
      case "manual-location":
        navigation.navigate("SkolengoInstanceSelector", { pos: null });
        break;
    }

    playSound(LEson);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message="Que préfères-tu pour te connecter à Skolengo ?"
        numberOfLines={2}
        width={260}
        offsetTop={"20%"}
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
            leading={
              <MapPinIcon
                size={24}
                color={method === "geolocation" ? theme.colors.primary : (theme.colors.text + "88")}
              />
            }
            text="Utiliser ma position"
            enabled={method === "geolocation"}
            onPress={() => setMethod("geolocation")}
          />
        </Reanimated.View>
        <Reanimated.View
          style={{ width: "100%" }}
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(200)}
        >
          <DuoListPressable
            leading={
              <SearchIcon
                size={24}
                color={method === "manual-location" ? theme.colors.primary : (theme.colors.text + "88")}
              />
            }
            text="Rechercher manuellement"
            enabled={method === "manual-location"}
            onPress={() => setMethod("manual-location")}
          />
        </Reanimated.View>
      </Reanimated.View>

      <View style={styles.buttons}>
        <View
          style={{
            gap: 12,
            alignItems: "center",
            marginBottom: 9,
            marginHorizontal: 9,
          }}
        >
          <LockIcon
            size={20}
            strokeWidth={2.5}
            color={theme.colors.text + "88"}
          />
          <NativeText
            style={{
              color: theme.colors.text,
              opacity: 0.5,
              fontSize: 13,
              lineHeight: 16,
            }}
          >
            Papillon n'est pas affilié à Skolengo. Tes données restent uniquement sur ton appareil de manière sécurisée.
          </NativeText>
        </View>

        <ButtonCta
          primary
          value="Confirmer"
          disabled={method === null}
          onPress={handleConfirmation}
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
});

export default SkolengoAuthenticationSelector;
