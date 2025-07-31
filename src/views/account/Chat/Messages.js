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
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, LogBox, View, ActivityIndicator, Platform, Text, RefreshControl, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeItem, NativeList, NativeText, } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { getChats } from "@/services/chats";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import { AccountService } from "@/stores/account/types";
import { getProfileColorByName } from "@/services/local/default-personalization";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeIn, FadeInDown, FadeOut, } from "react-native-reanimated";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { SquarePen } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { TabLocation } from "pawnote";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { timestampToString } from "@/utils/format/DateHelper";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
// Voir la documentation de `react-navigation`.
//
// Nous sommes dans un cas particulier où l'on a le droit
// de faire transmettre des objets non-sérialisables dans
// le state de navigation.
LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
]);
var Discussions = function (_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var isOnline = useOnlineStatus().isOnline;
    var colors = theme.colors;
    var account = useCurrentAccount(function (state) { return state.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Chats, account.localID) : true;
    var _c = useState(null), chats = _c[0], setChats = _c[1];
    var _d = useState(false), refreshing = _d[0], setRefreshing = _d[1];
    var supported = account.service === AccountService.Pronote || account.service === AccountService.EcoleDirecte;
    var enabled = supported &&
        (account.service === AccountService.Pronote
            ? (_b = account.instance) === null || _b === void 0 ? void 0 : _b.user.authorizations.tabs.includes(TabLocation.Discussions)
            : true);
    useLayoutEffect(function () {
        navigation.setOptions(__assign({}, TabAnimatedTitle({ route: route, navigation: navigation })));
    }, [navigation, route.params, theme.colors.text]);
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchChats()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    var onRefresh = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, fetchChats()];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var fetchChats = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var chats_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!enabled || !supported) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getChats(account)];
                case 2:
                    chats_1 = _a.sent();
                    setChats(chats_1);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error("Erreur lors du chargement des discussions :", e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [enabled, supported]);
    var getChatCreator = useCallback(function (chat) { return chat.creator === account.name ? chat.recipient : chat.creator; }, [account.name]);
    return (<>
      <PapillonHeader route={route} navigation={navigation}>
        {isOnline && supported && enabled && (<TouchableOpacity style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                paddingRight: 8,
            }} onPress={function () { return navigation.navigate("ChatCreate"); }}>
            <NativeText color={theme.colors.primary}>Composer</NativeText>
            <SquarePen color={theme.colors.primary}/>
          </TouchableOpacity>)}
      </PapillonHeader>
      {!supported || !enabled ? (<View style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                padding: 20,
            }}>
          {hasServiceSetup && !supported ? (<MissingItem emoji="🚧" title="Fonctionnalité en construction" description="Cette page est en cours de développement, reviens plus tard." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} style={{ paddingVertical: 26 }}/>) : hasServiceSetup && !enabled && (<MissingItem emoji="💬" title="Discussions désactivées" description="Les discussions ne sont pas activées par ton établissement." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} style={{ paddingVertical: 26 }}/>)}
          {!hasServiceSetup && (<MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷" style={{ marginTop: 16 }}/>)}
        </View>) : (<ScrollView contentContainerStyle={{
                padding: 20,
                paddingTop: 0,
            }} scrollIndicatorInsets={{ top: 42 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
          <PapillonHeaderInsetHeight route={route}/>

          {!isOnline ? (<OfflineWarning cache={false}/>) : !chats ? (<Reanimated.View entering={FadeIn.springify().mass(1).damping(20).stiffness(300)} exiting={Platform.OS === "ios"
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
                Chargement des discussions…
              </Text>
              <Text style={{
                    color: colors.text,
                    fontSize: 16,
                    textAlign: "center",
                    fontFamily: "medium",
                    marginTop: 4,
                    opacity: 0.5,
                }}>
                Tes conversations arrivent…
              </Text>
            </Reanimated.View>) : chats.length === 0 ? (<MissingItem emoji="💬" title="Aucune discussion" description="Commence une nouvelle discussion pour les afficher ici." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} style={{ paddingVertical: 26 }}/>) : (<NativeList>
              {chats.map(function (chat) { return (<NativeItem key={chat.id} onPress={function () { return navigation.navigate("Chat", { handle: chat }); }} leading={<InitialIndicator initial={parse_initials(getChatCreator(chat))} color={getProfileColorByName(getChatCreator(chat)).bright} textColor={getProfileColorByName(getChatCreator(chat)).dark}/>}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    {!chat.read && (<View style={{
                            backgroundColor: getProfileColorByName(getChatCreator(chat))
                                .dark,
                            borderRadius: 5,
                            height: 10,
                            width: 10,
                        }}/>)}
                    <NativeText variant={"subtitle"}>{getChatCreator(chat)}</NativeText>
                  </View>
                  <NativeText>{chat.subject || "Aucun sujet"}</NativeText>
                  <NativeText variant={"subtitle"}>{timestampToString(chat.date.getTime())}</NativeText>
                </NativeItem>); })}
            </NativeList>)}
          <InsetsBottomView />
        </ScrollView>)}
    </>);
};
export default Discussions;
