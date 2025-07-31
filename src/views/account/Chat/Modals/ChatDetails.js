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
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { ChevronDown } from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import InitialIndicator from "@/components/News/InitialIndicator";
import { getProfileColorByName } from "@/services/local/default-personalization";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import GetAvailableThemes from "@/utils/chat/themes/GetAvailableThemes";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChat";
import SetThemeForChatId from "@/utils/chat/themes/SetThemeForChat";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
var ChatDetails = function (_a) {
    var _b, _c;
    var navigation = _a.navigation, route = _a.route;
    var account = useCurrentAccount(function (state) { return state.account; });
    var _d = useState(4), maxRecipientsShow = _d[0], setMaxRecipientsShow = _d[1];
    var _e = useState([]), availableThemes = _e[0], setAvailableThemes = _e[1];
    var _f = useState("default"), actualTheme = _f[0], setActualTheme = _f[1];
    var theme = useTheme();
    var colors = theme.colors;
    var onThemeChange = route.params.onThemeChange;
    var chat = route.params.handle;
    var recipients = route.params.recipients;
    var creatorName = chat.creator === account.name ? chat.recipient : chat.creator;
    useEffect(function () {
        GetAvailableThemes()
            .then(function (themes) {
            setAvailableThemes(themes);
        })
            .catch(function (error) {
            console.error("Error fetching themes:", error);
        });
    }, []);
    useEffect(function () {
        GetThemeForChatId(chat.subject)
            .then(function (theme) {
            setActualTheme(theme.meta.path);
        })
            .catch(function (error) {
            console.error("Error fetching themes:", error);
        });
    }, []);
    var increaseMaxRecipientsShow = function () {
        setMaxRecipientsShow(maxRecipientsShow + 4);
    };
    var updateTheme = function (meta) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setActualTheme(meta.path);
                    return [4 /*yield*/, SetThemeForChatId(chat.subject, meta)];
                case 1:
                    _a.sent();
                    if (onThemeChange)
                        onThemeChange(meta);
                    return [2 /*return*/];
            }
        });
    }); };
    return (<ScrollView>
      <View style={styles.headerContainer}>
        <InitialIndicator initial={recipients.length > 2 ? "group" : parse_initials(creatorName)} color={getProfileColorByName(creatorName).bright} textColor={getProfileColorByName(creatorName).dark} size={55}/>
        <View style={{ alignItems: "center", maxWidth: "80%" }}>
          <NativeText variant="subtitle">{creatorName}</NativeText>
          <NativeText variant="title" numberOfLines={3} style={{ textAlign: "center" }}>{chat.subject}</NativeText>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <NativeList>
          <NativeItem onPress={function () { return navigation.navigate("ChatThemes", {
            handle: chat,
            themes: availableThemes,
            onGoBack: function (selectedThemePath) { return updateTheme(selectedThemePath); },
        }); }}>
            <View style={styles.themeItem}>
              <View style={{ flex: 1, flexDirection: "row", gap: 10, alignItems: "center" }}>
                <Image source={(_b = availableThemes.find(function (theme) { return theme.path === actualTheme; })) === null || _b === void 0 ? void 0 : _b.icon} style={{ width: 35, height: 35, borderRadius: 25 / 2 }}/>
                <View>
                  <NativeText>Thème</NativeText>
                  <NativeText variant="subtitle">{(_c = availableThemes.find(function (theme) { return theme.path === actualTheme; })) === null || _c === void 0 ? void 0 : _c.name}</NativeText>
                </View>
              </View>
            </View>
          </NativeItem>
        </NativeList>
        <NativeListHeader label={"Destinataires (" + recipients.length + ")"}/>
        <NativeList>
          {recipients.slice(0, maxRecipientsShow).map(function (recipient, index) { return (<NativeItem key={index}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                {recipient.name === account.name ? (<Image source={account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== ""
                    ? { uri: account.personalization.profilePictureB64 }
                    : defaultProfilePicture(account.service, "")} style={{ width: 38, height: 38, borderRadius: 38 / 2 }}/>) : (<InitialIndicator initial={parse_initials(recipient.name)} color={getProfileColorByName(recipient.name).bright} textColor={getProfileColorByName(recipient.name).dark} size={38}/>)}
                <NativeText>{recipient.name === account.name ? "".concat(account.studentName.last, " ").concat(account.studentName.first) : recipient.name}</NativeText>
                {recipient.class ? (<View style={[styles.recipientItem, { backgroundColor: colors.primary + "35" }]}>
                    <NativeText color={colors.primary}>{recipient.class}</NativeText>
                  </View>) : null}
              </View>
            </NativeItem>); })}
          {recipients.length > maxRecipientsShow ? (<NativeItem>
              <TouchableOpacity onPress={increaseMaxRecipientsShow}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                  <NativeText variant="title">En afficher plus</NativeText>
                  <ChevronDown color={colors.text}/>
                </View>
              </TouchableOpacity>
            </NativeItem>) : null}
        </NativeList>
      </View>
      <InsetsBottomView />
    </ScrollView>);
};
var styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        alignItems: "center",
        paddingTop: 40,
        gap: 10
    },
    themeItem: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between"
    },
    recipientItem: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5.5,
    }
});
export default ChatDetails;
