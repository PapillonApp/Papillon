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
  const dateValue = mode === "date"
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

  return React.createElement("input" as any, {
    type: mode,
    value: dateValue,
    onChange: (event: { target: { value: string } }) => {
      const [first, second, third] = event.target.value.split(mode === "date" ? "-" : ":").map(Number);
      if (mode === "date") {
        const date = new Date(value);
        date.setFullYear(first, second - 1, third);
        onChange(date);
      } else if (Number.isFinite(first) && Number.isFinite(second)) {
        const date = new Date(value);
        date.setHours(first, second, 0, 0);
        onChange(date);
      }
    },
    style: {
      color: "inherit",
      background: "transparent",
      border: "1px solid #80808055",
      borderRadius: 10,
      padding: "10px 12px",
      font: "inherit",
      minWidth: 150,
    },
  });
}
