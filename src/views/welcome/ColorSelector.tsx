import React, { useLayoutEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import MaskStarsColored from "@/components/FirstInstallation/MaskStarsColored";
import { useTheme } from "@react-navigation/native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import type { Screen } from "@/router/helpers/types";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentAccount } from "@/stores/account";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, { ZoomIn, ZoomOut, LinearTransition, FadeIn, FadeOut, FlipInXDown, FadeOutUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getIconName, setIconName } from "@candlefinance/app-icon";

import colorsList from "@/utils/data/colors.json";
import { removeColor } from "../settings/SettingsIcons";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

type Color = typeof colorsList[number];

const ColorSelector: Screen<"ColorSelector"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const settings = route.params?.settings || false;
  const { playHaptics, playSound } = useSoundHapticsWrapper();
  const LEson003 = require("@/../assets/sound/click_003.wav");
  const LEson6 = require("@/../assets/sound/6.wav");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: settings || false,
      headerBackVisible: true,
      headerTitle: "Choix de la couleur",
    });
  }, [navigation]);

  const messages = colorsList.map((color) => ({
    [color.hex.primary]: color.description
  })).reduce((acc, cur) => ({ ...acc, ...cur }), {} as { [key: string]: string });

  const selectColor = (color: Color) => {
    mutateProperty("personalization", { color });
    playHaptics("notification", {
      notification: Haptics.NotificationFeedbackType.Success,
    });
    playSound(LEson003);

    if (!isExpoGo()) {
      getIconName().then((currentIcon) => {
        if (currentIcon.includes("_Dynamic_")) {
          const mainColor = color.hex.primary;
          const colorItem = colorsList.find((color) => color.hex.primary === mainColor);
          const nameIcon = removeColor(currentIcon);

          const iconConstructName = nameIcon + (colorItem ? "_" + colorItem.id : "");

          setIconName(iconConstructName);
        }
      });
    };
  };

  const ColorButton: React.FC<{ color: Color }> = ({ color }) => (
    <View style={styles.colorButtonContainer}>
      <Pressable
        onPress={() => selectColor(color)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? color.hex.primary + "44" : color.hex.primary,
          },
        ]}
      />

      {account?.personalization?.color?.hex.primary === color.hex.primary && (
        <Reanimated.View
          pointerEvents="none"
          style={[
            styles.colorButtonContainer,
            {
              position: "absolute",
              top: -18,
              left: -18,
              width: 60,
              height: 60,
              borderRadius: 200,
              borderColor: color.hex.primary,
              zIndex: -99,
            }
          ]}
          entering={ZoomIn.springify().mass(1).stiffness(150)}
          exiting={ZoomOut}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Reanimated.View
        entering={Platform.OS === "ios" ? FadeIn.duration(400) : void 0}
        exiting={Platform.OS === "ios" ? FadeOut.duration(2000) : void 0}
        key={account?.personalization?.color?.hex.primary || ""}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <LinearGradient
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          colors={[account?.personalization?.color?.hex.primary + "22", colors.background]}
          locations={[0, 0.5]}
        />
      </Reanimated.View>

      <PapillonShineBubble
        message={"Quelle est ta couleur préférée ?"}
        numberOfLines={1}
        width={280}
        offsetTop={"10%"}
      />
      <MaskStarsColored color={account?.personalization?.color?.hex.primary || colors.text}/>
      <View style={styles.colors}>
        <View style={styles.row}>
          {colorsList.slice(0, 3).map((color) => <ColorButton key={color.id} color={color} />)}
        </View>
        <View style={styles.row}>
          {colorsList.slice(3, 6).map((color) => <ColorButton key={color.id} color={color} />)}
        </View>

        <Reanimated.View
          layout={LinearTransition}
          entering={FlipInXDown.springify().delay(50)}
          exiting={FadeOutUp.springify()}
          key={account?.personalization?.color?.hex.primary || ""}
          style={[styles.message, {
            backgroundColor: account?.personalization?.color?.hex.primary + "33",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center"}]}
        >
          <Reanimated.Text
            layout={LinearTransition.springify().stiffness(150)}
            style={{
              color: account?.personalization?.color?.hex.primary || "",
              fontFamily: "semibold",
              fontSize: 15,
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: "100%"
            }}
          >
            {messages[account?.personalization?.color?.hex.primary || ""]}
          </Reanimated.Text>
        </Reanimated.View>
      </View>

      <Reanimated.View
        style={styles.done}
        entering={Platform.OS === "ios" ? FadeIn.duration(200) : void 0}
        exiting={Platform.OS === "ios" ? FadeOut.duration(1000) : void 0}
        key={(account?.personalization?.color?.hex.primary || "") + "_btn"}
      >
        <ButtonCta
          primary
          value="Finaliser"
          onPress={async () => {
            if (!settings) {
              playSound(LEson6);
            }
            navigation.navigate("AccountStack", {onboard: true});
          }}
          disabled={!account?.personalization?.color}
          style={{
            marginBottom: insets.bottom + 20,
            backgroundColor: account?.personalization?.color?.hex.primary
          }}
        />
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 30,
    margin: 5,
  },
  colors: {
    flex: 1,
    marginTop: -200,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonContainer: {
    borderRadius: 200,
    borderWidth: 5,
    margin: 13,
    borderColor: "transparent",
  },
  message: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 250,
    width: "90%",
  },
  done: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
  },
});

export default ColorSelector;
