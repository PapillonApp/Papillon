import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";

const DuoListPressable: React.FC<{
  children?: JSX.Element,
  leading?: JSX.Element,
  text?: string,
  trailing?: JSX.Element,
  enabled?: boolean,
  onPress?: () => void,
}> = ({
  children,
  leading,
  text,
  trailing,
  enabled,
  onPress = () => { },
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const playSound = useCallback(async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/../assets/sound/click_003.wav")
    );
    await sound.setPositionAsync(0);
    await sound.playAsync();
  }, []);

  useEffect(() => {
    if (pressed) {
      scale.value = withTiming(1, { duration: 0, easing: Easing.linear });
      scale.value = withTiming(0.95, { duration: 50, easing: Easing.linear });
      opacity.value = withTiming(0.7, { duration: 10, easing: Easing.linear });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound();
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
        width: "100%",
      }}
    >
      <Pressable
        style={[
          styles.pressable,
          enabled ? {
            borderColor: colors.primary,
            backgroundColor: colors.primary + "22",
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
          }}
        >
          {children}

          {text && (
            <Text style={[
              styles.text,
              enabled && styles.text_enabled,
              enabled ? { color: colors.primary } : { color: colors.text + "88" },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            >
              {text}
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
    width: "100%",
    borderWidth: 1.5,
    borderBottomWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },

  text: {
    fontSize: 18,
    fontFamily: "medium",
    width: "100%",
  },

  text_enabled: {
    fontFamily: "semibold",
  },
});

export default DuoListPressable;