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
import { decodePeriod } from "@/services/pronote/period";
import pronote from "pawnote";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { SkillLevel } from "@/services/shared/Evaluation";
var getTab = function (account) {
    if (!account.instance)
        throw new ErrorServiceUnauthenticated("pronote");
    var tab = account.instance.user.resources[0].tabs.get(pronote.TabLocation.Evaluations);
    if (!tab)
        throw new Error("Tu n'as pas accès à l'onglet 'Compétences' dans PRONOTE");
    return tab;
};
export var getEvaluationsPeriods = function (account) {
    var tab = getTab(account);
    info("PRONOTE->getEvaluationsPeriods(): OK", "pronote");
    return {
        default: tab.defaultPeriod.name,
        periods: tab.periods.map(decodePeriod)
    };
};
export var getEvaluations = function (account, periodName) { return __awaiter(void 0, void 0, void 0, function () {
    var tab, period, overview, evaluations;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tab = getTab(account);
                period = tab.periods.find(function (p) { return p.name === periodName; });
                if (!period)
                    throw new Error("La période sélectionnée n'a pas été trouvée.");
                return [4 /*yield*/, pronote.evaluations(account.instance, period)];
            case 1:
                overview = _a.sent();
                evaluations = overview.map(function (e) { return ({
                    id: buildLocalID(e),
                    name: e.name,
                    subjectId: e.subject.id,
                    subjectName: e.subject.name,
                    description: e.description,
                    timestamp: e.date.getTime(),
                    coefficient: e.coefficient,
                    levels: e.levels,
                    skills: e.skills.map(function (s) { return ({
                        coefficient: s.coefficient,
                        level: getLevel(s.abbreviation),
                        domainName: s.domainName,
                        itemName: s.itemName || "Compétence sans nom",
                        pillarPrefixes: s.pillarPrefixes,
                    }); }),
                    teacher: e.teacher
                }); });
                return [2 /*return*/, evaluations];
        }
    });
}); };
export var getLevel = function (level) {
    switch (level) {
        case "Nr":
            return SkillLevel.NotReturned;
        case "Dsp":
            return SkillLevel.Dispensed;
        case "Abs":
            return SkillLevel.Absent;
        case "E":
            return SkillLevel.Insufficient;
        case "D":
            return SkillLevel.Beginning;
        case "C":
            return SkillLevel.Fragile;
        case "B":
            return SkillLevel.AlmostMastered;
        case "A":
            return SkillLevel.Satisfactory;
        case "A+":
            return SkillLevel.Excellent;
        default:
            return SkillLevel.None;
    }
};
export var buildLocalID = function (e) { return "".concat(e.subject.name, ":").concat(e.date.getTime(), "/").concat(e.name); };
