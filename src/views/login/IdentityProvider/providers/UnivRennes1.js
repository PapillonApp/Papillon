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
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
var UnivRennes1_Login = function (_a) {
    var navigation = _a.navigation;
    var mainURL = "https://sesame.univ-rennes1.fr/comptes/";
    var theme = useTheme();
    var webViewRef = React.useRef(null);
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var _b = React.useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = React.useState("Connexion en cours..."), isLoadingText = _c[0], setIsLoadingText = _c[1];
    var loginUnivData = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var local_account;
        var _a;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    if (!(((_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.uid) !== null)) return [3 /*break*/, 2];
                    _a = {
                        authentication: undefined,
                        instance: undefined,
                        identityProvider: {
                            identifier: "univ-rennes1",
                            name: "Université de Rennes",
                            rawData: data
                        },
                        providers: ["ical", "moodle"],
                        localID: uuid(),
                        service: AccountService.Local,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: ((_d = (_c = data === null || data === void 0 ? void 0 : data.user) === null || _c === void 0 ? void 0 : _c.infos) === null || _d === void 0 ? void 0 : _d.lastName) + " " + ((_f = (_e = data === null || data === void 0 ? void 0 : data.user) === null || _e === void 0 ? void 0 : _e.infos) === null || _f === void 0 ? void 0 : _f.firstName),
                        studentName: {
                            first: (_h = (_g = data === null || data === void 0 ? void 0 : data.user) === null || _g === void 0 ? void 0 : _g.infos) === null || _h === void 0 ? void 0 : _h.firstName,
                            last: (_k = (_j = data === null || data === void 0 ? void 0 : data.user) === null || _j === void 0 ? void 0 : _j.infos) === null || _k === void 0 ? void 0 : _k.lastName,
                        },
                        className: "UR1", // TODO ?
                        schoolName: data.caccount.data.attachmentDpt.name.replace("Institut Universitaire de Technologie", "IUT") + " - Université de Rennes"
                    };
                    return [4 /*yield*/, defaultPersonalization()];
                case 1:
                    local_account = (_a.personalization = _l.sent(),
                        _a.identity = {},
                        _a.serviceData = {},
                        _a);
                    createStoredAccount(local_account);
                    switchTo(local_account);
                    queueMicrotask(function () {
                        // Reset the navigation stack to the "Home" screen.
                        // Prevents the user from going back to the login screen.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "AccountCreated" }],
                        });
                    });
                    _l.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    return (<View style={{
            flex: 1,
        }}>
      {isLoading && (<View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.colors.card,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                gap: 6,
            }}>
          <PapillonSpinner size={48} strokeWidth={5} color="#29947a" style={{
                marginBottom: 16,
                marginHorizontal: 26,
            }}/>

          <NativeText variant="title" style={{ textAlign: "center" }}>
            Connexion au compte Sésame
          </NativeText>

          <NativeText variant="subtitle" style={{ textAlign: "center" }}>
            {isLoadingText}
          </NativeText>
        </View>)}

      <WebView source={{ uri: mainURL }} style={{
            height: "100%",
            width: "100%",
        }} ref={webViewRef} startInLoadingState={true} incognito={true} onLoadStart={function (e) {
            if (e.nativeEvent.url === "https://sesame.univ-rennes1.fr/comptes/api/auth/data") {
                setIsLoadingText("Récupération des données...");
                setIsLoading(true);
            }
        }} onLoadEnd={function (e) {
            var _a, _b;
            if (e.nativeEvent.title === "Sésame" && e.nativeEvent.url === mainURL) {
                (_a = webViewRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n              window.location.href = \"https://sesame.univ-rennes1.fr/comptes/api/auth/data\";\n            ");
            }
            if (e.nativeEvent.url === "https://sesame.univ-rennes1.fr/comptes/api/auth/data") {
                (_b = webViewRef.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript("\n              window.ReactNativeWebView.postMessage(JSON.stringify({type: \"loginData\", data: document.querySelector(\"pre\").innerText}));\n            ");
            }
            else {
                setIsLoading(false);
            }
        }} onMessage={function (e) {
            var data = JSON.parse(e.nativeEvent.data);
            if (data.type === "loginData") {
                loginUnivData(JSON.parse(data.data));
            }
        }}/>
    </View>);
};
export default UnivRennes1_Login;
