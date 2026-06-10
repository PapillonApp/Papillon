import { ProgressiveBlurView } from "@sbaiahmed1/react-native-blur";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stack from "@/ui/components/Stack";

import HomeTopBarButton from "../components/HomeTopBarButton";
import UserProfile from "./UserProfile";
import {
  createAnimatedComponent,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const HomeTopBar = ({
  height = 56,
  scroll,
}: {
  height?: number;
  scroll: SharedValue<number>;
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const AnimatedLinearGradient = createAnimatedComponent(LinearGradient);

  const linearAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -20,
    opacity: scroll.value / 200,
  }));

  return (
    <>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height + insets.top,
          zIndex: 10,
        }}
      >
        {Platform.OS === "ios" && (
          <ProgressiveBlurView
            blurAmount={10}
            blurType="systemMaterial"
            direction="blurredTopClearBottom"
            startOffset={0}
            reducedTransparencyFallbackColor="#00000000"
            style={{ width: "100%", height: "101%" }}
          />
        )}
        <AnimatedLinearGradient
          colors={["#0008", "#0000"]}
          style={linearAnimatedStyle}
        />
      </View>

      <View
        style={{
          height: height,
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          zIndex: 11,
          alignItems: "center",
          flexDirection: "row",
          gap: 16,
        }}
      >
        <UserProfile />

        <Stack
          direction="horizontal"
          hAlign="center"
          vAlign="end"
          gap={7}
          inline
        >
          <HomeTopBarButton
            icon="palette"
            onPress={() => router.push("/(modals)/wallpaper")}
          />
          <HomeTopBarButton
            icon="gears"
            onPress={() => router.push("/(settings)/settings")}
          />
        </Stack>
      </View>
    </>
  );
};

export default HomeTopBar;
