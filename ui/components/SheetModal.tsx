import React, { PropsWithChildren, useEffect, useState } from "react";
import { Modal, ModalProps, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const OPEN_DURATION = 220;
const CLOSE_DURATION = 180;

type SheetModalProps = PropsWithChildren<ModalProps>;

export default function SheetModal({
  animationType = "slide",
  children,
  visible = false,
  ...props
}: SheetModalProps) {
  const { height } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useSharedValue(visible ? 0 : height);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    if (visible) {
      if (!isMounted) {
        setIsMounted(true);
        translateY.value = height;
      }

      translateY.value = withTiming(0, {
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!isMounted) {
      translateY.value = height;
      return;
    }

    // Android unmounts Modal children as soon as `visible` becomes false.
    translateY.value = withTiming(
      height,
      {
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
      },
      finished => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      }
    );
  }, [height, isMounted, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (Platform.OS !== "android") {
    return (
      <Modal
        {...props}
        animationType={animationType}
        visible={visible}
      >
        {children}
      </Modal>
    );
  }

  if (!visible && !isMounted) {
    return null;
  }

  return (
    <Modal
      {...props}
      animationType="none"
      navigationBarTranslucent
      statusBarTranslucent
      transparent
      visible
    >
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
