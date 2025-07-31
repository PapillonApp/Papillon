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
import React from "react";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as StoreReview from "expo-store-review";
import { Asterisk, Calculator, Scale, School, UserMinus, UserPlus, Users, Maximize2, BadgeInfo, } from "lucide-react-native";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGradesStore } from "@/stores/grades";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedEmoji from "@/components/Grades/AnimatedEmoji";
import GradeModal from "@/components/Grades/GradeModal";
import { useAlert } from "@/providers/AlertProvider";
var GradeDocument = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var route = _a.route, navigation = _a.navigation;
    var _j = route.params, grade = _j.grade, _k = _j.allGrades, allGrades = _k === void 0 ? [] : _k;
    var theme = useTheme();
    var showAlert = useAlert().showAlert;
    var _l = useState(false), modalOpen = _l[0], setModalOpen = _l[1];
    var _m = useState(false), isReactionBeingTaken = _m[0], setIsReactionBeingTaken = _m[1];
    var _o = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _o[0], setSubjectData = _o[1];
    var _p = useState(false), shouldShowReviewOnClose = _p[0], setShouldShowReviewOnClose = _p[1];
    var currentReel = useGradesStore(function (state) { return state.reels[grade.id]; });
    var reels = useGradesStore(function (state) { return state.reels; });
    var askForReview = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            StoreReview.isAvailableAsync().then(function (available) {
                if (available) {
                    StoreReview.requestReview();
                }
            });
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        navigation.addListener("beforeRemove", function () {
            if (shouldShowReviewOnClose) {
                AsyncStorage.getItem("review_given").then(function (value) {
                    if (!value) {
                        askForReview();
                        AsyncStorage.setItem("review_given", "true");
                    }
                });
            }
        });
    });
    useEffect(function () {
        AsyncStorage.getItem("review_openGradeCount").then(function (value) {
            if (value) {
                if (parseInt(value) >= 5) {
                    AsyncStorage.setItem("review_openGradeCount", "0");
                    setShouldShowReviewOnClose(true);
                }
                else {
                    AsyncStorage.setItem("review_openGradeCount", (parseInt(value) + 1).toString());
                }
            }
            else {
                AsyncStorage.setItem("review_openGradeCount", "1");
            }
        });
    }, []);
    var fetchSubjectData = function () {
        var data = getSubjectData(grade.subjectName);
        setSubjectData(data);
    };
    useEffect(function () {
        fetchSubjectData();
    }, [grade.subjectName]);
    useLayoutEffect(function () {
        navigation.setOptions({
            headerTitle: "Note en " + subjectData.pretty,
            headerStyle: {
                backgroundColor: Platform.OS === "android" ? subjectData.color : undefined,
            },
            headerTintColor: "#ffffff",
        });
    }, [navigation, subjectData]);
    var _q = useState({}), gradeDiff = _q[0], setGradeDiff = _q[1];
    var _r = useState({}), classDiff = _r[0], setClassDiff = _r[1];
    useEffect(function () {
        var gD = getAverageDiffGrade([grade], allGrades, "student");
        var cD = getAverageDiffGrade([grade], allGrades, "average");
        setGradeDiff(gD);
        setClassDiff(cD);
    }, [grade]);
    var lists = [
        {
            title: "Informations",
            items: [
                {
                    icon: <Asterisk />,
                    title: "Coefficient",
                    description: "Coefficient de la note",
                    value: "x" + grade.coefficient.toFixed(2),
                },
                grade.outOf.value !== 20 &&
                    !grade.student.disabled && {
                    icon: <Calculator />,
                    title: "Remis sur /20",
                    description: "Valeur recalculée sur 20",
                    value: typeof grade.student.value === "number" &&
                        typeof grade.outOf.value === "number"
                        ? ((grade.student.value / grade.outOf.value) * 20).toFixed(2)
                        : "??",
                    bareme: "/20",
                },
            ],
        },
        {
            title: "Ma classe",
            items: [
                {
                    icon: <Users />,
                    title: "Note moyenne",
                    description: "Moyenne de la classe",
                    value: (_c = (_b = grade.average.value) === null || _b === void 0 ? void 0 : _b.toFixed(2)) !== null && _c !== void 0 ? _c : "??",
                    bareme: "/" + grade.outOf.value,
                },
                {
                    icon: <UserPlus />,
                    title: "Note maximale",
                    description: "Meilleure note de la classe",
                    value: (_e = (_d = grade.max.value) === null || _d === void 0 ? void 0 : _d.toFixed(2)) !== null && _e !== void 0 ? _e : "??",
                    bareme: "/" + grade.outOf.value,
                },
                {
                    icon: <UserMinus />,
                    title: "Note minimale",
                    description: "Moins bonne note de la classe",
                    value: ((_f = grade.min.value) === null || _f === void 0 ? void 0 : _f.toFixed(2)) &&
                        grade.min.value.toFixed(2) !== "-1.00"
                        ? (_g = grade.min.value) === null || _g === void 0 ? void 0 : _g.toFixed(2)
                        : "??",
                    bareme: "/" + grade.outOf.value,
                },
            ].filter(function (value) { return value.value != "??"; }),
        },
        {
            title: "Influence",
            items: [
                !grade.student.disabled && {
                    icon: <Scale />,
                    title: "Moyenne générale",
                    description: "Impact sur la moyenne générale",
                    value: gradeDiff.difference === undefined
                        ? "???"
                        : (gradeDiff.difference > 0
                            ? "- "
                            : gradeDiff.difference === 0
                                ? "+/- "
                                : "+ ") +
                            gradeDiff.difference.toFixed(2).replace("-", "") +
                            " pts",
                    color: gradeDiff.difference === undefined
                        ? void 0
                        : gradeDiff.difference < 0
                            ? "#4CAF50"
                            : gradeDiff.difference === 0
                                ? theme.colors.text
                                : "#F44336",
                },
                !grade.average.disabled && {
                    icon: <School />,
                    title: "Moyenne de la classe",
                    description: "Impact sur la moyenne de la classe",
                    value: classDiff.difference === undefined
                        ? "???"
                        : (classDiff.difference > 0
                            ? "- "
                            : gradeDiff.difference === 0
                                ? "+/- "
                                : "+ ") +
                            classDiff.difference.toFixed(2).replace("-", "") +
                            " pts",
                },
            ],
        },
    ];
    var deleteReel = function (reelId) {
        useGradesStore.setState(function (store) {
            var updatedReels = __assign({}, store.reels);
            delete updatedReels[reelId];
            return { reels: updatedReels };
        });
        setModalOpen(false);
    };
    var handleFocus = useCallback(function () {
        // Si on revient de la page de réaction et qu'on a un reel
        if (currentReel && isReactionBeingTaken) {
            setModalOpen(true);
            setIsReactionBeingTaken(false);
        }
    }, [currentReel]);
    useEffect(function () {
        return navigation.addListener("focus", handleFocus);
    }, [navigation, handleFocus]);
    return (<View style={{ flex: 1 }}>
      {reels[grade.id] &&
            <GradeModal isVisible={modalOpen} reel={reels[grade.id]} onClose={function () { return setModalOpen(false); }} DeleteGrade={function () { return deleteReel(grade.id); }}/>}
      <View style={{ borderCurve: "continuous", minHeight: 180, backgroundColor: "#000000" }}>
        <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 15,
            opacity: 0.90,
            backgroundColor: subjectData.color,
        }}>
          {currentReel ? (<>
              <Image source={{ uri: "data:image/jpeg;base64,".concat(currentReel.imagewithouteffect) }} style={{
                position: "absolute",
                top: -20,
                right: 0,
                width: "50%",
                height: 250,
                zIndex: 1,
                transform: [{ scaleX: -1 }],
            }}/>
              <LinearGradient colors={[subjectData.color + "20", subjectData.color]} start={[0.7, 0]} end={[0, 0]} style={{
                position: "absolute",
                top: 0,
                left: "50%",
                bottom: 0,
                width: "50%",
                zIndex: 1,
            }}/>
            </>) : null}

          <Image source={require("../../../../assets/images/mask_stars_settings.png")} style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            tintColor: "#ffffff",
            opacity: 0.15,
            zIndex: 1,
        }}/>
        </View>
        <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
        }}>
          {Platform.OS === "ios" && (<View style={{
                backgroundColor: "#ffffff",
                width: 60,
                height: 4,
                borderRadius: 2,
                alignSelf: "center",
                opacity: 0.3,
                marginVertical: 8,
            }}/>)}
          {!reels[grade.id] ? (<TouchableOpacity style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "#00000043",
                zIndex: 50,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
            }} onPress={function () {
                setIsReactionBeingTaken(true);
                navigation.navigate("GradeReaction", { grade: grade });
            }}>
              <AnimatedEmoji />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "semibold", textAlign: "center", textAlignVertical: "center" }}>
                RÉAGIR
              </Text>
            </TouchableOpacity>) : (<TouchableOpacity style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: 8,
                borderRadius: 100,
                backgroundColor: "#00000043",
                zIndex: 50,
            }} onPress={function () { return setModalOpen(true); }}>
              <Maximize2 color="white"/>
            </TouchableOpacity>)}
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 6,
            flex: 1,
            justifyContent: "flex-end",
            zIndex: 30,
        }}>
            <Text style={{
            color: "#ffffff",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "semibold",
            opacity: 0.6,
        }} numberOfLines={1}>
              {subjectData.pretty}
            </Text>
            <Text style={{
            color: "#ffffff",
            fontSize: 17,
            fontFamily: "semibold",
            opacity: 1,
        }} numberOfLines={1}>
              {grade.description || "Note sans description"}
            </Text>
            <Text style={{
            color: "#ffffff",
            fontSize: 15,
            fontFamily: "medium",
            opacity: 0.6,
        }} numberOfLines={1}>
              {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })}
            </Text>

            <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            gap: 2,
            marginTop: 8,
        }}>
              <Text style={{
            color: "#ffffff",
            fontSize: 28,
            fontFamily: "semibold",
            opacity: 1,
        }} numberOfLines={1}>
                {grade.student.disabled ? grade.student.status : (_h = grade.student.value) === null || _h === void 0 ? void 0 : _h.toFixed(2)}
              </Text>
              <Text style={{
            color: "#ffffff",
            fontSize: 18,
            fontFamily: "medium",
            opacity: 0.6,
            marginBottom: 1,
        }} numberOfLines={1}>
                /{grade.outOf.value}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} style={{
            flex: 1,
            width: "100%",
            backgroundColor: theme.colors.background,
            borderCurve: "continuous",
            overflow: "hidden",
        }} contentContainerStyle={{
            width: "100%",
        }}>
        <View style={{ paddingHorizontal: 16 }}>
          {lists.map(function (list, index) { return (<View key={index}>
              <NativeListHeader label={list.title} trailing={list.title === "Influence" ? (<TouchableOpacity style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    marginVertical: -3,
                    marginTop: -4,
                    backgroundColor: theme.colors.primary + "22",
                }} onPress={function () {
                    showAlert({
                        title: "À propos de l'influence",
                        message: "Cette section t’indique comment cette note pourrait faire évoluer ta moyenne générale ainsi que celle de ta classe.\n\n⚠️ Il s’agit d’une estimation indicative, basée sur les notes enregistrées.",
                        icon: <BadgeInfo />,
                    });
                }}>
                    <Text style={{
                    color: theme.colors.primary,
                    fontSize: 14.5,
                    letterSpacing: 0.3,
                    fontFamily: "semibold",
                }}>
                      Qu'est-ce que c'est ?
                    </Text>
                  </TouchableOpacity>) : undefined}/>

              <NativeList>
                {list.items.map(function (item, index) {
                return item && (<NativeItem key={index} icon={item.icon} trailing={<View style={{
                            marginRight: 10,
                            alignItems: "flex-end",
                            flexDirection: "row",
                            gap: 2,
                        }}>
                            <NativeText style={{
                            fontSize: 18,
                            lineHeight: 22,
                            fontFamily: "semibold",
                            color: "color" in item ? item.color : theme.colors.text,
                        }}>
                              {item.value}
                            </NativeText>

                            {"bareme" in item && (<NativeText variant="subtitle">
                                {item.bareme}
                              </NativeText>)}
                          </View>}>
                        <NativeText variant="overtitle">{item.title}</NativeText>
                        {item.description && (<NativeText variant="subtitle">
                            {item.description}
                          </NativeText>)}
                      </NativeItem>);
            })}
              </NativeList>
            </View>); })}
        </View>
        <InsetsBottomView />
      </ScrollView>
    </View>);
};
export default GradeDocument;
