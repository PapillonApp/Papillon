import React, { useEffect } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Svg, { G, Rect, Polygon } from "react-native-svg";
import { StyleSheet, Dimensions, View, Text } from "react-native";
import Reanimated, { useSharedValue, withRepeat, withSpring, withSequence, withTiming, Easing } from "react-native-reanimated";
var generatePoints = function (width, numberOfLines, heightDec) {
    var point1 = "".concat((width / 2) - 10, ",").concat(24 + numberOfLines * 20 + heightDec);
    var point2 = "".concat((width / 2) + 10, ",").concat(24 + numberOfLines * 20 + heightDec);
    var point3 = "".concat((width / 2), ",").concat(24 + numberOfLines * 20 + 8 + heightDec);
    return "".concat(point1, " ").concat(point2, " ").concat(point3);
};
var PapillonShineBubble = function (_a) {
    var message = _a.message, _b = _a.width, width = _b === void 0 ? 230 : _b, _c = _a.numberOfLines, numberOfLines = _c === void 0 ? 1 : _c, _d = _a.offsetTop, offsetTop = _d === void 0 ? 0 : _d, _e = _a.noFlex, noFlex = _e === void 0 ? false : _e, style = _a.style;
    var colors = useTheme().colors;
    var height = 24 + numberOfLines * 20;
    var translateY = useSharedValue(0);
    var rotate = useSharedValue("0deg"); // '0deg' or '180deg
    var shadowScale = useSharedValue(1);
    // make the logo bounce on each side infinitely
    useEffect(function () {
        translateY.value = withRepeat(withSequence(withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })), -1, true);
        rotate.value = withRepeat(withSequence(withTiming("5deg", { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming("-5deg", { duration: 2000, easing: Easing.inOut(Easing.ease) })), -1, true);
        shadowScale.value = withRepeat(withSequence(withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })), -1, true);
    }, []);
    var bubbleScale = useSharedValue(0);
    var bubbleOpacity = useSharedValue(0);
    var bubbleTranslateY = useSharedValue(20);
    useEffect(function () {
        bubbleOpacity.value = withTiming(1, { duration: 300 });
        bubbleTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        bubbleScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, []);
    var _f = React.useState(Dimensions.get("window").height / Dimensions.get("window").scale), sHeight = _f[0], setSHeight = _f[1];
    var _g = React.useState(Dimensions.get("window").width / Dimensions.get("window").scale), sWidth = _g[0], setSWidth = _g[1];
    useEffect(function () {
        Dimensions.addEventListener("change", function (_a) {
            var window = _a.window;
            setSHeight(window.height / window.scale);
            setSWidth(window.width / window.scale);
        });
    }, []);
    return (<View style={[
            papillon_ls_styles.container,
            {
                flex: noFlex ? 0 : 1,
            },
            style,
            sWidth > 450 && {
                marginTop: -100,
                marginBottom: 50,
            }
        ]}>
      <Reanimated.View style={[
            papillon_ls_styles.bubble,
            {
                opacity: bubbleOpacity,
                transform: [
                    {
                        scale: bubbleScale
                    },
                    {
                        translateY: bubbleTranslateY
                    }
                ],
            },
            {
                marginTop: offsetTop,
            }
        ]}>
        <Text style={{
            color: colors.text + "e5",
            fontSize: 16,
            fontFamily: "medium",
            position: "absolute",
            top: (24 + numberOfLines * 20 - 19.5 * numberOfLines) / 2,
            width: width,
            textAlign: "center",
            paddingHorizontal: 10,
            lineHeight: 20,
            zIndex: 1,
        }} numberOfLines={numberOfLines} ellipsizeMode="tail">
          {message}
        </Text>

        <Svg width={width + 2} height={height + 10 + 2} fill={colors.card}>
          <G stroke={colors.border} x={1} y={1} strokeWidth={1.5} fill={colors.card}>
            <Rect width={width} height={height} rx={9}/>
            <Polygon points={generatePoints(width, numberOfLines, 0)}/>
          </G>
          <G fill={colors.card} x={2} y={2}>
            <Polygon points={generatePoints(width - 2, numberOfLines, -2)}/>
          </G>
        </Svg>
      </Reanimated.View>

      <View style={papillon_ls_styles.full_logo}>

        <Reanimated.Image source={require("../../../assets/images/shaded_papillon_setup.png")} style={[
            papillon_ls_styles.logo,
            {
                transform: [
                    {
                        translateY: translateY
                    },
                    {
                        rotate: rotate
                    },
                ],
            }
        ]} resizeMode="contain"/>

        <Reanimated.Image source={require("../../../assets/images/shaded_papillon_setup_shadow.png")} style={{
            transform: [
                {
                    scale: shadowScale
                },
            ],
        }} resizeMode="contain" tintColor={"#000000"}/>
      </View>
    </View>);
};
var papillon_ls_styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    bubble: {
        position: "relative",
        marginBottom: 20,
    },
    full_logo: {
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    logo: {
        width: 82,
        height: 82,
    }
});
export default PapillonShineBubble;
