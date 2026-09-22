import React, { forwardRef, useImperativeHandle } from "react";
import { View } from "react-native";

export type CalendarRef = {
  focus?: () => void;
};

type CalendarProps = Record<string, any>;

/** Web fallback. The native SwiftUI calendar is intentionally not bundled for web. */
const Calendar = forwardRef<CalendarRef, CalendarProps>((_props, ref) => {
  useImperativeHandle(ref, () => ({}), []);
  return <View />;
});

Calendar.displayName = "Calendar";
export default Calendar;
