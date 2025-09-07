import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { runsIOS26 } from "../utils/IsLiquidGlass";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import List from "./List";
import { useHeaderHeight } from '@react-navigation/elements';

export interface CalendarProps {
  date?: Date;
  topInset?: number;
  onDateChange?: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  date: initialDate = new Date(),
  topInset,
  onDateChange,
  showDatePicker,
  setShowDatePicker,
}) => {
  const [date, setDate] = useState(initialDate);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onDateChange?.(currentDate);
    if (Platform.OS === "android") { setShowDatePicker(false); }
  };

  React.useEffect(() => {
    if (showDatePicker) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [showDatePicker]);

  if (!showDatePicker) { return null; }

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

  return (
    <Pressable
      onPress={() => setShowDatePicker(false)}
      style={{
        position: "absolute",
        top: runsIOS26() ? insets.top + 48 : topInset || 8,
        zIndex: 99999,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View style={{ pointerEvents: "box-none" }}>
        <List
          disablePadding
          style={{
            overflow: "hidden",
            maxWidth: "90%",
            transformOrigin: "top center",
            maxHeight: 320,
            borderColor: colors.text + "26",
            borderWidth: 0.5,
            top: useHeaderHeight(),
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
            style={{ maxWidth: 300, width: 300, maxHeight: 320, height: 320, marginTop: 0, marginHorizontal: 10, }}
          />
        </List>
      </View>
    </Pressable>
  );
};

export default Calendar;
