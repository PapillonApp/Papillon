import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useScrollViewOffset,
  useAnimatedRef, useDerivedValue, runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedModalLayoutProps {
  backgroundColor?: string;
  background?: React.ReactNode;
  headerContent: React.ReactNode;
  modalContent: React.ReactNode;
  onScrollOffsetChange?: (offset: number) => void;
}

export default function AnimatedModalLayout({
                                              backgroundColor = "#fff",
                                              background,
                                              headerContent,
                                              modalContent,
                                              onScrollOffsetChange
                                            }: AnimatedModalLayoutProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollViewRef);

  useDerivedValue(() => {
    if (onScrollOffsetChange) {
      runOnJS(onScrollOffsetChange)(scrollOffset.value);
    }
  }, [scrollOffset]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollOffset.value, [0, 50], [0, 35], Extrapolate.EXTEND),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [0, 50 + insets.top + 125],
          [1, 0.5],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(scrollOffset.value, [0, 50 + 125], [1, 0], Extrapolate.CLAMP),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    borderTopRightRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + 125],
      [25, 10],
      Extrapolate.CLAMP
    ),
    borderTopLeftRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + 125],
      [25, 10],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {background}
      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        style={[
          styles.scrollView,
          { paddingTop: 50 + insets.top },
        ]}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          {headerContent}
        </Animated.View>

        <Animated.View style={[styles.modal, { paddingBottom: 16 + insets.bottom }, modalStyle]}>
          {modalContent}
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
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "#FFF",
    padding: 16,
  },
});
