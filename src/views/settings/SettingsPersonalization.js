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
import React, { useState } from "react";
import { ScrollView, Platform } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { Sparkles, SwatchBook, Route, Palette } from "lucide-react-native";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var SettingsPersonalization = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var _b = useState(false), click = _b[0], setClick = _b[1];
    var isTablet = useScreenDimensions().isTablet;
    // These are regular items that stay within the settings navigation
    var regularItems = [
        {
            icon: <SwatchBook />,
            colors: ["#4CAF50", "#8BC34A"],
            label: "Matières",
            onPress: function () { return navigation.navigate("SettingsSubjects"); },
        },
        {
            icon: <Sparkles />,
            colors: ["#2196F3", "#03A9F4"],
            label: "Icône de l'application",
            onPress: function () { return navigation.navigate("SettingsIcons"); },
            android: false,
        },
    ];
    // These are special items that close the settings modal and show a full-screen view
    var specialItems = [
        {
            icon: <Palette />,
            colors: ["#9C27B0", "#BA68C8"],
            label: "Thème de couleur",
            onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    // Close the entire Settings stack
                    (_a = navigation.getParent()) === null || _a === void 0 ? void 0 : _a.goBack();
                    // Navigate to the ColorSelector after a short delay
                    setTimeout(function () {
                        navigation.navigate("ColorSelector", { settings: true });
                    }, 10);
                    return [2 /*return*/];
                });
            }); }
        }
    ];
    // Add Tabs & Navigation item if not on tablet
    if (!isTablet) {
        specialItems.push({
            icon: click ? (<PapillonSpinner size={18} color="white" strokeWidth={2.8} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)}/>) : <Route />,
            colors: ["#673AB7", "#9575CD"],
            label: "Onglets & Navigation",
            onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    setClick(true);
                    // Close the entire Settings stack
                    (_a = navigation.getParent()) === null || _a === void 0 ? void 0 : _a.goBack();
                    // Navigate to SettingsTabs after a short delay
                    setTimeout(function () {
                        navigation.navigate("SettingsTabs");
                        setClick(false);
                    }, 10);
                    return [2 /*return*/];
                });
            }); }
        });
    }
    return (<ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
        }}>
      <NativeList>
        {regularItems.map(function (item, index) { return ((Platform.OS === "android" && "android" in item && !item.android) ? null :
            <NativeItem key={index} onPress={item.onPress} leading={<NativeIconGradient icon={item.icon} colors={item.colors}/>}>
              <NativeText variant="title">
                {item.label}
              </NativeText>
              {"description" in item && item.description &&
                    <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                {item.description}
              </NativeText>}
            </NativeItem>); })}
      </NativeList>

      <NativeList style={{ marginTop: 16 }}>
        {specialItems.map(function (item, index) { return (<NativeItem key={index} onPress={item.onPress} leading={<NativeIconGradient icon={item.icon} colors={item.colors}/>}>
            <NativeText variant="title">
              {item.label}
            </NativeText>
            {"description" in item && item.description &&
                <NativeText variant="subtitle" style={{ marginTop: -3 }}>
                {item.description}
              </NativeText>}
          </NativeItem>); })}
      </NativeList>
    </ScrollView>);
};
export default SettingsPersonalization;
