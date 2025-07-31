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
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { PressableScale } from "react-native-pressable-scale";
import { NativeText } from "../Global/NativeComponents";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
var Widget = function (_a) {
    var DynamicWidget = _a.widget, navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var widgetRef = useRef(null);
    var isOnline = useOnlineStatus().isOnline;
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(false), hidden = _c[0], setHidden = _c[1];
    useEffect(function () {
        if (!isOnline && loading) {
            setLoading(false);
        }
    }, [isOnline, loading]);
    var handlePress = useCallback(function () {
        var _a;
        var location = (_a = widgetRef.current) === null || _a === void 0 ? void 0 : _a.handlePress();
        if (location) {
            navigation === null || navigation === void 0 ? void 0 : navigation.navigate(location);
        }
    }, [navigation]);
    return (<Reanimated.View layout={LinearTransition} style={{
            opacity: hidden ? 0 : 1,
            display: hidden ? "none" : "flex",
        }} entering={animPapillon(ZoomIn).withInitialValues({ transform: [{ scale: 0.7 }], opacity: 0 })} exiting={FadeOut.duration(150)}>
      <PressableScale onPress={handlePress}>
        <Reanimated.View entering={FadeIn.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut} style={[styles.widget, { backgroundColor: colors.card }]}>
          {loading && (<Reanimated.View style={__assign(__assign({}, StyleSheet.absoluteFillObject), { justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: colors.card + "CC", zIndex: 100, borderRadius: 17, borderCurve: "continuous" })} entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
              <ActivityIndicator />
              <NativeText variant="subtitle">Chargement...</NativeText>
            </Reanimated.View>)}
          <Reanimated.View style={[
            styles.widgetContent,
            {
                backgroundColor: theme.dark ? colors.primary + "09" : colors.primary + "11",
                overflow: "hidden",
                opacity: loading ? 0 : 1,
            },
        ]}>
            <DynamicWidget ref={widgetRef} setLoading={setLoading} loading={loading} setHidden={setHidden} hidden={hidden}/>
          </Reanimated.View>
        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>);
};
var styles = StyleSheet.create({
    widget: {
        width: 200,
        height: 131,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 17,
        borderCurve: "continuous",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    widgetContent: {
        width: "100%",
        height: "100%",
        borderRadius: 17,
        padding: 13,
        borderCurve: "continuous",
    },
});
export default memo(Widget);
