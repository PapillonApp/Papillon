import { LiquidGlassView } from "@sbaiahmed1/react-native-blur";
import React from "react";
import { Platform, View, ViewProps } from "react-native";
import { ListTouchable } from "./List";

const GlassContainer = (props: ViewProps) => {
  if (Platform.OS !== 'ios') {
    return (
      <ListTouchable {...props}>
        {props.children}
      </ListTouchable>
    );
  }

  return (
    <LiquidGlassView {...props}>
      {props.children}
    </LiquidGlassView>
  );
}

export default GlassContainer;