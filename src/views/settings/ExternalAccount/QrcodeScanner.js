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
import React, { useEffect } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { QrCode } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccounts } from "@/stores/account";
import { BarCodeScanner } from "expo-barcode-scanner";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var QrcodeScanner = function (_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var update = useAccounts(function (store) { return store.update; });
    var accountID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.accountID;
    var _c = React.useState(null), hasPermission = _c[0], setHasPermission = _c[1];
    var _d = React.useState(false), scanned = _d[0], setScanned = _d[1];
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    useEffect(function () {
        var getBarCodeScannerPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BarCodeScanner.requestPermissionsAsync()];
                    case 1:
                        status = (_a.sent()).status;
                        setHasPermission(status === "granted");
                        return [2 /*return*/];
                }
            });
        }); };
        getBarCodeScannerPermissions();
    }, []);
    var handleBarCodeScanned = function (_a) {
        var type = _a.type, data = _a.data;
        setScanned(true);
        playHaptics("notification", {
            notification: Haptics.NotificationFeedbackType.Success,
        });
        update(accountID, "data", { "qrcodedata": data, "qrcodetype": type });
        navigation.navigate("PriceDetectionOnboarding", { accountID: accountID });
    };
    return (<SafeAreaView style={styles.container}>
      <View style={[styles.explainations,
            { top: insets.top + 20 }
        ]}>
        <QrCode size={32} color={"#fff"}/>
        <Text style={styles.title}>
          Associe ton QR Code à ton compte
        </Text>
        <Text style={styles.text}>
          Scanne le QR code de ton self pour le lier à ton compte
        </Text>
      </View>

      <MaskedView style={StyleSheet.absoluteFillObject} maskElement={<View style={styles.maskContainer}>
            <View style={styles.transparentSquare}/>
          </View>}>
        <View style={styles.maskContainer}/>
        {hasPermission === true && (<BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject}/>)}
        {hasPermission === true && (<View style={styles.transparentSquareBorder}/>)}
      </MaskedView>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    maskContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    transparentSquare: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "black",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 10,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "30%",
    },
    transparentSquareBorder: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 10,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "30%",
    },
    explainations: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 24,
        gap: 4,
        zIndex: 9999,
    },
    title: {
        fontFamily: "semibold",
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    text: {
        fontFamily: "medium",
        fontSize: 16,
        color: "white",
        textAlign: "center",
        opacity: 0.8,
    },
});
export default QrcodeScanner;
