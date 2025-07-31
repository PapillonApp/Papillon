var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import useScreenDimensions from "@/hooks/useScreenDimensions";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useCallback } from "react";
import { KeyboardAvoidingView, Modal, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, SlideInDown, SlideOutDown, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
var BottomSheet = function (_a) {
    var children = _a.children, opened = _a.opened, setOpened = _a.setOpened, props = __rest(_a, ["children", "opened", "setOpened"]);
    var colors = useTheme().colors;
    var translateY = useSharedValue(0);
    var insets = useSafeAreaInsets();
    var isTablet = useScreenDimensions().isTablet;
    var closeModal = useCallback(function () {
        setOpened(false);
        // reset translateY value
        translateY.value = 0;
    }, [setOpened]);
    var gesture = Gesture.Pan()
        .onUpdate(function (event) {
        if (event.translationY > 0) {
            translateY.value = event.translationY;
        }
    })
        .onEnd(function (event) {
        if (event.translationY > 100) {
            translateY.value = withTiming(500, {}, function () {
                runOnJS(closeModal)();
            });
        }
        else {
            translateY.value = withTiming(0);
        }
    });
    var animatedStyle = useAnimatedStyle(function () {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });
    return (<Modal transparent={true} visible={opened} onRequestClose={closeModal} animationType="fade" {...props}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0 - insets.bottom} style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}>
        <Pressable style={{
            flex: 1,
            width: "100%",
        }} onPress={closeModal}/>

        {opened && (<GestureDetector gesture={gesture}>
            <Reanimated.View style={[
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
            ]} entering={SlideInDown.easing(Easing.bezier(0.5, 0, 0, 1).factory()).duration(300)} exiting={SlideOutDown}>
              {children}
            </Reanimated.View>
          </GestureDetector>)}
      </KeyboardAvoidingView>
    </Modal>);
};
export default BottomSheet;
