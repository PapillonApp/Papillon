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
import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BadgeX, CircleHelp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAccounts } from "@/stores/account";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { detectMealPrice as ARDPriceDetector } from "@/views/settings/ExternalAccount/ARD";
import { useAlert } from "@/providers/AlertProvider";
var PriceError = function (_a) {
    var _b, _c;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var update = useAccounts(function (store) { return store.update; });
    var account = (_b = route.params) === null || _b === void 0 ? void 0 : _b.account;
    var accountId = (_c = route.params) === null || _c === void 0 ? void 0 : _c.accountId;
    var showAlert = useAlert().showAlert;
    var manualInput = function () {
        Alert.prompt("Entre le prix d'un repas", "", [
            { text: "Annuler", onPress: function () { } },
            { text: "Soumettre", onPress: function (input) { return __awaiter(void 0, void 0, void 0, function () {
                    var mealPrice;
                    return __generator(this, function (_a) {
                        if (input) {
                            mealPrice = parseFloat(input.replace(",", ".")) * 100;
                            update(accountId, "authentication", { "mealPrice": mealPrice });
                            navigation.pop();
                            navigation.pop();
                            navigation.pop();
                            navigation.pop();
                        }
                        return [2 /*return*/];
                    });
                }); } },
        ], "plain-text", "2.00");
    };
    var reloadMealPrice = function () { return __awaiter(void 0, void 0, void 0, function () {
        var mealPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ARDPriceDetector(account)];
                case 1:
                    mealPrice = _a.sent();
                    if (!mealPrice) {
                        return [2 /*return*/, showAlert({
                                title: "Erreur",
                                message: "Impossible de déterminer le prix d'un repas",
                                icon: <BadgeX />,
                            })];
                    }
                    update(accountId, "authentication", { "mealPrice": mealPrice });
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<SafeAreaView style={styles.container}>
      <View style={{ width: "100%", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <CircleHelp color={colors.text + "55"} size={200}></CircleHelp>
      </View>
      <View style={{
            padding: 10,
            gap: 9
        }}>
        <Text style={{
            textAlign: "left",
            fontFamily: "semibold",
            color: colors.text,
            fontSize: 32,
            maxWidth: "90%"
        }}>Une erreur s'est produite</Text>
        <Text style={{
            textAlign: "left",
            fontFamily: "medium",
            color: colors.text + "75",
            fontSize: 17,
        }}>Nous n’avons pas réussi à déterminer le prix d’un repas</Text>
      </View>
      <View style={styles.buttons}>
        <ButtonCta primary value="Recommencer" disabled={false} onPress={function () { return reloadMealPrice(); }}/>
        <ButtonCta style={{
            borderWidth: 0
        }} value="Saisir manuellement" disabled={false} onPress={function () { return manualInput(); }}/>
      </View>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 20,
    },
    list: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    image: {
        width: 32,
        height: 32,
        borderRadius: 80,
    },
});
export default PriceError;
