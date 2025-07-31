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
export var AsyncStoragePronoteKeys = {
    NEXT_TIME_TOKEN: "pronote:next_time_token",
    ACCOUNT_TYPE_ID: "pronote:account_type_id",
    INSTANCE_URL: "pronote:instance_url",
    USERNAME: "pronote:username",
    DEVICE_UUID: "pronote:device_uuid",
};
var GetV6Data = function () { return __awaiter(void 0, void 0, void 0, function () {
    var values, imported, shouldRestore, _i, values_1, value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, AsyncStorage.multiGet([
                    AsyncStoragePronoteKeys.NEXT_TIME_TOKEN,
                    AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID,
                    AsyncStoragePronoteKeys.INSTANCE_URL,
                    AsyncStoragePronoteKeys.USERNAME,
                    AsyncStoragePronoteKeys.DEVICE_UUID,
                ])];
            case 1:
                values = _a.sent();
                return [4 /*yield*/, AsyncStorage.getItem("pronote:imported")];
            case 2:
                imported = _a.sent();
                shouldRestore = true;
                for (_i = 0, values_1 = values; _i < values_1.length; _i++) {
                    value = values_1[_i];
                    if (value[1] === null) {
                        shouldRestore = false;
                        break;
                    }
                }
                return [2 /*return*/, {
                        restore: shouldRestore,
                        imported: imported === "true",
                        data: {
                            nextTimeToken: values[0][1],
                            accountTypeId: values[1][1],
                            instanceUrl: values[2][1],
                            username: values[3][1],
                            deviceUUID: values[4][1],
                        },
                    }];
        }
    });
}); };
export default GetV6Data;
