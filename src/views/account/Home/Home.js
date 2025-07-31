//+——————————————————————————————————————————————————————————+
// |                                                          |
// |           _   _   _             _   _                    |
// |          / \ | |_| |_ ___ _ __ | |_(_) ___  _ __         |
// |         / _ \| __| __/ _ \ '_ \| __| |/ _ \| '_ \        |
// |        / ___ \ |_| ||  __/ | | | |_| | (_) | | | |       |
// |       /_/   \_\__|\__\___|_| |_|\__|_|\___/|_| |_|       |
// |                                                          |
// |Il semblerait que tu essaies de modifier la page d'accueil|
// |  de Papillon, mais malheureusement pour toi, ce fichier  |
// |  ne contiendra pas grand-chose qui puisse t'intéresser.  |
// |                                                          |
// |        Heureusement pour toi, je suis magicien !         |
// |                  ╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ                    |
// |                                                          |
// |          Si tu souhaites modifier les widgets :          |
// |                      ~/src/widgets                       |
// |                                                          |
// |      Si tu souhaites ajouter un widget à la modal :      |
// |            ~/src/views/account/Home/Elements             |
// |      (N'oublie pas de l'ajouter à ElementIndex.tsx)      |
// |                                                          |
// |    Si tu souhaites modifier le contenu de la modal :     |
// |        ~/src/views/account/Home/ModalContent.tsx         |
// |                                                          |
// |            Si tu veux une pizza à l'ananas :             |
// |                         Alt + F4                         |
// |                            ;)                            |
// |                                                          |
// |               Sur ce, bonne continuation !               |
// |                                                          |
// +——————————————————————————————————————————————————————————+
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
import { protectScreenComponent } from "@/router/helpers/protected-screen";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import { useIsFocused, useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Linking, Platform, Pressable, RefreshControl, StatusBar, View } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import Animated, { Extrapolation, interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccountSwitcher from "@/components/Home/AccountSwitcher";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import Header from "@/components/Home/Header";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import ModalContent from "@/views/account/Home/ModalContent";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowLeft, Menu, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HEADERS_IMAGE } from "./Modal/CustomizeHeader";
import MaskedView from "@react-native-masked-view/masked-view";
var Home = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var navigation = _a.navigation;
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    var corners = useMemo(function () { return getCorners(); }, []);
    var focused = useIsFocused();
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var isTablet = useScreenDimensions().isTablet;
    var showAlert = useAlert().showAlert;
    var scrollRef = useAnimatedRef();
    var scrollOffset = useScrollViewOffset(scrollRef);
    var account = useCurrentAccount(function (store) { return store.account; });
    var accounts = useAccounts(function (store) { return store.accounts; });
    useEffect(function () {
        var checkAccounts = function () { return __awaiter(void 0, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!useAccounts.persist.hasHydrated())
                            return [2 /*return*/];
                        if (!(accounts.filter(function (account) { return !account.isExternal; }).length === 0)) return [3 /*break*/, 1];
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "FirstInstallation" }],
                        });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, Linking.getInitialURL()];
                    case 2:
                        url = _a.sent();
                        manageIzlyLogin(url || "");
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        checkAccounts();
        var handleUrl = function (event) {
            manageIzlyLogin(event.url);
        };
        Linking.addEventListener("url", handleUrl);
    }, [accounts, navigation]);
    var manageIzlyLogin = function (url) {
        if (url) {
            var scheme = url.split(":")[0];
            if (scheme === "izly") {
                setTimeout(function () {
                    showAlert({
                        title: "Activation de compte Izly",
                        message: "Papillon gère la connexion au service Izly. Ouvrez les paramètres de services de cantine pour activer votre compte.",
                        icon: <Menu />,
                        actions: [
                            { title: "Annuler", icon: <ArrowLeft /> },
                            {
                                title: "Ajouter mon compte",
                                icon: <Plus />,
                                onPress: function () { return navigation.navigate("SettingStack", { view: "IzlyActivation" }); },
                                primary: true,
                            }
                        ],
                    });
                }, 1000);
            }
        }
    };
    var _u = useState(false), shouldOpenContextMenu = _u[0], setShouldOpenContextMenu = _u[1];
    var _v = useState(false), modalOpen = _v[0], setModalOpen = _v[1];
    var _w = useState(false), modalFull = _w[0], setModalFull = _w[1];
    var _x = useState(true), canHaptics = _x[0], setCanHaptics = _x[1];
    var _y = useState(false), refreshing = _y[0], setRefreshing = _y[1];
    var openAccSwitcher = useCallback(function () {
        setShouldOpenContextMenu(false);
        setTimeout(function () {
            setShouldOpenContextMenu(true);
        }, 150);
    }, []);
    var windowHeight = Dimensions.get("window").height;
    var tabbarHeight = useBottomTabBarHeight();
    var widgetAnimatedStyle = useAnimatedStyle(function () { return ({
        paddingTop: insets.top,
        opacity: interpolate(scrollOffset.value, [0, 265 + insets.top], [1, 0], Extrapolation.CLAMP),
        transform: [
            { translateY: scrollOffset.value },
            { scale: interpolate(scrollOffset.value, [0, 265], [1, 0.9], Extrapolation.CLAMP) },
        ]
    }); });
    var modalAnimatedStyle = useAnimatedStyle(function () { return (__assign(__assign(__assign(__assign({}, (Platform.OS === "android" ? {} : { borderCurve: "continuous" })), { borderTopLeftRadius: interpolate(scrollOffset.value, [0, 100, 265 + insets.top - 0.1, 265 + insets.top], [12, 12, corners, 0], Extrapolation.CLAMP), borderTopRightRadius: interpolate(scrollOffset.value, [0, 100, 265 + insets.top - 0.1, 265 + insets.top], [12, 12, corners, 0], Extrapolation.CLAMP), shadowColor: "#000" }), (Platform.OS === "android" ? {} : { shadowOffset: { width: 0, height: 2 } })), { shadowOpacity: 0.2, shadowRadius: 10, flex: 1, minHeight: windowHeight - tabbarHeight - 8, backgroundColor: colors.card, overflow: "hidden", transform: [{ translateY: interpolate(scrollOffset.value, [-1000, 0, 125, 265], [-1000, 0, 105, 0], Extrapolation.CLAMP) }] })); });
    var navigationBarAnimatedStyle = useAnimatedStyle(function () { return ({
        position: "absolute",
        top: scrollOffset.value - 270 - insets.top,
        left: 0,
        right: 0,
        height: interpolate(scrollOffset.value, [125, 265], [0, insets.top + 60], Extrapolation.CLAMP),
        zIndex: 100,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderBottomWidth: 0.5,
    }); });
    var modalContentAnimatedStyle = useAnimatedStyle(function () { return ({
        paddingHorizontal: 16,
        paddingBottom: 16 + insets.top + 56,
        transform: [{ translateY: interpolate(scrollOffset.value, [-1000, 0, 125, 265 + insets.top], [1000, 0, 0, insets.top + 56], Extrapolation.CLAMP) }],
    }); });
    var modalIndicatorAnimatedStyle = useAnimatedStyle(function () { return ({
        position: "absolute",
        top: 10,
        left: "50%",
        transform: [{ translateX: interpolate(scrollOffset.value, [125, 200], [-25, -2], Extrapolation.CLAMP) }],
        width: interpolate(scrollOffset.value, [125, 200], [50, 4], Extrapolation.CLAMP),
        height: 4,
        backgroundColor: colors.text + "20",
        zIndex: 100,
        borderRadius: 5,
        opacity: interpolate(scrollOffset.value, [125, 180, 200], [1, 0.5, 0], Extrapolation.CLAMP),
    }); });
    var scrollViewAnimatedStyle = useAnimatedStyle(function () { return ({
        flex: 1,
        backgroundColor: scrollOffset.value > 265 + insets.top ? colors.card : "transparent",
    }); });
    return (<View style={{ flex: 1 }}>
      {!modalOpen && focused && !isTablet && (<StatusBar barStyle="light-content" backgroundColor={"transparent"} translucent/>)}
      {!isTablet && (<ContextMenu style={[{ position: "absolute", top: insets.top + 8, left: 16, zIndex: 1000 }]} shouldOpenContextMenu={shouldOpenContextMenu}>
          <AccountSwitcher translationY={scrollOffset} modalOpen={modalOpen} loading={!account.instance}/>
        </ContextMenu>)}

      <Pressable style={[{
                position: "absolute",
                top: insets.top,
                left: 16,
                right: 16,
                height: 60,
                zIndex: 1,
            }]} onLongPress={function () {
            if (modalOpen)
                return;
            navigation.navigate("CustomizeHeader");
        }} pointerEvents={modalOpen ? "none" : "auto"}/>

      <View style={{
            backgroundColor: colors.primary,
            width: "100%",
            height: 280 + insets.top,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: -10,
        }}>
        {((_c = (_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.header) === null || _c === void 0 ? void 0 : _c.gradient) && (<Reanimated.View style={{
                width: "100%",
                height: "100%",
                zIndex: -100,
            }} key={((_e = (_d = account === null || account === void 0 ? void 0 : account.personalization) === null || _d === void 0 ? void 0 : _d.header) === null || _e === void 0 ? void 0 : _e.gradient.startColor) + ":" + ((_g = (_f = account === null || account === void 0 ? void 0 : account.personalization) === null || _f === void 0 ? void 0 : _f.header) === null || _g === void 0 ? void 0 : _g.gradient.endColor)} entering={(focused || Platform.OS !== "ios") ? undefined : FadeIn.duration(500)} exiting={(focused || Platform.OS !== "ios") ? undefined : FadeOut.duration(500)}>
            <LinearGradient colors={[
                (_j = (_h = account === null || account === void 0 ? void 0 : account.personalization) === null || _h === void 0 ? void 0 : _h.header) === null || _j === void 0 ? void 0 : _j.gradient.startColor,
                (_l = (_k = account === null || account === void 0 ? void 0 : account.personalization) === null || _k === void 0 ? void 0 : _k.header) === null || _l === void 0 ? void 0 : _l.gradient.endColor,
            ]} style={{
                width: "100%",
                height: "100%"
            }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}/>
          </Reanimated.View>)}

        {((_o = (_m = account === null || account === void 0 ? void 0 : account.personalization) === null || _m === void 0 ? void 0 : _m.header) === null || _o === void 0 ? void 0 : _o.image) && !isTablet && (<Reanimated.View style={{
                width: "100%",
                height: "100%",
                maxHeight: 200,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: -1,
            }} key={(_q = (_p = account === null || account === void 0 ? void 0 : account.personalization) === null || _p === void 0 ? void 0 : _p.header) === null || _q === void 0 ? void 0 : _q.image} entering={(focused || Platform.OS !== "ios") ? undefined : FadeIn.duration(300)} exiting={(focused || Platform.OS !== "ios") ? undefined : FadeOut.duration(300)}>
            <MaskedView style={{
                width: "100%",
                height: "100%",
                opacity: 0.16,
            }} maskElement={<LinearGradient colors={["black", "transparent"]} style={{
                    width: "100%",
                    height: "100%",
                }}/>}>
              <Image source={(_r = HEADERS_IMAGE.find(function (item) { var _a, _b; return item.label === ((_b = (_a = account === null || account === void 0 ? void 0 : account.personalization) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.image); })) === null || _r === void 0 ? void 0 : _r.source} style={{
                width: "100%",
                height: "100%",
            }} resizeMode="cover"/>
            </MaskedView>
          </Reanimated.View>)}

        {((_t = (_s = account === null || account === void 0 ? void 0 : account.personalization) === null || _s === void 0 ? void 0 : _s.header) === null || _t === void 0 ? void 0 : _t.darken) && (<Reanimated.View style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#00000053",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 8,
            }} entering={(focused || Platform.OS !== "ios") ? undefined : FadeIn.duration(500)} exiting={(focused || Platform.OS !== "ios") ? undefined : FadeOut.duration(500)}/>)}
      </View>

      <Reanimated.ScrollView ref={scrollRef} snapToEnd={false} snapToStart={false} style={scrollViewAnimatedStyle} snapToOffsets={[0, 265 + insets.top]} decelerationRate={modalFull || Platform.OS === "android" ? "normal" : 0} onScrollEndDrag={function (e) {
            var _a;
            if (e.nativeEvent.contentOffset.y < 265 + insets.top && modalOpen) {
                (_a = scrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ y: 0, animated: true });
            }
        }} onScroll={function (e) {
            var scrollY = e.nativeEvent.contentOffset.y;
            if (scrollY > 125 && canHaptics) {
                playHaptics("impact", { impact: Haptics.ImpactFeedbackStyle.Light });
                setCanHaptics(false);
            }
            else if (scrollY < 125 && !canHaptics) {
                setCanHaptics(true);
            }
            setModalOpen(scrollY >= 170 + insets.top);
            setModalFull(scrollY >= 265 + insets.top);
        }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={function () { return setRefreshing(true); }} style={{ zIndex: 100 }} progressViewOffset={285 + insets.top}/>} showsVerticalScrollIndicator={false}>
        <Animated.View style={[widgetAnimatedStyle, isTablet && { marginTop: 2 * (0 - insets.top) }]}>
          <Header scrolled={false} navigation={navigation}/>
        </Animated.View>

        <Animated.View style={modalAnimatedStyle}>
          <Animated.View style={modalIndicatorAnimatedStyle}/>
          <Animated.View style={modalContentAnimatedStyle}>
            <ModalContent navigation={navigation} refresh={refreshing} endRefresh={function () { return setRefreshing(false); }}/>
          </Animated.View>
        </Animated.View>
      </Reanimated.ScrollView>
    </View>);
};
export default protectScreenComponent(Home);
