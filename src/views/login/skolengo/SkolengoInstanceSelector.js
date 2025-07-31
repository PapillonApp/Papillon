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
import { TouchableOpacity, View, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from "react-native";
import Reanimated, { LinearTransition, FlipInXDown, FadeInUp, FadeOutUp, ZoomIn, ZoomOut, Easing, ZoomInEasyDown } from "react-native-reanimated";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { LinearGradient } from "expo-linear-gradient";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Search, X, GraduationCap, } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import { Skolengo } from "scolengo-api";
import { useDebounce } from "@/hooks/debounce";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var SkolengoInstanceSelector = function (_a) {
    var params = _a.route.params, navigation = _a.navigation;
    // `null` when loading, `[]` when no instances found.
    var _b = useState([]), instances = _b[0], setInstances = _b[1];
    var _c = useState(null), geoInstances = _c[0], setGeoInstances = _c[1];
    var _d = useState(false), isSearchLoading = _d[0], setIsSearchLoading = _d[1];
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    var showAlert = useAlert().showAlert;
    var _e = useState(""), search = _e[0], setSearch = _e[1];
    var searchInputRef = React.createRef();
    var debouncedSearch = useDebounce(search, 1000);
    var _f = useState(false), hasSearched = _f[0], setHasSearched = _f[1];
    var _g = useState(false), keyboardOpen = _g[0], setKeyboardOpen = _g[1];
    var _h = useState(0), keyboardHeight = _h[0], setKeyboardHeight = _h[1];
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
        if (params && params.pos && params.pos !== null) {
            void function () {
                return __awaiter(this, void 0, void 0, function () {
                    var instances;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setIsSearchLoading(true);
                                return [4 /*yield*/, Skolengo.searchSchool({ lon: params.pos.longitude, lat: params.pos.latitude }, 20)];
                            case 1:
                                instances = _a.sent();
                                // On limite à 20 instances.
                                instances.splice(20);
                                setInstances(instances);
                                setGeoInstances(instances);
                                setIsSearchLoading(false);
                                return [2 /*return*/];
                        }
                    });
                });
            }();
        }
        else {
            setInstances([]);
            setGeoInstances(null);
        }
    }, [params]);
    useEffect(function () {
        var _debSearch = debouncedSearch + ""; // make a copy of the debounced search string.
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                var newInstances, newInstances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(geoInstances !== null)) return [3 /*break*/, 1];
                            newInstances = geoInstances.filter(function (instance) { var _a; return (_a = instance.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase()); });
                            setInstances(newInstances);
                            setHasSearched(true);
                            return [3 /*break*/, 3];
                        case 1:
                            setIsSearchLoading(true);
                            return [4 /*yield*/, Skolengo.searchSchool({ text: search }, 20)];
                        case 2:
                            newInstances = _a.sent();
                            // On limite à 20 instances.
                            newInstances.splice(20);
                            setIsSearchLoading(false);
                            if (_debSearch !== debouncedSearch)
                                return [2 /*return*/]; // if the search has changed, we don't update the instances.
                            setInstances(newInstances);
                            setHasSearched(true);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }();
    }, [search, geoInstances]);
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }}/>

      {!keyboardOpen &&
            <Reanimated.View entering={FadeInUp.duration(250).delay(200)} exiting={FadeOutUp.duration(150)} style={{ zIndex: 9999 }} layout={LinearTransition}>
          <PapillonShineBubble message={"Voici les établissements que j'ai trouvé !"} numberOfLines={2} width={250} noFlex style={{ marginTop: 0, zIndex: 9999 }}/>
        </Reanimated.View>}

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

        <ResponsiveTextInput ref={searchInputRef} placeholder={params.pos ? "Recherche parmis ceux-là" : "Une ville, un établissement..."} placeholderTextColor={colors.text + "55"} value={search} onChangeText={setSearch} style={[
            styles.searchInput,
            {
                color: colors.text,
            }
        ]}/>

        {search.length > 0 && (<Reanimated.View layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)} entering={ZoomIn.springify()} exiting={ZoomOut.springify()}>
            <TouchableOpacity onPress={function () {
                setSearch("");
            }}>
              <X size={24} color={colors.text + "55"}/>
            </TouchableOpacity>
          </Reanimated.View>)}
      </Reanimated.View>

      {instances.length === 0 && (debouncedSearch.length > 0 || params.pos) ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large"/>
        </View>) : (<Reanimated.View style={styles.overScrollContainer} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>

          <LinearGradient pointerEvents="none" colors={[
                colors.background + "00",
                colors.background,
            ]} style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 999,
            }}/>

          <Reanimated.ScrollView style={styles.overScroll} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>
            {instances.length === 0 && params.pos && (<Reanimated.Text style={{
                    color: colors.text + "88",
                    textAlign: "center",
                    marginTop: 20,
                    fontFamily: "medium",
                    fontSize: 16,
                }} entering={FadeInUp.springify()} exiting={FadeOutUp.springify()}>
                Aucun établissement trouvé.
              </Reanimated.Text>)}

            {instances.length === 0 && !params.pos && (<Reanimated.Text style={{
                    color: colors.text + "88",
                    textAlign: "center",
                    marginTop: 20,
                    fontFamily: "medium",
                    fontSize: 16,
                }} entering={FadeInUp.springify()} exiting={FadeOutUp.springify()}>
                {hasSearched ? "Aucun établissement trouvé, modifie ta recherche." : "Recherche un établissement."}
              </Reanimated.Text>)}

            <Reanimated.View style={[styles.list,
                {
                    paddingBottom: keyboardHeight + insets.bottom + (keyboardHeight > 0 ? 0 : 20),
                }
            ]} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>
              {instances.map(function (instance, index) { return (<Reanimated.View style={{ width: "100%" }} layout={LinearTransition.springify().mass(1).stiffness(150).damping(20)} entering={index < 10 &&
                    !hasSearched && geoInstances !== null ?
                    FlipInXDown.springify().delay(100 * index)
                    // @ts-expect-error
                    : ZoomInEasyDown.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1)).delay(30 * index)} exiting={index < 10 ? FadeOutUp : void 0} key={instance.id}>
                  <DuoListPressable leading={<GraduationCap size={24} color={colors.text + "88"}/>} text={instance.name} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        navigation.navigate("SkolengoWebview", {
                            school: instance,
                        });
                        return [2 /*return*/];
                    });
                }); }}/>
                </Reanimated.View>); })}
            </Reanimated.View>
          </Reanimated.ScrollView>
        </Reanimated.View>)}
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
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
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 300,
        gap: 12,
        zIndex: 9999,
        marginTop: -10,
    },
    searchInput: {
        flex: 1,
        fontSize: 17,
        fontFamily: "medium",
    }
});
export default SkolengoInstanceSelector;
