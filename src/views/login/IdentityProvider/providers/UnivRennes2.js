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
function extractStudentDataFromHTML(htmlString) {
    var data = {
        title: "",
        identity: {},
        formation: {},
        sesamAccount: {}
    };
    try {
        // Extract title
        var titleMatch = htmlString.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
            data.title = titleMatch[1].trim();
        }
        // Helper function to extract section data
        function extractSectionData(sectionName, dataObject) {
            var sectionRegex = new RegExp("<h3 class=\"section-h3\">".concat(sectionName, "[\\s\\S]*?<dl class=\"well\">[\\s\\S]*?</dl>"));
            var sectionMatch = htmlString.match(sectionRegex);
            if (sectionMatch) {
                var divRegex = /<div class="information-dl-div">[\s\S]*?<dt[^>]*>(.*?)<\/dt>[\s\S]*?<dd[^>]*>(.*?)<\/dd>[\s\S]*?<\/div>/g;
                var divMatch = void 0;
                while ((divMatch = divRegex.exec(sectionMatch[0])) !== null) {
                    var key = divMatch[1].replace(/<[^>]*>/g, "").trim();
                    var value = divMatch[2].replace(/<[^>]*>/g, "").trim();
                    dataObject[key] = value;
                }
            }
        }
        // Extract data for each section
        extractSectionData("Identité", data.identity);
        extractSectionData("Formation", data.formation);
        extractSectionData("Compte Sésame", data.sesamAccount);
    }
    catch (error) {
        console.error("Error parsing HTML:", error);
    }
    return data;
}
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
var UnivRennes2_Login = function (_a) {
    var navigation = _a.navigation;
    var mainURL = "https://cas.univ-rennes2.fr/login?service=https%3A%2F%2Fservices.univ-rennes2.fr%2Fsesame%2Findex.php%2Flogin%2Fmon-compte-sesame%2Fchanger-mon-mot-de-passe";
    var theme = useTheme();
    var webViewRef = React.useRef(null);
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var _b = React.useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = React.useState("Connexion en cours..."), isLoadingText = _c[0], setIsLoadingText = _c[1];
    var loginUnivData = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var local_account;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(data !== null)) return [3 /*break*/, 2];
                    _a = {
                        authentication: undefined,
                        instance: undefined,
                        identityProvider: {
                            identifier: "univ-rennes2",
                            name: "Université de Rennes 2",
                            rawData: data
                        },
                        providers: ["ical", "moodle"],
                        localID: uuid(),
                        service: AccountService.Local,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: (data === null || data === void 0 ? void 0 : data.identity["Nom"]) + " " + (data === null || data === void 0 ? void 0 : data.identity["Prénom(s)"]),
                        studentName: {
                            first: data === null || data === void 0 ? void 0 : data.identity["Prénom(s)"],
                            last: data === null || data === void 0 ? void 0 : data.identity["Nom"],
                        },
                        className: "UR2", // TODO ?
                        schoolName: (data === null || data === void 0 ? void 0 : data.formation["Formation"]) + " - Université de Rennes 2"
                    };
                    return [4 /*yield*/, defaultPersonalization()];
                case 1:
                    local_account = (_a.personalization = _b.sent(),
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
                    _b.label = 2;
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
            if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/login/mon-compte-sesame/changer-mon-mot-de-passe") {
                setIsLoadingText("Récupération des données...");
                setIsLoading(true);
            }
        }} onLoadEnd={function (e) {
            var _a, _b;
            if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/login/mon-compte-sesame/changer-mon-mot-de-passe") {
                (_a = webViewRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n              window.location.href = \"https://services.univ-rennes2.fr/sesame/index.php/mon-compte-sesame\";\n            ");
            }
            else if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/mon-compte-sesame") {
                // send all HTML content to the app
                (_b = webViewRef.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript("\n              window.ReactNativeWebView.postMessage(JSON.stringify({\n                type: \"accountHTML\",\n                data: document.documentElement.outerHTML\n              }));\n            ");
            }
            else {
                setIsLoading(false);
            }
        }} onMessage={function (e) {
            var data = JSON.parse(e.nativeEvent.data);
            if (data.type === "accountHTML") {
                var accountData = extractStudentDataFromHTML(data.data);
                loginUnivData(accountData);
            }
        }}/>
    </View>);
};
export default UnivRennes2_Login;
