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
import React, { createRef, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Dimensions, KeyboardAvoidingView, Platform, } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import Reanimated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, LinearTransition, } from "react-native-reanimated";
import pronote from "pawnote";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import defaultPersonalization from "@/services/pronote/default-personalization";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { useAlert } from "@/providers/AlertProvider";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { BadgeInfo, Undo2 } from "lucide-react-native";
var PronoteWebview = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var showAlert = useAlert().showAlert;
    var _b = useState(true), setLoading = _b[1];
    var _c = useState(0), setLoadProgress = _c[1];
    var _d = useState(false), showWebView = _d[0], setShowWebView = _d[1];
    var _e = useState(false), loggingIn = _e[0], setLoggingIn = _e[1];
    var _f = useState(""), setCurrentURL = _f[1];
    var deviceUUID = useState(uuid())[0];
    var _g = useState("Préparation de la connexion"), loginStep = _g[0], setLoginStep = _g[1];
    var playSound = useSoundHapticsWrapper().playSound;
    var LEson3 = require("@/../assets/sound/3.wav");
    var LEson4 = require("@/../assets/sound/4.wav");
    var instanceURL = route.params.instanceURL.toLowerCase();
    var infoMobileURL = instanceURL + "/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4";
    var webViewRef = createRef();
    var currentLoginStateIntervalRef = useRef(null);
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var PRONOTE_COOKIE_EXPIRED = new Date(0).toUTCString();
    var PRONOTE_COOKIE_VALIDATION_EXPIRES = new Date(new Date().getTime() + 5 * 60 * 1000).toUTCString();
    var PRONOTE_COOKIE_LANGUAGE_EXPIRES = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    useEffect(function () {
        playSound(LEson3);
    }, []);
    var INJECT_PRONOTE_JSON = "\n    (function () {\n      try {\n        const json = JSON.parse(document.body.innerText);\n        const lJetonCas = !!json && !!json.CAS && json.CAS.jetonCAS;\n        \n        document.cookie = \"appliMobile=; expires=".concat(PRONOTE_COOKIE_EXPIRED, "\"\n\n        if (!!lJetonCas) {\n          document.cookie = \"validationAppliMobile=\" + lJetonCas + \"; expires=").concat(PRONOTE_COOKIE_VALIDATION_EXPIRES, "\";\n          document.cookie = \"uuidAppliMobile=").concat(deviceUUID, "; expires=").concat(PRONOTE_COOKIE_VALIDATION_EXPIRES, "\";\n          // 1036 = French\n          document.cookie = \"ielang=1036; expires=").concat(PRONOTE_COOKIE_LANGUAGE_EXPIRES, "\";\n        }\n\n        window.location.assign(\"").concat(instanceURL, "/mobile.eleve.html?fd=1\");\n      }\n      catch {\n        // TODO: Handle error\n      }\n    })();\n  ").trim();
    /**
     * Creates the hook inside the webview when logging in.
     * Also hides the "Download PRONOTE app" button.
     */
    var INJECT_PRONOTE_INITIAL_LOGIN_HOOK = "\n    (function () {\n      window.hookAccesDepuisAppli = function() {\n        this.passerEnModeValidationAppliMobile('', '".concat(deviceUUID, "');\n      };\n      \n      return '';\n    })();\n  ").trim();
    var INJECT_PRONOTE_CURRENT_LOGIN_STATE = "\n    (function () {\n      setInterval(function() {\n        const state = window && window.loginState ? window.loginState : void 0;\n\n        window.ReactNativeWebView.postMessage(JSON.stringify({\n          type: 'pronote.loginState',\n          data: state\n        }));\n      }, 1000);\n    })();\n  ".trim();
    return (<SafeAreaView style={styles.container}>
      <MaskStars />
      <KeyboardAvoidingView behavior="padding">
        <View style={[
            {
                flex: 1,
                marginTop: Platform.OS === "ios" ? 46 : 56,
                marginBottom: 10,
                width: Dimensions.get("window").width - 20,
                borderRadius: 10,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.border,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 1,
                shadowRadius: 0,
            },
            Platform.OS === "android" && {
                overflow: "hidden",
                elevation: 4,
            },
        ]}>
          {!showWebView && (<Reanimated.View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
                backgroundColor: theme.colors.card,
            }} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
              <PapillonSpinner animated={true} size={48} color={theme.colors.primary} strokeWidth={6} entering={!showWebView && FadeInUp.duration(200)} exiting={FadeOutDown.duration(100)}/>

              <Reanimated.Text style={{
                color: theme.colors.text,
                marginTop: 10,
                fontSize: 18,
                fontFamily: "semibold",
                textAlign: "center",
            }} entering={!showWebView && FadeInUp.duration(200)} exiting={FadeOutDown.duration(100)} layout={animPapillon(LinearTransition)}>
                Connexion à Pronote
              </Reanimated.Text>

              <Reanimated.View layout={animPapillon(LinearTransition)} entering={!showWebView && FadeInUp.duration(200)} exiting={FadeOutDown.duration(100)} key={loginStep + "stp"}>
                <Reanimated.Text style={{
                color: theme.colors.text,
                marginTop: 6,
                fontSize: 16,
                lineHeight: 20,
                fontFamily: "medium",
                opacity: 0.5,
                textAlign: "center",
            }}>
                  {loginStep}
                </Reanimated.Text>
              </Reanimated.View>
            </Reanimated.View>)}

          <WebView ref={webViewRef} style={[
            styles.webview,
            {
                width: "100%",
                height: "100%",
                opacity: showWebView ? 1 : 0,
                borderRadius: 10,
                borderCurve: "continuous",
                overflow: "hidden",
                zIndex: 1,
            },
        ]} source={{ uri: infoMobileURL }} setSupportMultipleWindows={false} onLoadProgress={function (_a) {
            var nativeEvent = _a.nativeEvent;
            setLoadProgress(nativeEvent.progress);
        }} onError={function (e) {
            console.error("Pronote webview error", e);
        }} onLoadStart={function (e) {
            var url = e.nativeEvent.url;
            setCurrentURL(url);
            setLoading(true);
            if (url.includes("mobile.eleve.html")) {
                setLoginStep("En attente de ton établissement");
                setShowWebView(false);
            }
        }} onMessage={function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var message, session_1, refresh, user, name_1, account;
            var _c;
            var nativeEvent = _b.nativeEvent;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        message = JSON.parse(nativeEvent.data);
                        if (!(message.type === "pronote.loginState")) return [3 /*break*/, 3];
                        if (loggingIn)
                            return [2 /*return*/];
                        if (!message.data)
                            return [2 /*return*/];
                        if (message.data.status !== 0)
                            return [2 /*return*/];
                        setShowWebView(false);
                        setLoginStep("Obtention des informations");
                        setLoggingIn(true);
                        if (currentLoginStateIntervalRef.current)
                            clearInterval(currentLoginStateIntervalRef.current);
                        session_1 = pronote.createSessionHandle();
                        return [4 /*yield*/, pronote
                                .loginToken(session_1, {
                                url: instanceURL,
                                kind: pronote.AccountKind.STUDENT,
                                username: message.data.login,
                                token: message.data.mdp,
                                deviceUUID: deviceUUID
                            }).catch(function (error) {
                                if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                                    navigation.navigate("Pronote2FA_Auth", {
                                        session: session_1,
                                        error: error,
                                        accountID: deviceUUID
                                    });
                                }
                                else {
                                    throw error;
                                }
                            })];
                    case 1:
                        refresh = _d.sent();
                        if (!refresh)
                            throw pronote.AuthenticateError;
                        user = session_1.user.resources[0];
                        name_1 = user.name;
                        _c = {
                            instance: session_1,
                            localID: deviceUUID,
                            service: AccountService.Pronote,
                            isExternal: false,
                            linkedExternalLocalIDs: [],
                            name: name_1,
                            className: user.className,
                            schoolName: user.establishmentName,
                            studentName: {
                                first: extract_pronote_name(name_1).givenName,
                                last: extract_pronote_name(name_1).familyName,
                            },
                            authentication: __assign(__assign({}, refresh), { deviceUUID: deviceUUID })
                        };
                        return [4 /*yield*/, defaultPersonalization(session_1)];
                    case 2:
                        account = (_c.personalization = _d.sent(),
                            _c.identity = {},
                            _c.serviceData = {},
                            _c.providers = [],
                            _c);
                        pronote.startPresenceInterval(session_1);
                        createStoredAccount(account);
                        setLoading(false);
                        switchTo(account);
                        // We need to wait a tick to make sure the account is set before navigating.
                        queueMicrotask(function () {
                            // Reset the navigation stack to the "Home" screen.
                            // Prevents the user from going back to the login screen.
                            playSound(LEson4);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "AccountCreated" }],
                            });
                        });
                        _d.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); }} onLoadEnd={function (e) {
            var _a, _b, _c, _d;
            var url = e.nativeEvent.url;
            (_a = webViewRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(INJECT_PRONOTE_INITIAL_LOGIN_HOOK);
            if (url.includes("InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4")) {
                (_b = webViewRef.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript(INJECT_PRONOTE_JSON);
            }
            else {
                setLoading(false);
                if (url.includes("pronote/mobile.eleve.html")) {
                    if (!url.includes("identifiant")) {
                        showAlert({
                            title: "Attention",
                            message: "Désolé, seuls les comptes élèves sont compatibles pour le moment.",
                            icon: <BadgeInfo />,
                            actions: [
                                {
                                    title: "OK",
                                    primary: true,
                                    icon: <Undo2 />,
                                    onPress: function () { return navigation.goBack(); },
                                },
                            ],
                        });
                    }
                    else {
                        (_c = webViewRef.current) === null || _c === void 0 ? void 0 : _c.injectJavaScript(INJECT_PRONOTE_INITIAL_LOGIN_HOOK);
                        (_d = webViewRef.current) === null || _d === void 0 ? void 0 : _d.injectJavaScript(INJECT_PRONOTE_CURRENT_LOGIN_STATE);
                    }
                }
                if (url.split("?")[0].includes("mobile.eleve.html") == false) {
                    setShowWebView(true);
                }
            }
        }} incognito={true} // prevent to keep cookies on webview load
     userAgent="Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"/>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    webview: {
        flex: 1,
    },
});
export default PronoteWebview;
