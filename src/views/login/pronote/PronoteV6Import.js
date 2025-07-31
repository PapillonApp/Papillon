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
import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { BadgeX, Info, PlugZap, Undo2 } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import pronote from "pawnote";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/pronote/default-personalization";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import { useAlert } from "@/providers/AlertProvider";
var PronoteV6Import = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var data = route.params.data;
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var _b = React.useState(false), loading = _b[0], setLoading = _b[1];
    var showAlert = useAlert().showAlert;
    var ResetImport = function () {
        navigation.pop();
    };
    var TryLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var session_1, refresh, user, name_1, account, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    setLoading(true);
                    session_1 = pronote.createSessionHandle();
                    return [4 /*yield*/, pronote.loginToken(session_1, {
                            url: data.instanceUrl,
                            kind: pronote.AccountKind.STUDENT,
                            username: data.username,
                            token: data.nextTimeToken,
                            deviceUUID: data.deviceUUID
                        }).catch(function (error) {
                            if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                                navigation.navigate("Pronote2FA_Auth", {
                                    session: session_1,
                                    error: error,
                                    accountID: data.deviceUUID
                                });
                            }
                            else {
                                throw error;
                            }
                        })];
                case 1:
                    refresh = _b.sent();
                    if (!refresh)
                        throw pronote.AuthenticateError;
                    user = session_1.user.resources[0];
                    name_1 = user.name;
                    _a = {
                        instance: session_1,
                        localID: data.deviceUUID,
                        service: AccountService.Pronote,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: name_1,
                        className: user.className,
                        schoolName: user.establishmentName,
                        studentName: {
                            first: extract_pronote_name(name_1).givenName,
                            last: extract_pronote_name(name_1).familyName
                        },
                        authentication: __assign(__assign({}, refresh), { deviceUUID: data.deviceUUID })
                    };
                    return [4 /*yield*/, defaultPersonalization(session_1)];
                case 2:
                    account = (_a.personalization = _b.sent(),
                        _a.identity = {},
                        _a.serviceData = {},
                        _a.providers = [],
                        _a);
                    pronote.startPresenceInterval(session_1);
                    createStoredAccount(account);
                    setLoading(false);
                    switchTo(account);
                    return [4 /*yield*/, AsyncStorage.setItem("pronote:imported", "true")];
                case 3:
                    _b.sent();
                    // We need to wait a tick to make sure the account is set before navigating.
                    queueMicrotask(function () {
                        navigation.pop();
                        // Reset the navigation stack to the "Home" screen.
                        // Prevents the user from going back to the login screen.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "AccountCreated" }],
                        });
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    setLoading(false);
                    showAlert({
                        title: "Impossible de te reconnecter automatiquement",
                        message: "Tu peux cependant te connecter manuellement en indiquant ton identifiant et mot de passe.",
                        icon: <BadgeX />,
                        actions: [
                            {
                                title: "Se connecter manuellement",
                                icon: <PlugZap />,
                                onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                navigation.pop();
                                                return [4 /*yield*/, AsyncStorage.setItem("pronote:imported", "true")];
                                            case 1:
                                                _a.sent();
                                                navigation.navigate("PronoteManualURL", { url: data.instanceUrl });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); },
                                primary: true,
                            },
                            {
                                title: "Annuler",
                                icon: <Undo2 />,
                                onPress: ResetImport,
                                danger: true,
                            }
                        ]
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <NativeList inline>
        <NativeItem icon={<Info />}>
          <NativeText variant="subtitle">
            Il semblerait que tu as déjà utilisé l'application Papillon. Veux-tu importer tes données ?
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem>
          <NativeText variant="subtitle">
            Compte trouvé d'une ancienne installation
          </NativeText>
          <NativeText variant="title">
            {data.username.toUpperCase()}
          </NativeText>
        </NativeItem>
      </NativeList>

      <View style={{
            gap: 9,
            marginTop: 24,
        }}>
        <ButtonCta primary value="Me reconnecter" onPress={function () { return TryLogin(); }} icon={loading ? <ActivityIndicator /> : undefined}/>

        <ButtonCta value="Plus tard" onPress={function () { return ResetImport(); }}/>
      </View>
    </ScrollView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export default PronoteV6Import;
