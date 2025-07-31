import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { Svg, Circle, G } from "react-native-svg";
import { animPapillon } from "@/utils/ui/animations";
var PapillonSpinner = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 50 : _b, _c = _a.color, color = _c === void 0 ? "#000000" : _c, _d = _a.strokeWidth, strokeWidth = _d === void 0 ? 4 : _d, style = _a.style, entering = _a.entering, exiting = _a.exiting, _e = _a.animated, animated = _e === void 0 ? true : _e;
    var animatedValue = useRef(new Animated.Value(0));
    useEffect(function () {
        Animated.loop(Animated.timing(animatedValue.current, {
            toValue: 1,
            duration: 700,
            easing: Easing.linear,
            useNativeDriver: true,
        })).start();
    }, []);
    var radius = (size - strokeWidth) / 2;
    var circumference = radius * 2 * Math.PI;
    var spin = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    return (<Reanimated.View style={style} layout={animated ? animPapillon(LinearTransition) : undefined} entering={entering} exiting={exiting}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={"".concat(size / 2, ", ").concat(size / 2)}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={"".concat(circumference * 0.75, " ").concat(circumference * 0.25)} strokeLinecap="round" fill="none"/>
          </G>
        </Svg>
      </Animated.View>
    </Reanimated.View>);
};
export default PapillonSpinner;
