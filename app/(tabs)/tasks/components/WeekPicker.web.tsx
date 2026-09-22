import React from "react";
import { View } from "react-native";

type WeekPickerProps = Record<string, any>;

/** Native SwiftUI week picker is not available on web. */
export default function WeekPicker({ visible }: WeekPickerProps) {
  return visible ? <View /> : null;
}
