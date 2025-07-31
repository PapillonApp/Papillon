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
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { reduceIcalToCourse } from "./utils/reduceIcalToCourse";
import { error } from "@/utils/logger/logger";
import { useTimetableStore } from "@/stores/timetable";
var icalParser = require("cal-parser");
var MERGE_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds
export var fetchIcalData = function (account_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([account_1], args_1, true), void 0, function (account, force) {
        var identityProvider, courses, icalURLs, _loop_1, _a, icalURLs_1, ical, coursesByEpochWeekNumber, _b, coursesByEpochWeekNumber_1, courses_1, mergedCourses, nonEmptyWeeks, _c, nonEmptyWeeks_1, courses_2, newData;
        if (force === void 0) { force = false; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (account.isExternal) {
                        error("Cannot fetch iCals for account type ".concat(account.service), "fetchIcalData");
                        return [2 /*return*/, []];
                    }
                    identityProvider = account.identityProvider || "";
                    courses = [];
                    icalURLs = account.personalization.icalURLs || [];
                    if (icalURLs.length === 0) {
                        return [2 /*return*/, []];
                    }
                    _loop_1 = function (ical) {
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, fetch(ical.url.trim(), {
                                        headers: {
                                            "User-Agent": "Papillon",
                                        },
                                    })
                                        .then(function (res) {
                                        return res.text();
                                    })
                                        .then(function (text) {
                                        var parsed = icalParser.parseString(text).events;
                                        for (var _i = 0, parsed_1 = parsed; _i < parsed_1.length; _i++) {
                                            var event_1 = parsed_1[_i];
                                            courses.push(reduceIcalToCourse(event_1, identityProvider, ical.url));
                                        }
                                    })];
                                case 1:
                                    _e.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, icalURLs_1 = icalURLs;
                    _d.label = 1;
                case 1:
                    if (!(_a < icalURLs_1.length)) return [3 /*break*/, 4];
                    ical = icalURLs_1[_a];
                    return [5 /*yield**/, _loop_1(ical)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _a++;
                    return [3 /*break*/, 1];
                case 4:
                    if (courses.length === 0) {
                        return [2 /*return*/, []];
                    }
                    coursesByEpochWeekNumber = courses.reduce(function (acc, course) {
                        var epochWeekNumber = dateToEpochWeekNumber(new Date(course.startTimestamp));
                        var item = acc.find(function (c) { return c.epochWeekNumber === epochWeekNumber; });
                        if (item) {
                            item.courses.push(course);
                        }
                        else {
                            acc.push({ epochWeekNumber: epochWeekNumber, courses: [course] });
                        }
                        return acc;
                    }, []);
                    // merge courses with same subject, room, title and itemType, and less than 20 minutes between them
                    for (_b = 0, coursesByEpochWeekNumber_1 = coursesByEpochWeekNumber; _b < coursesByEpochWeekNumber_1.length; _b++) {
                        courses_1 = coursesByEpochWeekNumber_1[_b].courses;
                        courses_1.sort(function (a, b) { return a.startTimestamp - b.startTimestamp; });
                        mergedCourses = courses_1.reduce(function (acc, course) {
                            var lastCourse = acc[acc.length - 1];
                            if (lastCourse &&
                                lastCourse.subject === course.subject &&
                                lastCourse.room === course.room &&
                                lastCourse.title === course.title &&
                                lastCourse.itemType === course.itemType &&
                                course.startTimestamp - lastCourse.endTimestamp <= MERGE_THRESHOLD) {
                                lastCourse.endTimestamp = Math.max(lastCourse.endTimestamp, course.endTimestamp);
                            }
                            else {
                                acc.push(course);
                            }
                            return acc;
                        }, []);
                        courses_1.splice.apply(courses_1, __spreadArray([0, courses_1.length], mergedCourses, false));
                    }
                    nonEmptyWeeks = coursesByEpochWeekNumber.filter(function (week) { return week.courses.length > 0; });
                    // for each non-empty week, sort by startTimestamp
                    for (_c = 0, nonEmptyWeeks_1 = nonEmptyWeeks; _c < nonEmptyWeeks_1.length; _c++) {
                        courses_2 = nonEmptyWeeks_1[_c].courses;
                        courses_2.sort(function (a, b) { return a.startTimestamp - b.startTimestamp; });
                    }
                    newData = nonEmptyWeeks.reduce(
                    // Maybe add better typing, I added any type because didn't understand following lines :(
                    function (acc, _a) {
                        var epochWeekNumber = _a.epochWeekNumber, courses = _a.courses;
                        acc[epochWeekNumber] = courses;
                        return acc;
                    }, {});
                    useTimetableStore.getState().injectClasses(newData);
                    return [2 /*return*/, nonEmptyWeeks];
            }
        });
    });
};
