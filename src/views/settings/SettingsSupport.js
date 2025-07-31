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
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SupportContainerCard from "@/components/Settings/SupportContainerCard";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Check, Mail, Tag, Text, OctagonX } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { get_logs } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";
import { modelName, osName, osVersion } from "expo-device";
import { useCurrentAccount, useAccounts } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import PackageJSON from "../../../package.json";
var SettingsSupport = function (_a) {
    var _b;
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var showAlert = useAlert().showAlert;
    var _c = useState(false), sendLogs = _c[0], setSendLogs = _c[1];
    var _d = useState(), email = _d[0], setEmail = _d[1];
    var _e = useState(), subject = _e[0], setSubject = _e[1];
    var _f = useState(), description = _f[0], setDescription = _f[1];
    var currentAccount = useCurrentAccount(function (store) { return store.account; });
    var AccountType = AccountService[currentAccount.service] !== "Local" && currentAccount.service !== AccountService.PapillonMultiService ? AccountService[currentAccount.service] : currentAccount.identityProvider ? currentAccount.identityProvider.name : "Compte local";
    var cantineAccounts = useAccounts(function (state) {
        return state.accounts.filter(function (acc) {
            return [AccountService.Turboself, AccountService.ARD, AccountService.Izly, AccountService.Alise].includes(acc.service);
        });
    });
    var serviceNames = (_b = {},
        _b[AccountService.Turboself] = "Turboself",
        _b[AccountService.ARD] = "ARD",
        _b[AccountService.Izly] = "Izly",
        _b[AccountService.Alise] = "Alise",
        _b);
    var cantineServices = cantineAccounts
        .map(function (acc) { var _a; return (_a = serviceNames[acc.service]) !== null && _a !== void 0 ? _a : "Inconnu"; })
        .join(", ") || "Aucun";
    var handlePress = function () { return __awaiter(void 0, void 0, void 0, function () {
        var logs, formattedLogs, isValidEmail, data, response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_logs()];
                case 1:
                    logs = _a.sent();
                    formattedLogs = logs
                        .filter(function (log) { return log.type === "ERROR"; })
                        .sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); })
                        .map(function (log) {
                        if (!log.date)
                            return "[".concat(log.type, "] ").concat(log.message);
                        var logDate = new Date(log.date);
                        if (isNaN(logDate.getTime()))
                            return "[".concat(log.type, "] ").concat(log.message);
                        return "[".concat(log.date, "] [").concat(log.type, "] [").concat(log.from, "] ").concat(log.message);
                    })
                        .join("<br>");
                    isValidEmail = function (email) {
                        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(email);
                    };
                    if (!isValidEmail(email !== null && email !== void 0 ? email : "")) {
                        showAlert({
                            title: "Oups, une erreur s'est produite",
                            message: "Ton adresse e-mail n'est pas valide.",
                            icon: <OctagonX />,
                        });
                        return [2 /*return*/];
                    }
                    data = {
                        email: email,
                        title: subject,
                        detail: "<br>\uD83D\uDCAC \uD835\uDDD7\uD835\uDDF2\uD835\uDE00\uD835\uDDF0\uD835\uDDFF\uD835\uDDF6\uD835\uDDFD\uD835\uDE01\uD835\uDDF6\uD835\uDDFC\uD835\uDDFB \uD835\uDDF1\uD835\uDE02 \uD835\uDDFD\uD835\uDDFF\uD835\uDDFC\uD835\uDDEF\uD835\uDDF9\uD835\uDDF2\u0300\uD835\uDDFA\uD835\uDDF2:<br>".concat((description !== null && description !== void 0 ? description : "").replace(/\n/g, "<br>"), " <br><br>\uD83D\uDD12 \uD835\uDDDC\uD835\uDDFB\uD835\uDDF3\uD835\uDDFC\uD835\uDDFF\uD835\uDDFA\uD835\uDDEE\uD835\uDE01\uD835\uDDF6\uD835\uDDFC\uD835\uDDFB\uD835\uDE00 \uD835\uDE00\uD835\uDE02\uD835\uDDFF \uD835\uDDF9'\uD835\uDDEE\uD835\uDDFD\uD835\uDDFD\uD835\uDDEE\uD835\uDDFF\uD835\uDDF2\uD835\uDDF6\uD835\uDDF9:<br>\uD83D\uDCF1 Mod\u00E8le de l'appareil: ").concat(modelName, "<br>\uD83C\uDF10 OS: ").concat(osName, " ").concat(osVersion, "<br>\uD83E\uDD8B Version de Papillon: ").concat(PackageJSON.version, " ").concat(Platform.OS, "<br><br>\u231B \uD835\uDDE6\uD835\uDDF2\uD835\uDDFF\uD835\uDE03\uD835\uDDF6\uD835\uDDF0\uD835\uDDF2\uD835\uDE00 \uD835\uDE02\uD835\uDE01\uD835\uDDF6\uD835\uDDF9\uD835\uDDF6\uD835\uDE00\uD835\uDDF2\u0301\uD835\uDE00:<br>\u26A1 Service scolaire: ").concat(AccountType, "<br>\uD83C\uDF74 Service de cantine: ").concat(cantineServices, "<br><br>\u274C \uD835\uDDDD\uD835\uDDFC\uD835\uDE02\uD835\uDDFF\uD835\uDDFB\uD835\uDDEE\uD835\uDE02\uD835\uDE05 \uD835\uDDF1'\uD835\uDDF2\uD835\uDDFF\uD835\uDDFF\uD835\uDDF2\uD835\uDE02\uD835\uDDFF\uD835\uDE00: <br>").concat(formattedLogs, "<br>"),
                    };
                    return [4 /*yield*/, fetch("https://api-menthe-et-cristaux.papillon.bzh/api/v1/ticket/public/create", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    setSubject("");
                    setEmail("");
                    setDescription("");
                    setSendLogs(false);
                    showAlert({
                        title: "Merci de ton retour !",
                        message: "Nous avons reçu ta demande et allons la regarder avec la plus grande attention.",
                        icon: <Check />,
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    return (<KeyboardAvoidingView behavior="height" keyboardVerticalOffset={insets.top + 64} style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            overflow: "visible",
        }}>
      <ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: insets.bottom + 16,
        }}>
        <SupportContainerCard theme={theme}/>
        <NativeListHeader label="Formulaire"/>
        <NativeList>
          <NativeItem icon={<Mail />}>
            <NativeText variant="subtitle">Adresse e-mail</NativeText>
            <TextInput style={[{
                fontSize: 16,
                fontFamily: "semibold",
            }, { color: theme.colors.text }]} placeholder="exemple@acme.inc" autoCapitalize="none" autoCorrect={false} placeholderTextColor={theme.colors.text + "80"} value={email} onChangeText={setEmail}/>
          </NativeItem>
          <NativeItem icon={<Tag />}>
            <NativeText variant="subtitle">Sujet</NativeText>
            <TextInput style={[{
                fontSize: 16,
                fontFamily: "semibold",
            }, { color: theme.colors.text }]} placeholder="Fais court, mais fais bien" placeholderTextColor={theme.colors.text + "80"} value={subject} multiline={false} onChangeText={setSubject}/>
          </NativeItem>
          <NativeItem icon={<Text />}>
            <NativeText variant="subtitle">Description</NativeText>
            <TextInput style={[{
                fontSize: 16,
                lineHeight: 22,
                marginVertical: -4,
                fontFamily: "semibold",
            }, { color: theme.colors.text }]} placeholder="Expliquez votre problème de manière détaillée afin de nous aider à résoudre le problème rapidement." placeholderTextColor={theme.colors.text + "80"} value={description} multiline={true} onChangeText={setDescription}/>
          </NativeItem>
        </NativeList>
        <NativeListHeader label="Consentement"/>
        <NativeList>
          <NativeItem leading={<PapillonCheckbox checked={sendLogs} onPress={function () {
                setSendLogs(!sendLogs);
            }}/>}>
            <NativeText>J’accepte de transmettre le modèle et la version de mon appareil, les services connectés ainsi que les données du formulaire pour le traitement de ma demande</NativeText>
          </NativeItem>
        </NativeList>
        <View style={{ paddingVertical: 20 }}>
          <ButtonCta primary value={"Envoyer mon message"} disabled={!(email && subject && description && sendLogs)} onPress={function () { return handlePress(); }}/>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>);
};
// Styles
var styles = StyleSheet.create({
    title: {
        color: "#222222",
        fontSize: 15,
    },
    time: {
        color: "#3F3F3F",
        opacity: 0.5,
        textAlign: "right",
        fontFamily: "sfmedium",
        fontSize: 13,
        marginRight: 10,
    },
    message: {
        color: "#3F3F3F",
        fontFamily: "sfmedium",
        fontSize: 14,
        maxWidth: "85%",
        minWidth: "85%",
        lineHeight: 15,
        letterSpacing: -0.4,
    },
    overlay: {
        backgroundColor: "#EEF5F5",
        borderWidth: 1,
        borderColor: "#00000030",
        borderRadius: 20,
        height: 25,
        padding: 9,
        marginHorizontal: 20,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    }
});
export default SettingsSupport;
