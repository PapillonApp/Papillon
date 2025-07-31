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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Switch, ActivityIndicator, RefreshControl, Text, Dimensions } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { AlertTriangle, BadgeX, ChefHat, CookingPot, MapPin, Plus, Sprout, Utensils, } from "lucide-react-native";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { balanceFromExternal } from "@/services/balance";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeIn, FadeInDown, FadeOut, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { qrcodeFromExternal } from "@/services/qrcode";
import { getMenu } from "@/services/menu";
import { PapillonHeaderSelector } from "@/components/Global/PapillonModernHeader";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import DateModal from "../../../components/Global/DateModal";
import { bookDayFromExternal, getBookingsAvailableFromExternal } from "@/services/booking";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import DrawableImportRestaurant from "@/components/Drawables/DrawableImportRestaurant";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import { AccountService } from "@/stores/account/types";
import { STORE_THEMES } from "./Cards/StoreThemes";
import MenuCard from "./Cards/Card";
import { useAlert } from "@/providers/AlertProvider";
var Menu = function (_a) {
    var _b, _c, _d, _e;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var isOnline = useOnlineStatus().isOnline;
    var account = useCurrentAccount(function (store) { return store.account; });
    var linkedAccounts = useCurrentAccount(function (store) { return store.linkedAccounts; });
    var _f = useState(false), isRefreshing = _f[0], setIsRefreshing = _f[1];
    var _g = useState(0), refreshCount = _g[0], setRefreshCount = _g[1];
    var currentDate = new Date();
    var _h = useState(null), allBookings = _h[0], setAllBookings = _h[1];
    var _j = useState(null), currentMenu = _j[0], setCurrentMenu = _j[1];
    var _k = useState(0), currentWeek = _k[0], setCurrentWeek = _k[1];
    var _l = useState(false), showDatePicker = _l[0], setShowDatePicker = _l[1];
    var _m = React.useState(new Date(new Date().setHours(0, 0, 0, 0))), pickerDate = _m[0], setPickerDate = _m[1];
    var _o = useState(false), isMenuLoading = _o[0], setMenuLoading = _o[1];
    var _p = useState(false), isInitialised = _p[0], setIsInitialised = _p[1];
    var _q = useState(0), selectedIndex = _q[0], setSelectedIndex = _q[1];
    var _r = useState(null), allCards = _r[0], setAllCards = _r[1];
    var showAlert = useAlert().showAlert;
    var refreshData = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsRefreshing(true);
            setRefreshCount(refreshCount + 1);
            return [2 /*return*/];
        });
    }); };
    var getWeekNumber = function (date) {
        var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        var pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    var onDatePickerSelect = function (date) { return __awaiter(void 0, void 0, void 0, function () {
        var newDate, newWeek, allBookings_1, _i, linkedAccounts_1, account_1, bookingsForAccount, AliseAccount, dailyMenu, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!date) {
                        return [2 /*return*/];
                    }
                    newDate = new Date(date);
                    newDate.setHours(0, 0, 0, 0);
                    if (newDate.valueOf() === pickerDate.valueOf()) {
                        return [2 /*return*/];
                    }
                    setPickerDate(newDate);
                    setMenuLoading(true);
                    newWeek = getWeekNumber(date);
                    if (!(currentWeek !== newWeek)) return [3 /*break*/, 5];
                    setCurrentWeek(newWeek);
                    allBookings_1 = [];
                    _i = 0, linkedAccounts_1 = linkedAccounts;
                    _c.label = 1;
                case 1:
                    if (!(_i < linkedAccounts_1.length)) return [3 /*break*/, 4];
                    account_1 = linkedAccounts_1[_i];
                    return [4 /*yield*/, getBookingsAvailableFromExternal(account_1, newWeek)];
                case 2:
                    bookingsForAccount = _c.sent();
                    allBookings_1.push.apply(allBookings_1, bookingsForAccount);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    setAllBookings(allBookings_1);
                    _c.label = 5;
                case 5:
                    AliseAccount = linkedAccounts.find(function (account) { return account.service === AccountService.Alise; });
                    if (!AliseAccount) return [3 /*break*/, 7];
                    return [4 /*yield*/, getMenu(AliseAccount, pickerDate).catch(function () { return null; })];
                case 6:
                    _a = _c.sent();
                    return [3 /*break*/, 11];
                case 7:
                    if (!account) return [3 /*break*/, 9];
                    return [4 /*yield*/, getMenu(account, pickerDate).catch(function () { return null; })];
                case 8:
                    _b = _c.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _b = null;
                    _c.label = 10;
                case 10:
                    _a = _b;
                    _c.label = 11;
                case 11:
                    dailyMenu = _a;
                    setCurrentMenu(dailyMenu);
                    setMenuLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleBookTogglePress = function (terminal, bookingDay) { return __awaiter(void 0, void 0, void 0, function () {
        var newBookingStatus, updatedBookings, _a, revertedBookings;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newBookingStatus = !bookingDay.booked;
                    updatedBookings = allBookings === null || allBookings === void 0 ? void 0 : allBookings.map(function (term) {
                        return term === terminal
                            ? __assign(__assign({}, term), { days: term.days.map(function (day) {
                                    return day === bookingDay ? __assign(__assign({}, day), { booked: newBookingStatus }) : day;
                                }) }) : term;
                    });
                    setAllBookings(updatedBookings !== null && updatedBookings !== void 0 ? updatedBookings : null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, bookDayFromExternal(terminal.account, bookingDay.id, pickerDate, newBookingStatus)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    revertedBookings = allBookings === null || allBookings === void 0 ? void 0 : allBookings.map(function (term) {
                        return term === terminal
                            ? __assign(__assign({}, term), { days: term.days.map(function (day) {
                                    return day === bookingDay ? __assign(__assign({}, day), { booked: !newBookingStatus }) : day;
                                }) }) : term;
                    });
                    setAllBookings(revertedBookings !== null && revertedBookings !== void 0 ? revertedBookings : null);
                    showAlert({
                        title: "Erreur",
                        message: "Une erreur est survenue lors de la réservation du repas",
                        icon: <BadgeX />,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    useLayoutEffect(function () {
        navigation.setOptions(__assign({}, TabAnimatedTitle({ route: route, navigation: navigation })));
    }, [navigation, route.params, theme.colors.text]);
    var fetchCardsData = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                var newCards_1, newBookings_1, AliseAccount, dailyMenu, _a, _b, accountPromises, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 8, , 9]);
                            newCards_1 = [
                            /* {
                              service: 5,
                              account: null,
                              identifier: "123456789",
                              balance: [{
                                amount: 20.30
                              }],
                              history: [],
                              cardnumber: null,
                              theme: STORE_THEMES[1],
                            } */
                            ];
                            newBookings_1 = [];
                            AliseAccount = linkedAccounts.find(function (account) { return account.service === AccountService.Alise; });
                            if (!AliseAccount) return [3 /*break*/, 2];
                            return [4 /*yield*/, getMenu(AliseAccount, pickerDate).catch(function () { return null; })];
                        case 1:
                            _a = _c.sent();
                            return [3 /*break*/, 6];
                        case 2:
                            if (!account) return [3 /*break*/, 4];
                            return [4 /*yield*/, getMenu(account, pickerDate).catch(function () { return null; })];
                        case 3:
                            _b = _c.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            _b = null;
                            _c.label = 5;
                        case 5:
                            _a = _b;
                            _c.label = 6;
                        case 6:
                            dailyMenu = _a;
                            accountPromises = linkedAccounts.map(function (account) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, balance, history_1, cardnumber, booking, newCard, error_2;
                                var _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _e.trys.push([0, 2, , 3]);
                                            if (!account || !account.service) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, Promise.all([
                                                    balanceFromExternal(account, isRefreshing).catch(function (err) {
                                                        console.warn("Error fetching balance for account ".concat(account, ":"), err);
                                                        return [];
                                                    }),
                                                    reservationHistoryFromExternal(account).catch(function (err) {
                                                        console.warn("Error fetching history for account ".concat(account, ":"), err);
                                                        return [];
                                                    }),
                                                    qrcodeFromExternal(account).catch(function (err) {
                                                        console.warn("Error fetching QR code for account ".concat(account, ":"), err);
                                                        return "0";
                                                    }),
                                                    getBookingsAvailableFromExternal(account, getWeekNumber(new Date()), isRefreshing).catch(function (err) {
                                                        console.warn("Error fetching bookings for account ".concat(account, ":"), err);
                                                        return [];
                                                    })
                                                ])];
                                        case 1:
                                            _a = _e.sent(), balance = _a[0], history_1 = _a[1], cardnumber = _a[2], booking = _a[3];
                                            newBookings_1.push.apply(newBookings_1, booking);
                                            newCard = {
                                                service: (_b = account.service) !== null && _b !== void 0 ? _b : 0,
                                                identifier: (_c = account.username) !== null && _c !== void 0 ? _c : "",
                                                account: account !== null && account !== void 0 ? account : null,
                                                balance: balance !== null && balance !== void 0 ? balance : [],
                                                history: history_1 !== null && history_1 !== void 0 ? history_1 : [],
                                                cardnumber: cardnumber !== null && cardnumber !== void 0 ? cardnumber : "",
                                                // @ts-ignore
                                                theme: (_d = STORE_THEMES.find(function (theme) { return theme.id === AccountService[account.service]; })) !== null && _d !== void 0 ? _d : STORE_THEMES[0],
                                            };
                                            newCards_1.push(newCard);
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_2 = _e.sent();
                                            setIsInitialised(true);
                                            console.warn("An error occurred with account ".concat(account, ":"), error_2);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [4 /*yield*/, Promise.all(accountPromises)];
                        case 7:
                            _c.sent();
                            setAllCards(newCards_1);
                            setAllBookings(newBookings_1);
                            setCurrentMenu(dailyMenu);
                            setIsInitialised(true);
                            setIsRefreshing(false);
                            return [3 /*break*/, 9];
                        case 8:
                            error_1 = _c.sent();
                            console.warn("An error occurred while fetching data:", error_1);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); })();
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        fetchCardsData();
    }, [linkedAccounts, refreshCount]);
    var getLabelIcon = function (label) {
        switch (label) {
            case "Assemblé sur place":
                return <CookingPot size={12} strokeWidth={3} color="#FFFFFF"/>;
            case "Issu de l'Agriculture Biologique":
                return <Sprout size={12} strokeWidth={3} color="#FFFFFF"/>;
            case "Fait maison - Recette du chef":
                return <ChefHat size={12} strokeWidth={3} color="#FFFFFF"/>;
            case "Produits locaux":
                return <MapPin size={12} strokeWidth={3} color="#FFFFFF"/>;
            default:
                return null;
        }
    };
    var getLabelName = function (label) {
        switch (label) {
            case "Assemblé sur place":
                return "Assemblé sur place";
            case "Issu de l'Agriculture Biologique":
                return "Agriculture Biologique";
            case "Fait maison - Recette du chef":
                return "Fait maison";
            case "Produits locaux":
                return "Produits locaux";
            default:
                return label;
        }
    };
    function renderAllergens(allergens) {
        if (allergens.length === 0) {
            return null;
        }
        return (<View style={styles.allergensContainer}>
        <AlertTriangle size={16} color={colors.text} opacity={0.6}/>
        <NativeText variant="subtitle">
          Allergènes : {allergens.map(function (allergen) { return allergen.name; }).join(", ")}
        </NativeText>
      </View>);
    }
    function renderLabels(labels) {
        if (labels.length === 0) {
            return null;
        }
        return (<View style={styles.labelsContainer}>
        {labels.map(function (label, k) {
                var _a;
                return (<View key={"label-" + k} style={[styles.label, { backgroundColor: (_a = label.color) !== null && _a !== void 0 ? _a : "#888888" }]}>
            {getLabelIcon(label.name)}
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>
              {getLabelName(label.name)}
            </Text>
          </View>);
            })}
      </View>);
    }
    return (<>
      <PapillonHeader route={route} navigation={navigation}/>
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsHorizontalScrollIndicator={false} scrollIndicatorInsets={{ top: 42 }} refreshControl={<RefreshControl refreshing={isRefreshing} progressViewOffset={120} onRefresh={function () {
                refreshData();
            }}/>}>
        <PapillonHeaderInsetHeight route={route}/>

        {!isOnline ? (<OfflineWarning cache={false}/>) : !isInitialised ? (<ActivityIndicator size="large" style={{ padding: 50 }}/>) : (<>

            {(allCards === null || allCards === void 0 ? void 0 : allCards.length) === 0 && !currentMenu && (<MissingItem style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                }} leading={<DrawableImportRestaurant color={colors.primary} style={{ marginBottom: 10 }}/>} title="Commence par connecter un service externe de cantine" description="Papillon te permet de connecter un compte Turboself, ARD, Alise ou Izly." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} trailing={<View>
                    <ButtonCta value="Ajouter un service" primary onPress={function () { return navigation.navigate("SettingStack", { view: "SettingsExternalServices" }); }} style={{ marginTop: 16 }}/>
                  </View>}/>)}

            <View style={{ height: 16 }}/>

            {((_b = (allCards !== null && allCards !== void 0 ? allCards : [])) === null || _b === void 0 ? void 0 : _b.length) > 0 && (<ScrollView style={{
                    width: (Dimensions.get("window").width - 32),
                    overflow: "visible",
                    maxHeight: (Dimensions.get("window").width - 32) / 1.72
                }} contentContainerStyle={{
                    overflow: "visible",
                    gap: 6,
                }} horizontal showsHorizontalScrollIndicator={false} scrollEnabled={((_c = (allCards !== null && allCards !== void 0 ? allCards : [])) === null || _c === void 0 ? void 0 : _c.length) > 1} decelerationRate={"fast"} snapToInterval={(Dimensions.get("window").width - 32) + 6}>
                {allCards === null || allCards === void 0 ? void 0 : allCards.map(function (card, index) { return (<Reanimated.View key={index} style={{
                        width: Dimensions.get("window").width - 32,
                    }}>
                    <MenuCard key={index} card={card} onPress={function () {
                        navigation.navigate("RestaurantCardDetail", { card: card, outsideNav: true });
                    }}/>
                  </Reanimated.View>); })}
              </ScrollView>)}

            {(currentMenu || (allBookings && (allBookings === null || allBookings === void 0 ? void 0 : allBookings.some(function (terminal) { return terminal.days.some(function (day) { var _a; return ((_a = day.date) === null || _a === void 0 ? void 0 : _a.toDateString()) === pickerDate.toDateString(); }); })))) &&
                <View style={styles.calendarContainer}>
                <Reanimated.View layout={animPapillon(LinearTransition)} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)}>
                  <PressableScale onPress={function () {
                        onDatePickerSelect(new Date(pickerDate.setDate(pickerDate.getDate() - 1)));
                        setRefreshCount(refreshCount + 1);
                    }} activeScale={0.8}>
                    <View style={[styles.weekPickerText, {
                            backgroundColor: theme.colors.border,
                            padding: 8,
                            borderRadius: 100,
                        }]}>
                      <ChevronLeft size={24} color={theme.colors.text} strokeWidth={2.5}/>
                    </View>
                  </PressableScale>
                </Reanimated.View>
                <PapillonHeaderSelector loading={isMenuLoading} onPress={function () { return setShowDatePicker(true); }}>
                  <Reanimated.View layout={animPapillon(LinearTransition)}>
                    <Reanimated.View key={pickerDate.toLocaleDateString("fr-FR", { weekday: "short" })} entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
                      <Reanimated.Text style={[styles.weekPickerText, { color: theme.colors.text }]}>
                        {pickerDate.toLocaleDateString("fr-FR", { weekday: "long" })}
                      </Reanimated.Text>
                    </Reanimated.View>
                  </Reanimated.View>
                  <AnimatedNumber value={pickerDate.getDate().toString()} style={[styles.weekPickerText, { color: theme.colors.text }]}/>
                  <Reanimated.Text style={[styles.weekPickerText, { color: theme.colors.text }]} layout={animPapillon(LinearTransition)}>
                    {pickerDate.toLocaleDateString("fr-FR", { month: "long" })}
                  </Reanimated.Text>
                </PapillonHeaderSelector>
                <Reanimated.View layout={animPapillon(LinearTransition)} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)}>
                  <PressableScale onPress={function () {
                        onDatePickerSelect(new Date(pickerDate.setDate(pickerDate.getDate() + 1)));
                        setRefreshCount(refreshCount + 1);
                    }} activeScale={0.8}>
                    <View style={[styles.weekPickerText, {
                            backgroundColor: theme.colors.border,
                            padding: 8,
                            borderRadius: 100,
                        }]}>
                      <ChevronRight size={24} color={theme.colors.text} strokeWidth={2.5}/>
                    </View>
                  </PressableScale>
                </Reanimated.View>
              </View>}

            {allBookings && pickerDate.getTime() > currentDate.getTime() && allBookings.some(function (terminal) { return terminal.days.some(function (day) { var _a; return ((_a = day.date) === null || _a === void 0 ? void 0 : _a.toDateString()) === pickerDate.toDateString(); }); }) && (<>
                <NativeListHeader label="Réservations disponibles"/>
                <NativeList>
                  {allBookings.map(function (terminal, index) { return (<React.Fragment key={index}>
                      {terminal.days.map(function (bookingDay, dayIndex) {
                        var _a;
                        return ((_a = bookingDay.date) === null || _a === void 0 ? void 0 : _a.toDateString()) === pickerDate.toDateString() ? (<NativeItem separator disabled={!bookingDay.canBook} icon={<Utensils />} key={dayIndex} trailing={<Switch value={bookingDay.booked} disabled={!bookingDay.canBook} onValueChange={function () { return handleBookTogglePress(terminal, bookingDay); }}/>}>
                            <NativeText style={{ fontSize: 16, fontFamily: "semibold", color: theme.colors.text }}>Réserver mon repas</NativeText>
                            <NativeText variant="subtitle">Borne "{terminal.terminalLabel}"</NativeText>
                          </NativeItem>) : null;
                    })}
                    </React.Fragment>); })}
                </NativeList>
              </>)}

            <View style={{ height: 16 }}/>

            {currentMenu ?
                <>
                {isMenuLoading ? (<ActivityIndicator size="large" style={{ padding: 50 }}/>) : (currentMenu === null || currentMenu === void 0 ? void 0 : currentMenu.lunch) || (currentMenu === null || currentMenu === void 0 ? void 0 : currentMenu.dinner) ? (<>
                    {((_d = currentMenu === null || currentMenu === void 0 ? void 0 : currentMenu.lunch) === null || _d === void 0 ? void 0 : _d.main) && (<>
                        <NativeListHeader label="Menu du jour"/>
                        <NativeList>
                          {[
                                { title: "Entrée", items: currentMenu.lunch.entry },
                                { title: "Plat", items: currentMenu.lunch.main },
                                { title: "Accompagnement", items: currentMenu.lunch.side },
                                { title: "Fromage", items: currentMenu.lunch.cheese },
                                { title: "Dessert", items: currentMenu.lunch.dessert },
                                { title: "Boisson", items: currentMenu.lunch.drink },
                            ].map(function (_a, index) {
                                var title = _a.title, items = _a.items;
                                return items && (<NativeItem key={index}>
                                <NativeText variant="subtitle">{title}</NativeText>
                                {items.map(function (food, idx) {
                                        var _a;
                                        return (<React.Fragment key={idx}>
                                    <NativeText variant="title">
                                      {(_a = food.name) !== null && _a !== void 0 ? _a : ""}
                                    </NativeText>
                                    {renderAllergens(food.allergens ? food.allergens : [])}
                                    {renderLabels(food.labels ? food.labels : [])}
                                  </React.Fragment>);
                                    })}
                              </NativeItem>);
                            })}
                        </NativeList>
                      </>)}
                    {((_e = currentMenu === null || currentMenu === void 0 ? void 0 : currentMenu.dinner) === null || _e === void 0 ? void 0 : _e.main) && (<>
                        <NativeListHeader label="Menu du soir"/>
                        <NativeList>
                          {[
                                { title: "Entrée", items: currentMenu.dinner.entry },
                                { title: "Plat", items: currentMenu.dinner.main },
                                { title: "Accompagnement", items: currentMenu.dinner.side },
                                { title: "Fromage", items: currentMenu.dinner.cheese },
                                { title: "Dessert", items: currentMenu.dinner.dessert },
                                { title: "Boisson", items: currentMenu.dinner.drink },
                            ].map(function (_a, index) {
                                var title = _a.title, items = _a.items;
                                return items && (<NativeItem key={index}>
                                <NativeText variant="subtitle">{title}</NativeText>
                                {items.map(function (food, idx) {
                                        var _a;
                                        return (<React.Fragment key={idx}>
                                    <NativeText variant="title">
                                      {(_a = food.name) !== null && _a !== void 0 ? _a : ""}
                                    </NativeText>
                                    {renderAllergens(food.allergens ? food.allergens : [])}
                                    {renderLabels(food.labels ? food.labels : [])}
                                  </React.Fragment>);
                                    })}
                              </NativeItem>);
                            })}
                        </NativeList>
                      </>)}
                  </>) : (<MissingItem emoji="🍽️" title="Aucun menu prévu" description={"Malheureusement, aucun menu n'est pr\u00E9vu pour le ".concat(pickerDate.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        }), ".")} entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)} style={{ marginTop: 16 }}/>)}
              </>
                : <>
                {(allCards !== null && allCards !== void 0 ? allCards : []).length > 0 && (<View style={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 6,
                        }}>
                    <PressableScale onPress={function () {
                            navigation.navigate("SettingStack", { view: "SettingsExternalServices" });
                        }} style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 100,
                            backgroundColor: theme.colors.text + "12",
                            borderColor: theme.colors.text + "40",
                            borderWidth: 0,
                        }}>
                      <Plus size={20} strokeWidth={2.5} color={theme.colors.text}/>
                      <NativeText>
                        Ajouter une carte
                      </NativeText>
                    </PressableScale>
                  </View>)}
              </>}
            <DateModal showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} currentDate={pickerDate} onDateSelect={onDatePickerSelect} isHomework={false}/>
          </>)}
        <InsetsBottomView />
      </ScrollView>
    </>);
};
var styles = StyleSheet.create({
    scrollViewContent: { padding: 16, flexGrow: 1 },
    accountButtonContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 },
    horizontalList: { marginTop: 10 },
    calendarContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16, marginBottom: -10, gap: 10 },
    weekPickerText: { zIndex: 10000, fontSize: 14.5, fontFamily: "medium", opacity: 0.7 },
    allergensContainer: { display: "flex", flexDirection: "row", alignItems: "center", gap: 5 },
    labelsContainer: { display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
    label: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }
});
export default Menu;
