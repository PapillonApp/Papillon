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
import React, { useLayoutEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import MaskStarsColored from "@/components/FirstInstallation/MaskStarsColored";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentAccount } from "@/stores/account";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, { ZoomIn, LinearTransition, FadeIn, FadeOut, FadeOutUp, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getIconName, setIconName } from "@candlefinance/app-icon";
import colorsList from "@/utils/data/colors.json";
import { removeColor } from "../settings/SettingsIcons";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { animPapillon } from "@/utils/ui/animations";
var ColorSelector = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var settings = ((_b = route.params) === null || _b === void 0 ? void 0 : _b.settings) || false;
    var _x = useSoundHapticsWrapper(), playHaptics = _x.playHaptics, playSound = _x.playSound;
    var LEson003 = require("@/../assets/sound/click_003.wav");
    var LEson6 = require("@/../assets/sound/6.wav");
    var hasProfilePic = account && (account === null || account === void 0 ? void 0 : account.personalization) && (account === null || account === void 0 ? void 0 : account.personalization.profilePictureB64) !== undefined && (account === null || account === void 0 ? void 0 : account.personalization.profilePictureB64.trim()) !== "";
    useLayoutEffect(function () {
        navigation.setOptions({
            headerShown: settings || false,
            headerBackVisible: true,
            headerTitle: "Choix de la couleur",
        });
    }, [navigation]);
    var messages = colorsList.map(function (color) {
        var _a;
        return (_a = {},
            _a[color.hex.primary] = color.description,
            _a);
    }).reduce(function (acc, cur) { return (__assign(__assign({}, acc), cur)); }, {});
    var selectColor = function (color) {
        mutateProperty("personalization", { color: color });
        playHaptics("notification", {
            notification: Haptics.NotificationFeedbackType.Success,
        });
        playSound(LEson003);
        if (!isExpoGo()) {
            getIconName().then(function (currentIcon) {
                if (currentIcon.includes("_Dynamic_")) {
                    var mainColor_1 = color.hex.primary;
                    var colorItem = colorsList.find(function (color) { return color.hex.primary === mainColor_1; });
                    var nameIcon = removeColor(currentIcon);
                    var iconConstructName = nameIcon + (colorItem ? "_" + colorItem.id : "");
                    setIconName(iconConstructName);
                }
            });
        }
        ;
    };
    var ColorButton = function (_a) {
        var _b, _c;
        var color = _a.color;
        return (<View style={styles.colorButtonContainer}>
      <Pressable onPress={function () { return selectColor(color); }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.button,
                    {
                        backgroundColor: pressed ? color.hex.primary + "44" : color.hex.primary,
                    },
                ];
            }}/>

      {((_c = (_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.color) === null || _c === void 0 ? void 0 : _c.hex.primary) === color.hex.primary && (<Reanimated.View pointerEvents="none" style={[
                    styles.colorButtonContainer,
                    {
                        position: "absolute",
                        top: -18,
                        left: -18,
                        width: 60,
                        height: 60,
                        borderRadius: 200,
                        borderColor: color.hex.primary,
                        zIndex: -99,
                    }
                ]} entering={animPapillon(ZoomIn)} exiting={FadeOut.duration(150)}/>)}
    </View>);
    };
    return (<View style={styles.container}>
      <Reanimated.View entering={Platform.OS === "ios" ? FadeIn.duration(400) : void 0} exiting={Platform.OS === "ios" ? FadeOut.duration(2000) : void 0} key={((_d = (_c = account === null || account === void 0 ? void 0 : account.personalization) === null || _c === void 0 ? void 0 : _c.color) === null || _d === void 0 ? void 0 : _d.hex.primary) || ""} style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        }}>
        <LinearGradient style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        }} colors={[((_f = (_e = account === null || account === void 0 ? void 0 : account.personalization) === null || _e === void 0 ? void 0 : _e.color) === null || _f === void 0 ? void 0 : _f.hex.primary) + "22", colors.background]} locations={[0, 0.5]}/>
      </Reanimated.View>

      <PapillonShineBubble message={"Quelle est ta couleur préférée ?"} numberOfLines={1} width={280} offsetTop={"10%"}/>
      <MaskStarsColored color={((_h = (_g = account === null || account === void 0 ? void 0 : account.personalization) === null || _g === void 0 ? void 0 : _g.color) === null || _h === void 0 ? void 0 : _h.hex.primary) || colors.text}/>
      <View style={styles.colors}>
        <View style={styles.row}>
          {colorsList.slice(0, 3).map(function (color) { return <ColorButton key={color.id} color={color}/>; })}
        </View>
        <View style={styles.row}>
          {colorsList.slice(3, 6).map(function (color) { return <ColorButton key={color.id} color={color}/>; })}
        </View>

        <Reanimated.View layout={animPapillon(LinearTransition)} style={[styles.message, {
                backgroundColor: ((_k = (_j = account === null || account === void 0 ? void 0 : account.personalization) === null || _j === void 0 ? void 0 : _j.color) === null || _k === void 0 ? void 0 : _k.hex.primary) + "33",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center"
            }]}>
          <Reanimated.Text layout={animPapillon(LinearTransition)} entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp)} key={((_m = (_l = account === null || account === void 0 ? void 0 : account.personalization) === null || _l === void 0 ? void 0 : _l.color) === null || _m === void 0 ? void 0 : _m.hex.primary) || ""} style={{
            color: ((_p = (_o = account === null || account === void 0 ? void 0 : account.personalization) === null || _o === void 0 ? void 0 : _o.color) === null || _p === void 0 ? void 0 : _p.hex.primary) || "",
            fontFamily: "semibold",
            fontSize: 15,
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            width: "100%"
        }}>
            {messages[((_r = (_q = account === null || account === void 0 ? void 0 : account.personalization) === null || _q === void 0 ? void 0 : _q.color) === null || _r === void 0 ? void 0 : _r.hex.primary) || ""]}
          </Reanimated.Text>
        </Reanimated.View>
      </View>

      <Reanimated.View style={styles.done} entering={Platform.OS === "ios" ? FadeIn.duration(200) : void 0} exiting={Platform.OS === "ios" ? FadeOut.duration(1000) : void 0} key={(((_t = (_s = account === null || account === void 0 ? void 0 : account.personalization) === null || _s === void 0 ? void 0 : _s.color) === null || _t === void 0 ? void 0 : _t.hex.primary) || "") + "_btn"}>
        <ButtonCta primary value={settings ? "Sauvegarder" : !hasProfilePic ? "Continuer" : "Finaliser"} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!settings) {
                    if (!hasProfilePic) {
                        navigation.navigate("ProfilePic");
                        return [2 /*return*/];
                    }
                    else {
                        playSound(LEson6);
                    }
                }
                navigation.reset({
                    index: 0,
                    routes: [{ name: "AccountStack" }],
                });
                return [2 /*return*/];
            });
        }); }} disabled={!((_u = account === null || account === void 0 ? void 0 : account.personalization) === null || _u === void 0 ? void 0 : _u.color)} style={{
            marginBottom: insets.bottom + 20,
            backgroundColor: (_w = (_v = account === null || account === void 0 ? void 0 : account.personalization) === null || _v === void 0 ? void 0 : _v.color) === null || _w === void 0 ? void 0 : _w.hex.primary
        }}/>
      </Reanimated.View>
    </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        marginBottom: 0,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 30,
        margin: 5,
    },
    colors: {
        flex: 1,
        marginTop: -200,
        justifyContent: "center",
        alignItems: "center",
    },
    colorButtonContainer: {
        borderRadius: 200,
        borderWidth: 5,
        margin: 13,
        borderColor: "transparent",
    },
    message: {
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        borderRadius: 250,
        width: "90%",
    },
    done: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
    },
});
export default ColorSelector;
