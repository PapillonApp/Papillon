import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring, withSequence, Easing, } from "react-native-reanimated";
var AnimatedEmoji = function (_a) {
    var _b = _a.initialScale, initialScale = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 20 : _c;
    var scale = useSharedValue(initialScale);
    var opacity = useSharedValue(1);
    var emojis = ["😍", "🙄", "😭", "🥳", "😱", "😳", "🤓", "🤡", "🤯", "😨", "🤔", "🫠"];
    var _d = useState(emojis[0]), currentEmoji = _d[0], setCurrentEmoji = _d[1];
    var animatedStyle = useAnimatedStyle(function () {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });
    var changeEmoji = function () {
        scale.value = withSequence(withSpring(initialScale * 0.5, {
            damping: 10,
            stiffness: 100,
        }), withSpring(initialScale, {
            damping: 12,
            stiffness: 200,
        }));
        opacity.value = withSequence(withTiming(0, {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
        }), withTiming(1, {
            duration: 200,
            easing: Easing.inOut(Easing.ease),
        }));
        setTimeout(function () {
            var nextIndex = (emojis.indexOf(currentEmoji) + 1) % emojis.length;
            setCurrentEmoji(emojis[nextIndex]);
        }, 100);
    };
    useEffect(function () {
        var interval = setInterval(function () {
            changeEmoji();
        }, 2000);
        return function () { return clearInterval(interval); };
    }, [currentEmoji]);
    return (<View style={{
            justifyContent: "center",
            alignItems: "center",
        }}>
      <Animated.Text style={[
            {
                color: "#FFFFFF",
                fontSize: size,
                fontFamily: "semibold",
                textAlign: "center",
                textAlignVertical: "center",
                marginTop: -2,
            },
            animatedStyle,
        ]}>
        {currentEmoji}
      </Animated.Text>
    </View>);
};
export default AnimatedEmoji;
