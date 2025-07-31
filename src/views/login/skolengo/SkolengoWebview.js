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
import React, { createRef, useEffect, useState } from "react";
import { StyleSheet, View, Dimensions, KeyboardAvoidingView, ActivityIndicator, Platform, Text, } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView, useSafeAreaInsets, } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import * as AuthSession from "expo-auth-session";
import { OID_CLIENT_ID, OID_CLIENT_SECRET, REDIRECT_URI } from "scolengo-api";
import { useAlert } from "@/providers/AlertProvider";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { authTokenToSkolengoTokenSet } from "@/services/skolengo/skolengo-types";
import { getSkolengoAccount } from "@/services/skolengo/skolengo-account";
import { wait } from "@/services/skolengo/data/utils";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { BadgeX, Undo2 } from "lucide-react-native";
// TODO : When the app is not started with Expo Go (so with a prebuild or a release build), use the expo auth-session module completely with the deeplink and without the webview.
var SkolengoWebview = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var showAlert = useAlert().showAlert;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var _b = useState(false), showWebView = _b[0], setShowWebView = _b[1];
    var _c = useState("Connexion aux services d'authentification de Skolengo..."), loginStep = _c[0], setLoginStep = _c[1];
    var _d = useState(null), pageUrl = _d[0], setPageUrl = _d[1];
    var _e = useState(null), discovery = _e[0], setDiscovery = _e[1];
    var playSound = useSoundHapticsWrapper().playSound;
    var LEson = require("@/../assets/sound/3.wav");
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    useEffect(function () {
        getSkolengoURL(route.params.school).then(function (skourl) {
            if (skourl) {
                setPageUrl(skourl.url);
                setDiscovery(skourl.discovery);
            }
        });
    }, [route.params.school]);
    var webViewRef = createRef();
    useEffect(function () {
        playSound(LEson);
    }, []);
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
            }
        ]}>
          {!showWebView && (<View style={{
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
            }}>
              <ActivityIndicator size="large" color={theme.colors.text}/>

              <Text style={{
                color: theme.colors.text,
                marginTop: 10,
                fontSize: 18,
                fontFamily: "semibold",
                textAlign: "center",
            }}>
                Connexion à Skolengo
              </Text>

              <Text style={{
                color: theme.colors.text,
                marginTop: 6,
                fontSize: 16,
                lineHeight: 20,
                fontFamily: "medium",
                opacity: 0.5,
                textAlign: "center",
            }}>
                {loginStep}
              </Text>
            </View>)}

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
        ]} onHttpError={function () { return setShowWebView(false); }} onShouldStartLoadWithRequest={function (e) {
            if (e.url.startsWith("http://") || e.url.startsWith("https://")) {
                if (!showWebView)
                    setShowWebView(true);
                return true;
            }
            if (e.url.includes(REDIRECT_URI)) {
                setShowWebView(false);
                var url = new URL(e.url);
                var code = url.searchParams.get("code");
                if (!code || !discovery) {
                    showAlert({
                        title: "Erreur",
                        message: "Impossible de récupérer le code d'authentification.",
                        icon: <BadgeX />,
                        actions: [
                            {
                                title: "OK",
                                primary: true,
                                icon: <Undo2 />,
                                onPress: function () { return navigation.goBack(); },
                            }
                        ]
                    });
                    return false;
                }
                setLoginStep("Récupératon du token d'authentification...");
                AuthSession.exchangeCodeAsync({
                    clientId: OID_CLIENT_ID,
                    clientSecret: OID_CLIENT_SECRET,
                    code: code,
                    redirectUri: REDIRECT_URI,
                }, discovery).then(function (token) { return __awaiter(void 0, void 0, void 0, function () {
                    var newToken, skolengoAccount;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setLoginStep("Initialisation du compte...");
                                newToken = authTokenToSkolengoTokenSet(token);
                                // Need that if the user have ressources from PRONOTE
                                return [4 /*yield*/, wait(1000)];
                            case 1:
                                // Need that if the user have ressources from PRONOTE
                                _a.sent();
                                setLoginStep("Obtention du compte...");
                                return [4 /*yield*/, getSkolengoAccount({
                                        school: route.params.school,
                                        tokenSet: newToken,
                                        discovery: discovery
                                    })];
                            case 2:
                                skolengoAccount = _a.sent();
                                setLoginStep("Finalisation du compte...");
                                createStoredAccount(skolengoAccount);
                                switchTo(skolengoAccount);
                                // We need to wait a tick to make sure the account is set before navigating.
                                queueMicrotask(function () {
                                    // Reset the navigation stack to the "Home" screen.
                                    // Prevents the user from going back to the login screen.
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: "AccountCreated" }],
                                    });
                                });
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            return true;
        }} source={{ uri: pageUrl || "" }} setSupportMultipleWindows={false} originWhitelist={["http://*", "https://*", "skoapp-prod://*"]} incognito={true} // Prevent to keep cookies on webview load.
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
export default SkolengoWebview;
var getSkolengoURL = function (school) { return __awaiter(void 0, void 0, void 0, function () {
    var discovery, authRes, url, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch(school.emsOIDCWellKnownUrl)
                        .then(function (res) { return res.json(); })
                        .then(function (res) { return res.issuer; })
                        .then(function (issuer) { return AuthSession.resolveDiscoveryAsync(issuer); })];
            case 1:
                discovery = _a.sent();
                if (!discovery)
                    return [2 /*return*/];
                authRes = new AuthSession.AuthRequest({
                    clientId: OID_CLIENT_ID,
                    clientSecret: OID_CLIENT_SECRET,
                    redirectUri: REDIRECT_URI,
                    extraParams: {
                        scope: "openid",
                        response_type: "code",
                    },
                    usePKCE: false,
                });
                return [4 /*yield*/, authRes.makeAuthUrlAsync(discovery)];
            case 2:
                url = _a.sent();
                return [2 /*return*/, { url: url, discovery: discovery, authRes: authRes }];
            case 3:
                e_1 = _a.sent();
                console.error(e_1);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
//! This function is not used in the current codebase but will be used in the future
var loginSkolengoWorkflow = function (school) { return __awaiter(void 0, void 0, void 0, function () {
    var skolengoUrl, res, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getSkolengoURL(school)];
            case 1:
                skolengoUrl = _a.sent();
                if (!skolengoUrl)
                    return [2 /*return*/];
                return [4 /*yield*/, skolengoUrl.authRes.promptAsync(skolengoUrl.discovery, {
                        url: skolengoUrl.url,
                    })];
            case 2:
                res = _a.sent();
                if (!res || (res === null || res === void 0 ? void 0 : res.type) !== "success")
                    return [2 /*return*/];
                return [4 /*yield*/, AuthSession.exchangeCodeAsync({
                        clientId: OID_CLIENT_ID,
                        clientSecret: OID_CLIENT_SECRET,
                        code: res.params.code,
                        redirectUri: REDIRECT_URI,
                    }, skolengoUrl.discovery)];
            case 3:
                token = _a.sent();
                if (!token)
                    return [2 /*return*/];
                return [2 /*return*/];
        }
    });
}); };
