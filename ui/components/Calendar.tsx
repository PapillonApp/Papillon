import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import React, { useState, useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring, withDelay } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runsIOS26 } from '../utils/IsLiquidGlass';

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';


export interface CalendarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  color?: string;
}

export interface CalendarRef {
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

const Calendar = React.forwardRef<CalendarRef, CalendarProps>(({
  date: initialDate = new Date(),
  onDateChange,
  color,
}, ref) => {
  const [date, setDate] = useState(initialDate);
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();

  React.useImperativeHandle(ref, () => ({
    toggle: () => setVisible(prev => !prev),
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onDateChange?.(currentDate);
    if (Platform.OS === "android") { setVisible(false); }
  };

  if (Platform.OS === "android") {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={date}
        mode="date"
        design="material"
        display="inline"
        accentColor={color}
        locale={Localization.getLocales()[0].languageTag}
        onChange={handleChange}
        style={{ maxWidth: 300, width: 300, maxHeight: 320, height: 320, marginTop: -6, marginHorizontal: 10 }}
      />
    )
  }

  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = withSpring(1, { duration: 600, dampingRatio: 0.6, mass: 2, velocity: 1 });
    } else {
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = withSpring(0.85, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable
      onPress={() => setVisible(false)}
      pointerEvents={visible ? "auto" : "none"}
      style={{
        position: "absolute",
        top: runsIOS26 ? insets.top + 46 : 0,
        left: 16,
        bottom: 0,
        right: 0,
        zIndex: 999,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View style={{ pointerEvents: "box-none" }}>
        <Reanimated.View
          style={[{
            transformOrigin: "top left",
            overflow: "visible",
            top: 4,
          }, animatedStyle]}
        >
          <LiquidGlassView
            glassType="regular"
            isInteractive={true}
            glassOpacity={0}
            style={{
              borderRadius: 20,
              zIndex: 99,
              width: 340,
              height: 320,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              accentColor={color}
              locale={Localization.getLocales()[0].languageTag}
              onChange={handleChange}
              style={{
                width: "100%",
                height: "100%",
                paddingHorizontal: 5,
                paddingBottom: 5,
              }}
            />
          </LiquidGlassView>
        </Reanimated.View>
      </View>
    </Pressable>
  );
});

export default Calendar;
