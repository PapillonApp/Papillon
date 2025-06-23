import React, { useState } from "react";
import { View, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import List from "./List";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

export interface CalendarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  date: initialDate = new Date(),
  onDateChange,
  showDatePicker,
  setShowDatePicker,
}) => {
  if(Platform.OS === 'android') {
    return null;
  }

  const [date, setDate] = useState(initialDate);
  const insets = useSafeAreaInsets();

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onDateChange?.(currentDate);
    if (Platform.OS === "android") setShowDatePicker(false);
  };

  if (!showDatePicker) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 48,
        zIndex: 99999,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View>
        <List
          disablePadding
          style={{
            overflow: "hidden",
            maxWidth: "90%",
            transformOrigin: "top center",
          }}
          entering={PapillonAppearIn}
          exiting={PapillonAppearOut}
        >
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={handleChange}
            style={{ width: "100%", marginTop: -6, marginHorizontal: 10 }}
          />
        </List>
      </View>
    </View>
  );
};

export default Calendar;
