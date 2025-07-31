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
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { AlertTriangle, BadgeHelp, CheckCheck, ChevronRight, Eraser, Undo2 } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAlert } from "@/providers/AlertProvider";
import * as TaskManager from "expo-task-manager";
import { error, log } from "@/utils/logger/logger";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import { papillonNotify } from "@/background/Notifications";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { registerBackgroundTasks, unsetBackgroundFetch } from "@/background/BackgroundTasks";
var DevMenu = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var showAlert = useAlert().showAlert;
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), isBackgroundActive = _c[0], setIsBackgroundActive = _c[1];
    useEffect(function () {
        var checkBackgroundTaskStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
            var isRegistered_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, TaskManager.isTaskRegisteredAsync("background-fetch")];
                    case 1:
                        isRegistered_1 = _a.sent();
                        setTimeout(function () {
                            setIsBackgroundActive(isRegistered_1);
                        }, 500);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        error("\u274C Failed to register background task: ".concat(err_1), "BACKGROUND");
                        setIsBackgroundActive(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        if (!isExpoGo() && !loading) {
            checkBackgroundTaskStatus();
        }
    }, [isBackgroundActive, loading]);
    // add button to header
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () { return __DEV__ && (<TouchableOpacity onPress={function () {
                    navigation.navigate("AccountSelector");
                }} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 0,
                }}>
          <Text style={{
                    color: colors.primary,
                    fontFamily: "medium",
                    fontSize: 17.5,
                }}>
            Appli
          </Text>

          <ChevronRight size={32} color={colors.primary} style={{ marginLeft: 0, marginRight: -8 }}/>
        </TouchableOpacity>); },
        });
    }, [navigation]);
    return (<ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{
            padding: 16,
        }}>
      {__DEV__ && (<View style={{
                backgroundColor: colors.text + "16",
                borderRadius: 10,
                borderCurve: "continuous",
                padding: 16,
                gap: 4,
            }}>
          <Text style={{
                color: colors.text,
                fontSize: 18,
                fontFamily: "bold",
            }}>
            Menu pour les développeurs
          </Text>


          <Text style={{
                color: colors.text,
                fontSize: 16,
                lineHeight: 20,
                fontFamily: "medium",
                opacity: 0.7,
            }}>
            Intègre tes options et paramètres de développement ici.
          </Text>
        </View>)}

      {__DEV__ && (<View>
          <NativeListHeader label="Application debug"/>

          <NativeList>

            <NativeItem onPress={function () { return navigation.navigate("AccountSelector"); }}>
              <NativeText>
                Go to Account Selector
              </NativeText>
            </NativeItem>

            <NativeItem onPress={function () { return navigation.navigate("GradeReaction", {
                grade: {
                    id: "devGrade",
                    subjectName: "Développement",
                    description: "Typage avec Vince",
                    timestamp: new Date().getTime(),
                    outOf: { value: 7, status: null },
                    coefficient: 7,
                    student: { value: 7, status: null },
                    average: { value: 7, status: null },
                    max: { value: 7, status: null },
                    min: { value: 1, status: null }
                }
            }); }}>
              <NativeText>
                GradeReaction
              </NativeText>
            </NativeItem>

            <NativeItem onPress={function () { return navigation.navigate("ColorSelector"); }}>
              <NativeText>
                ColorSelector
              </NativeText>
            </NativeItem>

            <NativeItem onPress={function () { return navigation.navigate("AccountCreated"); }}>
              <NativeText>
                AccountCreated
              </NativeText>
            </NativeItem>

          </NativeList>
        </View>)}

      <View>
        <NativeListHeader label="Options de développement"/>

        <NativeList>
          <NativeItem onPress={function () {
            navigation.navigate("SettingStack", {
                view: "SettingsFlags"
            });
        }}>
            <NativeText>
              Gérer les flags
            </NativeText>
          </NativeItem>
          <NativeItem onPress={function () {
            navigation.navigate("SettingStack", {
                view: "SettingsDevLogs"
            });
        }}>
            <NativeText>
              Logs de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      </View>


      {!isExpoGo() && (<View>
          <NativeListHeader label="Tâches en arrière-plan"/>

          <NativeList>
            <NativeItem leading={isBackgroundActive ? (<CheckCheck color="#00bd55"/>) : isBackgroundActive === false ? (<AlertTriangle color="#bd9100"/>) : (<PapillonSpinner size={24} color={theme.colors.primary}/>)}>
              <NativeText variant="body">
                {isBackgroundActive === true
                ? "Le background est actuellement actif."
                : isBackgroundActive === false
                    ? "Le background n'est pas actif."
                    : "Vérification du background..."}
              </NativeText>
            </NativeItem>
            {isBackgroundActive !== null && (<NativeItem title={isBackgroundActive ? "Réinitialiser" : "Activer"} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setLoading(true);
                                setIsBackgroundActive(null);
                                if (!isBackgroundActive) return [3 /*break*/, 2];
                                return [4 /*yield*/, unsetBackgroundFetch()
                                        .then(function () { return log("✅ Background task unregistered", "BACKGROUND"); })
                                        .catch(function (ERRfatal) {
                                        return error("\u274C Failed to unregister background task: ".concat(ERRfatal), "BACKGROUND");
                                    })];
                            case 1:
                                _a.sent();
                                ;
                                _a.label = 2;
                            case 2: return [4 /*yield*/, registerBackgroundTasks()
                                    .then(function () { return log("✅ Background task registered", "BACKGROUND"); })
                                    .catch(function (ERRfatal) {
                                    return error("\u274C Failed to register background task: ".concat(ERRfatal), "BACKGROUND");
                                })];
                            case 3:
                                _a.sent();
                                setTimeout(function () {
                                    setLoading(false);
                                }, 500);
                                return [2 /*return*/];
                        }
                    });
                }); }}/>)}
            <NativeItem title={"Test des notifications"} trailing={loading ? (<View>
                    <PapillonSpinner strokeWidth={3} size={22} color={theme.colors.text}/>
                  </View>) : undefined} disabled={loading} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLoading(true);
                            return [4 /*yield*/, papillonNotify({
                                    id: "test",
                                    title: "Coucou, c'est Papillon 👋",
                                    subtitle: "Test",
                                    body: "Si tu me vois, c'est que tout fonctionne correctement !",
                                }, "Test")];
                        case 1:
                            _a.sent();
                            setTimeout(function () {
                                setLoading(false);
                            }, 500);
                            return [2 /*return*/];
                    }
                });
            }); }}/></NativeList>
        </View>)}

      <View>
        <NativeListHeader label="Actions destructives"/>

        <NativeList>

          <NativeItem onPress={function () {
            showAlert({
                title: "Réinitialisation de Papillon",
                message: "Veux-tu vraiment réinitialiser toutes les données de l'application ?",
                icon: <BadgeHelp />,
                actions: [
                    {
                        title: "Annuler",
                        icon: <Undo2 />,
                        primary: false,
                    },
                    {
                        title: "Réinitialiser",
                        icon: <Eraser />,
                        onPress: function () {
                            AsyncStorage.clear();
                            navigation.popToTop();
                        },
                        danger: true,
                        delayDisable: 10,
                    }
                ]
            });
        }}>
            <NativeText style={{
            color: "#E91E63",
            fontFamily: "semibold",
        }}>
              Réinitialiser toutes les données
            </NativeText>
            <NativeText variant="subtitle">
              Supprime toutes les données de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      </View>

    </ScrollView>);
};
export default DevMenu;
