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
import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Calendar, Clock } from "lucide-react-native";
import WidgetHeader from "@/components/Home/WidgetHeader";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { getSubjectData } from "@/services/shared/Subject";
import { TimetableClassStatus } from "@/services/shared/Timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { updateTimetableForWeekInCache } from "@/services/timetable";
var lz = function (num) { return (num < 10 ? "0".concat(num) : num); };
var NextCourseWidget = forwardRef(function (_a, ref) {
    var hidden = _a.hidden, setHidden = _a.setHidden, loading = _a.loading, setLoading = _a.setLoading;
    var account = useCurrentAccount(function (store) { return store.account; });
    var timetables = useTimetableStore(function (store) { return store.timetables; });
    var _b = useState(null), nextCourse = _b[0], setNextCourse = _b[1];
    var _c = useState("Prochain cours"), widgetTitle = _c[0], setWidgetTitle = _c[1];
    var currentWeekNumber = useMemo(function () { return dateToEpochWeekNumber(new Date()); }, []);
    useImperativeHandle(ref, function () { return ({
        handlePress: function () { return "Lessons"; }
    }); });
    var fetchTimetable = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!timetables[currentWeekNumber] && account.instance)) return [3 /*break*/, 4];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, updateTimetableForWeekInCache(account, currentWeekNumber)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [account, currentWeekNumber, timetables, setLoading]);
    var updateNextCourse = useCallback(function () {
        var todayDate = new Date();
        var today = todayDate.getTime();
        if (!account.instance || !timetables[currentWeekNumber]) {
            setNextCourse(null);
            setHidden(true);
            return;
        }
        var weekCourses = timetables[currentWeekNumber];
        var updatedNextCourse = weekCourses
            .filter(function (c) { return c.endTimestamp > today && c.status !== TimetableClassStatus.CANCELED; })
            .sort(function (a, b) { return a.startTimestamp - b.startTimestamp; })[0];
        setNextCourse(updatedNextCourse);
        setHidden(!updatedNextCourse);
        setLoading(false);
    }, [account.instance, timetables, currentWeekNumber, setHidden, setLoading]);
    useEffect(function () {
        fetchTimetable();
    }, [fetchTimetable]);
    useEffect(function () {
        if (nextCourse) {
            setNextCourse(nextCourse);
            setHidden(false);
        }
        setLoading(false);
    }, [account.instance, timetables]);
    useEffect(function () {
        setLoading(true);
        updateNextCourse();
        var intervalId = setInterval(updateNextCourse, 60000); // Update every minute
        return function () { return clearInterval(intervalId); };
    }, [updateNextCourse, setLoading]);
    return !hidden && (<View style={{ width: "100%", height: "100%" }}>
      <WidgetHeader icon={<Calendar />} title={widgetTitle}/>
      {nextCourse ? (<NextCourseLesson nextCourse={nextCourse} setWidgetTitle={setWidgetTitle}/>) : (<View style={{ width: "100%", height: "88%", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {loading && <ActivityIndicator />}
          <Text style={{ color: "gray", fontSize: 15, fontFamily: "medium" }}>
            {loading ? "Chargement..." : "Aucun cours"}
          </Text>
        </View>)}
    </View>);
});
var NextCourseLesson = function (_a) {
    var nextCourse = _a.nextCourse, setWidgetTitle = _a.setWidgetTitle;
    var _b = useState({ color: "#888888", pretty: "Matière inconnue" }), subjectData = _b[0], setSubjectData = _b[1];
    var colors = useTheme().colors;
    var _c = useState(""), prettyTime = _c[0], setPrettyTime = _c[1];
    useEffect(function () {
        var fetchSubjectData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getSubjectData(nextCourse.title)];
                    case 1:
                        data = _a.sent();
                        setSubjectData(data);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchSubjectData();
    }, [nextCourse.title]);
    useEffect(function () {
        var updateRemainingTime = function () {
            var now = new Date().getTime();
            var distance = nextCourse.startTimestamp - now;
            var end = nextCourse.endTimestamp - now;
            if (distance > 0) {
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                if (days > 0) {
                    setPrettyTime("dans ".concat(days, " jour(s)"));
                }
                else if (hours > 0) {
                    setPrettyTime("dans ".concat(hours, "h ").concat(lz(minutes), "min"));
                }
                else {
                    setPrettyTime("dans ".concat(minutes, "min"));
                }
                setWidgetTitle("Prochain cours");
            }
            else if (end > 0) {
                var hours = Math.floor((end % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((end % (1000 * 60 * 60)) / (1000 * 60));
                setPrettyTime("reste ".concat(hours, "h ").concat(lz(minutes), "min"));
                setWidgetTitle("En classe");
            }
            else {
                setPrettyTime("Terminé");
                setWidgetTitle("Cours terminé");
            }
            // Schedule next update at the start of the next minute
            var nextMinute = new Date(now);
            nextMinute.setSeconds(0);
            nextMinute.setMilliseconds(0);
            nextMinute.setMinutes(nextMinute.getMinutes() + 1);
            var delay = nextMinute.getTime() - now;
            return setTimeout(updateRemainingTime, delay);
        };
        var timeout = updateRemainingTime();
        return function () { return clearTimeout(timeout); };
    }, [nextCourse, setWidgetTitle]);
    return (<View style={{ width: "100%", marginTop: 10, flex: 1, flexDirection: "row", gap: 10 }}>
      <ColorIndicator width={8} borderRadius={10} color={subjectData.color} style={{ flex: 0 }}/>
      <View style={{ flex: 1, width: "100%", justifyContent: "space-between" }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 17, fontFamily: "semibold" }}>
          {subjectData.pretty}
        </Text>
        <View style={{
            paddingHorizontal: 7,
            paddingVertical: 3,
            backgroundColor: subjectData.color + "33",
            borderRadius: 8,
            borderCurve: "continuous",
            alignSelf: "flex-start",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text numberOfLines={1} style={{
            color: subjectData.color,
            fontSize: 15,
            fontFamily: "semibold",
        }}>
              {nextCourse.room
            ? nextCourse.room.includes(",")
                ? "Plusieurs salles"
                : nextCourse.room
            : "Salle inconnue"}
            </Text>
          </View>

        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <Clock size={20} color={colors.text}/>
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontFamily: "medium" }}>
            {prettyTime}
          </Text>
        </View>
      </View>
    </View>);
};
export default NextCourseWidget;
