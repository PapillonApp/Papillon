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
import { HomeworkReturnType } from "@/services/shared/Homework";
import { info, log } from "@/utils/logger/logger";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { htmlToText } from "html-to-text";
import { decodeSkoAttachment } from "./attachment";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { toSkolengoDate } from "../skolengo-types";
var decodeHomework = function (h) {
    var _a, _b, _c, _d;
    return {
        id: h.id,
        subject: ((_a = h.subject) === null || _a === void 0 ? void 0 : _a.label) || "",
        attachments: ((_b = h.attachments) === null || _b === void 0 ? void 0 : _b.map(decodeSkoAttachment)) || [],
        color: ((_c = h.subject) === null || _c === void 0 ? void 0 : _c.color) || "#000000",
        content: (h.html && htmlToText(h.html || "") !== "") ? htmlToText(h.html) : (_d = h.title) !== null && _d !== void 0 ? _d : "",
        due: h.dueDateTime ? new Date(h.dueDateTime).getTime() : -1,
        done: h.done,
        returnType: h.deliverWorkOnline ? HomeworkReturnType.FileUpload : HomeworkReturnType.Paper,
        personalizate: false,
    };
};
export var getHomeworkForWeek = function (account, epochWeekNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, start, end, homeworks;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("skolengo");
                _a = weekNumberToDateRange(epochWeekNumber), start = _a.start, end = _a.end;
                return [4 /*yield*/, account.instance.getHomeworkAssignments(undefined, toSkolengoDate(start), toSkolengoDate(end))];
            case 1:
                homeworks = _b.sent();
                info("SKOLENGO->getHomeworkForWeek(): OK pour la semaine ".concat(epochWeekNumber, "."), "skolengo");
                return [2 /*return*/, homeworks.map(decodeHomework)];
        }
    });
}); };
export var toggleHomeworkState = function (account, h) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!account.instance)
                    throw new ErrorServiceUnauthenticated("skolengo");
                return [4 /*yield*/, ((_a = account.instance) === null || _a === void 0 ? void 0 : _a.patchHomeworkAssignment(void 0, h.id, { done: !h.done }))];
            case 1:
                _b.sent();
                //await pronote.assignmentStatus(account.instance, h.id, !h.done);
                log("SKOLENGO->toggleHomeworkState(): Homework ".concat(h.id, " marked as ").concat(h.done ? "not done" : "done", "."), "skolengo");
                return [2 /*return*/];
        }
    });
}); };
