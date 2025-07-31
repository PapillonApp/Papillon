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
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { getCurrentPosition } from "@/utils/native/location";
import { useLocationPermission } from "@/hooks/location";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
/**
 * Intermediate screen to get the user's location before displaying the list of PRONOTE instances.
 *
 * When user grants the location permission, the screen will
 * automatically fetch the user's location and navigate
 * to the next screen.
 *
 * When the permission is not yet granted, the screen will
 * display a button to request the permission.
 */
var PronoteGeolocation = function (_a) {
    var navigation = _a.navigation;
    var _b = useLocationPermission(), permission = _b[0], _c = _b[1], loadingPermission = _c.loading, request = _c.request, refetch = _c.refetch;
    var _d = useState(false), loadingLocation = _d[0], setLoadingLocation = _d[1];
    var PapillonMessage = "".concat(loadingPermission ? "Chargement des permissions..." : "", " ").concat(loadingLocation ? "Localisation en cours..." : "Papillon a besoin de ton emplacement pour chercher des établissements").trim();
    var theme = useTheme();
    var colors = theme.colors;
    useEffect(function () {
        if (!(permission === null || permission === void 0 ? void 0 : permission.granted))
            return;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var position;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoadingLocation(true);
                        return [4 /*yield*/, getCurrentPosition()];
                    case 1:
                        position = _a.sent();
                        if (!!position) return [3 /*break*/, 3];
                        setLoadingLocation(false);
                        return [4 /*yield*/, refetch()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        setTimeout(function () {
                            navigation.goBack();
                            navigation.navigate("PronoteInstanceSelector", position);
                        }, 500);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [permission]);
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble message={PapillonMessage} numberOfLines={(permission === null || permission === void 0 ? void 0 : permission.granted) ? 1 : 4} width={250}/>
      {!(permission === null || permission === void 0 ? void 0 : permission.granted) && (<View style={styles.buttons}>
          <ButtonCta value="Demander la permission" primary onPress={function () { return void request(); }}/>
        </View>)}

      <Text style={[styles.terms_text, { color: colors.text + "59" }]}>
        Ta position est nécessaire pour trouver les instances PRONOTE à proximité.
        Elle sera envoyée à Pronote et à l'API adresse du gouvernement pour trouver les établissements.
        Elle n'est pas stockée.
      </Text>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    presentation: {
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 20,
    },
    logotype: {
        height: 28,
    },
    presentation_text: {
        fontSize: 16,
        textAlign: "center",
        fontFamily: "medium",
        marginHorizontal: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    terms_text: {
        fontSize: 12,
        textAlign: "center",
        fontFamily: "medium",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
});
export default PronoteGeolocation;
