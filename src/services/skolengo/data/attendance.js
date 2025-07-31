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
import { info } from "@/utils/logger/logger";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
var dateIntervalToDeltaInMin = function (from, to) { return Math.round((to.getTime() - from.getTime()) / (1000 * 60)); };
var dateIntervalToTime = function (from, to) {
    var deltaInMin = dateIntervalToDeltaInMin(from, to);
    if (deltaInMin < 60) {
        return "".concat(deltaInMin, "min");
    }
    else if (deltaInMin < 1440) {
        return "".concat(Math.floor(deltaInMin / 60), "h").concat(deltaInMin % 60);
    }
    else {
        return "".concat(Math.floor(deltaInMin / 1440), "j").concat(Math.floor((deltaInMin % 1440) / 60), "h").concat(deltaInMin % 60);
    }
};
var _strs = function (strs, defaultStr) { return strs.filter(function (e) { return e && e.trim().length > 0; }).length > 0 ? strs.filter(function (e) { return e && e.trim().length > 0; }).join(" - ") : defaultStr; };
export var getAttendance = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var absences, attendance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("skolengo");
                return [4 /*yield*/, account.instance.getAbsenceFiles()];
            case 1:
                absences = _a.sent();
                attendance = {
                    delays: [],
                    absences: [],
                    // Not implemented in Skolengo
                    punishments: [],
                    // Not implemented in Skolengo
                    observations: []
                };
                absences.map(function (e) { return e.currentState; }).forEach(function (absence) {
                    var _a, _b, _c;
                    switch (absence.absenceType) {
                        case ("ABSENCE"):
                            attendance.absences.push({
                                id: absence.id,
                                fromTimestamp: new Date(absence.absenceStartDateTime).getTime(),
                                toTimestamp: new Date(absence.absenceEndDateTime).getTime(),
                                justified: absence.absenceFileStatus === "LOCKED",
                                hours: dateIntervalToTime(new Date(absence.absenceStartDateTime), new Date(absence.absenceEndDateTime)),
                                administrativelyFixed: absence.absenceFileStatus === "LOCKED",
                                reasons: _strs([(_a = absence.absenceReason) === null || _a === void 0 ? void 0 : _a.longLabel, absence.comment], "Non renseigné"),
                            });
                            break;
                        case ("LATENESS"):
                            attendance.delays.push({
                                id: absence.id,
                                timestamp: new Date(absence.absenceStartDateTime).getTime(),
                                duration: dateIntervalToDeltaInMin(new Date(absence.absenceStartDateTime), new Date(absence.absenceEndDateTime)),
                                justified: absence.absenceFileStatus === "LOCKED",
                                reasons: _strs([(_b = absence.absenceReason) === null || _b === void 0 ? void 0 : _b.longLabel, absence.comment], "Non renseigné"),
                                justification: _strs([(_c = absence.absenceReason) === null || _c === void 0 ? void 0 : _c.longLabel, absence.comment], "Non renseigné"),
                            });
                            break;
                    }
                });
                info("SKOLENGO->getAttendance(): OK", "skolengo");
                return [2 /*return*/, attendance];
        }
    });
}); };
