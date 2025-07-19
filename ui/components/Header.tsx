import React from "react";
import { PressableProps, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import LinearGradient from "react-native-linear-gradient";
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";

interface HeaderSideProps extends ViewProps {
  children?: React.ReactNode;
  side: "Left" | "Right";
}

const HeaderSide = React.memo(function HeaderSide(props: HeaderSideProps) {
  return (
    <View
      {...props}
    />
  );
});

interface HeaderTitleProps extends PressableProps {
  children?: React.ReactNode;
}

const HeaderTitle = React.memo(function HeaderTitle(props: HeaderTitleProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      {...props}
    />
  )
})

interface HeaderProps extends ViewProps {
  children?: React.ReactNode;
  scrollOffset: SharedValue<number>;
}

const Header = React.memo(function Header(HeaderProps: HeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = useTheme().colors;

  const HeaderBackgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(HeaderProps.scrollOffset.value, [0, insets.top + 56 + 125], [-(insets.top + 56), 0], {
          extrapolateLeft: Extrapolate.CLAMP,
          extrapolateRight: Extrapolate.CLAMP,
        }),
      },
    ],
    opacity: interpolate(HeaderProps.scrollOffset.value, [0, insets.top + 125], [0, 1], {
      extrapolateLeft: Extrapolate.CLAMP,
      extrapolateRight: Extrapolate.CLAMP,
    })
  }));

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 56 + insets.top, // Default height for header title
        zIndex: 1000, // Ensure it is above other content
      }}
      {...HeaderProps}
    >
      <Animated.View style={[{ flex: 1 }, HeaderBackgroundAnimatedStyle]}>
        <LinearGradient
          colors={[colors.background, colors.background + "AA", colors.background + "AA", colors.background + "00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56 + insets.top,
          }}
        />
        <MaskedView
          maskElement={
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: "#000", height: insets.top }} />
              <LinearGradient colors={["#000", "#000C", "#0000"]}
                              style={{ flex: 1 }}
              />
            </View>
          }
          style={{ flex: 1 }}
        >
          <BlurView
            intensity={20}
            tint={"systemThinMaterial"}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: insets.top, // Adjust for safe area
            }}
          />
        </MaskedView>
      </Animated.View>
      <View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        {HeaderProps.children}
      </View>
    </Animated.View>
  );
});

export { Header, HeaderSide, HeaderTitle };