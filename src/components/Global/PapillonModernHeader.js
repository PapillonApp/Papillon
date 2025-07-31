var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useMemo, memo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { PressableScale } from "react-native-pressable-scale";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BlurView } from "expo-blur";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
var NativeModernHeaderComponent = function (_a) {
    var children = _a.children, _b = _a.outsideNav, outsideNav = _b === void 0 ? false : _b, _c = _a.tint, tint = _c === void 0 ? null : _c;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var paddingTop = useMemo(function () { return (outsideNav ? 24 : insets.top) + 12; }, [outsideNav, insets.top]);
    return (<>
      <Reanimated.View style={[
            styles.nativeHeader,
            {
                backgroundColor: tint ? tint : theme.colors.card + "10",
                borderBottomColor: theme.colors.border,
            }
        ]} layout={animPapillon(LinearTransition)}>
        <BlurView intensity={100} style={[styles.blurContent, { paddingTop: paddingTop }]} tint={theme.dark ? "dark" : "light"}>
          {children}
        </BlurView>
      </Reanimated.View>

      {outsideNav && (<View style={[styles.handleIndicator, { backgroundColor: theme.colors.text + "22" }]}/>)}
    </>);
};
export var NativeModernHeader = memo(NativeModernHeaderComponent);
var LinearGradientModernHeaderComponent = function (_a) {
    var children = _a.children, _b = _a.outsideNav, outsideNav = _b === void 0 ? false : _b, _c = _a.height, height = _c === void 0 ? 70 : _c, _d = _a.startLocation, startLocation = _d === void 0 ? 0.5 : _d, _e = _a.tint, tint = _e === void 0 ? null : _e;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var isExpoGo = require("@/utils/native/expoGoAlert").isExpoGo;
    var LinearGradient = require("expo-linear-gradient").LinearGradient;
    var CustomFilterView = require("react-native-ios-visual-effect-view").CustomFilterView;
    var headerHeight = useMemo(function () { return outsideNav ? height : insets.top + height; }, [outsideNav, height, insets.top]);
    var blurHeight = useMemo(function () { return headerHeight - 10; }, [headerHeight]);
    var enableBlur = useMemo(function () {
        return Platform.OS === "ios" && !isExpoGo() && parseInt(Platform.Version) >= 18;
    }, []);
    var gradientColors = useMemo(function () {
        return tint && tint !== "" ? [tint + "EE", tint + "00"] : [theme.colors.background + "EE", theme.colors.background + "00"];
    }, [tint, theme.colors.background]);
    var windowWidth = useMemo(function () { return Dimensions.get("window").width; }, []);
    return (<>
      {enableBlur && (<CustomFilterView style={[
                styles.blurContainer,
                {
                    height: blurHeight,
                    width: windowWidth,
                }
            ]} backgroundLayerSamplingSizeScale={2} currentFilters={{
                backgroundFilters: [{
                        filterName: "variadicBlur",
                        radius: 8,
                        shouldNormalizeEdges: true,
                        gradientMask: {
                            type: "axial",
                            colors: ["rgba(0,0,0,1)", "rgba(0,0,0,0)"],
                            startPointPreset: "topCenter",
                            endPointPreset: "bottomCenter",
                            size: { height: blurHeight, width: windowWidth },
                        }
                    }]
            }}/>)}

      <LinearGradient colors={gradientColors} locations={[startLocation, 1]} style={[
            styles.gradientContainer,
            {
                height: headerHeight,
                opacity: enableBlur ? 0.5 : 1,
            }
        ]}/>

      <Reanimated.View style={[
            styles.headerContent,
            {
                top: outsideNav ? 24 : insets.top,
            }
        ]} layout={animPapillon(LinearTransition)}>
        {children}
      </Reanimated.View>

      {outsideNav && Platform.OS === "ios" && (<View style={[styles.handleIndicator, { backgroundColor: theme.colors.text + "22" }]}/>)}
    </>);
};
export var LinearGradientModernHeader = memo(LinearGradientModernHeaderComponent);
var PapillonModernHeaderComponent = function (props) {
    var native = props.native;
    if (native) {
        return <NativeModernHeader {...props}/>;
    }
    return <LinearGradientModernHeader {...props} tint={props.tint}/>;
};
export var PapillonModernHeader = memo(PapillonModernHeaderComponent);
var PapillonHeaderActionComponent = function (_a) {
    var onPress = _a.onPress, children = _a.children, icon = _a.icon, style = _a.style, _b = _a.animated, animated = _b === void 0 ? true : _b, _c = _a.entering, entering = _c === void 0 ? animPapillon(FadeIn) : _c, _d = _a.exiting, exiting = _d === void 0 ? animPapillon(FadeOut) : _d, iconProps = _a.iconProps;
    var theme = useTheme();
    var newIcon = useMemo(function () {
        if (!icon)
            return null;
        return React.cloneElement(icon, __assign({ size: 22, strokeWidth: 2.3, color: theme.colors.text }, iconProps));
    }, [icon, iconProps, theme.colors.text]);
    return (<Reanimated.View layout={animated && animPapillon(LinearTransition)} entering={entering} exiting={exiting}>
      <PressableScale activeScale={0.85} weight="light" onPress={onPress} style={[
            styles.actionButton,
            {
                backgroundColor: theme.colors.background + "ff",
                borderColor: theme.colors.border + "dd",
                shadowColor: "#00000022",
            },
            style
        ]}>
        {newIcon}
        {children}
      </PressableScale>
    </Reanimated.View>);
};
export var PapillonHeaderAction = memo(PapillonHeaderActionComponent);
var PapillonHeaderSeparatorComponent = function () {
    return (<Reanimated.View layout={animPapillon(LinearTransition)} style={styles.separator}/>);
};
export var PapillonHeaderSeparator = memo(PapillonHeaderSeparatorComponent);
var PapillonHeaderSelectorComponent = function (_a) {
    var children = _a.children, onPress = _a.onPress, onLongPress = _a.onLongPress, _b = _a.loading, loading = _b === void 0 ? false : _b;
    var theme = useTheme();
    var isOnline = useOnlineStatus();
    return (<Reanimated.View layout={animPapillon(LinearTransition)}>
      <PressableScale onPress={onPress} onLongPress={onLongPress}>
        <Reanimated.View layout={animPapillon(LinearTransition)} style={[styles.selectorContainer, {
                backgroundColor: theme.colors.text + "16",
            }]}>
          <BlurView style={styles.selectorContent} tint={theme.dark ? "dark" : "light"}>
            {children}

            {isOnline && loading && (<PapillonSpinner size={18} color={theme.colors.text} strokeWidth={2.8} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)} style={styles.spinner}/>)}
          </BlurView>
        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>);
};
export var PapillonHeaderSelector = memo(PapillonHeaderSelectorComponent);
var styles = StyleSheet.create({
    blurContainer: {
        backgroundColor: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 80,
    },
    gradientContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 90,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: "absolute",
        left: 0,
        zIndex: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    handleIndicator: {
        position: "absolute",
        top: 10,
        alignSelf: "center",
        height: 5,
        width: 50,
        borderRadius: 80,
        zIndex: 10000,
    },
    nativeHeader: {
        position: "absolute",
        left: 0,
        zIndex: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        borderBottomWidth: 0.5,
    },
    blurContent: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    actionButton: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 800,
        height: 40,
        width: 40,
        minWidth: 40,
        minHeight: 40,
        gap: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    separator: {
        flex: 1
    },
    selectorContainer: {
        overflow: "hidden",
        borderRadius: 80,
    },
    selectorContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 80,
        gap: 6,
        backgroundColor: "transparent",
        alignSelf: "flex-start",
        overflow: "hidden",
    },
    spinner: {
        marginLeft: 5,
    },
});
