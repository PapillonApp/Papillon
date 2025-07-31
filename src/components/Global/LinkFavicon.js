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
import { Image, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { Link2 } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
export var getURLDomain = function (url, www) {
    if (www === void 0) { www = true; }
    return url.replace("https://", "").replace("http://", "").split("/")[0].replace(www ? "www." : "", "");
};
var LinkFavicon = function (props) {
    var url = props.url, size = props.size;
    var finalSize = size || 24;
    var domain = getURLDomain(url);
    var finalUrl = "https://icons.duckduckgo.com/ip3/".concat(domain, ".ico");
    var localUrl = "".concat(FileSystem.cacheDirectory).concat(domain, ".ico");
    var colors = useTheme().colors;
    var _a = useState(null), fetchURL = _a[0], setFetchURL = _a[1];
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, FileSystem.getInfoAsync(localUrl)];
                    case 1:
                        file = _a.sent();
                        if (file.exists) {
                            setFetchURL(localUrl);
                            return [2 /*return*/];
                        }
                        // check if the file exists
                        fetch(finalUrl)
                            .then(function (response) { return __awaiter(void 0, void 0, void 0, function () {
                            var uri;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!!response.ok) return [3 /*break*/, 1];
                                        throw new Error("Network response was not ok");
                                    case 1: return [4 /*yield*/, FileSystem.downloadAsync(finalUrl, localUrl)];
                                    case 2:
                                        uri = (_a.sent()).uri;
                                        setFetchURL(uri);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [finalUrl, localUrl]);
    if (!fetchURL) {
        return (<View>
        <Link2 size={finalSize} color={colors.text + "80"} {...props}/>
      </View>);
    }
    return (<Image source={{ uri: fetchURL }} {...props} style={[{ width: finalSize, height: finalSize }, props.style]} resizeMethod="resize"/>);
};
export default LinkFavicon;
