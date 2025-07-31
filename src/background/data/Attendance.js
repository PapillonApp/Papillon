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
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getAttendance, updateAttendanceState } from "../utils/attendance";
import { formatHoursMinutes } from "../utils/format";
var getDifferences = function (currentAttendance, updatedAttendance) {
    var absFilter = updatedAttendance.absences.filter(function (updatedItem) {
        return !currentAttendance.absences.some(function (item) {
            return item.fromTimestamp === updatedItem.fromTimestamp &&
                item.toTimestamp === updatedItem.toTimestamp;
        });
    });
    var delFilter = updatedAttendance.delays.filter(function (updatedItem) {
        return !currentAttendance.delays.some(function (item) {
            return item.timestamp === updatedItem.timestamp &&
                item.duration === updatedItem.duration;
        });
    });
    var obsFilter = updatedAttendance.observations.filter(function (updatedItem) {
        return !currentAttendance.observations.some(function (item) {
            return item.timestamp === updatedItem.timestamp &&
                item.sectionName === updatedItem.sectionName;
        });
    });
    var punFilter = updatedAttendance.punishments.filter(function (updatedItem) {
        return !currentAttendance.punishments.some(function (item) {
            return item.timestamp === updatedItem.timestamp &&
                item.duration === updatedItem.duration;
        });
    });
    return {
        absences: absFilter,
        delays: delFilter,
        observations: obsFilter,
        punishments: punFilter,
    };
};
var fetchAttendance = function () { return __awaiter(void 0, void 0, void 0, function () {
    var account, notificationsTypesPermissions, _a, defaultPeriod, attendances, updatedAttendance, differences, LAdifference, _b, thenewevent, explication, dateAbsencesDebut, dateAbsencesFin, dateRetard, dateObservations, LesExplication;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                account = getCurrentAccount();
                notificationsTypesPermissions = account.personalization.notifications;
                _a = getAttendance(), defaultPeriod = _a.defaultPeriod, attendances = _a.attendances;
                if (!(notificationsTypesPermissions === null || notificationsTypesPermissions === void 0 ? void 0 : notificationsTypesPermissions.attendance)) {
                    return [2 /*return*/, attendances[defaultPeriod]];
                }
                if (!__DEV__) return [3 /*break*/, 2];
                return [4 /*yield*/, papillonNotify({
                        id: "statusBackground",
                        title: account.name,
                        body: "Récupération des dernières événement de la vie scolaire...",
                        android: {
                            progress: {
                                max: 100,
                                current: (100 / 6) * 5,
                                indeterminate: false,
                            },
                        },
                    }, "Status")];
            case 1:
                _d.sent();
                _d.label = 2;
            case 2: return [4 /*yield*/, updateAttendanceState(account, defaultPeriod)];
            case 3:
                _d.sent();
                updatedAttendance = getAttendance().attendances[defaultPeriod];
                differences = getDifferences(attendances[defaultPeriod], updatedAttendance);
                LAdifference = differences.absences.length +
                    differences.delays.length +
                    differences.observations.length +
                    differences.punishments.length;
                _b = LAdifference;
                switch (_b) {
                    case 0: return [3 /*break*/, 4];
                    case 1: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 4: return [3 /*break*/, 9];
            case 5:
                thenewevent = "";
                explication = "";
                if (differences.absences.length === 1) {
                    dateAbsencesDebut = formatHoursMinutes(differences.absences[0].fromTimestamp);
                    dateAbsencesFin = formatHoursMinutes(differences.absences[0].toTimestamp);
                    thenewevent = "Nouvelle absence";
                    explication = "Tu as \u00E9t\u00E9 absent de ".concat(dateAbsencesDebut, " \u00E0 ").concat(dateAbsencesFin, ".");
                }
                else if (differences.delays.length === 1) {
                    dateRetard = formatHoursMinutes(differences.delays[0].timestamp);
                    thenewevent = "Nouveau retard";
                    explication = "Tu as \u00E9t\u00E9 en retard de ".concat(differences.delays[0].duration, " min \u00E0 ").concat(dateRetard, ".");
                }
                else if (differences.observations.length === 1) {
                    dateObservations = formatHoursMinutes(differences.observations[0].timestamp);
                    thenewevent = "Nouvelle observation";
                    explication = "Tu as eu une observation en ".concat((_c = differences.observations[0].subjectName) !== null && _c !== void 0 ? _c : "Matière inconnue", " \u00E0 ").concat(dateObservations, ".");
                }
                else {
                    thenewevent = "Nouvelle punition";
                    explication = "\n          Tu as eu une punition de ".concat(differences.punishments[0].givenBy, ".<br />\n          Raison : ").concat(differences.punishments[0].reason.circumstances, "\n          ");
                }
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-attendance"),
                        title: "[".concat(account.name, "] ").concat(thenewevent),
                        subtitle: defaultPeriod,
                        body: explication,
                        data: {
                            accountID: account.localID,
                            page: "Attendance"
                        }
                    }, "Attendance")];
            case 6:
                _d.sent();
                return [3 /*break*/, 9];
            case 7:
                LesExplication = [];
                if (differences.absences.length > 0) {
                    if (differences.absences.length === 1) {
                        LesExplication.push("1 nouvelle absence");
                    }
                    else {
                        LesExplication.push("".concat(differences.absences.length, " nouvelles absences"));
                    }
                }
                if (differences.delays.length > 0) {
                    if (differences.delays.length === 1) {
                        LesExplication.push("1 nouveau retard");
                    }
                    else {
                        LesExplication.push("".concat(differences.delays.length, " nouveaux retards"));
                    }
                }
                if (differences.observations.length > 0) {
                    if (differences.observations.length === 1) {
                        LesExplication.push("1 nouvelle observation");
                    }
                    else {
                        LesExplication.push("".concat(differences.observations.length, " nouvelles observations"));
                    }
                }
                if (differences.punishments.length > 0) {
                    if (differences.absences.length === 1) {
                        LesExplication.push("1 nouvelle punition");
                    }
                    else {
                        LesExplication.push("".concat(differences.punishments.length, " nouvelles punitions"));
                    }
                }
                return [4 /*yield*/, papillonNotify({
                        id: "".concat(account.name, "-attendance"),
                        title: "[".concat(account.name, "] Vie Scolaire"),
                        subtitle: defaultPeriod,
                        body: "De nouveaux \u00E9v\u00E9nements ont \u00E9t\u00E9 publi\u00E9s, consulte la vie scolaire pour plus de d\u00E9tails : ".concat(LesExplication.join(", "), "."),
                        data: {
                            accountID: account.localID,
                            page: "Attendance"
                        }
                    }, "Attendance")];
            case 8:
                _d.sent();
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, updatedAttendance];
        }
    });
}); };
export { fetchAttendance };
