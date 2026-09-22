import React from "react";
import { Pressable, Text, View } from "react-native";

type ActionMenuProps = Record<string, any>;

/** Web fallback for the SwiftUI ActionMenu. Native behaviour remains unchanged on iOS/Android. */
export default function ActionMenu({ children, title, onPress, ...props }: ActionMenuProps) {
  if (children) return <View {...props}>{children}</View>;
  if (typeof onPress === "function") {
    return (
      <Pressable onPress={onPress} {...props}>
        {title ? <Text>{title}</Text> : null}
      </Pressable>
    );
  }
  return <View {...props} />;
}
