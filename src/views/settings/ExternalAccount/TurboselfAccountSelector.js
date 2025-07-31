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
import React, { useState } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { NativeText } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import Reanimated, { FlipInXDown, LinearTransition } from "react-native-reanimated";
import { AccountService } from "@/stores/account/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import uuid from "@/utils/uuid-v4";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { authenticateWithCredentials } from "turboself-api";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowRightFromLine, BadgeHelp, BadgeX, Undo2 } from "lucide-react-native";
var TurboselfAccountSelector = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var linkExistingExternalAccount = useCurrentAccount(function (store) { return store.linkExistingExternalAccount; });
    var create = useAccounts(function (store) { return store.create; });
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var account = route.params.accounts;
    var username = route.params.username;
    var password = route.params.password;
    var _c = useState(account[0].id), choosenHostId = _c[0], setChoosenHostId = _c[1];
    var showAlert = useAlert().showAlert;
    var handleLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var session, new_account, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, authenticateWithCredentials(username, password, true, false, choosenHostId)];
                case 1:
                    session = _a.sent();
                    new_account = {
                        instance: undefined,
                        service: AccountService.Turboself,
                        username: username,
                        authentication: {
                            session: session,
                            username: username,
                            password: password
                        },
                        isExternal: true,
                        localID: uuid(),
                        data: {}
                    };
                    create(new_account);
                    linkExistingExternalAccount(new_account);
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        showAlert({
                            title: "Erreur",
                            message: error_1.message,
                            icon: <BadgeX />,
                        });
                    }
                    else {
                        showAlert({
                            title: "Erreur",
                            message: "Une erreur est survenue lors de la connexion.",
                            icon: <BadgeX />,
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<TouchableWithoutFeedback onPress={function () { return Keyboard.dismiss(); }}>
      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={insets.top + 64} style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            overflow: "visible",
        }}>
        <SafeAreaView style={styles.container}>
          <PapillonShineBubble message={loading ? "Chargement en cours..." : "Tu as plusieurs comptes TurboSelf, choisis le tien :"} width={270} numberOfLines={loading ? 1 : 2} offsetTop={insets.top}/>
          <View style={{
            padding: 10,
            gap: 10
        }}>
            {account.map(function (item, index) { return (<Reanimated.View style={{ width: "100%" }} layout={LinearTransition} entering={FlipInXDown.springify().delay(200)}>
                <DuoListPressable text={"".concat(item.firstName, " ").concat(item.lastName, " (").concat(item.division, ")")} enabled={choosenHostId === item.id} onPress={function () { return setChoosenHostId(item.id); }}/>
              </Reanimated.View>); })}
          </View>
          <NativeText style={{
            width: "100%",
            paddingHorizontal: 16,
            fontSize: 14,
            color: colors.text + "55",
            textAlign: "center",
        }}>
            Papillon ne donnera jamais tes informations d'authentification à des tiers.
          </NativeText>

          <View style={styles.buttons}>
            <ButtonCta primary value="Continuer" disabled={choosenHostId === 0} onPress={function () { return handleLogin(); }}/>
            <ButtonCta primary={false} value="Annuler" disabled={loading} onPress={function () {
            showAlert({
                title: "Annuler",
                message: "Veux-tu vraiment annuler la connexion ?",
                icon: <BadgeHelp />,
                actions: [
                    {
                        title: "Continuer la connexion",
                        icon: <ArrowRightFromLine />,
                        primary: false,
                    },
                    {
                        title: "Confirmer",
                        icon: <Undo2 />,
                        onPress: function () { return navigation.pop(); },
                        danger: true,
                    }
                ]
            });
        }}/>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    list: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    image: {
        width: 32,
        height: 32,
        borderRadius: 80,
    },
});
export default TurboselfAccountSelector;
