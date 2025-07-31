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
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote from "pawnote";
import { decodeAttachment } from "./attachment";
import { ObservationType } from "../shared/Observation";
import { decodePeriod } from "./period";
import { info } from "@/utils/logger/logger";
var getTab = function (account) {
    if (!account.instance)
        throw new ErrorServiceUnauthenticated("pronote");
    var tab = account.instance.user.resources[0].tabs.get(pronote.TabLocation.Notebook);
    if (!tab)
        throw new Error("Tu n'as pas accès à l'onglet 'Vie Scolaire' dans PRONOTE");
    return tab;
};
export var getAttendancePeriods = function (account) {
    var tab = getTab(account);
    info("PRONOTE->getAttendancePeriods(): OK", "pronote");
    return {
        default: tab.defaultPeriod.name,
        periods: tab.periods.map(decodePeriod)
    };
};
export function getAttendance(account, periodName) {
    return __awaiter(this, void 0, void 0, function () {
        var tab, period, items, attendance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tab = getTab(account);
                    period = tab.periods.find(function (p) { return p.name === periodName; });
                    if (!period)
                        throw new Error("La période sélectionnée n'a pas été trouvée.");
                    return [4 /*yield*/, pronote.notebook(account.instance, period)];
                case 1:
                    items = _a.sent();
                    info("PRONOTE->getAttendance(): OK pour ".concat(periodName), "pronote");
                    attendance = {
                        observations: items.observations.map(function (observation) {
                            var _a;
                            var sectionType;
                            switch (observation.kind) {
                                case pronote.NotebookObservationKind.LogBookIssue:
                                    sectionType = ObservationType.LogBookIssue;
                                    break;
                                case pronote.NotebookObservationKind.Encouragement:
                                    sectionType = ObservationType.Encouragement;
                                    break;
                                case pronote.NotebookObservationKind.Observation:
                                    sectionType = ObservationType.Observation;
                                    break;
                                case pronote.NotebookObservationKind.Other:
                                    sectionType = ObservationType.Other;
                                    break;
                            }
                            return {
                                id: observation.id,
                                timestamp: observation.date.getTime(),
                                sectionName: observation.name,
                                sectionType: sectionType,
                                subjectName: (_a = observation.subject) === null || _a === void 0 ? void 0 : _a.name,
                                shouldParentsJustify: observation.shouldParentsJustify,
                                reasons: observation.reason
                            };
                        }),
                        punishments: items.punishments.map(function (punishment) { return ({
                            id: punishment.id,
                            schedulable: false, // TODO
                            schedule: [], // TODO
                            timestamp: punishment.dateGiven.getTime(),
                            givenBy: punishment.giver,
                            exclusion: punishment.exclusion,
                            duringLesson: punishment.isDuringLesson,
                            homework: {
                                text: punishment.workToDo,
                                documents: punishment.workToDoDocuments.map(decodeAttachment)
                            },
                            reason: {
                                text: punishment.reasons,
                                circumstances: punishment.circumstances,
                                documents: punishment.circumstancesDocuments.map(decodeAttachment)
                            },
                            nature: punishment.title,
                            duration: punishment.durationMinutes
                        }); }),
                        absences: items.absences.map(function (absence) { return ({
                            id: absence.id,
                            fromTimestamp: absence.startDate.getTime(),
                            toTimestamp: absence.endDate.getTime(),
                            justified: absence.justified,
                            hours: absence.hoursMissed + "h" + absence.minutesMissed,
                            administrativelyFixed: absence.administrativelyFixed,
                            reasons: absence.reason
                        }); }),
                        delays: items.delays.map(function (delay) {
                            var _a;
                            return ({
                                id: delay.id,
                                timestamp: delay.date.getTime(),
                                duration: delay.minutes,
                                justified: delay.justified,
                                justification: delay.justification,
                                reasons: (_a = delay.reason) !== null && _a !== void 0 ? _a : void 0,
                            });
                        })
                    };
                    return [2 /*return*/, attendance];
            }
        });
    });
}
