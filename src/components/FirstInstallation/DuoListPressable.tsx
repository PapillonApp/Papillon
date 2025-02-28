import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const DuoListPressable: React.FC<{
  children?: JSX.Element,
  leading?: JSX.Element,
  text?: string,
  subtext?: string,
  trailing?: JSX.Element,
  enabled?: boolean,
  onPress?: () => void,
}> = ({
  children,
  leading,
  text,
  subtext,
  trailing,
  enabled,
  onPress = () => { },
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const { isTablet } = useScreenDimensions();

  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const { playHaptics, playSound } = useSoundHapticsWrapper();
  const LEson = require("@/../assets/sound/click_003.wav");

  useEffect(() => {
    if (pressed) {
      scale.value = withTiming(1, { duration: 0, easing: Easing.linear });
      scale.value = withTiming(0.95, { duration: 50, easing: Easing.linear });
      opacity.value = withTiming(0.7, { duration: 10, easing: Easing.linear });
      playHaptics("impact", {
        impact: Haptics.ImpactFeedbackStyle.Light,
      });
      playSound(LEson);
    }
    else {
      scale.value = withTiming(1, { duration: 100, easing: Easing.linear });
      opacity.value = withTiming(1, { duration: 100, easing: Easing.linear });
    }

  }, [pressed]);

  return (
    <Reanimated.View
      style={{
        transform: [{ scale: scale }],
        opacity: opacity,
      }}
    >
      <Pressable
        style={[
          isTablet ? { width: "50%" } : { width: "100%" },
          styles.pressable,
          enabled ? {
            borderColor: colors.primary,
            backgroundColor: colors.primary + "26",
            shadowColor: colors.primary,
          } : {
            borderColor: colors.border,
          }
        ]}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => {
          setTimeout(() => {
            setPressed(false);
          }, 50);
        }}
      >
        {leading && (
          <View>
            {leading}
          </View>
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          {children}

          {text && (
            <Text
              style={[
                styles.text,
                enabled && styles.text_enabled,
                enabled ? { color: colors.primary } : { color: colors.text + "88" },
                subtext ? { marginBottom: 2 } : { marginTop: 0 },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {text}
            </Text>
          )}

          {subtext && (
            <Text style={[
              styles.subtext,
              enabled && styles.subtext_enabled,
              enabled ? { color: colors.primary } : { color: colors.text + "88" },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            >
              {subtext}
            </Text>
          )}
        </View>

        {trailing && (
          <View>
            {trailing}
          </View>
        )}
      </Pressable>
    </Reanimated.View >
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 18,
    alignSelf: "center",
  },

  text: {
    fontSize: 18,
    fontFamily: "medium",
    width: "100%",
  },

  subtext: {
    fontSize: 16,
    width: "100%",
    marginTop: 2,
    opacity: 0.7,
    fontFamily: "medium",
  },

  text_enabled: {
    fontFamily: "semibold",
  },

  subtext_enabled: {
  },
});

export default DuoListPressable;