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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { getWeekFrequency, updateTimetableForWeekInCache } from "@/services/timetable";
import { Page } from "./Atoms/Page";
import DateModal from "../../../components/Global/DateModal";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import * as StoreReview from "expo-store-review";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn, } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { CalendarPlus, Eye, EyeOff, MoreVertical } from "lucide-react-native";
import { PapillonHeaderAction, PapillonHeaderSelector, PapillonHeaderSeparator, PapillonModernHeader, } from "@/components/Global/PapillonModernHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountService } from "@/stores/account/types";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { fetchIcalData } from "@/services/local/ical";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var Lessons = function (_a) {
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Timetable, account.localID) : true;
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var timetables = useTimetableStore(function (store) { return store.timetables; });
    var outsideNav = (_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav;
    var insets = useSafeAreaInsets();
    var theme = useTheme();
    var loadedWeeks = useRef(new Set());
    var currentlyLoadingWeeks = useRef(new Set());
    var _c = useState(account.personalization.showWeekFrequency), shouldShowWeekFrequency = _c[0], setShouldShowWeekFrequency = _c[1];
    var _d = useState(null), weekFrequency = _d[0], setWeekFrequency = _d[1];
    var _e = useState(0), maxStartTime = _e[0], setMaxStartTime = _e[1];
    var _f = useState(0), maxEndTime = _f[0], setMaxEndTime = _f[1];
    useEffect(function () {
        try {
            var lessons = Object.values(timetables).flat();
            if (lessons.length > 0) {
                var startTimes = lessons.map(function (lesson) {
                    var startDate = new Date(lesson.startTimestamp);
                    return startDate.getHours() * 60 + startDate.getMinutes();
                });
                var endTimes = lessons.map(function (lesson) {
                    var endDate = new Date(lesson.endTimestamp);
                    return endDate.getHours() * 60 + endDate.getMinutes();
                });
                var maxStart = Math.min.apply(Math, startTimes);
                var maxEnd = Math.max.apply(Math, endTimes);
                setMaxStartTime(maxStart);
                setMaxEndTime(maxEnd);
            }
        }
        catch (e) {
            console.log("Error calculating max start and end times:", e);
        }
    }, [timetables]);
    var _g = useScreenDimensions(), width = _g.width, height = _g.height, isTablet = _g.isTablet;
    var finalWidth = width - (isTablet ? (320 > width * 0.35 ? width * 0.35 :
        320) : 0);
    useEffect(function () {
        // add all week numbers in timetables to loadedWeeks
        for (var week in timetables) {
            loadedWeeks.current.add(parseInt(week));
        }
    }, [timetables]);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var _h = useState(new Date(today)), pickerDate = _h[0], setPickerDate = _h[1];
    var getWeekFromDate = function (date) {
        var epochWeekNumber = dateToEpochWeekNumber(date);
        return epochWeekNumber;
    };
    var _j = useState(new Set()), updatedWeeks = _j[0], setUpdatedWeeks = _j[1];
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var weekNumber, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        weekNumber = getWeekFromDate(pickerDate);
                        return [4 /*yield*/, loadTimetableWeek(weekNumber, false)];
                    case 1:
                        _b.sent();
                        _a = setWeekFrequency;
                        return [4 /*yield*/, getWeekFrequency(account, weekNumber)];
                    case 2:
                        _a.apply(void 0, [(_b.sent())]);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [pickerDate, account.instance]);
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mutateProperty("personalization", __assign(__assign({}, account.personalization), { showWeekFrequency: shouldShowWeekFrequency }));
                return [2 /*return*/];
            });
        }); })();
    }, [shouldShowWeekFrequency]);
    useEffect(function () {
        loadTimetableWeek(getWeekFromDate(new Date()), true);
    }, [account.personalization.icalURLs]);
    var _k = useState([]), loadingWeeks = _k[0], setLoadingWeeks = _k[1];
    var _l = useState(false), loading = _l[0], setLoading = _l[1];
    var _m = useState(false), showDatePicker = _m[0], setShowDatePicker = _m[1];
    var loadTimetableWeek = function (weekNumber_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([weekNumber_1], args_1, true), void 0, function (weekNumber, force) {
            if (force === void 0) { force = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ((currentlyLoadingWeeks.current.has(weekNumber) ||
                            loadedWeeks.current.has(weekNumber)) &&
                            !force) {
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        if (force) {
                            setLoadingWeeks(__spreadArray(__spreadArray([], loadingWeeks, true), [weekNumber], false));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 5]);
                        return [4 /*yield*/, updateTimetableForWeekInCache(account, weekNumber, force)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, fetchIcalData(account, force)];
                    case 3:
                        _a.sent();
                        currentlyLoadingWeeks.current.add(weekNumber);
                        return [3 /*break*/, 5];
                    case 4:
                        currentlyLoadingWeeks.current.delete(weekNumber);
                        loadedWeeks.current.add(weekNumber);
                        setUpdatedWeeks(new Set(updatedWeeks).add(weekNumber));
                        setLoadingWeeks(loadingWeeks.filter(function (w) { return w !== weekNumber; }));
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var getAllLessonsForDay = function (date) {
        var week = getWeekFromDate(date);
        var timetable = timetables[week] || [];
        var newDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        var day = timetable.filter(function (lesson) {
            var startTimetableDate = new Date(lesson.startTimestamp);
            var lessonDate = Date.UTC(startTimetableDate.getFullYear(), startTimetableDate.getMonth(), startTimetableDate.getDate());
            return lessonDate === newDate;
        });
        return day;
    };
    var flatListRef = useRef(null);
    useEffect(function () {
        if (flatListRef.current) {
            var normalizeDate_1 = function (date) {
                var newDate = new Date(date);
                newDate.setHours(0, 0, 0, 0);
                return newDate;
            };
            var index = data.findIndex(function (d) { return normalizeDate_1(d).getTime() === normalizeDate_1(pickerDate).getTime(); });
            if (index >= 0) {
                flatListRef.current.scrollToIndex({
                    index: index,
                    animated: true,
                });
            }
        }
    }, [width, height]);
    var _o = useState(function () {
        var today = new Date();
        return Array.from({ length: 100 }, function (_, i) {
            var date = new Date(today);
            date.setDate(today.getDate() - 50 + i);
            date.setHours(0, 0, 0, 0);
            return date;
        });
    }), data = _o[0], setData = _o[1];
    var renderItem = useCallback(function (_a) {
        var date = _a.item;
        var weekNumber = getWeekFromDate(date);
        return (<View style={{ width: finalWidth, height: "100%" }}>
          <Page hasServiceSetup={hasServiceSetup} paddingTop={outsideNav ? 80 : insets.top + 56} current={true} date={date} day={getAllLessonsForDay(date)} weekExists={timetables[weekNumber] && timetables[weekNumber].length > 0} refreshAction={function () { return loadTimetableWeek(weekNumber, true); }} loading={loadingWeeks.includes(weekNumber)} maxStart={maxStartTime} maxEnd={maxEndTime}/>
        </View>);
    }, [
        pickerDate,
        timetables,
        loadingWeeks,
        outsideNav,
        insets,
        finalWidth,
        getAllLessonsForDay,
        loadTimetableWeek,
    ]);
    var onViewableItemsChanged = useCallback(function (_a) {
        var viewableItems = _a.viewableItems;
        if (viewableItems.length > 0) {
            var newDate = viewableItems[0].item;
            setPickerDate(newDate);
            loadTimetableWeek(getWeekFromDate(newDate), false);
        }
    }, [loadTimetableWeek]);
    var getItemLayout = useCallback(function (_, index) { return ({
        length: finalWidth,
        offset: finalWidth * index,
        index: index,
    }); }, [finalWidth]);
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
    useEffect(function () {
        // on focus
        var unsubscribe = navigation.addListener("focus", function () {
            AsyncStorage.getItem("review_coursesOpen").then(function (value) {
                if (value) {
                    if (parseInt(value) >= 7) {
                        AsyncStorage.setItem("review_coursesOpen", "0");
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
                        AsyncStorage.setItem("review_coursesOpen", (parseInt(value) + 1).toString());
                    }
                }
                else {
                    AsyncStorage.setItem("review_coursesOpen", "1");
                }
            });
        });
        return unsubscribe;
    }, []);
    var onDateSelect = function (date) {
        var newDate = new Date(date || 0);
        newDate.setHours(0, 0, 0, 0);
        setPickerDate(newDate);
        var firstDate = data[0];
        var lastDate = data[data.length - 1];
        var updatedData = __spreadArray([], data, true);
        var uniqueDates = new Set(updatedData.map(function (d) { return d.getTime(); }));
        if (newDate < firstDate) {
            var dates = [];
            for (var d = new Date(firstDate); d >= newDate; d.setDate(d.getDate() - 1)) {
                if (!uniqueDates.has(d.getTime())) {
                    dates.unshift(new Date(d));
                    uniqueDates.add(d.getTime());
                }
            }
            updatedData = __spreadArray(__spreadArray([], dates, true), data, true);
        }
        else if (newDate > lastDate) {
            var dates = [];
            for (var d = new Date(lastDate); d <= newDate; d.setDate(d.getDate() + 1)) {
                if (!uniqueDates.has(d.getTime())) {
                    dates.push(new Date(d));
                    uniqueDates.add(d.getTime());
                }
            }
            updatedData = __spreadArray(__spreadArray([], data, true), dates, true);
        }
        setData(updatedData);
        setTimeout(function () {
            var _a;
            var index = updatedData.findIndex(function (d) { return d.getTime() === newDate.getTime(); });
            if (index !== -1) {
                (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({ index: index, animated: false });
            }
        }, 0);
    };
    return (<View style={{ flex: 1 }}>
      <PapillonModernHeader outsideNav={outsideNav}>
        <PapillonHeaderSelector loading={loading} onPress={function () { return setShowDatePicker(true); }} onLongPress={function () {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            onDateSelect(today);
        }}>
          <Reanimated.View layout={animPapillon(LinearTransition)}>
            <Reanimated.View key={pickerDate.toLocaleDateString("fr-FR", { weekday: "short" })} entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
              <Reanimated.Text style={[
            styles.weekPickerText,
            styles.weekPickerTextIntl,
            {
                color: theme.colors.text,
            },
        ]}>
                {pickerDate.toLocaleDateString("fr-FR", { weekday: "long" })}
              </Reanimated.Text>
            </Reanimated.View>
          </Reanimated.View>

          <AnimatedNumber value={pickerDate.getDate().toString()} style={[
            styles.weekPickerText,
            styles.weekPickerTextNbr,
            {
                color: theme.colors.text,
            },
        ]}/>

          <Reanimated.Text style={[
            styles.weekPickerText,
            styles.weekPickerTextIntl,
            {
                color: theme.colors.text,
            },
        ]} layout={animPapillon(LinearTransition)}>
            {pickerDate.toLocaleDateString("fr-FR", { month: "long" })}
          </Reanimated.Text>

          {weekFrequency && shouldShowWeekFrequency && (<Reanimated.View layout={animPapillon(LinearTransition)} entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
              <Reanimated.View style={[
                {
                    borderColor: theme.colors.text,
                    borderWidth: 1,
                    paddingHorizontal: 4,
                    paddingVertical: 3,
                    borderRadius: 6,
                    opacity: 0.5,
                },
            ]} layout={animPapillon(LinearTransition)}>
                <Reanimated.Text style={[
                {
                    color: theme.colors.text,
                    fontFamily: "medium",
                    letterSpacing: 0.5,
                },
            ]} layout={animPapillon(LinearTransition)}>
                  {weekFrequency.freqLabel}
                </Reanimated.Text>
              </Reanimated.View>
            </Reanimated.View>)}
        </PapillonHeaderSelector>

        <PapillonHeaderSeparator />

        <PapillonPicker animated direction="right" delay={0} data={[
            {
                icon: <CalendarPlus />,
                label: "Importer un iCal",
                subtitle: "Ajouter un calendrier depuis une URL",
                sfSymbol: "calendar.badge.plus",
                onPress: function () {
                    navigation.navigate("LessonsImportIcal", {});
                }
            },
            account.service === AccountService.Pronote ? {
                icon: shouldShowWeekFrequency ? <EyeOff /> : <Eye />,
                label: shouldShowWeekFrequency
                    ? "Masquer alternance semaine"
                    : "Afficher alternance semaine",
                subtitle: shouldShowWeekFrequency
                    ? "Masquer semaine paire / impaire"
                    : "Afficher semaine paire / impaire",
                sfSymbol: "eye",
                onPress: function () {
                    setShouldShowWeekFrequency(!shouldShowWeekFrequency);
                },
                checked: shouldShowWeekFrequency,
            } : null,
        ]}>
          <PapillonHeaderAction icon={<MoreVertical />} entering={animPapillon(ZoomIn)} exiting={FadeOut.duration(130)}/>
        </PapillonPicker>
      </PapillonModernHeader>

      <FlatList ref={flatListRef} data={data} renderItem={renderItem} keyExtractor={function (item) { return item.toISOString(); }} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ itemVisiblePercentThreshold: 50 }} getItemLayout={getItemLayout} initialScrollIndex={50} onEndReached={function () {
            // Charger plus de dates si nécessaire
            var lastDate = data[data.length - 1];
            var newDates = Array.from({ length: 34 }, function (_, i) {
                var date = new Date(lastDate);
                date.setDate(lastDate.getDate() + i + 1);
                return date;
            });
            setData(function (prevData) { return __spreadArray(__spreadArray([], prevData, true), newDates, true); });
        }} onEndReachedThreshold={0.5}/>

      <DateModal showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker} currentDate={pickerDate} onDateSelect={function (date) {
            onDateSelect(date);
        }} isHomework={false}/>
    </View>);
};
var styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: "absolute",
        top: 0,
        left: 0,
    },
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
export default Lessons;
