var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView, } from "react-native";
import pronote from "pawnote";
import Reanimated, { LinearTransition, FlipInXDown, FadeInUp, FadeOutUp, ZoomIn, ZoomOut, Easing, ZoomInEasyDown, FadeInRight, FadeOut, } from "react-native-reanimated";
import determinateAuthenticationView from "@/services/pronote/determinate-authentication-view";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { LinearGradient } from "expo-linear-gradient";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Search, X, GraduationCap, SearchX } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import { Audio } from "expo-av";
import getInstancesFromDataset from "@/services/pronote/dataset_geolocation";
import * as WebBrowser from "expo-web-browser";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { anim2Papillon } from "@/utils/ui/animations";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var PronoteInstanceSelector = function (_a) {
    var _b;
    var params = _a.route.params, navigation = _a.navigation;
    // `null` when loading, `[]` when no instances found.
    var _c = useState(null), instances = _c[0], setInstances = _c[1];
    var _d = useState(null), originalInstances = _d[0], setOriginalInstances = _d[1];
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    var showAlert = useAlert().showAlert;
    var _e = useState(""), search = _e[0], setSearch = _e[1];
    var searchInputRef = React.createRef();
    var _f = useState(false), hasSearched = _f[0], setHasSearched = _f[1];
    var _g = useState(false), keyboardOpen = _g[0], setKeyboardOpen = _g[1];
    var _h = useState(0), keyboardHeight = _h[0], setKeyboardHeight = _h[1];
    var _j = useState(null), sound = _j[0], setSound = _j[1];
    var _k = useState(false), loading = _k[0], setLoading = _k[1];
    var routes = (_b = navigation.getState()) === null || _b === void 0 ? void 0 : _b.routes;
    var prevRoute = routes[routes.length - 2];
    var keyboardDidShow = function (event) {
        setKeyboardOpen(true);
        setKeyboardHeight(event.endCoordinates.height);
    };
    var keyboardDidHide = function () {
        setKeyboardOpen(false);
        setKeyboardHeight(0);
    };
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () { return (loading ? (<Reanimated.View entering={anim2Papillon(FadeInRight)} exiting={anim2Papillon(FadeOut)}>
          <PapillonSpinner size={22} strokeWidth={3} color={colors.primary}/>
        </Reanimated.View>) : <View />); }
        });
    }, [navigation, loading]);
    useEffect(function () {
        Keyboard.addListener("keyboardDidShow", keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);
        return function () {
            Keyboard.removeAllListeners("keyboardDidShow");
            Keyboard.removeAllListeners("keyboardDidHide");
        };
    }, []);
    useEffect(function () {
        var loadSound = function () { return __awaiter(void 0, void 0, void 0, function () {
            var sound;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Audio.Sound.createAsync(require("@/../assets/sound/3.wav"))];
                    case 1:
                        sound = (_a.sent()).sound;
                        setSound(sound);
                        return [2 /*return*/];
                }
            });
        }); };
        loadSound();
        return function () {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);
    useEffect(function () {
        if (params) {
            void (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var dataset_instances, pronote_instances, instances;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getInstancesFromDataset(params.longitude, params.latitude)];
                            case 1:
                                dataset_instances = _a.sent();
                                return [4 /*yield*/, pronote.geolocation(params)];
                            case 2:
                                pronote_instances = _a.sent();
                                instances = pronote_instances.map(function (instance) {
                                    var toRadians = function (degrees) { return degrees * (Math.PI / 180); };
                                    var R = 6371; // Earth's radius in kilometers
                                    var lat1 = toRadians(params.latitude);
                                    var lon1 = toRadians(params.longitude);
                                    var lat2 = toRadians(instance.latitude);
                                    var lon2 = toRadians(instance.longitude);
                                    var dLat = lat2 - lat1;
                                    var dLon = lon2 - lon1;
                                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(lat1) *
                                            Math.cos(lat2) *
                                            Math.sin(dLon / 2) *
                                            Math.sin(dLon / 2);
                                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                    var distance = R * c;
                                    return __assign(__assign({}, instance), { distance: distance });
                                });
                                // On limite à 20 instances.
                                instances.splice(20);
                                // On ajoute les instances trouvées par l'API adresse.
                                instances.push.apply(instances, dataset_instances);
                                // On trie par distance.
                                instances.sort(function (a, b) { return a.distance - b.distance; });
                                // On met à jour les instances.
                                setInstances(instances);
                                setOriginalInstances(instances);
                                return [2 /*return*/];
                        }
                    });
                });
            })();
        }
    }, [params]);
    useEffect(function () {
        if (originalInstances) {
            var newInstances = originalInstances.filter(function (instance) {
                return instance.name.toLowerCase().includes(search.toLowerCase());
            });
            setInstances(newInstances);
            setHasSearched(true);
        }
    }, [search, originalInstances]);
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }}/>

      {!keyboardOpen && (<Reanimated.View entering={FadeInUp.duration(250).delay(200)} exiting={FadeOutUp.duration(150)} style={{ zIndex: 9999 }} layout={LinearTransition}>
          <PapillonShineBubble message={"Voici les établissements que j'ai trouvé !"} numberOfLines={2} width={260} noFlex/>
        </Reanimated.View>)}

      <Reanimated.View style={[
            styles.searchContainer,
            {
                backgroundColor: colors.text + "15",
                // @ts-expect-error
                color: colors.text,
                borderColor: colors.border,
            },
        ]} layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}>
        <Search size={24} color={colors.text + "55"}/>

        <ResponsiveTextInput ref={searchInputRef} placeholder="Rechercher un établissement" placeholderTextColor={colors.text + "55"} value={search} onChangeText={setSearch} style={[
            styles.searchInput,
            {
                color: colors.text,
            },
        ]}/>

        {search.length > 0 && (<Reanimated.View layout={LinearTransition.springify()
                .mass(1)
                .stiffness(100)
                .damping(40)} entering={ZoomIn.springify()} exiting={ZoomOut.springify()}>
            <TouchableOpacity onPress={function () { return setSearch(""); }}>
              <X size={24} color={colors.text + "55"}/>
            </TouchableOpacity>
          </Reanimated.View>)}
      </Reanimated.View>

      {instances === null ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large"/>
        </View>) : (<Reanimated.View style={styles.overScrollContainer} layout={LinearTransition.springify()
                .mass(1)
                .stiffness(100)
                .damping(40)}>
          <LinearGradient pointerEvents="none" colors={[colors.background + "00", colors.background]} style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 999,
            }}/>

          <Reanimated.ScrollView style={styles.overScroll} layout={LinearTransition.springify()
                .mass(1)
                .stiffness(100)
                .damping(40)}>
            {instances.length === 0 && (<Reanimated.Text style={{
                    color: colors.text + "88",
                    textAlign: "center",
                    marginTop: 20,
                    fontFamily: "medium",
                    fontSize: 16,
                }} entering={FadeInUp.springify()} exiting={FadeOutUp.springify()}>
                Aucun établissement trouvé.
              </Reanimated.Text>)}

            <Reanimated.View style={[
                styles.list,
                {
                    paddingBottom: keyboardHeight +
                        insets.bottom +
                        (keyboardHeight > 0 ? 0 : 20),
                },
            ]} layout={LinearTransition.springify()
                .mass(1)
                .stiffness(100)
                .damping(40)}>
              {instances.map(function (instance, index) { return (<Reanimated.View style={{ width: "100%" }} layout={LinearTransition.springify()
                    .mass(1)
                    .stiffness(150)
                    .damping(20)} entering={index < 10 && !hasSearched
                    ? FlipInXDown.springify().delay(100 * index)
                    // @ts-expect-error
                    : ZoomInEasyDown.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1)).delay(30 * index)} exiting={index < 10 ? FadeOutUp : void 0} key={instance.url}>
                  <DuoListPressable leading={<GraduationCap size={24} color={colors.text + "88"}/>} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setLoading(true);
                                return [4 /*yield*/, determinateAuthenticationView(instance.url, navigation, showAlert)];
                            case 1:
                                _a.sent();
                                setLoading(false);
                                return [2 /*return*/];
                        }
                    });
                }); }} text={instance.name} subtext={params.hideDistance
                    ? undefined
                    : "\u00E0 ".concat(instance.distance.toFixed(2), "km de ta position")}/>
                </Reanimated.View>); })}
              <Reanimated.View style={{ width: "100%" }} layout={LinearTransition.springify()
                .mass(1)
                .stiffness(150)
                .damping(20)} entering={instances.length < 10 && !hasSearched
                ? FlipInXDown.springify().delay(100 * instances.length)
                // @ts-expect-error
                : ZoomInEasyDown.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1)).delay(30 * instances.length)} exiting={instances.length < 10 ? FadeOutUp : void 0}>
                <DuoListPressable leading={<SearchX size={24} color={colors.text + "88"}/>} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, WebBrowser.openBrowserAsync("https://support.papillon.bzh//articles/351104-frequency-asked-questions#etab-not-found", {
                                controlsColor: "#0E7CCB",
                                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }} text={"Je ne trouve pas mon établissement..."}/>
              </Reanimated.View>
            </Reanimated.View>
            <View style={{ height: 36 }}/>
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
    },
});
export default PronoteInstanceSelector;
