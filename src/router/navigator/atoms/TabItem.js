import * as React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { StyleSheet, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import colorsList from "@/utils/data/colors.json";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var TabItem = React.memo(function (_a) {
    var _b, _c;
    var route = _a.route, descriptor = _a.descriptor, navigation = _a.navigation, isFocused = _a.isFocused, settings = _a.settings;
    var theme = useTheme();
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var options = descriptor.options;
    var label = (_c = (_b = options.tabBarLabel) !== null && _b !== void 0 ? _b : options.title) !== null && _c !== void 0 ? _c : route.name;
    var onPress = React.useCallback(function () {
        var event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true
        });
        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
        if (lottieRef.current) {
            lottieRef.current.play();
        }
        playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Light,
        });
    }, [isFocused, navigation, playHaptics, route.key, route.name]);
    var onLongPress = React.useCallback(function () {
        navigation.emit({
            type: "tabLongPress",
            target: route.key
        });
    }, [navigation, route.key]);
    var lottieRef = React.useRef(null);
    var autoColor = React.useMemo(function () {
        return colorsList.find(function (c) { return c.hex.primary === theme.colors.primary; }) || colorsList[0];
    }, [theme.colors.primary]);
    var tabColor = React.useMemo(function () {
        var _a, _b;
        return isFocused
            ? ((_a = autoColor === null || autoColor === void 0 ? void 0 : autoColor.hex) === null || _a === void 0 ? void 0 : _a.lighter)
                ? theme.dark
                    ? (_b = autoColor === null || autoColor === void 0 ? void 0 : autoColor.hex) === null || _b === void 0 ? void 0 : _b.lighter
                    : autoColor.hex.dark
                : theme.colors.primary
            : theme.dark
                ? "#656c72"
                : "#8C9398";
    }, [isFocused, autoColor, theme.dark, theme.colors.primary]);
    return (<Reanimated.View key={"tab-tabButton-" + route.key} style={styles.tabItemContainer} layout={anim2Papillon(LinearTransition)}>
      <Pressable accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} accessibilityLabel={options.tabBarAccessibilityLabel} testID={options.tabBarTestID} onTouchStart={onPress} onLongPress={onLongPress} style={[styles.tabItem, settings.hideTabTitles && styles.tabItemNoText]}>
        <Reanimated.View entering={anim2Papillon(ZoomIn)} exiting={anim2Papillon(FadeOut)} style={[
            settings.showTabBackground && {
                padding: settings.hideTabTitles ? 6 : 4,
                paddingHorizontal: settings.hideTabTitles ? undefined : 16,
            },
        ]}>
          {settings.showTabBackground && isFocused && (<Reanimated.View entering={anim2Papillon(ZoomIn)} exiting={anim2Papillon(FadeOut)} style={[
                {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: tabColor + "22",
                    borderRadius: settings.hideTabTitles ? 8 : 80,
                    borderCurve: "continuous",
                },
            ]}/>)}

          {options.tabBarLottie && (<LottieView loop={false} source={options.tabBarLottie} colorFilters={[{
                    keypath: "*",
                    color: tabColor,
                }]} style={{
                width: settings.hideTabTitles ? 28 : 26,
                height: settings.hideTabTitles ? 28 : 26,
            }} ref={lottieRef}/>)}
        </Reanimated.View>

        {!settings.hideTabTitles && (<Reanimated.Text style={[
                styles.tabText,
                { color: tabColor },
                Platform.OS === "android" && { fontFamily: undefined }
            ]} numberOfLines={1} entering={anim2Papillon(FadeIn)} exiting={anim2Papillon(FadeOut)}>
            {label}
          </Reanimated.Text>)}
      </Pressable>
    </Reanimated.View>);
});
var styles = StyleSheet.create({
    tabItemContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    tabItem: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        gap: 4,
    },
    tabItemNoText: {
        padding: 2,
    },
    tabText: {
        fontSize: 13,
        textAlign: "center",
        fontFamily: "medium",
    },
});
export default TabItem;
