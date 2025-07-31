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
import ecoledirecte, { AttendanceItemKind } from "pawdirecte";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { dateStringAsTimeInterval, getDuration, getDurationInHours } from "@/services/ecoledirecte/time-interval";
var decodeDelay = function (item) {
    var _a;
    var timeInterval = dateStringAsTimeInterval(item.displayDate);
    var duration = ((timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.end) && timeInterval.start) ? getDuration(timeInterval).getTime() / (60 * 1000) : 0;
    return {
        id: item.id.toString(),
        timestamp: new Date((timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.start) || item.date).getTime(),
        duration: duration,
        justified: item.justified,
        justification: item.comment,
        reasons: (_a = item.reason) !== null && _a !== void 0 ? _a : void 0,
    };
};
var decodeAbsence = function (item) {
    var timeInterval = dateStringAsTimeInterval(item.displayDate);
    var duration = ((timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.end) && timeInterval.start) ? getDurationInHours(timeInterval) : "";
    var fromTimestamp = (timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.start) ? new Date(timeInterval.start).getTime() : 0;
    var toTimestamp = (timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.end) ? new Date(timeInterval.end).getTime() : 0;
    return {
        id: item.id.toString(),
        fromTimestamp: fromTimestamp,
        toTimestamp: toTimestamp,
        justified: item.justified,
        hours: duration,
        administrativelyFixed: item.justified,
        reasons: item.reason,
    };
};
var decodePunishment = function (item) {
    var _a;
    var timeInterval = dateStringAsTimeInterval(item.displayDate);
    var duration = ((timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.end) && timeInterval.start) ? getDuration(timeInterval).getTime() / (60 * 1000) : 0;
    return {
        id: item.id.toString(),
        duration: duration,
        givenBy: item.teacher,
        timestamp: new Date((_a = timeInterval === null || timeInterval === void 0 ? void 0 : timeInterval.start) !== null && _a !== void 0 ? _a : item.date.getTime()).getTime(),
        // TODO
        duringLesson: false,
        exclusion: false,
        homework: {
            documents: [],
            text: item.todo
        },
        nature: "",
        reason: {
            circumstances: "",
            documents: [],
            text: [item.reason]
        },
        schedulable: false,
        schedule: []
    };
};
export var getAttendance = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var attendance, delays, absences, punishments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.authentication.session)
                    throw new ErrorServiceUnauthenticated("ecoledirecte");
                return [4 /*yield*/, ecoledirecte.studentAttendance(account.authentication.session, account.authentication.account)];
            case 1:
                attendance = _a.sent();
                delays = attendance.absences
                    .filter(function (a) { return a.kind === AttendanceItemKind.RETARD; })
                    .map(decodeDelay);
                absences = attendance.absences
                    .filter(function (a) { return a.kind === AttendanceItemKind.ABSENCE; })
                    .map(decodeAbsence);
                punishments = attendance.punishments
                    .filter(function (a) { return a.kind === AttendanceItemKind.PUNITION; })
                    .map(decodePunishment);
                return [2 /*return*/, {
                        punishments: punishments,
                        absences: absences,
                        delays: delays,
                        observations: [],
                    }];
        }
    });
}); };
