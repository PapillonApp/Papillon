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
import { TimetableClassStatus } from "../shared/Timetable";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import ecoledirecte, { TimetableItemKind } from "pawdirecte";
var decodeTimetableClass = function (c) {
    var _a, _b;
    var base = {
        startTimestamp: c.startDate.getTime(),
        endTimestamp: c.endDate.getTime(),
        additionalNotes: c.notes,
        backgroundColor: c.color
    };
    switch (c.kind) {
        case TimetableItemKind.COURS:
            return __assign({ type: "lesson", id: c.id, subject: c.subjectName, title: c.subjectName, room: c.room || void 0, teacher: c.teacher || void 0, 
                // TODO: add more states
                status: c.updated ? TimetableClassStatus.MODIFIED : c.cancelled ? TimetableClassStatus.CANCELED : void 0, statusText: c.updated ? TimetableClassStatus.MODIFIED : c.cancelled ? TimetableClassStatus.CANCELED : void 0 }, base);
        case TimetableItemKind.PERMANENCE:
            return __assign({ type: "detention", subject: c.subjectName, id: c.id, title: (_a = c.subjectName) !== null && _a !== void 0 ? _a : "Sans titre", teacher: c.teacher || void 0, room: c.room || void 0 }, base);
        case TimetableItemKind.EVENEMENT:
            return __assign({ type: "activity", subject: c.subjectName, id: c.id, title: (_b = c.subjectName) !== null && _b !== void 0 ? _b : "Sans titre", teacher: c.teacher || void 0, room: c.room || void 0 }, base);
        case TimetableItemKind.CONGE:
            return __assign({ type: "vacation", subject: c.subjectName, id: c.id, title: "Congés", teacher: c.teacher || void 0, room: void 0 }, base);
        case TimetableItemKind.SANCTION:
            return __assign({ type: "detention", subject: "", id: c.id, title: "Sanction", teacher: c.teacher || void 0, room: "PERMANENCE" }, base);
        default:
            break;
    }
    throw new Error("ecoledirecte: unknown class type");
};
export var getTimetableForWeek = function (account, rangeDate) { return __awaiter(void 0, void 0, void 0, function () {
    var timetable;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!account.authentication.session)
                    throw new ErrorServiceUnauthenticated("ecoledirecte");
                return [4 /*yield*/, ecoledirecte.studentTimetable(account.authentication.session, account.authentication.account, rangeDate.start, rangeDate.end)];
            case 1:
                timetable = _a.sent();
                return [2 /*return*/, timetable.map(decodeTimetableClass).sort(function (a, b) { return a.startTimestamp - b.startTimestamp; })];
        }
    });
}); };
