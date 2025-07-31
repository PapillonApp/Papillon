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
import AsyncStorage from "@react-native-async-storage/async-storage";
var format = "[%TYPE%][%DATE%][%FROM%] %MESSAGE%";
var type_list = [
    "LOG",
    "ERROR",
    "WARN",
    "INFO",
    "NAV"
];
export function get_iso_date() {
    var now = new Date();
    return now.toISOString();
}
function get_message(type, date, from, message) {
    return (format
        .replaceAll("%TYPE%", type_list[type].padEnd(5))
        .replaceAll("%DATE%", date)
        .replaceAll("%FROM%", from)
        .replaceAll("%MESSAGE%", message));
}
function get_file_from_stacktrace(stack) {
    var res = "";
    try {
        res = stack
            .split("\n")[1]
            .split(/\/\/localhost:\d\d\d\d\//g)[1]
            .split("//&")[0];
    }
    catch (e) {
        res = "UNKNOWN";
    }
    return (res);
}
function obtain_function_name(from) {
    var _a, _b, _c, _d;
    var error = new Error(); // On génère une erreur pour obtenir la stacktrace
    var stack = ((_a = error.stack) === null || _a === void 0 ? void 0 : _a.split("\n")) || [];
    var relevantLine = (_b = stack
        .slice(3) // Ignore les premières lignes (celle du logger)
        .find(function (line) { return line.includes("at ") && line.includes("http"); }) // Recherche une ligne pertinente
    ) === null || _b === void 0 ? void 0 : _b.trim();
    // Extraire le nom de la fonction ou utiliser `from` si on trouve pas
    var functionName = (_d = (relevantLine && ((_c = RegExp(/at (\S+)\s\(/).exec(relevantLine)) === null || _c === void 0 ? void 0 : _c[1]))) !== null && _d !== void 0 ? _d : from;
    // `anon` cherche à matcher avec `anonymous` et `?anon_0_` qui sont des fonctions anonymes
    if ((functionName === null || functionName === void 0 ? void 0 : functionName.includes("anon_0_")) || (functionName === null || functionName === void 0 ? void 0 : functionName.includes("anonymous")))
        functionName = "";
    return functionName || (from !== null && from !== void 0 ? from : "UNKOWN");
}
function save_logs_to_memory(log) {
    AsyncStorage.getItem("logs").then(function (result) {
        var twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        var logs = [];
        if (result != null) {
            logs = JSON.parse(result);
        }
        logs.push(log);
        logs = logs.filter(function (element) {
            var match = element.split("]")[1].replace("[", "");
            if (match) {
                var logDate = new Date(match).getTime();
                return logDate >= twoWeeksAgo;
            }
            return false;
        });
        if (logs.length > 800) {
            logs = logs.splice(0, 100);
        }
        AsyncStorage.setItem("logs", JSON.stringify(logs));
    });
}
function log(message, from) {
    var log = get_message(0, get_iso_date(), obtain_function_name(from), message);
    save_logs_to_memory(log);
    console.log(log);
}
function error(message, from) {
    var log = get_message(1, get_iso_date(), obtain_function_name(from), message);
    save_logs_to_memory(log);
    console.error(log);
}
function warn(message, from) {
    var log = get_message(2, get_iso_date(), obtain_function_name(from), message);
    save_logs_to_memory(log);
    console.warn(log);
}
function info(message, from) {
    var log = get_message(3, get_iso_date(), obtain_function_name(from), message);
    save_logs_to_memory(log);
    console.info(log);
}
function navigate(to) {
    var log = get_message(4, get_iso_date(), "ROUTER", "User navigate into " + to);
    save_logs_to_memory(log);
    console.log(log);
}
function get_brute_logs() {
    return __awaiter(this, void 0, void 0, function () {
        var res, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AsyncStorage.getItem("logs")];
                case 1:
                    res = _a.sent();
                    value = [];
                    if (res)
                        value = JSON.parse(res);
                    return [2 /*return*/, value.join("\n")];
            }
        });
    });
}
function get_logs() {
    return __awaiter(this, void 0, void 0, function () {
        var returned, value, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    returned = [];
                    value = [];
                    return [4 /*yield*/, AsyncStorage.getItem("logs")];
                case 1:
                    res = _a.sent();
                    if (res)
                        value = JSON.parse(res);
                    value.forEach(function (item) {
                        var _a, _b, _c, _d;
                        var matchs = /\[([A-Z\s]+)\]\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z)]\[(\S+)\] (.+)/gm.exec(item);
                        returned.push({
                            type: (_a = matchs === null || matchs === void 0 ? void 0 : matchs[1]) !== null && _a !== void 0 ? _a : "Unkown type", // The index 0 is used for the global match
                            date: (_b = matchs === null || matchs === void 0 ? void 0 : matchs[2]) !== null && _b !== void 0 ? _b : "Unkown date",
                            from: (_c = matchs === null || matchs === void 0 ? void 0 : matchs[3]) !== null && _c !== void 0 ? _c : "Unkown from",
                            message: (_d = matchs === null || matchs === void 0 ? void 0 : matchs[4]) !== null && _d !== void 0 ? _d : "Unkown content"
                        });
                    });
                    return [2 /*return*/, returned];
            }
        });
    });
}
var delete_logs = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, AsyncStorage.removeItem("logs")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
export { log, error, warn, info, navigate, get_logs, get_brute_logs, delete_logs };
