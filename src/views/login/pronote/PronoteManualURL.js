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
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import determinateAuthenticationView from "@/services/pronote/determinate-authentication-view";
import * as Clipboard from "expo-clipboard";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeInfo, Link2, TriangleAlert, Undo2, X } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var PronoteManualURL = function (_a) {
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var _c = useState(""), instanceURL = _c[0], setInstanceURL = _c[1];
    var _d = useState(false), keyboardOpen = _d[0], setKeyboardOpen = _d[1];
    var showAlert = useAlert().showAlert;
    var keyboardDidShow = function (event) {
        setKeyboardOpen(true);
    };
    var keyboardDidHide = function () {
        setKeyboardOpen(false);
    };
    useEffect(function () {
        Keyboard.addListener("keyboardDidShow", keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);
        return function () {
            Keyboard.removeAllListeners("keyboardDidShow");
            Keyboard.removeAllListeners("keyboardDidHide");
        };
    }, []);
    // find url in route params
    useEffect(function () {
        var _a, _b, _c;
        if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.url) {
            setInstanceURL((_b = route.params) === null || _b === void 0 ? void 0 : _b.url);
            determinateAuthenticationView((_c = route.params) === null || _c === void 0 ? void 0 : _c.url, navigation, showAlert);
        }
    }, [route.params]);
    var _e = useState(false), clipboardFound = _e[0], setClipboardFound = _e[1];
    // get url from clipboard
    useEffect(function () {
        var _a;
        if (instanceURL === "" && !((_a = route.params) === null || _a === void 0 ? void 0 : _a.url)) {
            Clipboard.getStringAsync().then(function (clipboardContent) {
                if (clipboardContent && clipboardContent.startsWith("https://") && clipboardContent.includes("/pronote")) {
                    setInstanceURL(clipboardContent);
                    setClipboardFound(true);
                }
            });
        }
    }, []);
    useEffect(function () {
        setClipboardFound(false);
    }, [instanceURL]);
    var checkForDemoInstance = function (instanceURL, navigation, showAlert) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!instanceURL.includes("demo.index-education.net"))
                return [2 /*return*/, determinateAuthenticationView(instanceURL.trim(), navigation, showAlert)];
            showAlert({
                title: "Instance non prise en charge",
                message: "Désolé, les instances de démonstration ne sont pas prises en charge, elles peuvent être instables ou ne pas fonctionner correctement.",
                icon: <BadgeInfo />,
                actions: [
                    {
                        title: "Continuer",
                        icon: <TriangleAlert />,
                        onPress: function () { return determinateAuthenticationView(instanceURL, navigation, showAlert); },
                        danger: false,
                        delayDisable: 5,
                    },
                    {
                        title: "Annuler",
                        icon: <Undo2 />,
                        primary: true,
                    }
                ]
            });
            return [2 /*return*/];
        });
    }); };
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }}/>

      {!keyboardOpen && (<Reanimated.View entering={FadeInUp.duration(250).delay(200)} exiting={FadeOutUp.duration(150)} style={{ zIndex: 9999 }} layout={LinearTransition}>
          <PapillonShineBubble message={!clipboardFound ?
                "Indique moi l'adresse URL Pronote de ton établissement"
                : "J'ai trouvé cette adresse dans ton presse-papier !"} numberOfLines={2} width={250} noFlex/>
        </Reanimated.View>)}


      <Reanimated.View style={[
            styles.searchContainer,
            {
                backgroundColor: colors.text + "15",
                // @ts-expect-error
                color: colors.text,
                borderColor: colors.border,
            }
        ]}>
        <Link2 size={24} color={colors.text + "55"}/>

        <ResponsiveTextInput keyboardType="url" autoCapitalize="none" placeholder="URL de l'instance Pronote" style={[styles.searchInput, { color: theme.colors.text }]} placeholderTextColor={theme.colors.text + "50"} value={instanceURL} onChangeText={setInstanceURL} onSubmitEditing={function () {
            if (instanceURL.length > 0) {
                checkForDemoInstance(instanceURL, navigation, showAlert);
            }
            ;
        }}/>

        {instanceURL.length > 0 && (<Reanimated.View layout={LinearTransition} entering={ZoomIn.springify()} exiting={ZoomOut.springify()}>
            <TouchableOpacity onPress={function () {
                setInstanceURL("");
            }}>
              <X size={24} color={colors.text + "55"}/>
            </TouchableOpacity>
          </Reanimated.View>)}
      </Reanimated.View>

      <View style={{ flex: 1 }}/>

      <View style={styles.buttons}>
        <ButtonCta value="Confirmer" primary onPress={function () {
            if (instanceURL.length > 0) {
                checkForDemoInstance(instanceURL, navigation, showAlert);
            }
            ;
        }}/>
        {((_b = route.params) === null || _b === void 0 ? void 0 : _b.method) && (<ButtonCta value="Quitter" onPress={function () { return navigation.navigate("AccountSelector"); }}/>)}
      </View>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 300,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        fontFamily: "medium",
    }
});
export default PronoteManualURL;
