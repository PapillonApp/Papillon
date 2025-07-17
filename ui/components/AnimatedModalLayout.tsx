import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import getCorners from "../utils/Corners";
import { useTheme } from "@react-navigation/native";

interface AnimatedModalLayoutProps {
  backgroundColor?: string;
  background?: React.ReactNode;
  headerContent: React.ReactNode;
  modalContent: React.ReactNode;
  headerHeight?: number;
  onScrollOffsetChange?: (offset: number) => void;
}

export default function AnimatedModalLayout({
  backgroundColor = "#fff",
  background,
  headerContent,
  modalContent,
  headerHeight = 125,
  onScrollOffsetChange
}: AnimatedModalLayoutProps) {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  // Optionally call onScrollOffsetChange in JS thread
  React.useEffect(() => {
    if (!onScrollOffsetChange) return;
    const id = setInterval(() => {
      onScrollOffsetChange(scrollY.value);
    }, 100);
    return () => clearInterval(id);
  }, [onScrollOffsetChange, scrollY]);

  const corners = getCorners();
  const { colors } = useTheme();
  const windowHeight = Dimensions.get("window").height;

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollOffset.value,
          [0, 50 + insets.top + headerHeight],
          [1, 0.5],
          Extrapolate.CLAMP
        ),
      },
      {
        translateY: interpolate(
          scrollY.value,
          [0, 50 + insets.top + 125],
          [0, -100],
          Extrapolate.EXTEND
        ),
      }
    ],
    opacity: interpolate(scrollOffset.value, [0, 50 + headerHeight], [1, 0], Extrapolate.CLAMP),
  }));

  console.log("Corners:", corners);

  const modalStyle = useAnimatedStyle(() => ({
    borderTopRightRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + headerHeight],
      [25, 10],
      Extrapolate.CLAMP
    ),
    borderTopLeftRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + headerHeight],
      [25, 10],
      Extrapolate.CLAMP
    ),
    minHeight: windowHeight - (insets.bottom + 16 + 50 + insets.top + 125),
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {background}
      {/* Absolutely positioned animated header */}
      <Animated.View style={[styles.header, headerStyle, styles.headerAbsolute, { top: 50 + insets.top }]}>
        {headerContent}
      </Animated.View>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        style={[
          styles.scrollView,
          { paddingTop: 50 + insets.top + 125 }, // Add header height to padding
        ]}
      >
        <Animated.View style={[styles.header, { height: headerHeight }, headerStyle]}>
          {headerContent}
        </Animated.View>

        <Animated.View style={[styles.modal, { paddingBottom: 16 + insets.bottom }, modalStyle]}>
          {modalContent}
          {/* Invisible bottom extension to prevent background on bounce */}
          <View style={{ height: 40 }} />
          <View style={[styles.bottomExtension, { backgroundColor: colors.background }]} pointerEvents="none" />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 0,
  },
  modal: {
    padding: 16,
    zIndex: 100000,
  },
  bottomExtension: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1000,
    bottom: -1000,
    backgroundColor: "transparent",
    zIndex: -1,
  },
});
