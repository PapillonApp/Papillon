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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator, Platform, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { createDiscussion, createDiscussionRecipients } from "@/services/chats";
import { BadgeHelp, PenTool, Send, Tag, Undo2 } from "lucide-react-native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { getProfileColorByName } from "@/services/local/default-personalization";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var ChatCreate = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var account = useCurrentAccount(function (state) { return state.account; });
    var _b = useState(null), recipients = _b[0], setRecipients = _b[1];
    var _c = useState([]), selectedRecipients = _c[0], setSelectedRecipients = _c[1];
    var _d = useState(""), subject = _d[0], setSubject = _d[1];
    var _e = useState(""), content = _e[0], setContent = _e[1];
    var _f = useState(true), loading = _f[0], setLoading = _f[1];
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                var recipients;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, createDiscussionRecipients(account)];
                        case 1:
                            recipients = _a.sent();
                            setSelectedRecipients([]);
                            setRecipients(recipients);
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }();
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    var toggleRecipientSelection = function (recipient) {
        if (selectedRecipients.includes(recipient)) {
            setSelectedRecipients(selectedRecipients.filter(function (r) { return r !== recipient; }));
            return;
        }
        setSelectedRecipients(__spreadArray(__spreadArray([], selectedRecipients, true), [
            recipient,
        ], false));
    };
    var showAlert = useAlert().showAlert;
    return (<View style={styles.container}>
      <ScrollView contentContainerStyle={{
            padding: 20,
            paddingBottom: 150
        }} showsVerticalScrollIndicator={false}>
        <NativeListHeader label="Sujet et contenu"/>
        <NativeList>
          <NativeItem chevron={false} icon={<Tag />}>
            <NativeText variant="subtitle">Sujet</NativeText>
            <ResponsiveTextInput style={[styles.textInput, { color: theme.colors.text }]} placeholder="Sujet de ton message" placeholderTextColor={theme.colors.text + "80"} value={subject} onChangeText={setSubject}/>
          </NativeItem>
          <NativeItem chevron={false} icon={<PenTool />}>
            <NativeText variant="subtitle">Contenu</NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Entre ton texte" placeholderTextColor={theme.colors.text + "80"} value={content} multiline={true} onChangeText={setContent}/>
          </NativeItem>
        </NativeList>
        <NativeListHeader label="Destinataire(s)"/>
        {loading ? (<Reanimated.View entering={FadeIn.springify().mass(1).damping(20).stiffness(300)} exiting={Platform.OS === "ios"
                ? FadeOut.springify().mass(1).damping(20).stiffness(300)
                : undefined} style={{
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 50,
            }}>
            <ActivityIndicator size={"large"}/>

            <NativeText style={{
                color: colors.text,
                fontSize: 18,
                textAlign: "center",
                fontFamily: "semibold",
                marginTop: 10,
            }}>
              Chargement des destinataires...
            </NativeText>

            <NativeText style={{
                color: colors.text,
                fontSize: 16,
                textAlign: "center",
                fontFamily: "medium",
                marginTop: 4,
                opacity: 0.5,
            }}>
              Ça ne devrait pas prendre longtemps...
            </NativeText>
          </Reanimated.View>) : (<NativeList>
            {recipients &&
                recipients.map(function (recipient) { return (<NativeItem key={recipient.name} title={recipient.name} subtitle={recipient.subject} leading={<InitialIndicator initial={parse_initials(recipient.name)} color={getProfileColorByName(recipient.name).bright} textColor={getProfileColorByName(recipient.name).dark} size={38}/>} trailing={<PapillonCheckbox style={{ marginRight: 10 }} checked={selectedRecipients.includes(recipient)} color={getProfileColorByName(recipient.name).dark} onPress={function () { return toggleRecipientSelection(recipient); }}/>}/>); })}
          </NativeList>)}
      </ScrollView>
      <View style={[styles.fixedButtonContainer, { backgroundColor: colors.background }]}>
        <ButtonCta primary value={"Créer la discussion"} disabled={!(content && selectedRecipients.length > 0)} onPress={function () {
            if (!subject) {
                showAlert({
                    title: "Veux-tu continuer sans objet ?",
                    message: "Tu es sur le point de créer une discussion sans objet. Veux-tu continuer ?",
                    icon: <BadgeHelp />,
                    actions: [
                        {
                            title: "Annuler",
                            icon: <Undo2 />,
                            primary: false,
                            backgroundColor: theme.colors.primary,
                        },
                        {
                            title: "Continuer",
                            icon: <Send />,
                            onPress: function () {
                                createDiscussion(account, "Aucun objet", content, selectedRecipients);
                                navigation.goBack();
                            },
                        }
                    ]
                });
            }
            else {
                createDiscussion(account, subject, content, selectedRecipients);
                navigation.goBack();
            }
        }}/>
        <InsetsBottomView />
      </View>
    </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    button: {
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    textInput: {
        fontSize: 16,
        fontFamily: "semibold",
    }
});
export default ChatCreate;
