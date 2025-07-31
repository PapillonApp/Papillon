import React, { useEffect, useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var ButtonCta = function (_a) {
    var value = _a.value, primary = _a.primary, onPress = _a.onPress, style = _a.style, disabled = _a.disabled, backgroundColor = _a.backgroundColor, icon = _a.icon;
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var colors = useTheme().colors;
    var _b = useState(false), pressed = _b[0], setPressed = _b[1];
    var scale = useSharedValue(1);
    var opacity = useSharedValue(1);
    if (!backgroundColor) {
        backgroundColor = primary ? colors.primary : "transparent";
    }
    var newIcon = icon ? React.cloneElement(icon, {
        color: (primary && !disabled) ? "#fff" : colors.text,
        size: 24,
    }) : null;
    useEffect(function () {
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
    return (<Reanimated.View style={{
            transform: [{ scale: scale }],
            opacity: opacity
        }}>
      <Pressable style={[
            styles.button,
            (primary && !disabled) ? styles.primary : styles.secondary,
            { backgroundColor: backgroundColor },
            {
                borderColor: colors.border,
            },
            disabled && { opacity: 0.5, backgroundColor: colors.border },
            style
        ]} onPress={!disabled ? onPress : undefined} onPressIn={function () { return !disabled ? setPressed(true) : undefined; }} onPressOut={function () { return !disabled ? setPressed(false) : undefined; }}>
        {icon && newIcon}

        <Text style={[styles.text, { color: (primary && !disabled) ? "#ffffff" : colors.text }]}>
          {value}
        </Text>
      </Pressable>
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    button: {
        minWidth: "100%",
        maxWidth: 500,
        height: 46,
        borderRadius: 120,
        borderCurve: "continuous",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        flexDirection: "row",
    },
    primary: {
        elevation: 3,
    },
    secondary: {
        borderWidth: 2,
        opacity: 0.5,
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
