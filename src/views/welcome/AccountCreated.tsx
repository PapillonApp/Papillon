import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";

import LottieView from "lottie-react-native";

import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";

import * as Haptics from "expo-haptics";

import { useCurrentAccount } from "@/stores/account";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const AccountCreated: Screen<"AccountCreated"> = ({ navigation }) => {
  const account = useCurrentAccount((state) => state.account!);
  const { playHaptics, playSound } = useSoundHapticsWrapper();
  const LEson5 = require("@/../assets/sound/5.wav");
  const LEson6 = require("@/../assets/sound/6.wav");

  let name = (!account || !account.studentName?.first) ? null
    : account.studentName?.first;

  // Truncate name if over 10 characters.
  if (name && name.length > 10) {
    name = name.substring(0, 10) + "...";
  }

  const animationRef = useRef<LottieView>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // show animation on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setShowAnimation(true);

      // loop 20 times
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Medium,
          });
        }, i * 20);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // hide animation on blur
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setShowAnimation(false);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      {showAnimation && (
        <LottieView
          ref={animationRef}
          source={require("@/../assets/lottie/confetti_1.json")}
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -200,
          }}
          autoPlay
          loop={false}
        />
      )}

      <PapillonShineBubble
        message={name ? `Enchanté, ${name} ! On va personnaliser ton expérience !` : "Bienvenue sur Papillon !"}
        numberOfLines={name ? 2 : 1}
        width={260}
        style={{
          zIndex: 10,
        }}
      />

      <View
        style={styles.buttons}
      >
        <ButtonCta
          value="Personnaliser Papillon"
          primary
          onPress={() => {
            navigation.navigate("ColorSelector");
            playSound(LEson5);
          }}
        />
        <ButtonCta
          value="Ignorer cette étape"
          onPress={() => {
            navigation.navigate("AccountStack", { onboard: true });
            playSound(LEson6);
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

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  terms_text: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "medium",
    paddingHorizontal: 20,
  },
});

export default AccountCreated;
