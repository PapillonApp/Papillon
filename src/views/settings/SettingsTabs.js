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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Switch } from "react-native";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useCurrentAccount } from "@/stores/account";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import LottieView from "lottie-react-native";
import { AlertTriangle, Captions, Equal, SendToBack, Gift, Undo2, BadgeInfo, } from "lucide-react-native";
import { NestableDraggableFlatList, NestableScrollContainer, ShadowDecorator, } from "react-native-draggable-flatlist";
import { PressableScale } from "react-native-pressable-scale";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn, ZoomOut, } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultTabs } from "@/consts/DefaultTabs";
import { log } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";
var SettingsTabs = function () {
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var safeTabs = ["Home"];
    var _a = useState(true), loading = _a[0], setLoading = _a[1];
    var _b = useState([]), tabs = _b[0], setTabs = _b[1];
    var _c = useState([]), newTabs = _c[0], setNewTabs = _c[1];
    var _d = useState(false), hideTabTitles = _d[0], setHideTabTitles = _d[1];
    var _e = useState(false), showTabBackground = _e[0], setShowTabBackground = _e[1];
    var _f = useState(false), failAnimation = _f[0], setFailAnimation = _f[1];
    var _g = useState(0), previewIndex = _g[0], setPreviewIndex = _g[1];
    var _h = useState(false), showNewTabsNotification = _h[0], setShowNewTabsNotification = _h[1];
    // Refs for Lottie animations
    var lottieRefs = useRef([]);
    // Update Lottie refs when tabs change
    useEffect(function () {
        lottieRefs.current = tabs.map(function (_, i) { return lottieRefs.current[i] || React.createRef(); });
    }, [tabs]);
    var toggleTab = function (tab) {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var isTabEnabled, enabledTabsCount, updatedTabs;
            var _a, _b;
            return __generator(this, function (_c) {
                isTabEnabled = (_b = (_a = tabs.find(function (t) { return t.tab === tab; })) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
                enabledTabsCount = tabs.filter(function (t) { return t.enabled; }).length;
                if (!isTabEnabled && enabledTabsCount === 5) {
                    playFailAnimation();
                    return [2 /*return*/];
                }
                updatedTabs = tabs.map(function (t) {
                    return t.tab === tab ? __assign(__assign({}, t), { enabled: !t.enabled }) : t;
                });
                setTabs(updatedTabs);
                updatePersonalizationTabs(updatedTabs);
                return [2 /*return*/];
            });
        }); })();
    };
    var playFailAnimation = function () {
        setFailAnimation(true);
        setTimeout(function () { return setFailAnimation(false); }, 900);
    };
    var updatePersonalizationTabs = function (updatedTabs) {
        mutateProperty("personalization", __assign(__assign({}, account.personalization), { tabs: updatedTabs.map(function (_a) {
                var tab = _a.tab, enabled = _a.enabled, installed = _a.installed;
                return ({
                    name: tab,
                    enabled: enabled,
                    installed: installed,
                });
            }) }));
    };
    useLayoutEffect(function () {
        var loadTabs = function () { return __awaiter(void 0, void 0, void 0, function () {
            var storedTabs_1, updatedTabs, newTabsFound;
            var _a, _b;
            return __generator(this, function (_c) {
                if (account.personalization.tabs) {
                    storedTabs_1 = account.personalization.tabs;
                    updatedTabs = storedTabs_1
                        .map(function (storedTab) {
                        var defaultTab = defaultTabs.find(function (t) { return t.tab === storedTab.name; });
                        return defaultTab
                            ? __assign(__assign({}, defaultTab), { enabled: storedTab.enabled, installed: true }) : null;
                    })
                        .filter(function (tab) { return tab !== null; });
                    newTabsFound = defaultTabs.filter(function (defaultTab) { return !storedTabs_1.some(function (storedTab) { return storedTab.name === defaultTab.tab; }); }).map(function (tab) { return (__assign(__assign({}, tab), { installed: true })); });
                    setTabs(updatedTabs);
                    setNewTabs(newTabsFound);
                    setShowNewTabsNotification(newTabsFound.length > 0);
                }
                else {
                    log("No tabs found in account, using default tabs.", "SettingsTabs");
                    setTabs(defaultTabs.map(function (tab) { return (__assign(__assign({}, tab), { installed: true })); }));
                    updatePersonalizationTabs(defaultTabs.map(function (tab) { return (__assign(__assign({}, tab), { installed: true })); }));
                }
                setHideTabTitles((_a = account.personalization.hideTabTitles) !== null && _a !== void 0 ? _a : false);
                setShowTabBackground((_b = account.personalization.showTabBackground) !== null && _b !== void 0 ? _b : false);
                setLoading(false);
                return [2 /*return*/];
            });
        }); };
        loadTabs();
    }, []);
    var handleAddNewTabs = function () {
        log("Adding new tabs.", "SettingsTabs");
        var updatedTabs = __spreadArray(__spreadArray([], tabs, true), newTabs.map(function (tab) { return (__assign(__assign({}, tab), { installed: true, enabled: false })); }), true);
        setTabs(updatedTabs);
        updatePersonalizationTabs(updatedTabs);
        setNewTabs([]);
        setShowNewTabsNotification(false);
    };
    useEffect(function () {
        log("Ensuring Home tab is in the correct position.", "SettingsTabs");
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var newTabs, homeIndex, homeTab;
            return __generator(this, function (_a) {
                newTabs = __spreadArray([], tabs, true);
                homeIndex = newTabs.findIndex(function (tab) { return tab.tab === "Home"; });
                if (homeIndex > 4) {
                    homeTab = newTabs.splice(homeIndex, 1)[0];
                    newTabs.splice(4, 0, homeTab);
                    setTabs(newTabs);
                }
                setLoading(false);
                return [2 /*return*/];
            });
        }); })();
    }, [tabs]);
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mutateProperty("personalization", __assign(__assign({}, account.personalization), { hideTabTitles: hideTabTitles, showTabBackground: showTabBackground }));
                return [2 /*return*/];
            });
        }); })();
    }, [hideTabTitles, showTabBackground]);
    var resetTabs = function () {
        log("Resetting tabs to default.", "SettingsTabs");
        var resetTabs = defaultTabs.map(function (tab) { return (__assign(__assign({}, tab), { enabled: tab.tab === "Home" || tab.tab === "Lessons" || tab.tab === "Homeworks" || tab.tab === "Grades" || tab.tab === "News", installed: true })); });
        setTabs(resetTabs);
        updatePersonalizationTabs(resetTabs);
        setHideTabTitles(false);
        setShowTabBackground(false);
    };
    var showAlert = useAlert().showAlert;
    return (<View>
      <NestableScrollContainer contentContainerStyle={{
            paddingBottom: 16 + insets.bottom,
        }}>
        <View style={{
            padding: 16,
            paddingTop: 0,
        }}>


          <NativeList>
            <View style={{
            backgroundColor: theme.colors.primary + "22",
            borderRadius: 0,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
        }}>
              <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 10,
            backgroundColor: theme.colors.card,
            shadowColor: "black",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            paddingVertical: 8,
            paddingHorizontal: 6,
            height: 58,
        }}>
                {tabs.filter(function (tab) { return tab.enabled; }).map(function (tab, index) {
            return (<Reanimated.View key={tab.tab} style={{ flex: 1 }} layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)} entering={ZoomIn} exiting={ZoomOut}>
                      <PressableScale activeScale={0.85} weight="light" style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                    gap: 2,
                }} onPress={function () {
                    var _a, _b, _c, _d;
                    setPreviewIndex(index);
                    (_b = (_a = lottieRefs.current[index]) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.reset();
                    (_d = (_c = lottieRefs.current[index]) === null || _c === void 0 ? void 0 : _c.current) === null || _d === void 0 ? void 0 : _d.play();
                }}>
                        <Reanimated.View layout={LinearTransition} style={[
                    {
                        width: 22,
                        height: 22,
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    showTabBackground && !hideTabTitles && {
                        backgroundColor: index == previewIndex ? theme.colors.primary + "22" : "transparent",
                        borderRadius: 30,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        width: 50,
                        height: 28,
                    },
                    showTabBackground && hideTabTitles && {
                        backgroundColor: index == previewIndex ? theme.colors.primary + "22" : "transparent",
                        height: 36,
                        width: 36,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 6,
                    },
                    !showTabBackground && hideTabTitles && {
                        height: 26,
                        width: 26,
                    },
                ]}>
                          <LottieView autoPlay={true} loop={false} source={tab.icon} colorFilters={[{
                        keypath: "*",
                        color: index == previewIndex ? theme.colors.primary : theme.colors.text,
                    }]} style={{
                    width: "100%",
                    height: "100%",
                    marginVertical: hideTabTitles ? 8 : 0,
                }} ref={lottieRefs.current[index]}/>
                        </Reanimated.View>
                        {!hideTabTitles && (<Reanimated.Text style={{
                        color: index == previewIndex ? theme.colors.primary : theme.colors.text,
                        fontFamily: "semibold",
                        fontSize: 12.5,
                    }} numberOfLines={1} entering={FadeIn} exiting={FadeOut.duration(100)} layout={LinearTransition}>
                            {tab.label}
                          </Reanimated.Text>)}
                      </PressableScale>
                    </Reanimated.View>);
        })}

                {failAnimation && (<Reanimated.View layout={LinearTransition} style={{
                width: 42,
                height: 40,
                backgroundColor: "#CCA50023",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 4,
            }} entering={ZoomIn.springify().mass(1).damping(20).stiffness(500)} exiting={FadeOut.duration(100)}>
                    <AlertTriangle size={20} color={"#CCA500"}/>
                  </Reanimated.View>)}
              </View>
            </View>
            <NativeItem>
              <NativeText variant="title">
                Rangement des sections
              </NativeText>
              <NativeText variant="subtitle">
                Tu peux choisir jusqu'à 5 onglets à afficher sur la page d'accueil.
              </NativeText>
            </NativeItem>

          </NativeList>

          <NativeListHeader label="Réorganiser les onglets"/>

          <NativeList>
            {showNewTabsNotification && (<NativeItem leading={<Gift color={theme.colors.primary} size={28} strokeWidth={2}/>} onPress={handleAddNewTabs} style={{
                backgroundColor: theme.colors.primary + "30",
            }} androidStyle={{
                backgroundColor: theme.colors.primary + "20",
            }}>
                <NativeText variant="title">Nouveaux onglets disponibles !</NativeText>
                <NativeText variant="subtitle">
                  {newTabs.map(function (tab) { return tab.label; }).join(", ")}. Appuie ici pour les ajouter.
                </NativeText>
              </NativeItem>)}

            <NestableDraggableFlatList key={tabs.map(function (tab) { return tab.tab; }).join(",")} initialNumToRender={tabs.length} scrollEnabled={false} data={tabs} renderItem={function (_a) {
            var _b;
            var item = _a.item, getIndex = _a.getIndex, drag = _a.drag;
            return (<ShadowDecorator>
                  <View style={{ backgroundColor: theme.colors.card }}>
                    <NativeItem onLongPress={function () {
                    setLoading(true);
                    drag();
                }} delayLongPress={50} chevron={false} separator={((_b = getIndex()) !== null && _b !== void 0 ? _b : +Infinity) < tabs.length - 1} leading={<LottieView source={item.icon} colorFilters={[
                        {
                            keypath: "*",
                            color: theme.colors.text,
                        }
                    ]} style={{ width: 24, height: 24, marginVertical: 2 }}/>} trailing={<View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 9,
                        width: 70,
                    }}>
                          {!safeTabs.includes(item.tab) && !loading && (<Reanimated.View entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)} exiting={ZoomOut.duration(300)}>
                              <PapillonCheckbox checked={item.enabled} onPress={function () {
                            if (!item.enabled && tabs.filter(function (t) { return t.enabled; }).length === 5) {
                                showAlert({
                                    title: "Information",
                                    message: "Tu ne peux pas ajouter plus de 5 onglets sur la page d'accueil.",
                                    icon: <BadgeInfo />,
                                    actions: [
                                        {
                                            title: "OK",
                                            primary: true,
                                            icon: <Undo2 />,
                                        },
                                    ],
                                });
                            }
                            toggleTab(item.tab);
                        }}/>
                            </Reanimated.View>)}

                          <Equal size={24} color={theme.colors.text} style={{ marginRight: 6, opacity: 0.6 }}/>
                        </View>}>
                      <NativeText variant="title">
                        {item.label}
                      </NativeText>
                    </NativeItem>
                  </View>
                </ShadowDecorator>);
        }} keyExtractor={function (item) { return item.tab; }} onDragEnd={function (_a) {
            var data = _a.data;
            setTabs(data);
            updatePersonalizationTabs(data);
        }}/>
          </NativeList>

          <NativeListHeader label="Options"/>

          <NativeList>
            <NativeItem onPress={resetTabs}>
              <NativeText style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }}>
                Réinitialiser les onglets
              </NativeText>
              <NativeText style={{
            fontSize: 14,
            color: theme.colors.text + "90",
        }}>
                Réinitialiser les onglets par défaut
              </NativeText>
            </NativeItem>

            <NativeItem separator icon={<Captions />} trailing={<Switch trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary
            }} thumbColor={theme.dark ? theme.colors.text : theme.colors.background} value={!hideTabTitles} onValueChange={function () {
                setHideTabTitles(!hideTabTitles);
            }}/>}>
              <NativeText style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }}>
                Afficher les titres des onglets
              </NativeText>
            </NativeItem>
            <NativeItem icon={<SendToBack />} trailing={<Switch trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary
            }} thumbColor={theme.dark ? theme.colors.text : theme.colors.background} value={showTabBackground} onValueChange={function () {
                setShowTabBackground(!showTabBackground);
            }}/>}>
              <NativeText style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }}>
                Afficher un fond aux onglets
              </NativeText>
            </NativeItem>
          </NativeList>
        </View>
      </NestableScrollContainer>
    </View>);
};
export default SettingsTabs;
