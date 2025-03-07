import useScreenDimensions from "@/hooks/useScreenDimensions";
import { useTheme } from "@react-navigation/native";
import React, {useCallback} from "react";
import { KeyboardAvoidingView, Modal, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  Easing
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
  opened: boolean
  children: React.ReactNode
  setOpened: (value: boolean) => unknown
  // Additional properties
  [key: string]: any
}

const BottomSheet = ({ children, opened, setOpened, ...props }: BottomSheetProps) => {
  const colors = useTheme().colors;
  const translateY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { isTablet } = useScreenDimensions();

  const closeModal = useCallback(() => {
    setOpened(false);
    // reset translateY value
    translateY.value = 0;
  }, [setOpened]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withTiming(500, {}, () => {
          runOnJS(closeModal)();
        });
      } else {
        translateY.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Modal
      transparent={true}
      visible={opened}
      onRequestClose={closeModal}
      animationType="fade"
      {...props}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0 - insets.bottom}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <Pressable
          style={{
            flex: 1,
            width: "100%",
          }}
          onPress={closeModal}
        />

        {opened && (
          <GestureDetector gesture={gesture}>
            <Reanimated.View
              style={[
                {
                  backgroundColor: colors.background,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  borderCurve: "continuous",
                  paddingBottom: insets.bottom + 10 + 16,
                  width: "100%",
                  maxWidth: isTablet ? "50%" : "100%",
                },
                animatedStyle,
                props.contentContainerStyle,
              ]}
              entering={SlideInDown.easing(Easing.bezier(0.5, 0, 0, 1).factory()).duration(300)}
              exiting={SlideOutDown}
            >
              {children}
            </Reanimated.View>
          </GestureDetector>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;
