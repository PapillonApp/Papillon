import React from "react";
import { Switch } from "react-native";

type NativeSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function NativeSwitch({ value, onValueChange, disabled }: NativeSwitchProps) {
  return <Switch value={value} onValueChange={onValueChange} disabled={disabled} />;
}
