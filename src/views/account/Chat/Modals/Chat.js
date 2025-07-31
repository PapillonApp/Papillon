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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useRef, useState } from "react";
import { Image, ActivityIndicator, FlatList, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { ChevronLeft, Send } from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import InitialIndicator from "@/components/News/InitialIndicator";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HTMLView from "react-native-htmlview";
import Reanimated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { AccountService } from "@/stores/account/types";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import { getProfileColorByName } from "@/services/local/default-personalization";
import { getChatMessages, sendMessageInChat, getChatRecipients } from "@/services/chats";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChat";
import { AttachmentType } from "@/services/shared/Attachment";
import { AutoFileIcon } from "@/components/Global/FileIcon";
import LinkFavicon from "@/components/Global/LinkFavicon";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var Chat = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var stylesText = StyleSheet.create({
        body: {
            color: colors.text,
            fontFamily: "medium",
            fontSize: 16,
            lineHeight: 22,
        },
        a: {
            textDecorationLine: "underline",
        },
    });
    var stylesTextAuthor = StyleSheet.create({
        body: {
            color: "#FFF",
            fontFamily: "medium",
            fontSize: 16,
            lineHeight: 22
        },
        a: {
            textDecorationLine: "underline",
        },
    });
    var account = useCurrentAccount(function (state) { return state.account; });
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var _c = useState(""), text = _c[0], setText = _c[1];
    var _d = useState([]), recipients = _d[0], setRecipients = _d[1];
    var _e = useState(), chatTheme = _e[0], setActualTheme = _e[1];
    var _f = useState(false), disabled = _f[0], setDisabled = _f[1];
    useEffect(function () {
        setDisabled(text.trim() === "" || account.service === AccountService.EcoleDirecte);
    }, [text, account.service]);
    var creatorName = route.params.handle.creator === account.name ? route.params.handle.recipient : route.params.handle.creator;
    var backgroundImage = theme.dark
        ? { uri: "".concat(chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.chatBackgroundImage) }
        : { uri: "".concat(chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.chatBackgroundImage) };
    var openUrl = function (url) {
        if (account.service === AccountService.EcoleDirecte &&
            Platform.OS === "ios") {
            navigation.goBack();
            getAndOpenFile(account, url);
        }
        else {
            WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
                controlsColor: theme.colors.primary,
            });
        }
    };
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var messages, recipients, theme;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getChatMessages(account, route.params.handle)];
                    case 1:
                        messages = _a.sent();
                        return [4 /*yield*/, getChatRecipients(account, route.params.handle)];
                    case 2:
                        recipients = _a.sent();
                        return [4 /*yield*/, GetThemeForChatId(route.params.handle.subject)];
                    case 3:
                        theme = _a.sent();
                        setMessages(messages);
                        setRecipients(recipients);
                        setActualTheme(theme);
                        setTimeout(function () {
                            var _a;
                            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true });
                        }, 100);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [route.params.handle]);
    var flatListRef = useRef(null);
    useEffect(function () {
        if (messages.length > 0 && flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, flatListRef.current]);
    return (<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {messages[0] ? (<>
          <PapillonModernHeader height={130} outsideNav={true} tint={theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.headerBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.headerBackgroundColor}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <TouchableOpacity onPress={function () { return navigation.goBack(); }}>
                <ChevronLeft color={(theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.headerTextColor : (chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.headerTextColor) + "80")} size={26}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={function () { return navigation.navigate("ChatDetails", {
                handle: route.params.handle,
                recipients: recipients,
                onThemeChange: function (updatedTheme) { return __awaiter(void 0, void 0, void 0, function () {
                    var theme;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, GetThemeForChatId(route.params.handle.subject)];
                            case 1:
                                theme = _a.sent();
                                setActualTheme(theme);
                                return [2 /*return*/];
                        }
                    });
                }); }
            }); }} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <InitialIndicator initial={recipients.length > 2 ? "group" : parse_initials(creatorName)} color={getProfileColorByName(creatorName).bright} textColor={getProfileColorByName(creatorName).dark} size={38}/>
                <View style={{ flex: 1 }}>
                  <NativeText variant="subtitle" color={theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.headerTextColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.headerTextColor}>
                    {route.params.handle.subject ? creatorName : "Conversation avec"}
                  </NativeText>
                  <NativeText variant="title" numberOfLines={1} style={{
                maxWidth: 250
            }} color={theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.headerTextColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.headerTextColor}>
                    {route.params.handle.subject || creatorName}
                  </NativeText>
                </View>
              </TouchableOpacity>
            </View>
          </PapillonModernHeader>
          <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
            <FlatList ref={flatListRef} data={__spreadArray([], messages, true)} keyExtractor={function (item, index) { return index.toString(); }} contentContainerStyle={{
                padding: 16,
                paddingTop: 120
            }} style={{
                flex: 1,
                backgroundColor: (chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.chatBackgroundImage)
                    ? undefined
                    : theme.dark
                        ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.chatBackgroundColor
                        : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.chatBackgroundColor,
            }} renderItem={function (_a) {
                var _b;
                var item = _a.item, index = _a.index;
                var isFirst = index === 0 || messages[index - 1].author !== item.author;
                var isMiddle = (_b = (messages[index - 1] && messages[index + 1] && messages[index - 1].author === item.author && messages[index + 1].author === item.author)) !== null && _b !== void 0 ? _b : false;
                var isLast = (index === messages.length - 1 || messages[index + 1] && messages[index + 1].author !== item.author);
                var authorIsUser = item.author === account.name;
                var borderStyle = {
                    borderTopLeftRadius: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                    borderTopRightRadius: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                    borderBottomLeftRadius: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                    borderBottomRightRadius: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                };
                if (isFirst && !isLast) {
                    borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderRadiusLinked;
                }
                if (isMiddle) {
                    borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderRadiusLinked;
                    borderStyle.borderTopLeftRadius = theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderRadiusLinked;
                }
                if (isLast && !isFirst) {
                    borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageborderRadiusDefault;
                    borderStyle.borderTopLeftRadius = theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderRadiusLinked;
                }
                if (authorIsUser) {
                    borderStyle = __assign(__assign({}, borderStyle), { borderTopLeftRadius: borderStyle.borderTopRightRadius, borderTopRightRadius: borderStyle.borderTopLeftRadius, borderBottomLeftRadius: borderStyle.borderBottomRightRadius, borderBottomRightRadius: borderStyle.borderBottomLeftRadius });
                }
                return (<View style={{ gap: 10 }}>
                    {!isFirst ? null : (<View style={{ flex: 1, flexDirection: item.author === account.name ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
                        {authorIsUser ? (<Image source={account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== ""
                                ? { uri: account.personalization.profilePictureB64 }
                                : defaultProfilePicture(account.service, "")} style={{ width: 25, height: 25, borderRadius: 25 / 2 }}/>) : (<InitialIndicator initial={parse_initials(item.author)} color={getProfileColorByName(item.author).bright} textColor={getProfileColorByName(item.author).dark} size={25}/>)}
                        <NativeText variant="subtitle">{authorIsUser ? "".concat(account.studentName.last, " ").concat(account.studentName.first) : item.author}</NativeText>
                        <View style={{ width: 5, height: 5, backgroundColor: colors.text + "65", borderRadius: 5 }}/>
                        <NativeText variant="subtitle">
                          {item.date.toLocaleString("fr-FR", {
                            hour12: false,
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        </NativeText>
                      </View>)}
                    <View style={__assign(__assign({ marginBottom: 10, padding: 15, backgroundColor: authorIsUser ? theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sentMessageBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sentMessageBackgroundColor : theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBackgroundColor, borderColor: authorIsUser ? theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sentMessageBorderColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sentMessageBorderColor : theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderColor, borderWidth: authorIsUser ? theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sentMessageBorderSize : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sentMessageBorderSize : theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.receivedMessageBorderSize : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.receivedMessageBorderSize, alignSelf: authorIsUser ? "flex-end" : "flex-start" }, borderStyle), { gap: 5, position: "relative", maxWidth: "87%" })}>
                      {item.content.trim() !== "" && (<HTMLView value={"<body>".concat(item.content.replaceAll(/<\/?font[^>]*>/g, ""), "</body>")} stylesheet={authorIsUser ? stylesTextAuthor : stylesText} onLinkPress={function (url) { return openUrl(url); }}/>)}
                      {item.attachments && item.attachments.length > 0 && (<View style={{
                            marginTop: 10,
                            gap: 12,
                        }}>
                          {item.attachments.map(function (attachment) { return (<TouchableOpacity onPress={function () { return openUrl(attachment.url); }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, maxWidth: "90%" }}>
                                <View>
                                  {attachment.type === AttachmentType.File ? (<AutoFileIcon filename={attachment.name} size={28} color={colors.text} opacity={0.7}/>) : (<LinkFavicon size={28} url={attachment.url}/>)}
                                </View>
                                <View style={{
                                gap: 2,
                            }}>
                                  <NativeText>{attachment.name}</NativeText>
                                  <NativeText variant="subtitle" numberOfLines={1}>{attachment.url}</NativeText>
                                </View>
                              </View>
                            </TouchableOpacity>); })}
                        </View>)}
                      {isLast && authorIsUser && (<View style={{ position: "absolute", bottom: 2, right: 0, zIndex: 10, pointerEvents: "none" }}>
                          <View style={{
                            width: 17,
                            height: 17,
                            backgroundColor: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sentMessageBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sentMessageBackgroundColor,
                            borderRadius: 15,
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                        }}/>

                          <View style={{
                            width: 8,
                            height: 8,
                            backgroundColor: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sentMessageBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sentMessageBackgroundColor,
                            borderRadius: 15,
                            position: "absolute",
                            bottom: -7,
                            right: -7,
                        }}/>
                        </View>)}
                    </View>
                  </View>);
            }} ListEmptyComponent={function () { return (<MissingItem emoji="💬" title="C'est le début de la conversation" description="Envoie un message pour commencer la discussion." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} style={{ paddingVertical: 26 }}/>); }}/>
            <View style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderTopWidth: 0.5,
                borderTopColor: colors.text + "22",
                backgroundColor: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.inputBarBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.inputBarBackgroundColor,
                flexDirection: "row",
                alignItems: "flex-start",
            }}>

              <ResponsiveTextInput placeholder={"Envoyer un message à " + creatorName} placeholderTextColor={colors.text + "60"} style={{
                backgroundColor: "transparent",
                borderRadius: 25,
                flex: 1,
                marginRight: 10,
                fontSize: 16,
                color: colors.text,
                fontFamily: "medium",
            }} multiline={true} onChangeText={function (text) { return setText(text); }} value={text}/>
              <View style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end",
            }}>
                <TouchableOpacity style={{
                backgroundColor: disabled ? colors.text + "70" : theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.sendButtonBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.sendButtonBackgroundColor,
                width: 56,
                height: 40,
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                marginTop: -5
            }} onPress={function () {
                sendMessageInChat(account, route.params.handle, text);
            }} disabled={disabled}>
                  <Send color={disabled ? "#FFFFFF90" : "#FFF"} size={24} style={{ marginTop: 1, marginLeft: -3 }}/>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: insets.bottom, backgroundColor: theme.dark ? chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.darkModifier.inputBarBackgroundColor : chatTheme === null || chatTheme === void 0 ? void 0 : chatTheme.lightModifier.inputBarBackgroundColor }}></View>
          </ImageBackground>
        </>) : (<Reanimated.View entering={FadeIn.springify().mass(1).damping(20).stiffness(300)} exiting={Platform.OS === "ios"
                ? FadeOut.springify().mass(1).damping(20).stiffness(300)
                : undefined} style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 26,
            }}>
          <ActivityIndicator size={"large"}/>

          <Text style={{
                color: colors.text,
                fontSize: 18,
                textAlign: "center",
                fontFamily: "semibold",
                marginTop: 10,
            }}>
            Chargement des discussions...
          </Text>

          <Text style={{
                color: colors.text,
                fontSize: 16,
                textAlign: "center",
                fontFamily: "medium",
                marginTop: 4,
                opacity: 0.5,
            }}>
            Tes conversations arrivent...
          </Text>
        </Reanimated.View>)}
    </KeyboardAvoidingView>);
};
export default Chat;
