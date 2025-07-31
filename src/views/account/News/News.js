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
import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, FlatList, View } from "react-native";
import { updateNewsInCache } from "@/services/news";
import { useNewsStore } from "@/stores/news";
import { useCurrentAccount } from "@/stores/account";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { RefreshControl } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "@/components/News/Beta";
import NewsListItem from "./Atoms/Item";
import Reanimated, { FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { animPapillon } from "@/utils/ui/animations";
import { categorizeMessages } from "@/utils/magic/categorizeMessages";
import { protectScreenComponent } from "@/router/helpers/protected-screen";
import MissingItem from "@/components/Global/MissingItem";
import { AccountService } from "@/stores/account/types";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var NewsScreen = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var account = useCurrentAccount(function (store) { return store.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.News, account.localID) : true;
    var informations = useNewsStore(function (store) { return store.informations; });
    var _b = useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState([]), importantMessages = _c[0], setImportantMessages = _c[1];
    var _d = useState([]), sortedMessages = _d[0], setSortedMessages = _d[1];
    var _e = useState(false), isED = _e[0], setIsED = _e[1];
    var isOnline = useOnlineStatus().isOnline;
    useEffect(function () {
        if (!isOnline && isLoading) {
            setIsLoading(false);
        }
    }, [isOnline, isLoading]);
    var fetchData = useCallback(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (hidden) {
            if (hidden === void 0) { hidden = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!hidden)
                            setIsLoading(true);
                        return [4 /*yield*/, updateNewsInCache(account)];
                    case 1:
                        _a.sent();
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        });
    }, [account]);
    useEffect(function () {
        if (account.service === AccountService.EcoleDirecte)
            setIsED(true);
        if (sortedMessages.length === 0) {
            navigation.addListener("focus", function () { return fetchData(true); });
            fetchData();
        }
    }, [account.instance]);
    useEffect(function () {
        if (informations) {
            if (account.personalization.MagicNews) {
                var _a = categorizeMessages(informations), importantMessages_1 = _a.importantMessages, normalMessages = _a.normalMessages;
                setImportantMessages(importantMessages_1.map(function (message) { return (__assign(__assign({}, message), { date: message.date.toString() })); }));
                setSortedMessages(normalMessages
                    .map(function (message) { return (__assign(__assign({}, message), { date: message.date.toString(), important: false })); })
                    .sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); }));
            }
            else {
                setImportantMessages([]);
                setSortedMessages(informations
                    .map(function (info) { return (__assign(__assign({}, info), { date: info.date.toString(), title: info.title || "", important: false })); })
                    .sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); }));
            }
        }
    }, [informations, account.personalization.MagicNews]);
    var renderItem = useCallback(function (_a) {
        var item = _a.item, index = _a.index;
        return (<NewsListItem key={index} index={index} message={item} navigation={navigation} parentMessages={sortedMessages} isED={account.service == AccountService.EcoleDirecte}/>);
    }, [navigation, sortedMessages]);
    var NoNewsMessage = function () { return (<View style={{
            marginTop: 20,
        }}>
      <MissingItem emoji={"🥱"} title={"Aucune actualité disponible"} description={"Malheureusement, il n'y a aucune actualité à afficher pour le moment."}/>
    </View>); };
    var hasNews = importantMessages.length > 0 || sortedMessages.length > 0;
    return (<>
      <PapillonHeader route={route} navigation={navigation}/>
      <Reanimated.ScrollView contentContainerStyle={styles.scrollViewContent} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} progressViewOffset={100}/>} scrollIndicatorInsets={{ top: 42 }}>
        <PapillonHeaderInsetHeight route={route}/>

        {!isOnline && <OfflineWarning cache={true}/>}

        {importantMessages.length > 0 && (<Reanimated.View entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOut)} layout={animPapillon(LinearTransition)}>
            <NativeListHeader label="Peut-être Important" animated leading={<Image source={require("@/../assets/images/magic/icon_magic.png")} style={styles.magicIcon} resizeMode="contain"/>} trailing={<BetaIndicator />}/>

            <NativeList animated>
              <LinearGradient colors={!theme.dark ? [theme.colors.card, "#BFF6EF"] : [theme.colors.card, "#2C2C2C"]} start={[0, 0]} end={[2, 0]}>
                <FlatList data={importantMessages} renderItem={renderItem} keyExtractor={function (_, index) { return "important-".concat(index); }} scrollEnabled={false}/>
              </LinearGradient>
            </NativeList>
          </Reanimated.View>)}

        {sortedMessages.length > 0 && (<Reanimated.View entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOut)} layout={animPapillon(LinearTransition)}>
            <NativeList animated inline>
              <FlatList data={sortedMessages} renderItem={renderItem} keyExtractor={function (_, index) { return "sorted-".concat(index); }} scrollEnabled={false} initialNumToRender={6}/>
            </NativeList>
          </Reanimated.View>)}

        {hasServiceSetup ?
            !isLoading && !hasNews && <NoNewsMessage />
            :
                <MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷"/>}
      </Reanimated.ScrollView>
    </>);
};
var styles = StyleSheet.create({
    scrollViewContent: {
        padding: 16,
    },
    magicIcon: {
        width: 26,
        height: 26,
        marginRight: 4
    },
    noNewsText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
});
export default protectScreenComponent(NewsScreen);
