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
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Check } from "lucide-react-native";
import React, { createContext, useState, useContext, useEffect, useCallback, memo } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import NativeTouchable from "@/components/Global/NativeTouchable";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import { anim2Papillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
var AlertContext = createContext(undefined);
export var useAlert = function () {
    var context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
};
var AlertProvider = function (_a) {
    var _b, _c;
    var children = _a.children;
    var _d = useState(null), alert = _d[0], setAlert = _d[1];
    var _e = useState(false), visible = _e[0], setVisible = _e[1];
    var _f = useState({}), delays = _f[0], setDelays = _f[1];
    var colors = useTheme().colors;
    var isTablet = useScreenDimensions().isTablet;
    var insets = useSafeAreaInsets();
    var showAlert = useCallback(function (_a) {
        var title = _a.title, message = _a.message, icon = _a.icon, _b = _a.actions, actions = _b === void 0 ? [
            {
                title: "Compris !",
                onPress: hideAlert,
                icon: <Check />,
                primary: true,
            },
        ] : _b;
        setAlert({ title: title, message: message, icon: icon, actions: actions });
        setVisible(true);
        var initialDelays = actions.reduce(function (acc, action) {
            acc[action.title] = action.delayDisable || 0;
            return acc;
        }, {});
        setDelays(initialDelays);
    }, []);
    var hideAlert = useCallback(function () {
        setVisible(false);
        setTimeout(function () { return setAlert(null); }, 150);
    }, []);
    useEffect(function () {
        var interval = setInterval(function () {
            setDelays(function (prevDelays) {
                var newDelays = __assign({}, prevDelays);
                Object.keys(newDelays).forEach(function (key) {
                    if (newDelays[key] > 0) {
                        newDelays[key] -= 1;
                    }
                });
                return newDelays;
            });
        }, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    return (<AlertContext.Provider value={{ showAlert: showAlert }}>
      {children}
      {alert && (<Modal transparent onRequestClose={hideAlert} animationType="none">
          {visible && (<View style={{ flex: 1 }}>
              <Reanimated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.overlay}>
                <BlurView intensity={10} style={styles.blur}/>
              </Reanimated.View>

              <Reanimated.View style={[
                    styles.modalContainer,
                    { width: isTablet ? "50%" : "100%", alignSelf: "center" },
                ]} layout={LinearTransition}>
                <Pressable style={styles.pressable} onPress={hideAlert}/>
                <Reanimated.View style={[
                    styles.alertBox,
                    { backgroundColor: colors.card, marginBottom: 10 + insets.bottom },
                ]} entering={PapillonContextEnter} exiting={PapillonContextExit}>
                  <View style={styles.contentContainer}>
                    <View style={styles.titleContainer}>
                      {alert.icon &&
                    React.cloneElement(alert.icon, {
                        color: colors.text,
                        size: 24,
                    })}
                      <Text style={[styles.title, { color: colors.text }]}>
                        {alert.title}
                      </Text>
                    </View>
                    <Text style={[styles.message, { color: colors.text }]}>
                      {alert.message}
                    </Text>
                  </View>

                  <View style={[
                    styles.buttons,
                    {
                        borderColor: colors.text + "20",
                        backgroundColor: colors.text + "06",
                        flexDirection: alert.actions && ((_b = alert.actions) === null || _b === void 0 ? void 0 : _b.length) > 2 ? "column" : "row",
                        alignItems: "center",
                    },
                ]}>
                    {(_c = alert.actions) === null || _c === void 0 ? void 0 : _c.map(function (_a) {
                    var _b, _c, _d, _e, _f, _g, _h, _j;
                    var title = _a.title, onPress = _a.onPress, icon = _a.icon, primary = _a.primary, danger = _a.danger, backgroundColor = _a.backgroundColor, delayDisable = _a.delayDisable;
                    return (<Reanimated.View key={title} layout={anim2Papillon(LinearTransition)} style={[
                            ((_c = (_b = alert.actions) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) === 1 || ((_e = (_d = alert.actions) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 2
                                ? styles.singleButtonContainer
                                : null,
                            { borderRadius: 300, overflow: "hidden" },
                        ]}>
                          <NativeTouchable disabled={delays[title] > 0} onPress={function () {
                            hideAlert();
                            onPress === null || onPress === void 0 ? void 0 : onPress();
                        }} contentContainerStyle={{ borderRadius: 300, overflow: "hidden" }} style={[
                            // @ts-expect-error
                            ((_f = alert.actions) === null || _f === void 0 ? void 0 : _f.length) === 1 || ((_g = alert.actions) === null || _g === void 0 ? void 0 : _g.length) > 2
                                ? styles.singleButtonContainer
                                : null,
                            { borderRadius: 300, overflow: "hidden" },
                        ]}>
                            <Reanimated.View layout={anim2Papillon(LinearTransition)} style={[
                            styles.button,
                            {
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 300,
                                overflow: "hidden",
                            },
                            // @ts-expect-error
                            ((_h = alert.actions) === null || _h === void 0 ? void 0 : _h.length) === 1 || ((_j = alert.actions) === null || _j === void 0 ? void 0 : _j.length) > 2
                                ? styles.singleButton
                                : null,
                            primary && !danger
                                ? {
                                    backgroundColor: (backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : colors.primary) + (delays[title] > 0 ? "99" : ""),
                                }
                                : danger
                                    ? { backgroundColor: "#BE0B00" + (delays[title] > 0 ? "99" : "") }
                                    : { borderColor: colors.text + "44", borderWidth: 1 },
                        ]}>
                              {icon &&
                            React.cloneElement(icon, {
                                color: primary || danger ? "#ffffff" : colors.text,
                                size: 24,
                            })}
                              <Reanimated.Text layout={anim2Papillon(LinearTransition)} style={[
                            styles.buttonText,
                            { color: danger ? "#ffffff" : colors.text },
                            primary && styles.primaryButtonText,
                        ]}>
                                {title}
                                {delays[title] > 0 ? " (".concat(delays[title], ")") : ""}
                              </Reanimated.Text>

                              {delays[title] > 0 && (<Reanimated.View layout={LinearTransition} style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "".concat((delays[title] / (delayDisable || 1)) * 120, "%"),
                                height: "200%",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                            }}/>)}
                            </Reanimated.View>
                          </NativeTouchable>
                        </Reanimated.View>);
                })}
                  </View>
                </Reanimated.View>
              </Reanimated.View>
            </View>)}
        </Modal>)}
    </AlertContext.Provider>);
};
var styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    blur: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 10,
        zIndex: 100000000,
    },
    pressable: {
        flex: 1,
        width: "100%",
    },
    alertBox: {
        borderRadius: 17,
        borderCurve: "continuous",
        width: "100%",
        transformOrigin: "bottom center",
        overflow: "hidden",
    },
    contentContainer: {
        gap: 10,
        padding: 18,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 18,
        lineHeight: 22,
        fontFamily: "semibold",
    },
    message: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: "medium",
        opacity: 0.6,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        gap: 10,
    },
    button: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 300,
        paddingVertical: 8,
        paddingHorizontal: 14,
        overflow: "hidden",
    },
    singleButton: {
        width: "100%",
    },
    singleButtonContainer: {
        width: "100%",
    },
    buttonText: {
        fontSize: 16,
        fontFamily: "medium",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontFamily: "semibold",
    },
});
export default memo(AlertProvider);
