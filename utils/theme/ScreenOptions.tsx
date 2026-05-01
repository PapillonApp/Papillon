import { Platform } from "react-native";
import AndroidBackButton from "./AndroidBackButton";
import AndroidHeaderBackground from "@/components/AndroidHeaderBackground";
import { useFont } from "./fonts";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useScreenOptions = (): any => {
  const font = useFont();

  return React.useMemo(() => ({
    headerLargeTitle: true,
    headerTransparent: Platform.OS === "ios" && parseInt(Platform.Version) >= 26,
    headerBackButtonDisplayMode:
      Platform.OS === "ios" && parseInt(Platform.Version) < 26
        ? undefined
        : "minimal",
    headerTitleStyle: {
      fontFamily: font("semibold"),
      fontSize: Platform.OS === "ios" ? 18 : 20,
    },
    headerLargeTitleStyle: {
      fontFamily: font("bold"),
    },
    headerBackTitleStyle: {
      fontFamily: font("semibold"),
      fontSize: 17,
    },
    headerBackIcon: Platform.OS == 'android' ? {
      type: "image",
      source: require("@/assets/icons/back.svg"),
    } : undefined,
    headerLeft: Platform.OS == 'android' ? () => <AndroidBackButton /> : undefined,
    headerBackVisible: Platform.OS == 'android' ? false : undefined
  }), [font]);
};
