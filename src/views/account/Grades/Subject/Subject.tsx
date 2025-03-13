import type { RouteParameters } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Grade, GradesPerSubject } from "@/services/shared/Grade";
import { NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { anim2Papillon, animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeInRight, FadeOutLeft, LinearTransition } from "react-native-reanimated";
import { FlatList, View } from "react-native";
import SubjectItem from "./SubjectList";
import { useCallback, useMemo, useState } from "react";
import PapillonPicker, { PickerDataItem } from "@/components/Global/PapillonPicker";
import { ArrowDownAZ, Calendar, ChevronDown, TrendingUp } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

interface SubjectProps {
  allGrades: Grade[]
  gradesPerSubject: GradesPerSubject[]
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>,
  currentPeriod?: string
}

type SortingFunction = (a: GradesPerSubject, b: GradesPerSubject) => number;

const sortingFunctions: Record<number, SortingFunction> = {
  0: (a, b) => a.average.subjectName.localeCompare(b.average.subjectName),
  1: (a, b) => (b.grades[0]?.timestamp || 0) - (a.grades[0]?.timestamp || 0),
  2: (a, b) => (b.average?.average?.value || 0) - (a.average?.average?.value || 0)
};

const sortings: PickerDataItem[] = [
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
];

const Subject: React.FC<SubjectProps> = ({
  gradesPerSubject,
  navigation,
  allGrades,
  currentPeriod
}) => {
  const [sorting, setSorting] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  // Memoize sorted data
  const sortedData = useMemo(() => {
    const sortFn = sortingFunctions[sorting];
    return [...gradesPerSubject].sort(sortFn);
  }, [gradesPerSubject, sorting]);

  const handleSortingChange = useCallback((item: PickerDataItem) => {
    setIsLoading(true);
    // Use requestAnimationFrame to prevent UI blocking
    requestAnimationFrame(() => {
      setSorting(sortings.indexOf(item));
      setIsLoading(false);
    });
  }, []);

  const renderItem = useCallback(({ item, index }: { item: GradesPerSubject; index: number }) => (
    <SubjectItem
      key={item.average.subjectName + "subjectItem"}
      index={index}
      subject={item}
      navigation={navigation}
      allGrades={allGrades}
    />
  ), [navigation, allGrades]);

  const ListHeaderComponent = useCallback(() => (
    <NativeListHeader
      label="Mes notes"
      trailing={(
        <PapillonPicker
          data={sortings}
          selected={sortings[sorting]}
          onSelectionChange={handleSortingChange}
          direction="right"
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 5,
              alignSelf: "flex-end",
              flex: 1,
            }}
          >
            <NativeText
              animated
              entering={animPapillon(FadeInRight)}
              exiting={animPapillon(FadeOutLeft)}
              style={{
                opacity: 1,
                color: theme.colors.primary,
                fontSize: 13,
                fontFamily: "semibold",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {
                typeof sortings[sorting] === "string"
                  ? sortings[sorting]
                  : sortings[sorting]?.label
              }
            </NativeText>
            {isLoading && (
              <PapillonSpinner
                size={18}
                strokeWidth={2.5}
                color={theme.colors.primary}
                style={{
                  paddingHorizontal: 5,
                }}
              />
            )}
            <ChevronDown
              size={20}
              strokeWidth={2.5}
              color={theme.colors.primary}
            />
          </View>
        </PapillonPicker>
      )}
    />
  ), [sorting, theme.colors.primary, isLoading, handleSortingChange]);

  const keyExtractor = useCallback((item: GradesPerSubject, index: number) =>
    item.average.subjectName + index,
  []);

  return (
    <Reanimated.View
      layout={anim2Papillon(LinearTransition)}
    >
      <FlatList
        data={sortedData}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListHeaderComponentStyle={{zIndex: 99}}
        keyExtractor={keyExtractor}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
        contentContainerStyle={{
          overflow: "visible",
        }}
        style={{
          overflow: "visible",
        }}
      />
    </Reanimated.View>
  );
};

export default Subject;
