import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Reanimated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runsIOS26 } from '../utils/IsLiquidGlass';

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';


export interface CalendarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  setShowDatePicker: (show: boolean) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  date: initialDate = new Date(),
  onDateChange,
  setShowDatePicker,
}) => {
  const [date, setDate] = useState(initialDate);
  const { colors } = useTheme();

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onDateChange?.(currentDate);
    if (Platform.OS === "android") { setShowDatePicker(false); }
  };

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        design="material"
        display="inline"
        accentColor={colors.primary}
        locale={Localization.getLocales()[0].languageTag}
        onChange={handleChange}
        style={{ maxWidth: 300, width: 300, maxHeight: 320, height: 320, marginTop: -6, marginHorizontal: 10 }}
      />
    )
  }

  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => setShowDatePicker(false)}
      style={{
        position: "absolute",
        top: runsIOS26 ? insets.top + 46 : 0,
        left: 16,
        bottom: 0,
        right: 0,
        zIndex: 99999,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View style={{ pointerEvents: "box-none" }}>
        <Reanimated.View
          style={{
            transformOrigin: "top left",
            overflow: "hidden",
            width: 340,
            height: 320,
            borderColor: colors.text + "26",
            borderWidth: 0.5,
            borderRadius: 16,
            top: 4,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
          entering={PapillonAppearIn}
          exiting={PapillonAppearOut}
        >
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            accentColor={colors.primary}
            locale={Localization.getLocales()[0].languageTag}
            onChange={handleChange}
            style={{
              width: "100%",
              height: "100%",
              paddingHorizontal: 5,
              paddingBottom: 8,
            }}
          />
        </Reanimated.View>
      </View>
    </Pressable>
  );
};

export default Calendar;
