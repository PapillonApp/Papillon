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
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Pizza } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { useCurrentAccount } from "@/stores/account";
import QRCode from "react-native-qrcode-svg";
import { AccountService } from "@/stores/account/types";
import { qrcodeFromExternal } from "@/services/qrcode";
import { useNavigation } from "@react-navigation/native";
import { STORE_THEMES } from "@/views/account/Restaurant/Cards/StoreThemes";
import { formatCardIdentifier } from "@/utils/external/restaurant";
var RestaurantQRCodeWidget = forwardRef(function (_a, ref) {
    var _b;
    var setLoading = _a.setLoading, setHidden = _a.setHidden, loading = _a.loading;
    var theme = useTheme();
    var colors = theme.colors;
    var linkedAccounts = useCurrentAccount(function (store) { return store.linkedAccounts; });
    var navigation = useNavigation();
    var _c = useState(null), allCards = _c[0], setAllCards = _c[1];
    var _d = useState(0), currentCardIndex = _d[0], setCurrentCardIndex = _d[1];
    useImperativeHandle(ref, function () { return ({
        handlePress: function () {
            if (currentCard) {
                navigation.navigate("RestaurantQrCode", { card: currentCard });
            }
        }
    }); });
    var getWeekNumber = function (date) {
        var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        var pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                var newCards, currentHour, accountPromises;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setHidden(true);
                            setLoading(true);
                            newCards = [];
                            currentHour = new Date().getHours();
                            accountPromises = linkedAccounts.map(function (account) { return __awaiter(_this, void 0, void 0, function () {
                                var cardnumber, newCard, error_1;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, Promise.all([
                                                    qrcodeFromExternal(account).catch(function (err) {
                                                        console.warn("Error fetching QR code for account ".concat(account, ":"), err);
                                                        return "0";
                                                    }),
                                                ])];
                                        case 1:
                                            cardnumber = (_b.sent())[0];
                                            newCard = {
                                                service: account.service,
                                                identifier: account.username,
                                                account: account,
                                                balance: [],
                                                history: [],
                                                cardnumber: cardnumber,
                                                // @ts-ignore
                                                theme: (_a = STORE_THEMES.find(function (theme) { return theme.id === AccountService[account.service]; })) !== null && _a !== void 0 ? _a : STORE_THEMES[0],
                                            };
                                            newCards.push(newCard);
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_1 = _b.sent();
                                            console.warn("An error occurred with account ".concat(account, ":"), error_1);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [4 /*yield*/, Promise.all(accountPromises)];
                        case 1:
                            _a.sent();
                            setAllCards(newCards);
                            setHidden(!((allCards === null || allCards === void 0 ? void 0 : allCards.some(function (card) { return card.cardnumber; })) && currentHour >= 11 && currentHour <= 14));
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }();
    }, [linkedAccounts, setHidden]);
    useEffect(function () {
        var updateVisibility = function () {
            var currentHour = new Date().getHours();
            var shouldShow = (allCards === null || allCards === void 0 ? void 0 : allCards.some(function (card) { return card.cardnumber; })) && currentHour >= 11 && currentHour < 14;
            setHidden(!shouldShow);
        };
        updateVisibility();
        var interval = setInterval(updateVisibility, 60000);
        return function () { return clearInterval(interval); };
    }, [linkedAccounts, allCards]);
    useEffect(function () {
        if (allCards && allCards.length > 1) {
            var interval_1 = setInterval(function () {
                setCurrentCardIndex(function (prevIndex) { return (prevIndex + 1) % allCards.length; });
            }, 5000);
            return function () { return clearInterval(interval_1); };
        }
    }, [allCards]);
    var currentCard = allCards === null || allCards === void 0 ? void 0 : allCards[currentCardIndex];
    return (<>
      <View style={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            gap: 7,
            opacity: 0.5,
        }}>
        <Pizza size={20} color={colors.text}/>
        <Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
        }}>
          Cantine scolaire
        </Text>
      </View>

      <Reanimated.View style={{
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            width: "100%",
            height: "90%",
            gap: 4,
        }} layout={LinearTransition}>
        <Reanimated.Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
            maxWidth: "90%",
        }} layout={LinearTransition}>
          Toucher pour afficher le QR-Code
        </Reanimated.Text>
        <Reanimated.Text style={{
            fontSize: 15,
            letterSpacing: 1.5,
            fontFamily: "medium",
            opacity: 0.5,
        }} layout={LinearTransition}>
          {formatCardIdentifier((_b = currentCard === null || currentCard === void 0 ? void 0 : currentCard.account) === null || _b === void 0 ? void 0 : _b.localID)}
        </Reanimated.Text>
        <View style={{
            position: "absolute",
            right: 0,
        }}>
          <QRCode value="0" size={70} color={colors.text + "10"} backgroundColor="#FFFFFF00"/>
        </View>
      </Reanimated.View>
    </>);
});
export default RestaurantQRCodeWidget;
