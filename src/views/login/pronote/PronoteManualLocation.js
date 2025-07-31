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
import React, { createRef, useEffect, useState } from "react";
import { Keyboard, Text, StyleSheet, ActivityIndicator, TouchableOpacity, View } from "react-native";
import { getGeographicMunicipalities } from "@/utils/external/geo-gouv-api";
import { useDebounce } from "@/hooks/debounce";
import Reanimated, { LinearTransition, FlipInXDown, ZoomIn, ZoomOut, FadeInDown, FadeOutUp, FadeInUp, FadeOutDown } from "react-native-reanimated";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Search, X } from "lucide-react-native";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
/**
 * Allows the get the location of the user manually.
 *
 * Instead of using the device location, we ask the user to input
 * a city name and using the French government API, we retrieve the
 * location (longitude and latitude) of the city.
 */
var PronoteManualLocation = function (_a) {
    var navigation = _a.navigation;
    var searchInputRef = createRef();
    var _b = useState(""), search = _b[0], setSearch = _b[1];
    // Prevent to make a request on every key press.
    var debouncedSearch = useDebounce(search, 250);
    var _c = useState({
        loading: true,
        results: []
    }), municipalities = _c[0], setMunicipalities = _c[1];
    var insets = useSafeAreaInsets();
    var colors = useTheme().colors;
    var _d = useState(false), keyboardOpen = _d[0], setKeyboardOpen = _d[1];
    var _e = useState(0), keyboardHeight = _e[0], setKeyboardHeight = _e[1];
    var keyboardDidShow = function (event) {
        setKeyboardOpen(true);
        setKeyboardHeight(event.endCoordinates.height);
    };
    var keyboardDidHide = function () {
        setKeyboardOpen(false);
        setKeyboardHeight(0);
    };
    useEffect(function () {
        Keyboard.addListener("keyboardDidShow", keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);
        return function () {
            Keyboard.removeAllListeners("keyboardDidShow");
            Keyboard.removeAllListeners("keyboardDidHide");
        };
    }, []);
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Limitations from the API.
                        if (debouncedSearch.length < 3 || debouncedSearch.length > 200) {
                            setMunicipalities({
                                loading: false,
                                results: []
                            });
                            return [2 /*return*/];
                        }
                        // We set the loading state to true.
                        setMunicipalities(function (prev) { return ({
                            loading: true,
                            results: prev.results // Keep the previous results while it's loading.
                        }); });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getGeographicMunicipalities(debouncedSearch, 15)];
                    case 2:
                        data = _b.sent();
                        setMunicipalities({
                            loading: false,
                            results: data
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        setMunicipalities({
                            loading: false,
                            results: []
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    }, [debouncedSearch]);
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }}/>

      {!keyboardOpen && municipalities.results.length === 0 && (<Reanimated.View entering={FadeInUp.duration(250).delay(200)} exiting={FadeOutUp.duration(150)} style={{ zIndex: 9999 }} layout={LinearTransition}>
          <PapillonShineBubble message={"Dans quelle ville se trouve ton établissement ?"} numberOfLines={2} width={250} noFlex style={{ marginTop: 0, zIndex: 9999 }}/>
        </Reanimated.View>)}

      <Reanimated.View style={[
            styles.searchContainer,
            {
                backgroundColor: colors.text + "15",
                // @ts-expect-error
                color: colors.text,
                borderColor: colors.border,
            }
        ]} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>
        <Search size={24} color={colors.text + "55"}/>

        <ResponsiveTextInput ref={searchInputRef} autoFocus={true} placeholder="Nom d'une ville, municipalité, etc." placeholderTextColor={colors.text + "55"} value={search} onChangeText={setSearch} style={[
            styles.searchInput,
            {
                color: colors.text,
            }
        ]}/>

        {search.length > 0 && (<Reanimated.View layout={LinearTransition} entering={ZoomIn.springify()} exiting={ZoomOut.springify()}>
            <TouchableOpacity onPress={function () {
                var _a;
                setSearch("");
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }}>
              <X size={24} color={colors.text + "55"}/>
            </TouchableOpacity>
          </Reanimated.View>)}
      </Reanimated.View>

      <Reanimated.ScrollView style={styles.overScroll} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>
        <Reanimated.View style={[styles.list, {
                paddingBottom: keyboardHeight + insets.bottom,
            }]} layout={LinearTransition}>
          {municipalities.loading ? (<Reanimated.View style={styles.loadingContainer} layout={LinearTransition} entering={FadeInDown.springify()} exiting={FadeOutDown.springify()}>
              <ActivityIndicator />
              <Text style={{
                color: colors.text + "88",
                marginTop: 10,
                fontSize: 16,
            }}>
                Chargement...
              </Text>
            </Reanimated.View>) : (municipalities.results.map(function (municipality, index) { return (<Reanimated.View style={{ width: "100%" }} entering={FlipInXDown.springify().delay(100 * index)} exiting={FadeOutDown.duration(150).delay(100 * index)} layout={LinearTransition} key={index}>
                <DuoListPressable text={"".concat(municipality.properties.name, " (").concat(municipality.properties.postcode, ")")} onPress={function () { return void navigation.navigate("PronoteInstanceSelector", {
                longitude: municipality.geometry.coordinates[0],
                latitude: municipality.geometry.coordinates[1],
                hideDistance: true
            }); }}/>
              </Reanimated.View>); }))}
        </Reanimated.View>
      </Reanimated.ScrollView>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        // justifyContent: "center",
        gap: 20,
        // paddingTop: -40,
    },
    overScrollContainer: {
        flex: 1,
        width: "100%",
    },
    overScroll: {
        width: "100%",
        marginTop: -20,
    },
    list: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        gap: 10,
        paddingBottom: 60,
        paddingTop: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: -10,
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 300,
        gap: 12,
        zIndex: 9999,
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        fontFamily: "medium",
    }
});
export default PronoteManualLocation;
