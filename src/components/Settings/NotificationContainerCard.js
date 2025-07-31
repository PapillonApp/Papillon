var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useEffect } from "react";
import { View, StyleSheet, Switch, Pressable, Platform, Linking, } from "react-native";
import LottieView from "lottie-react-native";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, Easing, } from "react-native-reanimated";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { BellOff, Settings, X } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import { alertExpoGo } from "@/utils/native/expoGoAlert";
var openNotificationSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
    var notifee;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(Platform.OS === "ios")) return [3 /*break*/, 1];
                Linking.openURL("app-settings:");
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, import("@notifee/react-native")];
            case 2:
                notifee = (_a.sent()).default;
                notifee.openNotificationSettings();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var NotificationContainerCard = function (_a) {
    var theme = _a.theme, isEnable = _a.isEnable, setEnabled = _a.setEnabled, navigation = _a.navigation;
    var colors = theme.colors;
    var opacity = useSharedValue(0);
    var borderRadius = useSharedValue(20);
    var width = useSharedValue("90%");
    var marginBottom = useSharedValue(0);
    var invertedOpacity = useSharedValue(1);
    var animationref = React.useRef(null);
    useEffect(function () {
        var _a, _b;
        var timingConfig = { duration: 250, easing: Easing.bezier(0.3, 0.3, 0, 1) };
        opacity.value = withTiming(isEnable ? 1 : 0, timingConfig);
        invertedOpacity.value = withTiming(isEnable ? 0 : 1, { duration: 150 });
        borderRadius.value = withTiming(isEnable ? 20 : 13, timingConfig);
        width.value = withTiming(isEnable ? "90%" : "80%", { duration: 300 });
        marginBottom.value = withTiming(isEnable ? 0 : -20, timingConfig);
        if (!isEnable) {
            (_a = animationref.current) === null || _a === void 0 ? void 0 : _a.play();
        }
        else {
            (_b = animationref.current) === null || _b === void 0 ? void 0 : _b.reset();
        }
    }, [isEnable]);
    var containerAnimatedStyle = useAnimatedStyle(function () { return ({
        borderRadius: borderRadius.value,
        width: width.value,
        marginBottom: marginBottom.value,
    }); });
    var textAnimatedStyle = useAnimatedStyle(function () { return ({
        opacity: opacity.value,
    }); });
    var invertedTextAnimatedStyle = useAnimatedStyle(function () { return ({
        opacity: invertedOpacity.value,
    }); });
    var showAlert = useAlert().showAlert;
    return (<NativeList>
      <View style={[styles.notificationView, { backgroundColor: colors.primary + "22" }]}>
        <View style={styles.innerNotificationView}>
          <Reanimated.View style={[styles.animatedContainer, containerAnimatedStyle]}>
            <Reanimated.View style={[styles.bellOffContainer, invertedTextAnimatedStyle]}>
              <LottieView source={require("@/../assets/lottie/header_notification_belloff.json")} ref={animationref} loop={false} style={{
            width: "100%",
            height: "100%",
        }} onAnimationFinish={isEnable
            ? function () {
                var _a;
                (_a = animationref.current) === null || _a === void 0 ? void 0 : _a.pause();
            }
            : undefined}/>
            </Reanimated.View>
            <View style={styles.row}>
              <Reanimated.Image source={require("../../../assets/images/icon_app_papillon.png")} style={[styles.icon, textAnimatedStyle]}/>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Reanimated.Text style={[styles.title, textAnimatedStyle]}>Papillon</Reanimated.Text>
                  <Reanimated.Text style={[styles.time, textAnimatedStyle]}>il y a 22 min</Reanimated.Text>
                </View>
                <Reanimated.Text numberOfLines={2} style={[styles.message, textAnimatedStyle]}>
                  Géographie (16:00-17:00) : Changement de salle ➡️ B106
                </Reanimated.Text>
              </View>
            </View>
          </Reanimated.View>
          <View style={[styles.overlay, styles.overlayPrimary]}/>
          <View style={[styles.overlay, styles.overlaySecondary]}/>
        </View>
      </View>
      <NativeItem trailing={isEnable !== null && isEnable !== undefined ? (<Switch trackColor={{
                false: colors.border,
                true: colors.primary
            }} thumbColor={theme.dark ? colors.text : colors.background} style={{
                marginRight: 10,
            }} value={isEnable} onValueChange={setEnabled}/>) : (<Pressable onPress={function () {
                if (isEnable === undefined) {
                    alertExpoGo(showAlert);
                }
                else {
                    showAlert({
                        title: "Notifications désactivées",
                        message: "Il faut activer les notifications dans les paramètres du téléphone pour pouvoir les activer dans Papillon.",
                        icon: <BellOff />,
                        actions: [
                            {
                                title: "Annuler",
                                icon: <X size={24} color={colors.text}/>,
                            },
                            {
                                title: "Paramètres système",
                                onPress: function () {
                                    openNotificationSettings();
                                    setTimeout(function () {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: "SettingsNotifications" }],
                                        });
                                    }, 1000);
                                },
                                primary: true,
                                backgroundColor: "#888",
                                icon: <Settings size={24} color={colors.text}/>,
                            },
                        ],
                    });
                }
            }}>
              <Switch trackColor={{
                false: colors.border,
                true: colors.primary
            }} thumbColor={theme.dark ? colors.text : colors.background} style={{
                marginRight: 10,
            }} value={false} disabled/>
            </Pressable>)}>
        <NativeText variant="title">Activer les notifications</NativeText>
        <NativeText variant="subtitle">
          Reçois des notifications pour ne rien rater de ta vie scolaire.
        </NativeText>
      </NativeItem>
    </NativeList>);
};
// Styles
var styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#E2FBFC",
        borderRadius: 15,
        borderWidth: 1,
        flexDirection: "column",
        overflow: "hidden",
    },
    notificationView: {
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    innerNotificationView: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    animatedContainer: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#00000030",
        marginTop: 30,
        marginHorizontal: 20,
        padding: 9,
        zIndex: 10,
        overflow: "hidden",
    },
    bellOffContainer: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 35,
        height: 35,
        borderRadius: 9,
    },
    textContainer: {
        marginLeft: 7,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "95%",
        marginBottom: -1,
    },
    title: {
        color: "#222222",
        fontSize: 16,
        fontFamily: "semibold",
    },
    time: {
        color: "#9F9F9F",
        opacity: 0.5,
        textAlign: "right",
        fontSize: 13,
        marginRight: 10,
        fontFamily: "medium",
    },
    message: {
        color: "#3F3F3F",
        fontSize: 14.5,
        maxWidth: "85%",
        minWidth: "85%",
        lineHeight: 20,
        letterSpacing: -0.1,
        fontFamily: "medium",
    },
    overlay: {
        borderWidth: 1,
        borderColor: "#00000030",
        borderRadius: 20,
        height: 25,
        padding: 9,
        marginHorizontal: 20,
    },
    overlayPrimary: {
        backgroundColor: "#EEF5F5",
        width: "80%",
        marginTop: -15,
        zIndex: 5,
    },
    overlaySecondary: {
        backgroundColor: "#F3F3F370",
        width: "70%",
        marginTop: -15,
        marginBottom: 30,
        zIndex: -1,
    },
    footer: {
        padding: 15,
        flexDirection: "row",
    },
    footerTextContainer: {
        flexDirection: "column",
        justifyContent: "center",
        flex: 1,
        gap: 3,
    },
    footerTitle: {
        fontSize: 18,
        fontFamily: "semibold",
    },
    footerDescription: {
        fontSize: 14,
        fontFamily: "medium",
        width: "95%",
        overflow: "hidden",
    },
});
export default NotificationContainerCard;
