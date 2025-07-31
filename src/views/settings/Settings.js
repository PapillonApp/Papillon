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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PackageJSON from "../../../package.json";
import Reanimated, { FadeIn, FadeOut, runOnJS, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { HandCoins, Info, LogOut, Palette, Paperclip, Settings as SettingsLucide, WandSparkles, X, PersonStanding, BadgeHelp } from "lucide-react-native";
import { NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import ModalHandle from "@/components/Modals/ModalHandle";
import AccountContainerCard from "@/components/Settings/AccountContainerCard";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { get_settings_widgets } from "@/addons/addons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFlagsStore } from "@/stores/flags";
import { useAlert } from "@/providers/AlertProvider";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var Settings = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var _b = useState([]), addons = _b[0], setAddons = _b[1];
    var _c = useState(false), devModeEnabled = _c[0], setDevModeEnabled = _c[1];
    var defined = useFlagsStore(function (state) { return state.defined; });
    var _d = useState(false), click = _d[0], setClick = _d[1];
    var isTablet = useScreenDimensions().isTablet;
    var removeAccount = useAccounts(function (store) { return store.remove; });
    var openUrl = function (url) {
        WebBrowser.openBrowserAsync(url, {
            presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
            controlsColor: theme.colors.primary,
        });
    };
    useEffect(function () {
        AsyncStorage.getItem("devmode")
            .then(function (res) {
            var value = { enabled: false };
            if (res)
                value = JSON.parse(res);
            setDevModeEnabled(value.enabled);
        });
    }, []);
    useEffect(function () {
        var _a;
        if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.view) {
            // @ts-expect-error : on ignore le state de navigation
            navigation.navigate(route.params.view);
        }
    }, [route.params]);
    useEffect(function () {
        var unsubscribe = navigation.addListener("focus", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setTimeout(function () {
                    get_settings_widgets().then(function (addons) {
                        setAddons(addons);
                    });
                }, 1);
                return [2 /*return*/];
            });
        }); });
        return unsubscribe;
    }, []);
    var showAlert = useAlert().showAlert;
    var menuItems = [
        {
            icon: <SettingsLucide />,
            colors: ["#1E88E5", "#64B5F6"],
            label: "Général",
            description: "Notifications et services",
            onPress: function () { return navigation.navigate("SettingsGeneral"); },
        },
        {
            icon: <Palette />,
            colors: ["#43A047", "#81C784"],
            label: "Personnalisation",
            description: "Apparence et navigation",
            onPress: function () { return navigation.navigate("SettingsPersonalization"); },
        },
        {
            icon: <PersonStanding />,
            colors: ["#8E24AA", "#BA68C8"],
            label: "Accessibilité",
            description: "Options d'accessibilité",
            onPress: function () { return navigation.navigate("SettingsAccessibility"); },
        },
        {
            icon: <WandSparkles />,
            colors: ["#FB8C00", "#FFB74D"],
            label: "Expérimental",
            description: "Fonctionnalités en bêta",
            onPress: function () { return navigation.navigate("SettingsExperimental"); },
        },
        {
            icon: <Info />,
            colors: ["#546E7A", "#90A4AE"],
            label: "Projet Papillon",
            description: "À propos et support",
            onPress: function () { return navigation.navigate("SettingsProject"); },
        },
    ];
    if (Platform.OS === "android") {
        menuItems.push({
            icon: <HandCoins />,
            colors: ["#F57C00", "#FFB74D"],
            label: "Soutenir Papillon",
            description: "Faire un don",
            onPress: function () { return openUrl("https://papillon.bzh/donate"); },
        });
    }
    var translationY = useSharedValue(0);
    var _e = useState(false), scrolled = _e[0], setScrolled = _e[1];
    var scrollHandler = useAnimatedScrollHandler(function (event) {
        translationY.value = event.contentOffset.y;
        var yOffset = event.contentOffset.y;
        runOnJS(setScrolled)(yOffset > 30);
    });
    // show header on Android
    useLayoutEffect(function () {
        navigation.setOptions(Platform.OS === "android" ? {
            headerShown: true,
        } : {
            headerTransparent: true,
            headerTitle: function () { return (<View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: -48,
                }}>
            {!scrolled && Platform.OS === "ios" &&
                    <Reanimated.View exiting={FadeOut.duration(100)} entering={FadeIn.duration(100)} style={{
                            zIndex: 1000,
                        }}>
                <ModalHandle />
              </Reanimated.View>}
          </View>); },
        });
    });
    return (<>
      <Reanimated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{
            paddingTop: Platform.OS === "ios" ? 0 : 16,
            paddingHorizontal: 16,
            paddingBottom: Platform.OS === "ios" ? 16 : insets.bottom + 16,
        }}>
        <AccountContainerCard account={account} onPress={function () { return navigation.navigate("SettingsProfile"); }}/>
        {addons.length > 0 &&
            <>
              <NativeListHeader label={"Extensions"}/>
              <NativeList>
                {addons.map(function (addon, index) { return (<NativeItem key={index} onPress={function () { return navigation.navigate("AddonSettingsPage", { addon: addon, from: "Settings" }); }} leading={<Image source={addon.manifest.icon == "" ? require("../../../assets/images/addon_default_logo.png") : { uri: addon.manifest.icon }} style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            borderWidth: 1,
                            borderColor: "#00000015",
                            marginLeft: -6,
                        }}/>}>
                    <NativeText variant="title" numberOfLines={1}>
                      {addon.manifest.name}
                    </NativeText>
                  </NativeItem>); })}
              </NativeList>
            </>}

        <NativeList>
          {menuItems.map(function (item, index) { return (<NativeItem key={index} onPress={item.onPress} leading={<NativeIconGradient icon={item.icon} colors={item.colors}/>}>
              <NativeText variant="title">
                {item.label}
              </NativeText>
              {"description" in item && item.description &&
                <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                  {item.description}
                </NativeText>}
            </NativeItem>); })}
        </NativeList>

        <NativeList style={{ marginTop: 16 }}>
          <NativeItem onPress={function () {
            showAlert({
                title: "Se déconnecter",
                message: "Veux-tu vraiment te déconnecter ?",
                icon: <BadgeHelp />,
                actions: [
                    {
                        title: "Annuler",
                        icon: <X />,
                        primary: false,
                    },
                    {
                        title: "Déconnexion",
                        onPress: function () {
                            removeAccount(account.localID);
                            setTimeout(function () {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: "AccountSelector" }],
                                });
                            }, 100);
                        },
                        danger: true,
                        icon: <LogOut />,
                        delayDisable: 5,
                    },
                ],
            });
        }} leading={<NativeIconGradient icon={<LogOut />} colors={["#E53935", "#EF5350"]}/>}>
            <NativeText variant="title">
              Se déconnecter
            </NativeText>
          </NativeItem>
        </NativeList>

        {devModeEnabled && (<View>
            <NativeListHeader label={"Développeur"}/>
            <NativeList>
              <NativeItem onPress={function () { return navigation.navigate("SettingsDevLogs"); }} leading={<NativeIconGradient icon={<Paperclip />} colors={["#757575", "#BDBDBD"]}/>}>
                <NativeText variant="title">
                  Logs
                </NativeText>
              </NativeItem>
            </NativeList>
          </View>)}

        <Text style={{
            color: colors.text + "60",
            fontFamily: "medium",
            fontSize: 12.5,
            textAlign: "center",
            marginTop: 24,
        }}>
          version {PackageJSON.version} {Platform.OS} {__DEV__ ? "(développeur)" : ""} {"\n"}
          fabriqué avec ❤️ par les contributeurs Papillon
        </Text>
      </Reanimated.ScrollView>
    </>);
};
export default Settings;
