import React, { useEffect, useState } from "react";
import { Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const ButtonCta: React.FC<{
  value: string
  primary?: boolean
  disabled?: boolean
  onPress?: () => void,
  style?: StyleProp<ViewStyle>,
  backgroundColor?: string,
  icon?: React.ReactElement
}> = ({
  value,
  primary,
  onPress,
  style,
  disabled,
  backgroundColor,
  icon,
}) => {
  const { playHaptics } = useSoundHapticsWrapper();
  const { colors } = useTheme();

  const { isTablet } = useScreenDimensions();

  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  if (!backgroundColor) {
    backgroundColor = primary ? colors.primary : "transparent";
  }

  const newIcon = icon ? React.cloneElement(icon, {
    color: (primary && !disabled) ? "#fff" : colors.text,
    size: 24,
  }) : null;

  useEffect(() => {
    if (pressed) {
      scale.value = withTiming(1, { duration: 0, easing: Easing.linear });
      scale.value = withTiming(0.95, { duration: 50, easing: Easing.linear });
      opacity.value = withTiming(0.7, { duration: 10, easing: Easing.linear });
      playHaptics("impact", {
        impact: Haptics.ImpactFeedbackStyle.Heavy,
      });
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
        opacity: opacity
      }}
    >
      <Pressable
        style={[
          isTablet ? { width: "50%" } : { width: "100%" },
          styles.button,
          (primary && !disabled) ? styles.primary : styles.secondary,
          { backgroundColor: backgroundColor },
          {
            borderColor: colors.border,
          },
          disabled && { opacity: 0.5, backgroundColor: colors.border },
          style
        ]}
        onPress={!disabled ? onPress : undefined}
        onPressIn={() => !disabled ? setPressed(true) : undefined}
        onPressOut={() => !disabled ? setPressed(false) : undefined}
      >
        {icon && newIcon}

        <Text style={[styles.text, { color: (primary && !disabled) ? "#ffffff" : colors.text}]}>
          {value}
        </Text>
      </Pressable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: 120,
    borderCurve: "continuous",
    justifyContent: "center",
    alignSelf: "center",
    gap: 8,
    flexDirection: "row",
  },

  primary: {
    elevation: 3,
  },

  secondary: {
    borderWidth: 2,
    opacity: 0.5 ,
  },

  text: {
    fontSize: 15,
    fontFamily: "semibold",
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "center",
    textAlign: "center",
  },
});

export default ButtonCta;
