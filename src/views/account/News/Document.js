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
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import formatDate from "@/utils/format/format_date_complets";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Check, Eye, EyeOff, FileIcon, Link, MoreHorizontal, WifiOff, } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import HTMLView from "react-native-htmlview";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { LinearGradient } from "expo-linear-gradient";
import { setNewsRead } from "@/services/news";
import { useCurrentAccount } from "@/stores/account";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { AttachmentType } from "@/services/shared/Attachment";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { newsInformationAcknowledge } from "pawnote";
import { AccountService } from "@/stores/account/types";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAlert } from "@/providers/AlertProvider";
var NewsItem = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = useState(JSON.parse(route.params.message)), message = _b[0], setMessage = _b[1];
    var important = route.params.important;
    var isED = route.params.isED;
    var account = useCurrentAccount(function (store) { return store.account; });
    var isOnline = useOnlineStatus().isOnline;
    var showAlert = useAlert().showAlert;
    var theme = useTheme();
    var stylesText = StyleSheet.create({
        body: {
            fontFamily: "medium",
            fontSize: 16,
            lineHeight: 22,
            color: theme.colors.text,
        },
        a: {
            color: theme.colors.primary,
            textDecorationColor: theme.colors.primary,
            textDecorationLine: "underline",
        },
    });
    useLayoutEffect(function () {
        navigation.setOptions({
            headerTitle: message.title,
        });
    }, [navigation, message.title]);
    useEffect(function () {
        if (account.instance) {
            setNewsRead(account, message, true);
            setMessage(function (prev) { return (__assign(__assign({}, prev), { read: true })); });
        }
    }, [account.instance]);
    var tagsStyles = {
        body: {
            color: theme.colors.text,
        },
        a: {
            color: theme.colors.primary,
            textDecorationColor: theme.colors.primary,
        },
    };
    function onPress(event, href) {
        Linking.openURL(href);
    }
    var renderersProps = {
        a: {
            onPress: onPress,
        },
    };
    return (<View style={{ flex: 1 }}>
      <PapillonModernHeader native height={110} outsideNav={true}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{ flex: 1, gap: 3 }}>
            <NativeText variant="title" numberOfLines={1}>{message.title === "" ? message.author : message.title}</NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>{message.title === "" ? formatDate(message.date.toString()) : message.author}</NativeText>
          </View>
          {!isED && (<PapillonPicker animated direction="right" delay={0} data={[
                {
                    icon: message.read ? <EyeOff /> : <Eye />,
                    label: message.read
                        ? "Marquer comme non lu"
                        : "Marquer comme lu",
                    onPress: function () {
                        if (isOnline) {
                            setNewsRead(account, message, !message.read);
                            setMessage(function (prev) { return (__assign(__assign({}, prev), { read: !prev.read })); });
                        }
                        else {
                            showAlert({
                                title: "Information",
                                message: "Tu es hors ligne. Vérifie ta connexion Internet et réessaie",
                                icon: <WifiOff />,
                                actions: [
                                    {
                                        title: "OK",
                                        icon: <Check />,
                                    },
                                ],
                            });
                        }
                    },
                },
            ]}>
              <TouchableOpacity>
                <MoreHorizontal size={24} color={theme.colors.text}/>
              </TouchableOpacity>
            </PapillonPicker>)}
        </View>
      </PapillonModernHeader>
      {important && (<LinearGradient colors={!theme.dark
                ? [theme.colors.card, "#BFF6EF"]
                : [theme.colors.card, "#2C2C2C"]} start={[0, 0]} end={[2, 2]} style={{
                flex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                opacity: 0.75,
            }}/>)}
      <ScrollView style={{
            flex: 1,
            paddingTop: 106 - 16,
            backgroundColor: theme.colors.background,
        }}>
        <View style={{
            paddingHorizontal: 16,
        }}>

          {account.service === AccountService.Pronote && message.ref.needToAcknowledge ? (<NativeList inline style={{
                marginBottom: 16,
            }}>
              <NativeItem leading={<PapillonCheckbox checked={message.acknowledged} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(!message.acknowledged && account.instance)) return [3 /*break*/, 3];
                                if (!isOnline) return [3 /*break*/, 2];
                                return [4 /*yield*/, newsInformationAcknowledge(account.instance, message.ref)];
                            case 1:
                                _a.sent();
                                setMessage(function (prev) { return (__assign(__assign({}, prev), { read: true, acknowledged: true })); });
                                return [3 /*break*/, 3];
                            case 2:
                                showAlert({
                                    title: "Information",
                                    message: "Tu es hors ligne. Vérifie ta connexion Internet et réessaie",
                                    icon: <WifiOff />,
                                    actions: [
                                        {
                                            title: "OK",
                                            icon: <Check />,
                                        },
                                    ],
                                });
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }} color={theme.colors.primary}/>}>
                <NativeText variant="body">
                  J'ai lu et pris connaissance
                </NativeText>
                <NativeText variant="subtitle">
                  Tu confirmes avoir lu et ton établissement peut en être notifié.
                </NativeText>
              </NativeItem>
            </NativeList>) : (<View style={{ marginBottom: 16 }}/>)}


          <HTMLView value={"<body>".concat(message.content.replaceAll("<p>", "").replaceAll("</p>", ""), "</body>")} stylesheet={stylesText}/>
        </View>

        {isED && <ScrollView horizontal={true} contentContainerStyle={{ gap: 5, paddingHorizontal: 16 }}>
          <View style={{
                padding: 4,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 80,
                borderColor: theme.colors.border,
                marginTop: 16,
            }}>
            <NativeText>{message.category}</NativeText>
          </View>
          <View style={{
                padding: 4,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 80,
                borderColor: theme.colors.border,
                marginTop: 16,
            }}>
            <NativeText>{formatDate(message.date.toString())}</NativeText>
          </View>
        </ScrollView>}

        {message.attachments.length > 0 && (<View style={{ paddingHorizontal: 16 }}>
            <NativeListHeader label="Pièces jointes"/>
            <NativeList>
              {message.attachments.map(function (attachment, index) { return (<NativeItem key={index} chevron={false} onPress={function () { return Linking.openURL(attachment.url); }} icon={attachment.type === AttachmentType.File ? (<FileIcon />) : (<Link />)}>
                  <NativeText variant="title" numberOfLines={1}>
                    {attachment.name}
                  </NativeText>
                  <NativeText variant="subtitle" numberOfLines={1}>
                    {attachment.url}
                  </NativeText>
                </NativeItem>); })}
            </NativeList>
          </View>)}

        <InsetsBottomView />
        <InsetsBottomView />
        <InsetsBottomView />
      </ScrollView>
    </View>);
};
export default NewsItem;
