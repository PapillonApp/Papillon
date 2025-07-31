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
import React, { useState, useEffect } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { NativeText, } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { tokenize } from "ezly";
import { AccountService } from "@/stores/account/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import uuid from "@/utils/uuid-v4";
import * as Linking from "expo-linking";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX } from "lucide-react-native";
var IzlyActivation = function (_a) {
    var _b, _c;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var linkExistingExternalAccount = useCurrentAccount(function (store) { return store.linkExistingExternalAccount; });
    var create = useAccounts(function (store) { return store.create; });
    var _d = useState(false), loading = _d[0], setLoading = _d[1];
    var secret = (_b = route.params) === null || _b === void 0 ? void 0 : _b.password;
    var username = (_c = route.params) === null || _c === void 0 ? void 0 : _c.username;
    var showAlert = useAlert().showAlert;
    useEffect(function () {
        var handleDeepLink = function (event) {
            var url = event.url;
            var scheme = url.split(":")[0];
            if (scheme === "izly") {
                console.log("[IzlyActivation] Activation link received:", url);
                handleActivation(url);
            }
            else {
                console.log("[IzlyActivation] Ignoring link:", url);
            }
        };
        Linking.getInitialURL().then(function (url) {
            if (url) {
                handleDeepLink({ url: url });
            }
        });
        Linking.addEventListener("url", handleDeepLink);
    }, []);
    var handleActivation = function (activationLink) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, identification, configuration, new_account, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    Keyboard.dismiss();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, tokenize(activationLink)];
                case 2:
                    _a = _b.sent(), identification = _a.identification, configuration = _a.configuration;
                    new_account = {
                        service: AccountService.Izly,
                        username: username,
                        instance: identification,
                        authentication: {
                            secret: secret,
                            identification: identification,
                            configuration: configuration
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
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
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
                            message: "Une erreur est survenue lors de l'activation.",
                            icon: <BadgeX />,
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
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
          <PapillonShineBubble message={loading ? "Activation en cours..." : "Tu viens de recevoir un lien par SMS, peux tu me cliquer sur le lien pour activer ton compte ?"} width={270} numberOfLines={loading ? 1 : 3} offsetTop={insets.top}/>

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
            <ButtonCta value="Annuler" disabled={loading} onPress={function () {
            Alert.alert("Annuler", "Veux-tu vraiment annuler l'activation ?", [
                {
                    text: "Continuer",
                    style: "cancel",
                },
                {
                    text: "Annuler l'activation",
                    onPress: function () { return navigation.pop(); },
                    style: "destructive",
                },
            ]);
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
export default IzlyActivation;
