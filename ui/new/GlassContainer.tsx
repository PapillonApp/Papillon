import { LiquidGlassView } from "@sbaiahmed1/react-native-blur";
import React, { useMemo, useState } from "react";
import { Platform } from "react-native";

const GlassContainer = (props) => {
  if (Platform.OS !== 'ios') {
    return (
      <View {...props}>
        {props.children}
      </View>
    );
  }

  return (
    <LiquidGlassView {...props}>
      {props.children}
    </LiquidGlassView>
  );
}

export default GlassContainer;