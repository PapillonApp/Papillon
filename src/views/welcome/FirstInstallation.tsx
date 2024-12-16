import React, { useState } from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";

import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";

import { useTheme } from "@react-navigation/native";

import * as WebBrowser from "expo-web-browser";
import { Audio } from "expo-av";
import * as SplashScreen from "expo-splash-screen";

const PRIVACY_POLICY_URL = "https://docs.papillon.bzh/legal/privacy";
const TERMS_OF_SERVICE_URL = "https://docs.papillon.bzh/legal/terms";

const FirstInstallation: Screen<"FirstInstallation"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const openUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: colors.primary,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  };

  React.useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/../assets/sound/5.wav")
      );
      setSound(sound);
    };

    loadSound();
    SplashScreen.hideAsync();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message="Bienvenue sur Papillon !"
        numberOfLines={1}
        width={220}
      />

      <View
        style={styles.presentation}
      >

        <Image
          source={require("../../../assets/images/mask_logotype.png")}
          style={styles.logotype}
          tintColor={colors.primary}
          resizeMode="contain"
        />
        <Text
          style={[styles.presentation_text, { color: colors.text + "79" }]}
        >
          L’unique application pour gérer toute ta vie scolaire au même endroit !
        </Text>
      </View>

      <View
        style={styles.buttons}
      >
        <ButtonCta
          value="Commençons !"
          primary
          onPress={() => navigation.navigate("ServiceSelector")}
        />

        <ButtonCta
          value="Besoin d'aide ?"
          onPress={() => openUrl("https://support.getpapillon.xyz/")}
        />
      </View>
      <Text
        style={[styles.terms_text, { color: colors.text + "59" }]}
      >
        En continuant, vous acceptez les&nbsp;
        <Text
          style={{ textDecorationLine: "underline" }}
          onPress={() => openUrl(TERMS_OF_SERVICE_URL)}
        >
          conditions d'utilisation
        </Text>
        &nbsp;et la&nbsp;
        <Text
          style={{ textDecorationLine: "underline" }}
          onPress={() => openUrl(PRIVACY_POLICY_URL)}
        >
          politique de confidentialité
        </Text>.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    paddingBottom: 16,
  },

  presentation: {
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 20,
  },

  logotype: {
    height: 28,
  },

  presentation_text: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "medium",
    marginHorizontal: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
  },

  terms_text: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "medium",
    paddingHorizontal: 20,
  },
});

export default FirstInstallation;
