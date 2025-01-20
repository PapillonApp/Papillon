import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";

import LottieView from "lottie-react-native";

import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";

import * as Haptics from "expo-haptics";

import { useCurrentAccount } from "@/stores/account";
import { Audio } from "expo-av";

import { useTranslation } from "react-i18next";

const AccountCreated: Screen<"AccountCreated"> = ({ navigation }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [sound2, setSound2] = useState<Audio.Sound | null>(null);
  const { t } = useTranslation();

  const account = useCurrentAccount((state) => state.account!);

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/../assets/sound/5.wav")
    );

    setSound(sound);

    const { sound: sound2 } = await Audio.Sound.createAsync(
      require("@/../assets/sound/6.wav")
    );

    setSound2(sound2);
  };

  useEffect(() => {
    loadSound();

    return () => {
      sound?.unloadAsync();
      sound2?.unloadAsync();
    };
  }, []);

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  const playSound2 = async () => {
    if (sound) {
      await sound2?.replayAsync();
    }
  };

  let name = !account.studentName?.first ? null
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -200,
          }}
          autoPlay
          loop={false}
        />
      )}

      <PapillonShineBubble
        message={name ? t("login.AccountCreated.message", {
          name: name,
        }) : t("login.AccountCreated.noNameMessage")}
        numberOfLines={name ? 3 : 1}
        width={260}
        style={{
          zIndex: 10,
        }}
      />

      <View
        style={styles.buttons}
      >
        <ButtonCta
          value={t("login.AccountCreated.customize")}
          primary
          onPress={() => {
            navigation.navigate("ColorSelector");
            playSound();
          }}
        />
        <ButtonCta
          value={t("login.AccountCreated.skip")}
          onPress={() => {
            navigation.navigate("AccountStack", { onboard: true });
            playSound2();
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
