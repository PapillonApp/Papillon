import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { QrCodeIcon, LinkIcon, MapPinIcon, SearchIcon, LockIcon } from "lucide-react-native";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { Audio } from "expo-av";
import { NativeText } from "@/components/Global/NativeComponents";
import { LinearGradient } from "expo-linear-gradient";

const PronoteAuthenticationSelector: Screen<"PronoteAuthenticationSelector"> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  type Methods = "geolocation" | "manual-location" | "manual-url" | "qr-code";
  const [method, setMethod] = useState<Methods | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/../assets/sound/2.wav")
    );

    setSound(sound);
  };

  useEffect(() => {
    loadSound();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playSound = () => void sound?.replayAsync();

  const handleConfirmation = () => {
    switch (method) {
      case "geolocation":
        navigation.navigate("PronoteGeolocation");
        break;
      case "manual-location":
        navigation.navigate("PronoteManualLocation");
        break;
      case "manual-url":
        navigation.navigate("PronoteManualURL");
        break;
      case "qr-code":
        navigation.navigate("PronoteQRCode");
        break;
    }

    playSound();
  };

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message={t("login.PronoteAuthSelector.message")}
        numberOfLines={2}
        width={260}
        offsetTop={"16%"}
      />

      <View
        style={{
          width: "100%",
          flex: 1,
          alignItems: "center",
          marginTop: -36,
          zIndex: 1000,
        }}
      >
        <LinearGradient
          colors={[theme.colors.background, theme.colors.background + "00"]}
          style={{
            width: "100%",
            height: 40,
            position: "absolute",
            top: 0,
            zIndex: 100,
          }}
        />

        <LinearGradient
          colors={[theme.colors.background + "00", theme.colors.background]}
          style={{
            width: "100%",
            height: 40,
            position: "absolute",
            bottom: 0,
            zIndex: 100,
          }}
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
              leading={
                <MapPinIcon
                  size={24}
                  color={method === "geolocation" ? theme.colors.primary : (theme.colors.text + "88")}
                />
              }
              text={t("login.PronoteAuthSelector.locate")}
              subtext={t("login.PronoteAuthSelector.locateSubtitle")}
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
              text={t("login.PronoteAuthSelector.city")}
              enabled={method === "manual-location"}
              onPress={() => setMethod("manual-location")}
            />
          </Reanimated.View>
          <Reanimated.View
            style={{ width: "100%" }}
            layout={LinearTransition}
            entering={FlipInXDown.springify().delay(300)}
          >
            <DuoListPressable
              leading={
                <QrCodeIcon
                  size={24}
                  color={method === "qr-code" ? theme.colors.primary : (theme.colors.text + "88")}
                />
              }
              text={t("login.PronoteAuthSelector.qr")}
              enabled={method === "qr-code"}
              onPress={() => setMethod("qr-code")}
            />
          </Reanimated.View>
          <Reanimated.View
            style={{ width: "100%" }}
            layout={LinearTransition}
            entering={FlipInXDown.springify().delay(400)}
          >
            <DuoListPressable
              leading={
                <LinkIcon
                  size={24}
                  color={method === "manual-url" ? theme.colors.primary : (theme.colors.text + "88")}
                />
              }
              text={t("login.PronoteAuthSelector.url")}
              enabled={method === "manual-url"}
              onPress={() => setMethod("manual-url")}
            />
          </Reanimated.View>
        </Reanimated.ScrollView>
      </View>

      <View style={styles.buttons}>
        <View
          style={{
            flexDirection: "row",
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
              flex: 1,
              color: theme.colors.text,
              opacity: 0.5,
              fontSize: 13,
              lineHeight: 16,
            }}
          >
            {t("login.PronoteAuthSelector.affiliation")}
          </NativeText>
        </View>

        <ButtonCta
          primary
          value={t("confirm")}
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
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },
});

export default PronoteAuthenticationSelector;
