import React from "react";
import { View } from "react-native";

type AveragesProps = Record<string, any>;

/** Web fallback for the native SwiftUI averages UI. */
export default function Averages({ style }: AveragesProps) {
  return <View style={style} />;
}
