import * as React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { StyleSheet, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import colorsList from "@/utils/data/colors.json";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var MenuItem = function (_a) {
    var _b, _c, _d, _e;
    var route = _a.route, descriptor = _a.descriptor, navigation = _a.navigation, isFocused = _a.isFocused;
    var theme = useTheme();
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var options = descriptor.options;
    var label = (_c = (_b = options.tabBarLabel) !== null && _b !== void 0 ? _b : options.title) !== null && _c !== void 0 ? _c : route.name;
    var onPress = function () {
        var _a;
        var event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true
        });
        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
        (_a = lottieRef.current) === null || _a === void 0 ? void 0 : _a.play();
        playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Light,
        });
    };
    var onLongPress = function () {
        navigation.emit({
            type: "tabLongPress",
            target: route.key
        });
    };
    var lottieRef = React.useRef(null);
    var autoColor = colorsList.filter(function (c) { return c.hex.primary === theme.colors.primary; })[0] || colorsList[0];
    var tabColor = isFocused ?
        (((_d = autoColor === null || autoColor === void 0 ? void 0 : autoColor.hex) === null || _d === void 0 ? void 0 : _d.lighter) ? (theme.dark ? (_e = autoColor === null || autoColor === void 0 ? void 0 : autoColor.hex) === null || _e === void 0 ? void 0 : _e.lighter : autoColor.hex.dark) : theme.colors.primary) : (theme.dark ? "#656c72" : "#8C9398");
    return (<Reanimated.View key={"tab-tabButton-" + route.key} style={[
            styles.tabItemContainer,
            isFocused && {
                backgroundColor: theme.dark ? theme.colors.text + "10" : theme.colors.card,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.20,
                shadowRadius: 6,
                elevation: 5,
            }
        ]} layout={anim2Papillon(LinearTransition)}>
      <Pressable accessibilityRole="button" accessibilityState={isFocused ? { selected: true } : {}} accessibilityLabel={options.tabBarAccessibilityLabel} testID={options.tabBarTestID} onPress={onPress} onLongPress={onLongPress} style={[styles.tabItem]}>
        {options.tabBarLottie && (<LottieView loop={false} source={options.tabBarLottie} colorFilters={[{
                    keypath: "*",
                    color: tabColor,
                }]} style={[
                {
                    width: 24,
                    height: 24,
                }
            ]} ref={lottieRef}/>)}


        <Reanimated.Text style={[
            styles.tabText,
            { color: tabColor },
            Platform.OS === "android" && { fontFamily: undefined }
        ]} numberOfLines={1} entering={anim2Papillon(FadeIn)} exiting={anim2Papillon(FadeOut)}>
          {label}
        </Reanimated.Text>

      </Pressable>
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    tabItemContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "flex-start",
        justifyContent: "center",
        borderRadius: 10,
        borderCurve: "continuous",
    },
    tabItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 0,
        gap: 12,
        width: "100%",
    },
    tabText: {
        fontSize: 15,
        textAlign: "center",
        fontFamily: "medium",
    },
});
export default React.memo(MenuItem);
