import { NativeItem, NativeList, NativeText, } from "@/components/Global/NativeComponents";
import { getAveragesHistory, getPronoteAverage, } from "@/utils/grades/getAverages";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Linking } from "react-native";
import Reanimated, { FadeIn, FadeInDown, FadeInLeft, FadeOut, FadeOutLeft, FadeOutUp, LinearTransition, } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import * as Haptics from "expo-haptics";
import { PressableScale } from "react-native-pressable-scale";
import { useCurrentAccount } from "@/stores/account";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { AlertTriangle, Check, ExternalLink, PieChart, TrendingUp } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
// Using require to set custom types bc module types are broken
var ReanimatedGraph = require("@birdwingo/react-native-reanimated-graph").default;
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var GradesAverageGraph = function (_a) {
    var grades = _a.grades, overall = _a.overall, classOverall = _a.classOverall;
    var theme = useTheme();
    var account = useCurrentAccount(function (store) { return store.account; });
    var showAlert = useAlert().showAlert;
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var _b = useState([]), gradesHistory = _b[0], setGradesHistory = _b[1];
    var _c = useState(0), hLength = _c[0], setHLength = _c[1];
    var _d = useState(0), currentAvg = _d[0], setCurrentAvg = _d[1];
    var _e = useState(0), originalCurrentAvg = _e[0], setOriginalCurrentAvg = _e[1];
    var _f = useState(0), classAvg = _f[0], setClassAvg = _f[1];
    var _g = useState(0), maxAvg = _g[0], setMaxAvg = _g[1];
    var _h = useState(0), minAvg = _h[0], setMinAvg = _h[1];
    var _j = useState(null), selectedDate = _j[0], setSelectedDate = _j[1];
    var _k = useState(false), showDetails = _k[0], setShowDetails = _k[1];
    var originalCurrentAvgRef = useRef(originalCurrentAvg);
    var graphRef = useRef(null);
    var gradesHistoryRef = useRef(gradesHistory);
    useEffect(function () {
        if (currentAvg !== originalCurrentAvg) {
            playHaptics("impact", {
                impact: Haptics.ImpactFeedbackStyle.Light,
            });
        }
    }, [currentAvg]);
    // on grades change, set selected date to null
    useEffect(function () {
        setSelectedDate(null);
    }, [grades]);
    useEffect(function () {
        var _a;
        var hst = getAveragesHistory(grades, "student", overall !== null && overall !== void 0 ? overall : void 0);
        if (hst.length === 0)
            return;
        var cla = getAveragesHistory(grades, "average", classOverall !== null && classOverall !== void 0 ? classOverall : void 0);
        var maxAvg = getPronoteAverage(grades, "max");
        var minAvg = getPronoteAverage(grades, "min");
        var finalAvg = getPronoteAverage(grades, "student");
        setGradesHistory(hst);
        setHLength(hst.length);
        gradesHistoryRef.current = hst;
        setCurrentAvg(hst[hst.length - 1].value);
        setOriginalCurrentAvg(hst[hst.length - 1].value);
        originalCurrentAvgRef.current = hst[hst.length - 1].value;
        setClassAvg(cla[cla.length - 1].value);
        setMaxAvg(maxAvg);
        setMinAvg(minAvg);
        hst = hst.filter(function (p) { return isNaN(p.value) === false; });
        (_a = graphRef.current) === null || _a === void 0 ? void 0 : _a.updateData({
            xAxis: hst.length > 0 ? hst.map(function (p, i) { return new Date(p.date).getTime(); }) : [Date.now()],
            yAxis: hst.length > 0 ? hst.map(function (p) { return p.value; }) : [10],
        });
    }, [grades, account.instance]);
    var updateTo = useCallback(function (index, x, y) {
        var _a;
        try {
            if (index < 0 || index > gradesHistoryRef.current.length - 1)
                return;
            if (!((_a = gradesHistoryRef.current[index]) === null || _a === void 0 ? void 0 : _a.value))
                return;
            setSelectedDate(gradesHistoryRef.current[index].date);
            setCurrentAvg(gradesHistoryRef.current[index].value);
        }
        catch (e) {
            console.error(e);
        }
    }, [gradesHistoryRef]);
    var resetToOriginal = useCallback(function () {
        setSelectedDate(null);
        setCurrentAvg(originalCurrentAvgRef.current);
    }, [originalCurrentAvgRef]);
    var theoryAvgDisclaimer = useCallback(function () {
        showAlert({
            title: "Moyenne théorique",
            message: "La moyenne théorique est calculée en prenant en compte toutes les moyennes de tes matières. Elle est donc purement indicative et ne reflète pas la réalité des différentes options ou variations.",
            icon: <TrendingUp />,
        });
    }, []);
    var estimatedAvgDisclaimer = useCallback(function () {
        showAlert({
            title: "Moyenne générale estimée",
            message: "L'estimation automatique des moyennes n'est pas une information exacte, mais une approximation qui essaye de s'en rapprocher un maximum.",
            icon: <PieChart />,
            actions: [
                {
                    title: "En savoir plus",
                    icon: <ExternalLink />,
                    onPress: function () {
                        Linking.openURL("https://docs.papillon.bzh/kb/averages");
                    }
                },
                {
                    title: "OK",
                    icon: <Check />,
                    primary: true,
                }
            ]
        });
    }, []);
    return (<PressableScale style={{
            paddingTop: 0,
        }} activeScale={0.975} weight="light" onPress={function () { return setShowDetails(!showDetails); }}>
      {hLength > 0 && (<NativeList animated layout={anim2Papillon(LinearTransition)}>
          <Reanimated.View layout={anim2Papillon(LinearTransition)} key={theme.colors.primary + account.instance}>
            {((showDetails && !overall) || selectedDate) && (<Reanimated.View style={{
                    height: 10,
                }}/>)}

            {((showDetails && !overall) || selectedDate) && (<TouchableOpacity onPress={function () {
                    estimatedAvgDisclaimer();
                }} style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 100,
                }}>
                <Reanimated.View style={{
                    backgroundColor: theme.colors.primary + "22",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderCurve: "continuous",
                    zIndex: 100,
                }} entering={anim2Papillon(FadeInLeft)} exiting={anim2Papillon(FadeOutLeft)}>
                  <Reanimated.Text style={{
                    fontSize: 14,
                    color: theme.colors.primary,
                    fontFamily: "semibold",
                }}>
                    Estimation
                  </Reanimated.Text>
                </Reanimated.View>
              </TouchableOpacity>)}

            {hLength > 1 ? (<Reanimated.View layout={anim2Papillon(LinearTransition)} entering={FadeIn} exiting={FadeOut} style={{
                    paddingTop: 16,
                    marginVertical: -16,
                    marginLeft: -14,
                }}>
                <ReanimatedGraph xAxis={gradesHistory.map(function (p, i) {
                    return new Date(p.date).getTime();
                })} yAxis={gradesHistory.map(function (p) { return !isNaN(p.value) ? p.value : (currentAvg !== null && currentAvg !== void 0 ? currentAvg : 10); })} color={theme.colors.primary} showXAxisLegend={false} showYAxisLegend={false} showExtremeValues={false} widthRatio={0.95} height={120} showBlinkingDot={true} selectionLines={"none"} ref={graphRef} animationDuration={400} onGestureUpdate={function (x, y, index) {
                    updateTo(index, x, y);
                }} onGestureEnd={function () {
                    resetToOriginal();
                }}/>
              </Reanimated.View>) : (<View />)}

            <Reanimated.View style={[
                styles.gradeBoth,
                Platform.OS === "android" && {
                    marginTop: 0,
                },
            ]} layout={anim2Papillon(LinearTransition)}>
              <View style={[styles.gradeInfo]}>
                {selectedDate ? (<Reanimated.View key={"sDateG"} entering={anim2Papillon(FadeInDown)} exiting={anim2Papillon(FadeOutUp)}>
                    <NativeText style={{ color: theme.colors.primary }} numberOfLines={1}>
                      {new Date(selectedDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
                    </NativeText>
                  </Reanimated.View>) : (<Reanimated.View key={"cAvgG"} entering={anim2Papillon(FadeInDown)} exiting={anim2Papillon(FadeOutUp)} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                }}>
                    <NativeText numberOfLines={1}>
                      {(!overall || selectedDate) ? ("Moyenne estimée") : ("Moyenne gén.")}
                    </NativeText>



                    {(!overall || selectedDate) && (<AlertTriangle size={16} color={theme.colors.primary} strokeWidth={2.5}/>)}
                  </Reanimated.View>)}

                <Reanimated.View style={[styles.gradeValue]} layout={anim2Papillon(LinearTransition)}>
                  <AnimatedNumber value={currentAvg.toFixed(2)} style={styles.gradeNumber} contentContainerStyle={{ marginLeft: -2 }}/>

                  <Reanimated.View layout={anim2Papillon(LinearTransition)}>
                    <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                  </Reanimated.View>
                </Reanimated.View>
              </View>
              <View style={[styles.gradeInfo, styles.gradeRight]}>
                <NativeText numberOfLines={1}>Moyenne classe</NativeText>
                <Reanimated.View style={[styles.gradeValue]} layout={anim2Papillon(LinearTransition)}>
                  {!Number.isNaN(classAvg) ? (<>
                      <AnimatedNumber value={classAvg.toFixed(2)} style={styles.gradeNumber} contentContainerStyle={{ marginLeft: -2 }}/>
                      <Reanimated.View layout={anim2Papillon(LinearTransition)}>
                        <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                      </Reanimated.View>
                    </>) : (<NativeText style={styles.gradeNumberClass}>Inconnue</NativeText>)}
                </Reanimated.View>
              </View>
            </Reanimated.View>

            {showDetails && maxAvg > 0 && minAvg > 0 ? (<Reanimated.View layout={anim2Papillon(LinearTransition)} exiting={FadeOut} key={"detailsG"} style={{
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 0,
                    paddingTop: 0,
                    marginTop: -4,
                }}>
                <NativeItem entering={anim2Papillon(FadeInDown).delay(100)} trailing={<View style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "flex-end",
                    }}>
                      <NativeText variant="titleLarge">
                        {maxAvg.toFixed(2)}
                      </NativeText>
                      <NativeText variant="subtitle">/20</NativeText>
                    </View>} onPress={function () { return theoryAvgDisclaimer(); }} separator chevron={false} style={{ paddingHorizontal: 4 }}>
                  <NativeText variant="subtitle">Moyenne théorique max.</NativeText>
                </NativeItem>
                <NativeItem entering={anim2Papillon(FadeInDown).delay(200)} trailing={<View style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "flex-end",
                    }}>
                      <NativeText variant="titleLarge">
                        {minAvg.toFixed(2)}
                      </NativeText>
                      <NativeText variant="subtitle">/20</NativeText>
                    </View>} onPress={function () { return theoryAvgDisclaimer(); }} chevron={false} style={{ paddingHorizontal: 4 }}>
                  <NativeText variant="subtitle">Moyenne théorique min.</NativeText>
                </NativeItem>
              </Reanimated.View>) : (<View />)}
          </Reanimated.View>
        </NativeList>)}
    </PressableScale>);
};
var styles = StyleSheet.create({
    gradeBoth: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    gradeInfo: {
        flex: 1,
        gap: 3,
    },
    gradeRight: {
        alignItems: "flex-end",
        opacity: 0.5,
    },
    gradeValue: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    gradeNumber: {
        fontSize: 24,
        lineHeight: 24,
        fontFamily: "semibold",
        letterSpacing: 0.3,
    },
    gradeNumberClass: {
        fontSize: 24,
        lineHeight: 24,
        fontFamily: "regular",
        letterSpacing: 0.3,
    },
    gradeOutOf: {
        fontSize: 16,
        lineHeight: 16,
        marginLeft: 2,
        opacity: 0.6,
        letterSpacing: 1,
    },
});
export default GradesAverageGraph;
