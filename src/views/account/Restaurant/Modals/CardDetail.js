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
import { Alert, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MenuCard from "../Cards/Card";
import Reanimated from "react-native-reanimated";
import React, { useState } from "react";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { differenceInDays, formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { PressableScale } from "react-native-pressable-scale";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { ExternalLink, MoreHorizontal, MoreVertical, QrCode, Trash2 } from "lucide-react-native";
import { balanceFromExternal } from "@/services/balance";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { LinearGradient } from "expo-linear-gradient";
import { formatCardIdentifier } from "@/utils/external/restaurant";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { PapillonHeaderAction } from "@/components/Global/PapillonModernHeader";
var RestaurantCardDetail = function (_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route, navigation = _a.navigation;
    try {
        var card_1 = route.params.card;
        var _h = useState(null), cardData = _h[0], setCardData_1 = _h[1];
        var theme_1 = useTheme();
        var account_1 = useCurrentAccount(function (store) { return store.account; });
        var removeAccount_1 = useAccounts(function (state) { return state.remove; });
        var cardName_1 = "Carte ".concat(AccountService[route.params.card.service], " ").concat(((_b = account_1 === null || account_1 === void 0 ? void 0 : account_1.identity) === null || _b === void 0 ? void 0 : _b.firstName) ? "de " + account_1.identity.firstName : "");
        React.useLayoutEffect(function () {
            if (Platform.OS === "ios") {
                navigation.setOptions({
                    headerTitle: cardName_1 !== null && cardName_1 !== void 0 ? cardName_1 : "Détail de la carte",
                    headerLargeTitleStyle: {
                        color: "transparent",
                    },
                    headerLargeStyle: {
                        backgroundColor: "transparent",
                    },
                    headerBlurEffect: "regular",
                    headerRight: function () {
                        var _a, _b;
                        return (<PapillonPicker data={__spreadArray(__spreadArray([], (_b = (_a = card_1.theme.links) === null || _a === void 0 ? void 0 : _a.map(function (link) { return ({
                                label: link.label,
                                subtitle: link.subtitle,
                                sfSymbol: link.sfSymbol,
                                icon: <ExternalLink />,
                                onPress: function () { return Linking.openURL(link.url); },
                            }); })) !== null && _b !== void 0 ? _b : [], true), [
                                {
                                    label: "Supprimer",
                                    icon: <Trash2 />,
                                    sfSymbol: "trash",
                                    destructive: true,
                                    onPress: function () {
                                        Alert.alert("Supprimer la carte", "Veux-tu vraiment supprimer la " + (cardName_1 !== null && cardName_1 !== void 0 ? cardName_1 : "carte") + " ?", [
                                            { text: "Annuler", style: "cancel" },
                                            {
                                                text: "Supprimer",
                                                style: "destructive",
                                                onPress: function () {
                                                    var _a;
                                                    try {
                                                        removeAccount_1((_a = card_1.account) === null || _a === void 0 ? void 0 : _a.localID);
                                                        navigation.goBack();
                                                    }
                                                    catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                            }
                                        ]);
                                    }
                                }
                            ], false)}>
              <TouchableOpacity activeOpacity={0.5}>
                <MoreHorizontal opacity={0.7} size={24} color={theme_1.colors.text}/>
              </TouchableOpacity>
            </PapillonPicker>);
                    },
                });
            }
        }, [navigation, theme_1]);
        var updateCardData_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, balance, history_1, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                balanceFromExternal(route.params.card.account).catch(function (err) {
                                    console.warn("Error fetching balance for account ".concat(account_1, ":"), err);
                                    return [];
                                }),
                                reservationHistoryFromExternal(route.params.card.account).catch(function (err) {
                                    console.warn("Error fetching history for account ".concat(account_1, ":"), err);
                                    return [];
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), balance = _a[0], history_1 = _a[1];
                        setCardData_1(__assign(__assign({}, card_1), { 
                            // @ts-expect-error
                            balance: balance, history: history_1 }));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        React.useEffect(function () {
            // on focus
            var unsubscribe = navigation.addListener("focus", function () {
                updateCardData_1();
            });
            return unsubscribe;
        }, []);
        return (<>
        {Platform.OS === "android" && (<PapillonHeader route={route} navigation={navigation} title={cardName_1 !== null && cardName_1 !== void 0 ? cardName_1 : "Détail de la carte"}>
            <PapillonPicker animated direction="right" delay={0} data={__spreadArray(__spreadArray([], (_d = (_c = card_1.theme.links) === null || _c === void 0 ? void 0 : _c.map(function (link) { return ({
                    label: link.label,
                    subtitle: link.subtitle,
                    sfSymbol: link.sfSymbol,
                    icon: <ExternalLink />,
                    onPress: function () { return Linking.openURL(link.url); },
                }); })) !== null && _d !== void 0 ? _d : [], true), [
                    {
                        label: "Supprimer",
                        icon: <Trash2 />,
                        sfSymbol: "trash",
                        destructive: true,
                        onPress: function () {
                            Alert.alert("Supprimer la carte", "Veux-tu vraiment supprimer la " + (cardName_1 !== null && cardName_1 !== void 0 ? cardName_1 : "carte") + " ?", [
                                { text: "Annuler", style: "cancel" },
                                {
                                    text: "Supprimer",
                                    style: "destructive",
                                    onPress: function () {
                                        var _a;
                                        try {
                                            removeAccount_1((_a = card_1.account) === null || _a === void 0 ? void 0 : _a.localID);
                                            navigation.goBack();
                                        }
                                        catch (e) {
                                            console.log(e);
                                        }
                                    }
                                }
                            ]);
                        }
                    }
                ], false)}>
              <PapillonHeaderAction icon={<MoreVertical />}/>
            </PapillonPicker>
          </PapillonHeader>)}
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{
                flex: 1,
            }} contentContainerStyle={{
                padding: 16,
            }}>
          <PapillonHeaderInsetHeight route={route}/>
          <PressableScale weight="light" activeScale={0.95} style={[
                Platform.OS === "ios" ? {
                    marginTop: -76,
                } : null
            ]}>
            <Reanimated.View style={{
                transform: [
                    { scale: 0.85 },
                ],
                marginVertical: 4,
            }} pointerEvents={"none"}>
              <MenuCard card={route.params.card}/>
            </Reanimated.View>
          </PressableScale>

          <View style={{
                gap: 3,
            }}>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
            }}>
              <Text style={{
                fontSize: 18,
                fontFamily: "bold",
                textAlign: "center",
                color: theme_1.colors.text,
            }}>
                {cardName_1}
              </Text>
            </View>
            <Text style={{
                fontSize: 15,
                fontFamily: "medium",
                opacity: 0.5,
                textAlign: "center",
                color: theme_1.colors.text,
                letterSpacing: 3.5,
            }}>
              {formatCardIdentifier((_e = card_1.account) === null || _e === void 0 ? void 0 : _e.localID, 12, "")}
            </Text>
          </View>

          <View style={{
                flexDirection: "row",
                gap: 10,
            }}>
            {(card_1 === null || card_1 === void 0 ? void 0 : card_1.balance[0]) && (<NativeList inline style={{ flex: 1, height: 76 }}>
                <View style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 76,
                }}>
                  <NativeText variant="subtitle" style={{
                    textAlign: "center",
                }}>
                    Solde de la carte
                  </NativeText>
                  <Text style={{
                    fontFamily: "semibold",
                    fontSize: 28,
                    textAlign: "center",
                    color: card_1.balance[0].amount > 0 ? "#00C853" : "#FF1744",
                }}>
                    {card_1.balance[0].amount > 0 && "+"}{card_1.balance[0].amount.toFixed(2)} €
                  </Text>
                </View>
              </NativeList>)}

            {(card_1 === null || card_1 === void 0 ? void 0 : card_1.cardnumber) && (<PressableScale onPress={function () { return navigation.navigate("RestaurantQrCode", { card: card_1 }); }} weight="light" activeScale={0.95}>
                <NativeList inline style={{ width: 120, height: 76 }}>
                  <View style={{
                    height: 76,
                    gap: 6,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: (_f = route.params.card.theme.colors.background) !== null && _f !== void 0 ? _f : theme_1.colors.primary,
                }}>
                    <QrCode size={24} strokeWidth={2.2} color={"#fff"}/>
                    <Text style={{
                    fontFamily: "semibold",
                    fontSize: 13,
                    color: "#fff",
                    textAlign: "center",
                }}>
                      Payer un repas
                    </Text>
                  </View>
                </NativeList>
              </PressableScale>)}
          </View>

          {(card_1 === null || card_1 === void 0 ? void 0 : card_1.balance[0]) &&
                (card_1 === null || card_1 === void 0 ? void 0 : card_1.balance[0].remaining) !== null &&
                (card_1 === null || card_1 === void 0 ? void 0 : card_1.balance[0].remaining) !== Infinity &&
                (<NativeList inline>
                <NativeItem trailing={<NativeText variant="titleLarge" style={{
                            marginRight: 10,
                            fontFamily: "semibold",
                            fontSize: 26,
                            lineHeight: 28,
                            color: card_1.balance[0].remaining > 1 ? "#00C853" : "#FF1744",
                        }}>
                      {card_1.balance[0].remaining.toFixed(0)}
                    </NativeText>}>
                  <NativeText variant="title">
                    Repas restants
                  </NativeText>
                  <NativeText variant="subtitle">
                    Tarif estimé à {(_g = card_1.balance[0].price) === null || _g === void 0 ? void 0 : _g.toFixed(2)} €
                  </NativeText>
                </NativeItem>
              </NativeList>)}

          {(card_1 === null || card_1 === void 0 ? void 0 : card_1.history.length) > 0 && (<NativeList inline>
              {card_1.history
                    .filter(function (event) { return !isNaN(new Date(event.timestamp).getTime()); })
                    .sort(function (a, b) { return b.timestamp - a.timestamp; })
                    .map(function (history, i) { return (<NativeItem key={"cardhistory-" + i} leading={<Image source={defaultProfilePicture(card_1.service)} style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            overflow: "hidden",
                            borderWidth: 1,
                            borderColor: theme_1.colors.border,
                        }}/>} trailing={<View style={{
                            paddingRight: 10,
                        }}>
                        {history.amount > 0 ? (<NativeText variant="title" style={{
                                fontFamily: "medium",
                                color: "#00C853",
                            }}>
                            +{history.amount.toFixed(2)} €
                          </NativeText>) : (<NativeText variant="title" style={{
                                fontFamily: "medium",
                                color: "#FF1744",
                            }}>
                            -{(-history.amount).toFixed(2)} €
                          </NativeText>)}
                      </View>}>
                    <NativeText variant="title">
                      {history.label}
                    </NativeText>

                    {new Date(history.timestamp) && differenceInDays(new Date(), new Date(history.timestamp)) < 30 ? (<NativeText variant="subtitle">
                        il y a {formatDistance(new Date(history.timestamp), new Date(), { locale: fr })} • {new Date(history.timestamp).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            weekday: "short",
                            month: "short",
                        })}
                      </NativeText>) : (<NativeText variant="subtitle">
                        {new Date(history.timestamp).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            weekday: "long",
                            month: "long",
                            year: new Date(history.timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                        })}
                      </NativeText>)}
                  </NativeItem>); })}
            </NativeList>)}

          <InsetsBottomView />
        </ScrollView>

        <LinearGradient pointerEvents="none" colors={[route.params.card.theme.colors.background + "00", route.params.card.theme.colors.background, route.params.card.theme.colors.background + "00"]} style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 600,
                opacity: 0.1,
            }}/>
      </>);
    }
    catch (e) {
        console.log(e);
        return <View />;
    }
};
export default RestaurantCardDetail;
