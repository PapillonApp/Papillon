import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";

export default function TaskDateInput({
  value,
  mode,
  onChange,
}: {
  value: Date;
  mode: "date" | "time";
  onChange: (value: Date) => void;
}) {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      onChange={(_, date) => date && onChange(date)}
    />
  );
}
