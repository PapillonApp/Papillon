import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import React, { useState, useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { PapillonAppearIn, PapillonAppearOut, PapillonSpringIn, PapillonSpringOut, PapillonZoomIn, PapillonZoomOut } from "../utils/Transition";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring, withDelay } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runsIOS26 } from '../utils/IsLiquidGlass';

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { PapillonSplashOut } from '@/components/FakeSplash';


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

  return (
    <>
      {
        visible && (
          <Pressable
            onPress={() => setVisible(false)}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 9,
            }}
          />
        )
      }

      {visible && (
        <Reanimated.View
          style={[{
            transformOrigin: "top left",
            overflow: "visible",
            position: "absolute",
            top: insets.top + 58,
            left: 12,
            zIndex: 10,
          }]}
          entering={PapillonSpringIn}
          exiting={PapillonSpringOut}
        >
          <LiquidGlassView
            glassType="regular"
            isInteractive={true}
            glassOpacity={0.1}
            style={{
              borderRadius: 20,
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
      )}
    </>
  );
});

export default Calendar;
