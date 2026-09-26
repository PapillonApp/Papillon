import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type TipProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/** TipKit is iOS-only. Keep the anchor component inert on web. */
export default function Tip({ style }: TipProps) {
  return <View pointerEvents="none" style={style} />;
}
