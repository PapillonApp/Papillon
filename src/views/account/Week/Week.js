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
import * as React from "react";
import { memo, useCallback, useMemo, useEffect } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CalendarKit from "@howljs/calendar-kit";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { AlertTriangle, CalendarDays } from "lucide-react-native";
import { PapillonHeaderAction } from "@/components/Global/PapillonModernHeader";
import { getSubjectData } from "@/services/shared/Subject";
import { PapillonNavigation } from "@/router/refs";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { TimetableClassStatus } from "@/services/shared/Timetable";
import { NativeText } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { fetchIcalData } from "@/services/local/ical";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var LOCALES = {
    en: {
        weekDayShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        meridiem: { ante: "am", post: "pm" },
        more: "more",
    },
    fr: {
        weekDayShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
        meridiem: { ante: "am", post: "pm" },
        more: "plus",
    },
};
var EventItem = memo(function (_a) {
    var event = _a.event;
    var theme = useTheme();
    var subjectData = useMemo(function () { return getSubjectData(event.event.title); }, [event.event.title] // Optimized dependency array
    );
    var _b = React.useState({ width: 0, height: 0 }), layout = _b[0], setLayout = _b[1];
    var isCanceled = event.event.status === TimetableClassStatus.CANCELED;
    var isWide = layout.width > 100;
    var handlePress = function () {
        var _a;
        (_a = PapillonNavigation.current) === null || _a === void 0 ? void 0 : _a.navigate("LessonDocument", { lesson: event.event });
    };
    var containerStyle = [
        styles.container,
        { backgroundColor: subjectData.color },
        isCanceled && styles.canceledContainer
    ];
    var contentStyle = [
        styles.contentContainer,
        { backgroundColor: subjectData.color + "22", borderColor: theme.colors.border },
        isCanceled && styles.canceledContent
    ];
    var titleStyle = [
        styles.title,
        isWide && styles.wideTitleVariant,
        { color: "#ffffff" }
    ];
    var roomStyle = [
        styles.room,
        { color: "#ffffff" }
    ];
    return (<TouchableOpacity onLayout={function (e) { return setLayout(e.nativeEvent.layout); }} style={containerStyle} activeOpacity={0.7} onPress={handlePress}>
      {event.event.statusText && (<View style={styles.alertBadge}>
          <AlertTriangle size={18} color="#ffffff" strokeWidth={2} style={styles.alertIcon}/>
        </View>)}
      <View style={{
            height: 6,
            backgroundColor: "#00000042",
            overflow: "hidden",
        }}>
        <Image source={require("../../../../assets/images/mask_stripes_long.png")} resizeMode="cover" style={{ width: 2000, height: 16, tintColor: "#000000", opacity: 0.3 }}/>
      </View>
      <View style={contentStyle}>
        <Text numberOfLines={3} style={titleStyle}>
          {subjectData.pretty}
        </Text>
        <Text numberOfLines={2} style={roomStyle}>
          {event.event.room}
        </Text>
      </View>
    </TouchableOpacity>);
});
var HeaderItem = memo(function (_a) {
    var header = _a.header;
    var theme = useTheme();
    var cols = header.extra.columns;
    var start = header.startUnix;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var todayStamp = today.getTime();
    return (<View style={{
            flex: 1,
            flexDirection: "row",
            height: 50,
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
        }}>
      {Array.from({ length: cols }, function (_, i) { return (<View key={i} style={[
                {
                    flex: 1,
                    height: 50,
                    justifyContent: "center",
                    gap: 1,
                    paddingTop: 1,
                }
            ]}>
          {cols > 1 && (<Text style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontFamily: "medium",
                    opacity: 0.6,
                    letterSpacing: 0.5,
                    color: theme.colors.text,
                }}>
              {new Date(start
                    + i * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { weekday: "short" })}
            </Text>)}
          <Text style={[
                {
                    textAlign: "center",
                    fontSize: 17,
                    fontFamily: "semibold",
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    alignSelf: "center",
                    borderRadius: 12,
                    minWidth: 42,
                    borderCurve: "continuous",
                    overflow: "hidden",
                    color: theme.colors.text,
                },
                start
                    + i * 24 * 60 * 60 * 1000 === todayStamp && {
                    backgroundColor: theme.colors.primary,
                    color: "white",
                }
            ]}>
            {new Date(start
                + i * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", cols > 1 ? { day: "numeric" } : {
                weekday: "long",
                day: "numeric",
                month: "long",
            })}
          </Text>
        </View>); })}
    </View>);
});
var displayModes = ["Semaine", "3 jours", "Journée"];
var Week = function (_a) {
    var _b, _c, _d;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var isOnline = useOnlineStatus().isOnline;
    var outsideNav = (_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav;
    var _e = React.useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var account = useCurrentAccount(function (store) { return store.account; });
    var timetables = useTimetableStore(function (store) { return store.timetables; });
    var _f = React.useState("Semaine"), displayMode = _f[0], setDisplayMode = _f[1];
    var customTheme = useMemo(function () { return ({
        colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            border: theme.colors.border + "88",
            text: theme.colors.text,
            surface: theme.colors.card,
            onPrimary: theme.colors.background,
            onBackground: theme.colors.text,
            onSurface: theme.colors.text,
        }
    }); }, [theme.colors]);
    var _g = React.useState([]), events = _g[0], setEvents = _g[1];
    useEffect(function () {
        if (!timetables)
            return;
        var nevts = Object.values(timetables)
            .flat()
            .map(function (event) { return ({
            id: event.id.toString(),
            title: event.title,
            start: { dateTime: new Date(event.startTimestamp) },
            end: { dateTime: new Date(event.endTimestamp) },
            event: event,
        }); });
        // @ts-ignore
        setEvents(nevts);
    }, [timetables]);
    var loadTimetableWeek = useCallback(function (weekNumber_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([weekNumber_1], args_1, true), void 0, function (weekNumber, force) {
            if (force === void 0) { force = false; }
            return __generator(this, function (_a) {
                if (!force) {
                    if (timetables[weekNumber])
                        return [2 /*return*/];
                }
                setIsLoading(true);
                requestAnimationFrame(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, , 3, 4]);
                                return [4 /*yield*/, updateTimetableForWeekInCache(account, weekNumber, force)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, fetchIcalData(account, force)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                setIsLoading(false);
                                return [7 /*endfinally*/];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    }, [account, timetables]);
    var handleDateChange = useCallback(function (date) { return __awaiter(void 0, void 0, void 0, function () {
        var weekNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    weekNumber = dateToEpochWeekNumber(new Date(date));
                    return [4 /*yield*/, loadTimetableWeek(weekNumber)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [loadTimetableWeek]);
    var _h = React.useState(false), openedIcalModal = _h[0], setOpenedIcalModal = _h[1];
    var initialDate = useMemo(function () {
        if (displayMode === "Journée") {
            return new Date();
        }
        return undefined;
    }, [displayMode]);
    var calendarKey = useMemo(function () {
        if (displayMode === "Journée") {
            return "journee-".concat(new Date().toDateString());
        }
        return displayMode;
    }, [displayMode]);
    React.useEffect(function () {
        var _a, _b;
        if (events.length === 0 && (((_b = (_a = account === null || account === void 0 ? void 0 : account.personalization) === null || _a === void 0 ? void 0 : _a.icalURLs) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0) {
            setIsLoading(true);
            requestAnimationFrame(function () { return __awaiter(void 0, void 0, void 0, function () {
                var weekNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            weekNumber = dateToEpochWeekNumber(new Date());
                            return [4 /*yield*/, loadTimetableWeek(weekNumber, true)];
                        case 1:
                            _a.sent();
                            setOpenedIcalModal(false);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    }, [(_c = account === null || account === void 0 ? void 0 : account.personalization) === null || _c === void 0 ? void 0 : _c.icalURLs]);
    return (<View style={{ flex: 1, marginTop: insets.top }}>
      {!isOnline && (<View style={{ padding: 16 }}>
          <OfflineWarning cache={true}/>
        </View>)}

      {((_d = account === null || account === void 0 ? void 0 : account.providers) === null || _d === void 0 ? void 0 : _d.includes("ical")) && Object.values(timetables).flat().length === 0 && (<View style={{
                zIndex: 100000,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "100%",
                backgroundColor: theme.colors.background,
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                padding: 24,
            }}>
          {isLoading ? (<PapillonSpinner color={theme.colors.primary}/>) : (<>
              <CalendarDays size={36} strokeWidth={2} color={theme.colors.text} style={{ marginBottom: 6 }}/>
              <NativeText variant="title" style={{ textAlign: "center" }}>
                Aucun agenda externe
              </NativeText>
              <NativeText variant="subtitle" style={{ textAlign: "center" }}>
                Importez un calendrier depuis une URL de votre agenda externe tel que ADE ou Moodle.
              </NativeText>

              <View style={{ height: 24 }}/>

              <ButtonCta value="Importer mes cours" primary onPress={function () {
                    setOpenedIcalModal(true);
                    setTimeout(function () {
                        var _a;
                        (_a = PapillonNavigation.current) === null || _a === void 0 ? void 0 : _a.navigate("LessonsImportIcal", {});
                    }, 100);
                }}/>
              <ButtonCta value="Comment faire ?" onPress={function () {
                    Linking.openURL("https://support.papillon.bzh/articles/351142-import-ical");
                }}/>
            </>)}
        </View>)}

      <View style={{
            zIndex: 1000,
            overflow: "visible",
            position: "absolute",
            left: 12,
            top: 3,
        }}>
        <PapillonPicker animated direction="left" delay={0} selected={displayMode} onSelectionChange={function (mode) {
            setIsLoading(true);
            requestAnimationFrame(function () {
                setDisplayMode(mode);
                setIsLoading(false);
            });
        }} data={displayModes}>
          <PapillonHeaderAction icon={isLoading ? (<PapillonSpinner size={20} strokeWidth={5} color={theme.colors.text}/>) : (<CalendarDays />)}/>
        </PapillonPicker>
      </View>

      <CalendarKit theme={customTheme} numberOfDays={displayMode === "Semaine" ? 5 : displayMode === "3 jours" ? 3 : 1} hideWeekDays={displayMode === "Semaine" ? [6, 7] : []} pagesPerSide={2} scrollByDay={displayMode === "Semaine" ? false : true} events={events} onDateChanged={handleDateChange} initialLocales={LOCALES} locale="fr" hourFormat="HH:mm" renderEvent={function (event) { return <EventItem event={event}/>; }} renderHeaderItem={function (header) { return <HeaderItem header={header}/>; }} dayBarHeight={50} key={calendarKey} initialDate={initialDate}/>
    </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 5,
        overflow: "hidden",
        borderCurve: "continuous",
    },
    canceledContainer: {
        borderColor: "red",
        borderWidth: 4,
        borderStyle: "dotted",
        backgroundColor: "transparent",
    },
    alertBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#00000099",
        zIndex: 1000,
        borderRadius: 30,
        borderColor: "#ffffff99",
        borderWidth: 2,
        padding: 4,
        paddingBottom: 2,
        paddingLeft: 2,
    },
    alertIcon: {
        margin: 4,
    },
    contentContainer: {
        flex: 1,
        borderRadius: 0,
        padding: 4,
        flexDirection: "column",
        gap: 2,
        borderWidth: 0,
    },
    canceledContent: {
        opacity: 0.5,
        backgroundColor: "grey",
        borderWidth: 0,
    },
    title: {
        fontSize: 11.5,
        letterSpacing: 0.2,
        fontFamily: "semibold",
        textTransform: "uppercase",
        zIndex: 100,
    },
    wideTitleVariant: {
        fontSize: 15,
        letterSpacing: 0.1,
        textTransform: "none",
    },
    room: {
        fontSize: 11,
        letterSpacing: 0.2,
        fontFamily: "medium",
        opacity: 0.6,
        zIndex: 100,
    },
});
export default memo(Week);
