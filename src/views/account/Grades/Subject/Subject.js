var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { anim2Papillon, animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeInRight, FadeOutLeft, LinearTransition } from "react-native-reanimated";
import { FlatList, View } from "react-native";
import SubjectItem from "./SubjectList";
import { useCallback, useMemo, useState } from "react";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { ArrowDownAZ, Calendar, ChevronDown, TrendingUp } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
var sortingFunctions = {
    0: function (a, b) { return a.average.subjectName.localeCompare(b.average.subjectName); },
    1: function (a, b) { var _a, _b; return (((_a = b.grades[0]) === null || _a === void 0 ? void 0 : _a.timestamp) || 0) - (((_b = a.grades[0]) === null || _b === void 0 ? void 0 : _b.timestamp) || 0); },
    2: function (a, b) { var _a, _b, _c, _d; return (((_b = (_a = b.average) === null || _a === void 0 ? void 0 : _a.average) === null || _b === void 0 ? void 0 : _b.value) || 0) - (((_d = (_c = a.average) === null || _c === void 0 ? void 0 : _c.average) === null || _d === void 0 ? void 0 : _d.value) || 0); }
};
var Subject = function (_a) {
    var gradesPerSubject = _a.gradesPerSubject, navigation = _a.navigation, allGrades = _a.allGrades, currentPeriod = _a.currentPeriod;
    var _b = useState(0), sorting = _b[0], setSorting = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var theme = useTheme();
    var sortings = useMemo(function () { return [
        {
            label: "Alphabétique",
            icon: <ArrowDownAZ />,
            sfSymbol: "arrow.up.arrow.down",
        },
        {
            label: "Date",
            icon: <Calendar />,
            sfSymbol: "calendar",
        },
        {
            label: "Moyenne",
            icon: <TrendingUp />,
            sfSymbol: "chart.line.uptrend.xyaxis",
        },
    ]; }, []);
    var sortedData = useMemo(function () {
        var sortFn = sortingFunctions[sorting];
        return __spreadArray([], gradesPerSubject, true).sort(sortFn);
    }, [gradesPerSubject, sorting]);
    var handleSortingChange = useCallback(function (item) {
        setIsLoading(true);
        requestAnimationFrame(function () {
            setSorting(sortings.indexOf(item));
            setIsLoading(false);
        });
    }, [sortings]);
    var renderItem = useCallback(function (_a) {
        var item = _a.item, index = _a.index;
        return (<SubjectItem key={item.average.subjectName + "subjectItem"} index={index} subject={item} navigation={navigation} allGrades={allGrades}/>);
    }, [navigation, allGrades]);
    var ListHeaderComponent = useCallback(function () {
        var _a;
        return (<NativeListHeader label="Mes notes" trailing={(<PapillonPicker data={sortings} selected={sortings[sorting]} onSelectionChange={handleSortingChange} direction="right">
          <View style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 5,
                    alignSelf: "flex-end",
                    flex: 1,
                }}>
            <NativeText animated entering={animPapillon(FadeInRight)} exiting={animPapillon(FadeOutLeft)} style={{
                    opacity: 1,
                    color: theme.colors.primary,
                    fontSize: 13,
                    fontFamily: "semibold",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                }}>
              {typeof sortings[sorting] === "string"
                    ? sortings[sorting]
                    : (_a = sortings[sorting]) === null || _a === void 0 ? void 0 : _a.label}
            </NativeText>
            {isLoading && (<PapillonSpinner size={18} strokeWidth={2.5} color={theme.colors.primary} style={{
                        paddingHorizontal: 5,
                    }}/>)}
            <ChevronDown size={20} strokeWidth={2.5} color={theme.colors.primary}/>
          </View>
        </PapillonPicker>)}/>);
    }, [sorting, theme.colors.primary, isLoading, handleSortingChange]);
    var keyExtractor = useCallback(function (item) { var _a; return "".concat(item.average.subjectName, "-").concat((_a = item.average.average) === null || _a === void 0 ? void 0 : _a.value, "-").concat(item.grades.length); }, []);
    return (<Reanimated.View layout={anim2Papillon(LinearTransition)}>
      <FlatList key={"allGrades[".concat(currentPeriod, "]:").concat(sorting)} data={sortedData} renderItem={renderItem} ListHeaderComponent={ListHeaderComponent} ListHeaderComponentStyle={{ zIndex: 99 }} keyExtractor={keyExtractor} removeClippedSubviews={true} maxToRenderPerBatch={6} initialNumToRender={4} windowSize={5} contentContainerStyle={{
            overflow: "visible",
        }} style={{
            overflow: "visible",
        }}/>
    </Reanimated.View>);
};
export default Subject;
