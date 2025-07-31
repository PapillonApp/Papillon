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
import * as FileSystem from "expo-file-system";
import { error, log } from "@/utils/logger/logger";
function init_addons_folder() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons")];
                case 1:
                    if (!!(_a.sent()).exists) return [3 /*break*/, 3];
                    return [4 /*yield*/, FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "addons")];
                case 2:
                    _a.sent();
                    log("Addons folder initialized at " + FileSystem.documentDirectory + "addons", "get_addons_list");
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generate_addons_error(error, name) {
    return {
        error: error,
        author: "",
        development: false,
        domains: [],
        minAppVersion: "7.0.0",
        permissions: [],
        placement: [],
        screenshot: [],
        version: "",
        name: name
    };
}
function get_addons_list() {
    return __awaiter(this, void 0, void 0, function () {
        var res, addons, _loop_1, _i, addons_1, addon;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init_addons_folder();
                    log("Reading addons folder", "get_addons_list");
                    res = [];
                    return [4 /*yield*/, FileSystem.readDirectoryAsync(FileSystem.documentDirectory + "addons")];
                case 1:
                    addons = _a.sent();
                    log("Found ".concat(addons.length, " folder to check..."), "get_addons_list");
                    _loop_1 = function (addon) {
                        var stat, info, file, manifest, icon, i, screen_1, e_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    log("| Starting check for folder ".concat(addon, "..."), "get_addons_list");
                                    return [4 /*yield*/, FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon)];
                                case 1:
                                    stat = _b.sent();
                                    if (!stat.isDirectory) {
                                        error("|   Not a directory ! Skipping...", "get_addons_list");
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Check if the addon has a manifest
                                    log("|   Searching for manifest.json...", "get_addons_list");
                                    return [4 /*yield*/, FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/manifest.json")];
                                case 2:
                                    info = _b.sent();
                                    if (!info.exists) {
                                        log("|   manifest.json not found ! Skipping...", "get_addons_list");
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Read the manifest
                                    log("|   Reading manifest.json...", "get_addons_list");
                                    return [4 /*yield*/, FileSystem.readAsStringAsync(FileSystem.documentDirectory + "addons/" + addon + "/manifest.json")];
                                case 3:
                                    file = _b.sent();
                                    _b.label = 4;
                                case 4:
                                    _b.trys.push([4, 11, , 12]);
                                    log("|   Parsing manifest.json...", "get_addons_list");
                                    manifest = JSON.parse(file);
                                    // Check if the manifest has all the required fields
                                    log("|   Loading addons...", "get_addons_list");
                                    if (!manifest.name && typeof manifest.name !== "string") {
                                        error("|   Missing properties \"name\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"name\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.author && typeof manifest.author !== "string") {
                                        error("|   Missing properties \"author\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"author\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.version && typeof manifest.version !== "string") {
                                        error("|   Missing properties \"version\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"version\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.placement && !Array.isArray(manifest.placement)) {
                                        error("|   Missing properties \"placement\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"placement\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (manifest.placement.length === 0) {
                                        error("|   Empty placement in ".concat(addon, " ! You must have 1 placement ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Empty placement", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.placement.every(function (p) { return typeof p.placement === "string" && typeof p.main === "string"; })) {
                                        error("|   Invalid placement in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid placement", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.permissions && !Array.isArray(manifest.permissions)) {
                                        error("|   Missing properties \"permissions\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"permissions\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.domains && !Array.isArray(manifest.domains)) {
                                        error("|   Missing properties \"domains\" in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Missing properties \"domains\"", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // if icon is defined, check if it's a string and if it exists
                                    if (manifest.icon && typeof manifest.icon !== "string") {
                                        error("|   Invalid icon in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid icon", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.icon) return [3 /*break*/, 6];
                                    return [4 /*yield*/, FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.icon)];
                                case 5:
                                    icon = _b.sent();
                                    if (!icon.exists) {
                                        error("|   Icon not found for ".concat(addon, " ! Are you sure there is a file at ").concat(addon + "/" + manifest.icon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Icon not found", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    _b.label = 6;
                                case 6:
                                    manifest.icon = FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.icon;
                                    // check if screenshot is an array of strings and if they exists
                                    if (manifest.screenshot && !Array.isArray(manifest.screenshot)) {
                                        error("|   Invalid screenshot in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid screenshot", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!manifest.screenshot) return [3 /*break*/, 10];
                                    i = 0;
                                    _b.label = 7;
                                case 7:
                                    if (!(i < manifest.screenshot.length)) return [3 /*break*/, 10];
                                    if (typeof manifest.screenshot[i] !== "string") {
                                        error("|   Invalid screenshot in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid screenshot", addon));
                                        return [3 /*break*/, 9];
                                    }
                                    return [4 /*yield*/, FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.screenshot[i])];
                                case 8:
                                    screen_1 = _b.sent();
                                    if (!screen_1.exists) {
                                        error("|   Screenshot not found for ".concat(addon, " ! Are you sure there is a file at ").concat(addon + "/" + manifest.screenshot[i], " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Screenshot not found", addon));
                                        return [3 /*break*/, 9];
                                    }
                                    manifest.screenshot[i] = FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.screenshot[i];
                                    _b.label = 9;
                                case 9:
                                    i++;
                                    return [3 /*break*/, 7];
                                case 10:
                                    // check if development is a boolean
                                    if (manifest.development && typeof manifest.development !== "boolean") {
                                        error("|   Invalid development in ".concat(addon, " ! Must be true or false ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid development", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // check if minAppVersion is a string
                                    if (manifest.minAppVersion && typeof manifest.minAppVersion !== "string") {
                                        error("|   Invalid minAppVersion in ".concat(addon, " ! Must be a string ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid minAppVersion", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // check if license is a string
                                    if (manifest.license && typeof manifest.license !== "string") {
                                        error("|   Invalid license in ".concat(addon, " ! Must be a string ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid license", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // check if description is a string
                                    if (manifest.description && typeof manifest.description !== "string") {
                                        error("|   Invalid description in ".concat(addon, " ! Must be a string ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid description", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // check if placement is an array of AddonPlacement
                                    if (!manifest.placement.every(function (p) { return typeof p.placement === "string" && typeof p.main === "string"; })) {
                                        error("|   Invalid placement in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid placement", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    manifest.placement.forEach(function (placement) {
                                        placement.main = FileSystem.documentDirectory + "addons/" + addon + "/" + placement.main;
                                    });
                                    // check if permissions is an array of AddonPermission
                                    if (!manifest.permissions.every(function (p) { return typeof p.name === "string" && typeof p.reason === "string"; })) {
                                        error("|   Invalid permissions in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid permissions", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // check if domains is an array of AddonDomain
                                    if (!manifest.domains.every(function (d) { return typeof d.domain === "string" && typeof d.reason === "string"; })) {
                                        error("|   Invalid domains in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                        res.push(generate_addons_error("Invalid domains", addon));
                                        return [2 /*return*/, "continue"];
                                    }
                                    // add the addon to the list
                                    log("|   ".concat(addon, " is a valid addon !"), "get_addons_list");
                                    res.push(manifest);
                                    return [3 /*break*/, 12];
                                case 11:
                                    e_1 = _b.sent();
                                    error("|   Invalid JSON in ".concat(addon, " ! Plugin can't load, skipping..."), "get_addons_list");
                                    res.push(generate_addons_error("Invalid JSON", addon));
                                    return [3 /*break*/, 12];
                                case 12: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, addons_1 = addons;
                    _a.label = 2;
                case 2:
                    if (!(_i < addons_1.length)) return [3 /*break*/, 5];
                    addon = addons_1[_i];
                    return [5 /*yield**/, _loop_1(addon)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    res.sort(function (a, b) { return a.name.localeCompare(b.name); });
                    return [2 /*return*/, res];
            }
        });
    });
}
function get_home_widgets() {
    return __awaiter(this, void 0, void 0, function () {
        var addons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_addons_list()];
                case 1:
                    addons = _a.sent();
                    return [2 /*return*/, addons.filter(function (addon) { return addon.placement.some(function (p) { return p.placement === "PLACE_HOME_WIDGET"; }); })];
            }
        });
    });
}
function get_settings_widgets() {
    return __awaiter(this, void 0, void 0, function () {
        var addons, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_addons_list()];
                case 1:
                    addons = _a.sent();
                    res = [];
                    addons.forEach(function (addon) {
                        for (var i = 0; i < addon.placement.length; i++) {
                            if (addon.placement[i].placement == "PLACE_SETTINGS_PAGE")
                                res.push({
                                    index: i,
                                    manifest: addon
                                });
                        }
                    });
                    return [2 /*return*/, res];
            }
        });
    });
}
export { init_addons_folder, get_addons_list, get_home_widgets, get_settings_widgets };
