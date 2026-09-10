import type { MenuAction, NativeActionEvent } from "@react-native-menu/menu";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Papicons } from "@getpapillon/papicons";

import ActionMenu from "@/ui/components/ActionMenu";

// Android header items are plain React Native views rather than
// `Stack.Toolbar` items. The toolbar's Android backend hosts its children in a
// Jetpack Compose island, which only accepts drawable icons (SF Symbols render
// nothing) and does not take part in React Native's touch dispatch, so taps on
// it fall through to whatever sits behind the header. Rendering the items with
// `asChild` keeps them in the RN tree, where hit testing and the app's own menu
// UI both behave.

// Matches the Material toolbar action size, so these line up with the native
// search icon the stack adds next to them.
const ITEM_SIZE = 48;

/** `ActionMenu` reads `papicon` off its actions; the upstream type omits it. */
export type AndroidHeaderMenuAction = MenuAction & { papicon?: string };

export function AndroidHeaderButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const tint = String(colors.text);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      android_ripple={{ color: `${tint}22`, borderless: true, radius: ITEM_SIZE / 2 }}
      style={styles.item}
    >
      <Papicons name={icon} size={24} color={tint} />
    </Pressable>
  );
}

export function AndroidHeaderMenu({
  icon,
  actions,
  onPressAction,
  accessibilityLabel,
}: {
  icon: string;
  actions: AndroidHeaderMenuAction[];
  onPressAction: (event: NativeActionEvent) => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();

  return (
    <ActionMenu actions={actions} onPressAction={onPressAction} placement="below">
      <View accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.item}>
        <Papicons name={icon} size={24} color={String(colors.text)} />
      </View>
    </ActionMenu>
  );
}

const styles = StyleSheet.create({
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
