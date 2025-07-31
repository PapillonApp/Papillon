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
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useHomeworkStore } from "@/stores/homework";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import { View, FlatList, Dimensions, ScrollView, RefreshControl, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { calculateWeekNumber, dateToEpochWeekNumber, epochWNToDate, weekNumberToMiddleDate } from "@/utils/epochWeekNumber";
import * as StoreReview from "expo-store-review";
import { PressableScale } from "react-native-pressable-scale";
import { CheckSquare, Plus, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Reanimated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, FadeOutLeft, LinearTransition, ZoomIn, ZoomOut, } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import MissingItem from "@/components/Global/MissingItem";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { AccountService } from "@/stores/account/types";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import HomeworkItem from "./Atoms/Item";
import DateModal from "@/components/Global/DateModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var MemoizedHomeworkItem = React.memo(HomeworkItem);
var MemoizedNativeList = React.memo(NativeList);
var formatDate = function (date) {
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long"
    });
};
var WeekView = function (_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route, navigation = _a.navigation;
    var flatListRef = useRef(null);
    var width = Dimensions.get("window").width;
    var insets = useSafeAreaInsets();
    var isOnline = useOnlineStatus().isOnline;
    var outsideNav = (_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav;
    var theme = useTheme();
    var account = useCurrentAccount(function (store) { return store.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Homeworks, account.localID) : true;
    var homeworks = useHomeworkStore(function (store) { return store.homeworks; });
    // @ts-expect-error
    var firstDate = ((_d = (_c = account === null || account === void 0 ? void 0 : account.instance) === null || _c === void 0 ? void 0 : _c.instance) === null || _d === void 0 ? void 0 : _d.firstDate) || null;
    if (!firstDate) {
        firstDate = new Date(Date.UTC(new Date().getFullYear(), 8, 1));
    }
    var firstDateEpoch = dateToEpochWeekNumber(firstDate);
    var currentWeek = new Date().getUTCDay() >= 5 || new Date().getUTCDay() === 0
        ? dateToEpochWeekNumber(new Date()) + 1
        : dateToEpochWeekNumber(new Date());
    var _g = useState(Array.from({ length: 100 }, function (_, i) { return currentWeek - 50 + i; })), data = _g[0], setData = _g[1];
    var _h = useState(currentWeek), selectedWeek = _h[0], setSelectedWeek = _h[1];
    var _j = useState(false), showDatePickerWeek = _j[0], setShowDatePickerWeek = _j[1];
    var _k = useState(false), hideDone = _k[0], setHideDone = _k[1];
    var getItemLayout = useCallback(function (_, index) { return ({
        length: width,
        offset: width * index,
        index: index,
    }); }, [width]);
    var keyExtractor = useCallback(function (item) { return item.toString(); }, []);
    var getDayName = function (date) {
        var days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        return days[new Date(date).getDay()];
    };
    var _l = useState(false), loading = _l[0], setLoading = _l[1];
    var _m = useState(false), refreshing = _m[0], setRefreshing = _m[1];
    useEffect(function () {
        if (!isOnline && loading) {
            setLoading(false);
        }
    }, [isOnline, loading]);
    var _o = useState([]), loadedWeeks = _o[0], setLoadedWeeks = _o[1];
    var updateHomeworks = useCallback(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (force, showRefreshing, showLoading) {
            if (force === void 0) { force = false; }
            if (showRefreshing === void 0) { showRefreshing = true; }
            if (showLoading === void 0) { showLoading = true; }
            return __generator(this, function (_a) {
                if (!account)
                    return [2 /*return*/];
                if (!force && loadedWeeks.includes(selectedWeek)) {
                    return [2 /*return*/];
                }
                if (showRefreshing) {
                    setRefreshing(true);
                }
                if (showLoading) {
                    setLoading(true);
                }
                updateHomeworkForWeekInCache(account, epochWNToDate(selectedWeek))
                    .then(function () {
                    setLoading(false);
                    setRefreshing(false);
                    setLoadedWeeks(function (prev) { return __spreadArray(__spreadArray([], prev, true), [selectedWeek], false); });
                });
                return [2 /*return*/];
            });
        });
    }, [account, selectedWeek, loadedWeeks]);
    var _p = useState(""), searchTerms = _p[0], setSearchTerms = _p[1];
    var renderWeek = useCallback(function (_a) {
        var _b;
        var item = _a.item;
        var homeworksInWeek = __spreadArray([], ((_b = homeworks[item]) !== null && _b !== void 0 ? _b : []), true);
        var sortedHomework = homeworksInWeek.sort(function (a, b) { return new Date(a.due).getTime() - new Date(b.due).getTime(); });
        var groupedHomework = sortedHomework.reduce(function (acc, curr) {
            var dayName = getDayName(curr.personalizate
                ? curr.due - 86400
                : curr.due);
            var formattedDate = formatDate(curr.due);
            var day = "".concat(dayName, " ").concat(formattedDate);
            if (!acc[day]) {
                acc[day] = [curr];
            }
            else {
                acc[day].push(curr);
            }
            // filter homeworks by search terms
            if (searchTerms.length > 0) {
                acc[day] = acc[day].filter(function (homework) {
                    var content = homework.content
                        .toLowerCase()
                        .trim()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                    var subject = homework.subject
                        .toLowerCase()
                        .trim()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                    return (content.includes(searchTerms
                        .toLowerCase()
                        .trim()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")) ||
                        subject.includes(searchTerms
                            .toLowerCase()
                            .trim()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")));
                });
            }
            // if hideDone is enabled, filter out the done homeworks
            if (hideDone) {
                acc[day] = acc[day].filter(function (homework) { return !homework.done; });
            }
            // homework completed downstairs
            acc[day] = acc[day].sort(function (a, b) {
                if (a.done === b.done) {
                    return 0; // if both have the same status, keep the original order
                }
                return a.done ? 1 : -1; // completed go after
            });
            // remove all empty days
            if (acc[day].length === 0) {
                delete acc[day];
            }
            return acc;
        }, {});
        var isCurrentWeek = item === currentWeek;
        if (isCurrentWeek) {
            var today = new Date().getUTCDay();
            var daysOfWeek = [
                "Lundi",
                "Mardi",
                "Mercredi",
                "Jeudi",
                "Vendredi",
                "Samedi",
                "Dimanche",
            ];
            var reorderedDays = __spreadArray(__spreadArray([], daysOfWeek.slice(today), true), daysOfWeek.slice(0, today), true);
            var reorderedGroupedHomework_1 = {};
            var completedDays_1 = [];
            Object.keys(groupedHomework).forEach(function (day) {
                var allDone = groupedHomework[day].every(function (homework) { return homework.done; });
                if (allDone) {
                    completedDays_1.push(day);
                }
            });
            reorderedDays.forEach(function (dayName) {
                var dayKey = Object.keys(groupedHomework).find(function (day) {
                    return day.startsWith(dayName);
                });
                if (dayKey && !completedDays_1.includes(dayKey)) {
                    reorderedGroupedHomework_1[dayKey] = groupedHomework[dayKey];
                }
            });
            completedDays_1.forEach(function (dayKey) {
                reorderedGroupedHomework_1[dayKey] = groupedHomework[dayKey];
            });
            groupedHomework = reorderedGroupedHomework_1;
        }
        var askForReview = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                StoreReview.isAvailableAsync().then(function (available) {
                    if (available) {
                        StoreReview.requestReview();
                    }
                });
                return [2 /*return*/];
            });
        }); };
        var countCheckForReview = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                AsyncStorage.getItem("review_checkedHomeworkCount").then(function (value) {
                    if (value) {
                        if (parseInt(value) >= 5) {
                            AsyncStorage.setItem("review_checkedHomeworkCount", "0");
                            setTimeout(function () {
                                AsyncStorage.getItem("review_given").then(function (value) {
                                    if (!value) {
                                        askForReview();
                                        AsyncStorage.setItem("review_given", "true");
                                    }
                                });
                            }, 1000);
                        }
                        else {
                            AsyncStorage.setItem("review_checkedHomeworkCount", (parseInt(value) + 1).toString());
                        }
                    }
                    else {
                        AsyncStorage.setItem("review_checkedHomeworkCount", "1");
                    }
                });
                return [2 /*return*/];
            });
        }); };
        return (<ScrollView style={{ width: width, height: "100%" }} contentContainerStyle={{
                padding: 16,
                paddingTop: outsideNav ? 72 : insets.top + 56,
            }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={function () { return updateHomeworks(true); }} progressViewOffset={outsideNav ? 72 : insets.top + 56}/>}>
        {!isOnline && <OfflineWarning cache={true}/>}

        {groupedHomework && Object.keys(groupedHomework).map(function (day) { return (<Reanimated.View key={day} entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)} layout={animPapillon(LinearTransition)}>
            <NativeListHeader animated label={day}/>

            <MemoizedNativeList animated>
              {groupedHomework[day].map(function (homework, idx) { return (<MemoizedHomeworkItem key={homework.id} index={idx} navigation={navigation} total={groupedHomework[day].length} homework={homework} onDonePressHandler={function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!homework.personalizate) return [3 /*break*/, 1];
                                    useHomeworkStore
                                        .getState()
                                        .updateHomework(item, homework.id, __assign(__assign({}, homework), { done: !homework.done }));
                                    return [3 /*break*/, 6];
                                case 1:
                                    if (!(account.service !== AccountService.Skolengo)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, toggleHomeworkState(account, homework)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, updateHomeworks(true, false, false)];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, countCheckForReview()];
                                case 5:
                                    _a.sent();
                                    _a.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); }}/>); })}
            </MemoizedNativeList>
          </Reanimated.View>); })}

        {groupedHomework && Object.keys(groupedHomework).length === 0 &&
                <Reanimated.View style={{
                        marginTop: 24,
                        width: "100%",
                    }} layout={animPapillon(LinearTransition)} key={searchTerms + hideDone}>
            {searchTerms.length > 0 ? (<MissingItem emoji="🔍" title="Aucun résultat" description="Aucun devoir ne correspond à ta recherche."/>) : hideDone ? (<MissingItem emoji="👏" title="Il ne te reste rien à faire !" description="Il n'y a aucun devoir non terminé pour cette semaine."/>) : hasServiceSetup ? (<MissingItem emoji="📚" title="Aucun devoir" description="Il n'y a aucun devoir pour cette semaine."/>) : (<MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷"/>)}
          </Reanimated.View>}

        <View style={{ height: 82 }}/>
      </ScrollView>);
    }, [
        homeworks,
        searchTerms,
        hideDone,
        updateHomeworks,
        navigation,
        getDayName,
        formatDate,
        insets,
        outsideNav,
        isOnline,
    ]);
    var onEndReached = function () {
        var lastWeek = data[data.length - 1];
        var newWeeks = Array.from({ length: 50 }, function (_, i) { return lastWeek + i + 1; });
        setData(function (prevData) { return __spreadArray(__spreadArray([], prevData, true), newWeeks, true); });
    };
    var onStartReached = function () {
        var _a;
        var firstWeek = data[0];
        var newWeeks = Array.from({ length: 50 }, function (_, i) { return firstWeek - 50 + i; });
        setData(function (prevData) { return __spreadArray(__spreadArray([], newWeeks, true), prevData, true); });
        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({ index: 50, animated: false });
    };
    var onScroll = useCallback(function (_a) {
        var nativeEvent = _a.nativeEvent;
        if (nativeEvent.contentOffset.x < width) {
            onStartReached();
        }
        // Update selected week based on scroll position
        var index = Math.round(nativeEvent.contentOffset.x / width);
        setSelectedWeek(data[index]);
    }, [width, data]);
    var onMomentumScrollEnd = useCallback(function (_a) {
        var nativeEvent = _a.nativeEvent;
        var index = Math.round(nativeEvent.contentOffset.x / width);
        setSelectedWeek(data[index]);
    }, [width, data]);
    var SearchRef = useRef(null);
    return (<View>
      <PapillonModernHeader outsideNav={outsideNav}>
        <Reanimated.View layout={animPapillon(LinearTransition)} entering={animPapillon(FadeIn).delay(100)} exiting={animPapillon(FadeOutLeft)}>
          <PressableScale style={[styles.weekPickerContainer]} onPress={function () { return setShowDatePickerWeek(true); }}>
            <Reanimated.View layout={animPapillon(LinearTransition)} style={[{
                backgroundColor: theme.colors.text + 16,
                overflow: "hidden",
                borderRadius: 80,
            }]}>
              <BlurView style={[styles.weekPicker, {
                backgroundColor: "transparent",
            }]} tint={theme.dark ? "dark" : "light"}>
                <Reanimated.Text style={[
            styles.weekPickerText,
            styles.weekPickerTextIntl,
            {
                color: theme.colors.text,
            },
        ]} layout={animPapillon(LinearTransition)}>
                  {width > 370 ? "Semaine" : "sem."}
                </Reanimated.Text>

                <Reanimated.View layout={animPapillon(LinearTransition)}>
                  <AnimatedNumber value={calculateWeekNumber(epochWNToDate(selectedWeek))} style={[
            styles.weekPickerText,
            styles.weekPickerTextNbr,
            {
                color: theme.colors.text,
            },
        ]}/>
                </Reanimated.View>

                {loading &&
            <PapillonSpinner size={18} color={theme.colors.text} strokeWidth={2.8} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)} style={{
                    marginLeft: 5,
                }}/>}
              </BlurView>
            </Reanimated.View>
          </PressableScale>
        </Reanimated.View>

        <Reanimated.View layout={animPapillon(LinearTransition)} style={{
            flex: 1
        }}/>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: hideDone ? theme.colors.primary : theme.colors.background + "ff",
            borderColor: theme.colors.border + "dd",
            borderWidth: 1,
            borderRadius: 800,
            height: 40,
            width: 40,
            gap: 4,
            shadowColor: "#00000022",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
        }}>
            <TouchableOpacity onPress={function () {
            setHideDone(!hideDone);
        }}>
              <CheckSquare size={20} color={hideDone ? "#fff" : theme.colors.text} strokeWidth={2.5} opacity={hideDone ? 1 : 0.7}/>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            backgroundColor: theme.colors.background + "ff",
            borderColor: theme.colors.border + "dd",
            borderWidth: 1,
            borderRadius: 800,
            paddingHorizontal: 14,
            height: 40,
            width: 40,
            gap: 4,
            shadowColor: "#00000022",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
            maxWidth: "60%",
        }}>
            <TouchableOpacity onPress={function () { var _a; return (_a = SearchRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }}>
              <Search size={20} color={theme.colors.text} strokeWidth={2.5} opacity={0.7}/>
            </TouchableOpacity>

            <Reanimated.View layout={animPapillon(LinearTransition)} style={{
            flex: 1,
            overflow: "hidden",
            borderRadius: 80,
        }} entering={FadeIn.duration(250).delay(20)} exiting={FadeOut.duration(100)}>
              <ResponsiveTextInput placeholder={hideDone ? "Non terminés" : "Rechercher"} value={searchTerms} onChangeText={setSearchTerms} placeholderTextColor={theme.colors.text + "80"} style={{
            color: theme.colors.text,
            padding: 7,
            borderRadius: 80,
            fontFamily: "medium",
            fontSize: 16.5,
        }} ref={SearchRef}/>
            </Reanimated.View>

            {searchTerms.length > 0 && (<TouchableOpacity onPress={function () { return setSearchTerms(""); }}>
                <Reanimated.View layout={animPapillon(LinearTransition)} entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)}>
                  <X size={20} color={theme.colors.text} strokeWidth={2.5} opacity={0.7}/>
                </Reanimated.View>
              </TouchableOpacity>)}
          </View>
        </View>

        {showDatePickerWeek && (<DateModal currentDate={weekNumberToMiddleDate(selectedWeek)} onDateSelect={function (selectedDate) {
                var _a;
                if (selectedDate) {
                    selectedDate.setUTCHours(1, 0, 0, 0);
                    var weekNumber_1 = dateToEpochWeekNumber(selectedDate);
                    var index = data.findIndex(function (week) { return week === weekNumber_1; });
                    if (index !== -1) {
                        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({ index: index, animated: true });
                        setSelectedWeek(weekNumber_1);
                        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, updateHomeworks(true, false, true)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 500);
                    }
                }
            }} showDatePicker={showDatePickerWeek} setShowDatePicker={setShowDatePickerWeek} isHomework/>)}
      </PapillonModernHeader>

      <AddHomeworkButton onPress={function () { return navigation.navigate("AddHomework", {}); }} outsideNav={(_f = (_e = route.params) === null || _e === void 0 ? void 0 : _e.outsideNav) !== null && _f !== void 0 ? _f : false}/>

      <FlatList ref={flatListRef} data={data} renderItem={renderWeek} keyExtractor={keyExtractor} horizontal pagingEnabled showsHorizontalScrollIndicator={false} initialNumToRender={3} maxToRenderPerBatch={5} windowSize={5} getItemLayout={getItemLayout} onEndReached={onEndReached} onEndReachedThreshold={0.1} onScroll={onScroll} onMomentumScrollEnd={onMomentumScrollEnd} scrollEventThrottle={16} initialScrollIndex={50} style={{
            height: "100%",
        }}/>
    </View>);
};
var AddHomeworkButton = function (_a) {
    var onPress = _a.onPress, outsideNav = _a.outsideNav;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    return (<Pressable onPress={function () { return onPress(); }} style={function (_a) {
            var pressed = _a.pressed;
            return [
                {
                    position: "absolute",
                    zIndex: 999999,
                    bottom: 16 + (outsideNav ? insets.bottom : 0),
                    right: 16,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    overflow: "visible",
                }
            ];
        }}>
      <View style={{
            width: 50,
            height: 50,
            borderRadius: 30,
            backgroundColor: theme.colors.primary,
            justifyContent: "center",
            alignItems: "center"
        }}>
        <Plus color={"#fff"} size={28} strokeWidth={2.5}/>
      </View>
    </Pressable>);
};
var styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: "absolute",
        top: 0,
        left: 0,
    },
    weekPickerContainer: {},
    weekPicker: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 80,
        gap: 6,
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        alignSelf: "flex-start",
        overflow: "hidden",
    },
    weekPickerText: {
        zIndex: 10000,
    },
    weekPickerTextIntl: {
        fontSize: 14.5,
        fontFamily: "medium",
        opacity: 0.7,
    },
    weekPickerTextNbr: {
        fontSize: 16.5,
        fontFamily: "semibold",
        marginTop: -1.5,
    },
    weekButton: {
        overflow: "hidden",
        borderRadius: 80,
        height: 38,
        width: 38,
        justifyContent: "center",
        alignItems: "center",
    },
});
export default WeekView;
