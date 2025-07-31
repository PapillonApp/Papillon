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
import { balanceFromExternal } from "@/services/balance";
import { qrcodeFromExternal } from "@/services/qrcode";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BlurView } from "expo-blur";
import { QrCodeIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PressableScale } from "react-native-pressable-scale";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import * as Brightness from "expo-brightness";
import Reanimated, { ZoomIn } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
var RestaurantQrCode = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var card = route.params.card;
    var _b = useState(null), qrCode = _b[0], setQrCode = _b[1];
    var _c = useState(0.5), defaultBrightness = _c[0], setDefaultBrightness = _c[1];
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var PollingBalance = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            balanceFromExternal(card.account).then(function (newBalance) {
                if (card.balance[0].amount !== newBalance[0].amount) {
                    var diff = newBalance[0].amount - card.balance[0].amount;
                    openFeedback();
                }
            });
            return [2 /*return*/];
        });
    }); };
    var openFeedback = function () {
        playHaptics("notification", {
            notification: Haptics.NotificationFeedbackType.Success,
        });
        navigation.goBack();
        setTimeout(function () {
            navigation.navigate("RestaurantPaymentSuccess", { card: card, diff: 0 });
        }, 1000);
    };
    useEffect(function () {
        var handleBrightness = function () { return __awaiter(void 0, void 0, void 0, function () {
            var status, currentBrightness;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Brightness.requestPermissionsAsync()];
                    case 1:
                        status = (_a.sent()).status;
                        if (!(status === "granted")) return [3 /*break*/, 3];
                        return [4 /*yield*/, Brightness.getBrightnessAsync()];
                    case 2:
                        currentBrightness = _a.sent();
                        setDefaultBrightness(currentBrightness);
                        Brightness.setSystemBrightnessAsync(1);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        handleBrightness();
        var handleBeforeRemove = function () { return __awaiter(void 0, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Brightness.requestPermissionsAsync()];
                    case 1:
                        status = (_a.sent()).status;
                        if (status === "granted" && defaultBrightness !== undefined) {
                            Brightness.setSystemBrightnessAsync(defaultBrightness);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        navigation.addListener("beforeRemove", handleBeforeRemove);
        return function () {
            navigation.removeListener("beforeRemove", handleBeforeRemove);
        };
    }, [defaultBrightness, navigation]);
    useEffect(function () {
        // Si Izly
        if (card.service === 10) {
            var interval_1 = setInterval(function () {
                console.log("[CANTINE >> IZLY] Demande du solde");
                PollingBalance();
            }, 1000);
            return function () {
                clearInterval(interval_1);
                console.log("[CANTINE >> IZLY] Fin du polling");
            };
        }
    }, []);
    var theme = useTheme();
    var GenerateQRCode = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            qrcodeFromExternal(card.account).then(function (qrCode) {
                // @ts-expect-error
                setQrCode(qrCode);
            });
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        GenerateQRCode();
    }, []);
    return (<View style={{
            flex: 1,
            backgroundColor: theme.colors.background + "50",
            justifyContent: "center",
            alignItems: "center",
        }}>
      <BlurView style={{
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
        }} intensity={100} tint={theme.dark ? "dark" : "light"}>

        <Pressable style={{
            width: "100%",
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
        }} onPress={function () { return navigation.goBack(); }}>
          <Reanimated.View style={{
            marginBottom: 32,
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            maxWidth: 260,
        }}>
            <QrCodeIcon size={24} color={theme.colors.text}/>

            <Text style={{
            color: theme.colors.text,
            fontSize: 15,
            lineHeight: 20,
            textAlign: "center",
            fontFamily: "semibold",
        }}>
              Approche le code QR du scanner de la borne afin de valider ta carte
            </Text>
          </Reanimated.View>
        </Pressable>

        {qrCode && (<Reanimated.View entering={anim2Papillon(ZoomIn).delay(100)}>
            <PressableScale style={{
                padding: 16,
                backgroundColor: "white",
                borderColor: theme.colors.text + "40",
                borderWidth: 1,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.2,
                shadowRadius: 7,
                elevation: 5,
                borderRadius: 16,
                borderCurve: "continuous",
            }} onPress={function () {
                GenerateQRCode();
            }} weight="light" activeScale={0.9}>
              <Reanimated.View entering={anim2Papillon(ZoomIn).delay(200)}>
                <QRCode value={qrCode} size={280}/>
              </Reanimated.View>
            </PressableScale>
          </Reanimated.View>)}

        <Pressable style={{
            width: "100%",
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
        }} onPress={function () { return navigation.goBack(); }}>
          <TouchableOpacity style={{
            marginTop: 32,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: theme.colors.text + "20",
            borderRadius: 50,
            borderCurve: "continuous",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
        }} onPress={function () { return navigation.goBack(); }}>
            <X strokeWidth={2.6} size={20} color={theme.colors.text}/>

            <Text style={{
            color: theme.colors.text,
            fontSize: 15,
            lineHeight: 20,
            textAlign: "center",
            fontFamily: "semibold",
        }}>
              Fermer
            </Text>
          </TouchableOpacity>
        </Pressable>

      </BlurView>
    </View>);
};
export default RestaurantQrCode;
