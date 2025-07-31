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
import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import Reanimated, { FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { Bug, Sparkles, X } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import PackageJSON from "../../../../package.json";
import { Dimensions, View } from "react-native";
import { Elements } from "./ElementIndex";
import { animPapillon } from "@/utils/ui/animations";
import { useFlagsStore } from "@/stores/flags";
import { useCurrentAccount } from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultTabs } from "@/consts/DefaultTabs";
import { TouchableOpacity } from "react-native-gesture-handler";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var ModalContent = function (_a) {
    var navigation = _a.navigation, refresh = _a.refresh, endRefresh = _a.endRefresh;
    var colors = useTheme().colors;
    var isOnline = useOnlineStatus().isOnline;
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var defined = useFlagsStore(function (state) { return state.defined; });
    var _b = useState(false), updatedRecently = _b[0], setUpdatedRecently = _b[1];
    var _c = useState([]), elements = _c[0], setElements = _c[1];
    useEffect(function () {
        setElements(Elements.map(function (Element) { return ({
            id: Element.id,
            component: Element.component,
            importance: undefined,
        }); }));
    }, []);
    var sortElementsByImportance = useCallback(function () {
        setElements(function (prevElements) {
            return __spreadArray([], prevElements, true).sort(function (a, b) {
                var _a, _b;
                var aImportance = (_a = a.importance) !== null && _a !== void 0 ? _a : -1;
                var bImportance = (_b = b.importance) !== null && _b !== void 0 ? _b : -1;
                return bImportance - aImportance;
            });
        });
    }, []);
    var updateImportance = useCallback(function (id, value) {
        setElements(function (prevElements) {
            return prevElements.map(function (element) {
                return element.id === id ? __assign(__assign({}, element), { importance: value }) : element;
            });
        });
    }, []);
    var handleImportanceChange = useCallback(function (id, value) {
        updateImportance(id, value);
        sortElementsByImportance();
    }, [sortElementsByImportance, updateImportance]);
    var checkForUpdateRecently = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AsyncStorage.getItem("changelog.lastUpdate")];
                case 1:
                    value = _a.sent();
                    if (value == null || value !== PackageJSON.version) {
                        setUpdatedRecently(true);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var checkForNewTabs = useCallback(function () {
        var storedTabs = account.personalization.tabs || [];
        var newTabs = defaultTabs.filter(function (defaultTab) { return !storedTabs.some(function (storedTab) { return storedTab.name === defaultTab.tab; }); });
        if (newTabs.length > 0) {
            var updatedTabs = __spreadArray(__spreadArray([], storedTabs, true), newTabs.map(function (tab) { return ({
                name: tab.tab,
                enabled: false,
                installed: true,
            }); }), true);
            mutateProperty("personalization", __assign(__assign({}, account.personalization), { tabs: updatedTabs }));
        }
    }, [account.personalization.tabs, mutateProperty]);
    var refreshData = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkForUpdateRecently()];
                case 1:
                    _a.sent();
                    checkForNewTabs();
                    sortElementsByImportance();
                    endRefresh();
                    return [2 /*return*/];
            }
        });
    }); }, [checkForUpdateRecently, checkForNewTabs, sortElementsByImportance, endRefresh]);
    useEffect(function () {
        if (refresh) {
            refreshData();
        }
    }, [refresh, refreshData]);
    useEffect(function () {
        var unsubscribe = navigation.addListener("focus", refreshData);
        return unsubscribe;
    }, [navigation, refreshData]);
    var memoizedElements = useMemo(function () { return elements.map(function (Element, index) { return (<Reanimated.View key={index} layout={animPapillon(LinearTransition)} entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
      <Element.component navigation={navigation} onImportance={Element.importance === undefined ? function (value) { return handleImportanceChange(Element.id, value); } : function () { }}/>
    </Reanimated.View>); }); }, [elements, handleImportanceChange, navigation]);
    return (<View style={{ minHeight: Dimensions.get("window").height - 131 }}>
      {(defined("force_debugmode") || __DEV__) && (<NativeList animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
          <View style={{
                flex: 1,
                flexDirection: "column",
                paddingHorizontal: 0,
                paddingVertical: 0,
                gap: 8,
                backgroundColor: colors.primary + "20",
            }}>
            <NativeItem onPress={function () { return navigation.navigate("DevMenu"); }} chevron={true} leading={<Bug size={22} strokeWidth={2} color={colors.text}/>} style={{
                paddingHorizontal: 0,
            }}>
              <NativeText variant="title" style={{ flex: 1, paddingVertical: 4 }}>
                Mode debug
              </NativeText>
            </NativeItem>
          </View>
        </NativeList>)}

      {(defined("force_changelog") || updatedRecently) && (<NativeList animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
          <TouchableOpacity onPress={function () { return navigation.navigate("ChangelogScreen"); }} style={{
                flex: 1,
                flexDirection: "column",
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 8,
                backgroundColor: colors.primary + "20",
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Sparkles size={22} strokeWidth={2} color={colors.text}/>
              <NativeText variant="title" style={{ flex: 1 }}>
                Papillon vient d'être mis à jour à la version {PackageJSON.version} !
              </NativeText>
              <TouchableOpacity onPress={function () {
                AsyncStorage.setItem("changelog.lastUpdate", PackageJSON.version);
                setUpdatedRecently(false);
            }} style={{ padding: 4, borderRadius: 100, backgroundColor: colors.text + "20" }}>
                <X size={18} strokeWidth={3} color={colors.text}/>
              </TouchableOpacity>
            </View>
            <NativeText variant="subtitle">
              Clique ici pour voir tous les changements et les dernières nouveautés.
            </NativeText>
          </TouchableOpacity>
        </NativeList>)}
      {!isOnline && <OfflineWarning paddingTop={16} cache={true}/>}
      <Reanimated.View layout={animPapillon(LinearTransition)}>
        {memoizedElements}
      </Reanimated.View>
    </View>);
};
export default memo(ModalContent);
