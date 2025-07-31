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
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Trophy, User, UserMinus, UserPlus, Users } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView } from "react-native";
var GradeSubjectScreen = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var route = _a.route, navigation = _a.navigation;
    var _m = route.params, subject = _m.subject, allGrades = _m.allGrades;
    var theme = useTheme();
    var _o = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _o[0], setSubjectData = _o[1];
    var fetchSubjectData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSubjectData(subject.average.subjectName)];
                case 1:
                    data = _a.sent();
                    setSubjectData(data);
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        fetchSubjectData();
    }, [subject.average.subjectName]);
    var studentAverage = parseFloat((((_c = (_b = subject.average) === null || _b === void 0 ? void 0 : _b.average) === null || _c === void 0 ? void 0 : _c.value) || -1).toString()).toFixed(2);
    var classAverage = parseFloat((((_e = (_d = subject.average) === null || _d === void 0 ? void 0 : _d.classAverage) === null || _e === void 0 ? void 0 : _e.value) || -1).toString()).toFixed(2);
    var highAverage = parseFloat((((_g = (_f = subject.average) === null || _f === void 0 ? void 0 : _f.max) === null || _g === void 0 ? void 0 : _g.value) || -1).toString()).toFixed(2);
    var lowAverage = parseFloat((((_j = (_h = subject.average) === null || _h === void 0 ? void 0 : _h.min) === null || _j === void 0 ? void 0 : _j.value) || -1).toString()).toFixed(2);
    var averages = [
        {
            icon: <User />,
            label: "Ta moyenne",
            value: studentAverage !== "-1.00" ? studentAverage : "N.Not",
        },
        {
            icon: <Users />,
            label: "Moy. de classe",
            value: classAverage !== "-1.00" ? classAverage : "??",
        },
        {
            icon: <UserPlus />,
            label: "Moy. la plus haute",
            value: highAverage !== "-1.00" ? highAverage : "??",
        },
        {
            icon: <UserMinus />,
            label: "Moy. la plus basse",
            value: lowAverage !== "-1.00" ? lowAverage : "??",
        },
    ].filter(function (value) { return value.value != "??"; });
    var subjectOutOf = ((_l = (_k = subject.average) === null || _k === void 0 ? void 0 : _k.outOf) === null || _l === void 0 ? void 0 : _l.value) || 20;
    var _p = useState({
        difference: 0,
        with: 0,
        without: 0,
    }), averageDiff = _p[0], setAverageDiff = _p[1];
    useLayoutEffect(function () {
        var diff = getAverageDiffGrade(subject.grades, allGrades);
        setAverageDiff(diff);
    }, [subject.average]);
    return (<ScrollView style={{
            flex: 1,
            padding: 16,
            paddingTop: 0,
        }}>
      <NativeList>
        <NativeItem>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        }}>
            <View style={{
            width: 36,
            height: 36,
            borderRadius: 300,
            backgroundColor: subjectData.color + "22",
            justifyContent: "center",
            alignItems: "center",
        }}>
              <NativeText style={{
            fontSize: 24,
            lineHeight: 32,
        }}>
                {subjectData.emoji}
              </NativeText>
            </View>

            <View style={{
            gap: 2,
            flex: 1,
        }}>
              <NativeText variant="overtitle">{subjectData.pretty}</NativeText>

              {getCourseSpeciality(subject.average.subjectName) && (<NativeText variant="subtitle">
                  {getCourseSpeciality(subject.average.subjectName)}
                </NativeText>)}
            </View>
          </View>
        </NativeItem>
      </NativeList>

      {subject.rank && (<>
          <NativeListHeader label="Classement"/>

          <NativeList>
            <NativeItem icon={<Trophy />} trailing={<View style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 4,
                    marginRight: 6,
                }}>
                  <NativeText style={{
                    fontSize: 18,
                    lineHeight: 22,
                    fontFamily: "semibold",
                }}>
                    {subject.rank.value}
                  </NativeText>
                  <NativeText style={{
                    fontSize: 15,
                    lineHeight: 15,
                    fontFamily: "medium",
                    opacity: 0.5,
                    marginBottom: 1,
                    letterSpacing: 0.5,
                }}>
                    /{subject.rank.outOf}
                  </NativeText>
                </View>}>
              <NativeText variant="title">
                Position dans le groupe
              </NativeText>
              <NativeText variant="subtitle">
                Rang de la moyenne de cette matière dans la classe
              </NativeText>
            </NativeItem>
          </NativeList>
        </>)}

      <NativeListHeader label="Moyennes"/>

      <NativeList>
        {averages.map(function (average) {
            return (<NativeItem key={average.label} icon={average.icon} trailing={<View style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 2,
                        marginRight: 6,
                    }}>
                  <NativeText style={{
                        fontSize: 18,
                        lineHeight: 22,
                        fontFamily: "semibold",
                    }}>
                    {average.value}
                  </NativeText>
                  <NativeText style={{
                        fontSize: 15,
                        lineHeight: 15,
                        fontFamily: "medium",
                        opacity: 0.5,
                        marginBottom: 1,
                        letterSpacing: 0.5,
                    }}>
                    /{subjectOutOf}
                  </NativeText>
                </View>}>
              <NativeText variant="subtitle">{average.label}</NativeText>
            </NativeItem>);
        })}
      </NativeList>

      {averageDiff.without !== -1 && (<>
          <NativeListHeader label="Détails"/>

          <NativeList>
            <NativeItem trailing={<NativeText style={{
                    fontSize: 16,
                    lineHeight: 18,
                    fontFamily: "semibold",
                    color: (averageDiff.difference || 0) < 0
                        ? "#4CAF50"
                        : (averageDiff.difference || 0) === 0
                            ? theme.colors.text
                            : "#F44336",
                    marginLeft: 12,
                    marginRight: 6,
                }}>
                  {(averageDiff.difference || 0) > 0
                    ? "- "
                    : (averageDiff.difference || 0) === 0
                        ? "+/- "
                        : "+ "}
                  {(averageDiff.difference || 0).toFixed(2).replace("-", "")} pts
                </NativeText>}>
              <NativeText variant="overtitle">Impact sur la moyenne</NativeText>
              <NativeText variant="subtitle">
                Indique le poids de {subjectData.pretty} sur ta moyenne générale
              </NativeText>
            </NativeItem>
          </NativeList>
        </>)}
    </ScrollView>);
};
export default GradeSubjectScreen;
