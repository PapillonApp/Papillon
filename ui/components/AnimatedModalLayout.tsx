import React, { useMemo, Suspense } from "react";
import { View, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS, useAnimatedRef, useScrollViewOffset, SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import getCorners from "../utils/Corners";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";

interface AnimatedModalLayoutProps {
  backgroundColor?: string;
  background?: React.ReactNode;
  headerContent: React.ReactNode;
  modalContent: React.ReactNode;
  height?: number; // Height of the header
  onFullyScrolled?: (isFullyScrolled: boolean) => void;
  scrollOffset?: SharedValue<number>;
}

export default function AnimatedModalLayout({
                                              backgroundColor = "#fff",
                                              background,
                                              headerContent,
                                              modalContent,
                                              height = 125,
                                              onFullyScrolled,
                                              scrollOffset,
                                            }: AnimatedModalLayoutProps) {
  // Precompute constants for animation, memoized for efficiency
  const headerHeight = height;

  // Remove deferred modal content rendering for fastest initial paint
  const insets = useSafeAreaInsets();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY: SharedValue<number> = useScrollViewOffset(scrollViewRef);
  const isScrolledPastThreshold = useSharedValue(false);

  // Use useAnimatedScrollHandler outside of render for performance
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";

      scrollOffset?.set(event.contentOffset.y);

      if (onFullyScrolled) {
        const wasScrolledPast = isScrolledPastThreshold.value;
        const isNowScrolledPast = event.contentOffset.y > headerHeight;

        if (wasScrolledPast !== isNowScrolledPast) {
          isScrolledPastThreshold.value = isNowScrolledPast;
          runOnJS(onFullyScrolled)(isNowScrolledPast);
        }
      }
    },
  });

  // Memoize corners and theme for efficiency
  const corners = useMemo(() => getCorners(), []);
  const { colors } = useTheme();
  const windowHeight = useMemo(() => Dimensions.get("window").height, []);
  const headerTop = useMemo(() => 50 + insets.top, [insets.top]);
  const scrollRange = useMemo(() => headerTop + headerHeight, [headerTop]);
  const modalPaddingBottom = useMemo(() => 16 + insets.bottom, [insets.bottom]);
  const modalMinHeight = useMemo(() => windowHeight - (insets.bottom + 16 + 50 + insets.top + headerHeight), [windowHeight, insets.bottom, insets.top]);
  // Use React.memo for modal and header content for best performance
  const MemoHeaderContent = React.memo(() => <>{headerContent}</>);
  const MemoModalContent = React.memo(() => <>{modalContent}</>);
  // Move style memoization outside render
  const scrollViewStyle = useMemo(() => [styles.scrollView, { paddingTop: headerTop + headerHeight }], [headerTop, headerHeight]);
  const modalBaseStyle = useMemo(() => [styles.modal, {
    paddingBottom: modalPaddingBottom,
    backgroundColor: colors.background,
  }], [modalPaddingBottom, colors.background]);
  const headerStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, scrollRange],
            [1, 0.5],
            Extrapolate.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            scrollY.value,
            [-200, 0, scrollRange],
            [200, 0, -100],
            Extrapolate.EXTEND,
          ),
        },
      ],
      opacity: interpolate(scrollY.value, [0, headerHeight + 50], [1, 0], Extrapolate.CLAMP),
      willChange: "transform, opacity", // Hint for native optimization
    };
  });
  const blurStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: interpolate(scrollY.value, [0, headerHeight/2], [0, 1], Extrapolate.CLAMP),
      willChange: "opacity", // Hint for native optimization
    };
  });
  const modalStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      minHeight: modalMinHeight,
      borderCurve: "continuous",
      willChange: "borderTopRightRadius, borderTopLeftRadius, minHeight", // Hint for native optimization
    };
  });
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {background}
      {/* Absolutely positioned animated header */}
      <Animated.View style={[styles.header, headerStyle, styles.headerAbsolute, {
        top: headerTop,
        height: headerHeight,
      }]}
      >
          <MemoHeaderContent />
      </Animated.View>
      <Animated.View
        style={[{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }, blurStyle]}
      >
        <BlurView
          intensity={50}
          style={{flex: 1}}
        />
      </Animated.View>
      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16} // Lower throttle for smoother scroll
        onScroll={scrollHandler}
        style={scrollViewStyle}
        removeClippedSubviews // Unmount offscreen views for memory
        snapToOffsets={[0, scrollRange]} // Snap to header and modal positions
      >
        <Animated.View style={[...modalBaseStyle, modalStyle]}>
          <Suspense fallback={<ActivityIndicator />}>
            <MemoModalContent />
          </Suspense>
          {/* Invisible bottom extension to prevent background on bounce */}
          <View style={{ height: 40 }} />
          <View style={[styles.bottomExtension, { backgroundColor: colors.background }]}
                pointerEvents="none"
          />
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
    zIndex: 10,
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
