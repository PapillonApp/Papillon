import React from "react";
import { View, ViewProps } from "react-native";

// @callstack/liquid-glass has no web build at all (iOS 26+ only) and calls
// requireNativeComponent at import time, which crashes the whole web/Electron
// bundle before anything renders. Callers in this codebase already gate the
// actual usage behind `runsIOS26` (see ui/utils/IsLiquidGlass.ts), so this
// component is never really rendered on web — it just needs to exist and be
// import-safe.
export function LiquidGlassView(props: ViewProps) {
  return <View {...props} />;
}

export const isLiquidGlassSupported = false;
