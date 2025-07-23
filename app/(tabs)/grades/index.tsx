import React, { useCallback, useState, useMemo } from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { useWindowDimensions, View } from "react-native";
import { useTheme } from "@react-navigation/native";

import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";
import { it } from "date-fns/locale";
import { Animation } from "@/ui/utils/Animation";
import { useHeaderHeight } from "@react-navigation/elements";

const sortings = [
  { label: "Alphabétique", value: "alphabetical" },
  { label: "Moyennes", value: "averages" },
  { label: "Date", value: "date" }, // Added new sorting option
];

const subjects = [
  {
    id: "fran",
    name: "Français",
    icon: "🇫🇷",
    color: "#8BC600",
    average: {
      student: 12.2,
      classAvg: 11.5,
      min: 8.3,
      max: 17.4,
    },
    grades: [
      {
        id: "fran-1",
        title: "Lecture cursive",
        date: 1705363200000, // 16/01
        score: 11.8,
        outOf: 20,
        min: 7.5,
        max: 18.0,
        avg: 12.2,
      },
      {
        id: "fran-2",
        title: "Test de lecture",
        date: 1705536000000, // 18/01
        score: 9.0,
        outOf: 20,
        min: 6.0,
        max: 16.0,
        avg: 10.5,
      },
    ]
  },
  {
    id: "phy",
    name: "Physique-Chimie",
    icon: "🧪",
    color: "#00BCD4",
    average: {
      student: 13.9,
      classAvg: 13.2,
      min: 9.5,
      max: 18.7,
    },
    grades: [
      {
        id: "phy-1",
        title: "Lecture cursive",
        date: 1705363200000, // 16/01
        score: 11.8,
        outOf: 20,
        min: 9.0,
        max: 17.0,
        avg: 12.3,
      },
      {
        id: "phy-2",
        title: "TP électricité",
        date: 1705795200000, // 20/01
        score: 16.0,
        outOf: 20,
        min: 10.0,
        max: 19.0,
        avg: 14.5,
      },
    ]
  },
  {
    id: "math",
    name: "Mathématiques",
    icon: "📐",
    color: "#FF9800",
    average: {
      student: 14.3,
      classAvg: 13.0,
      min: 6.0,
      max: 19.5,
    },
    grades: [
      {
        id: "math-1",
        title: "Contrôle sur les fonctions",
        date: 1705017600000, // 10/01
        score: 15.5,
        outOf: 20,
        min: 10.0,
        max: 19.5,
        avg: 13.6,
      },
      {
        id: "math-2",
        title: "Devoir maison",
        date: 1705536000000, // 17/01
        score: 13.1,
        outOf: 20,
        min: 6.0,
        max: 18.0,
        avg: 12.5,
      },
    ]
  },
  {
    id: "hist",
    name: "Histoire-Géographie",
    icon: "🌍",
    color: "#795548",
    average: {
      student: 11.5,
      classAvg: 12.2,
      min: 7.4,
      max: 17.3,
    },
    grades: [
      {
        id: "hist-1",
        title: "DS Seconde Guerre mondiale",
        date: 1705104000000, // 12/01
        score: 10.5,
        outOf: 20,
        min: 6.0,
        max: 18.0,
        avg: 12.0,
      },
      {
        id: "hist-2",
        title: "Exposé sur la décolonisation",
        date: 1705622400000, // 19/01
        score: 12.5,
        outOf: 20,
        min: 8.5,
        max: 17.0,
        avg: 12.3,
      },
    ]
  },
  {
    id: "eng",
    name: "Anglais",
    icon: "🇬🇧",
    color: "#3F51B5",
    average: {
      student: 5.4,
      classAvg: 14.2,
      min: 10.5,
      max: 19.2,
    },
    grades: [
      {
        id: "eng-1",
        title: "Compréhension orale",
        date: 1705027200000, // 11/01
        score: 14.5,
        outOf: 20,
        min: 10.0,
        max: 18.5,
        avg: 13.8,
      },
      {
        id: "eng-2",
        title: "Expression écrite",
        date: 1705881600000, // 21/01
        score: 16.3,
        outOf: 20,
        min: 12.0,
        max: 19.2,
        avg: 14.6,
      },
    ]
  },
];

export default function TabOneScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const headerHeight = useHeaderHeight();
  const windowDimensions = useWindowDimensions();

  const [sorting, setSorting] = useState("alphabetical");

  // Transform subjects into a list with headers and grades
  const transformedData = useMemo(() => {
    const sortedSubjects = [...subjects].sort((a, b) => {
      if (sorting === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else if (sorting === "averages") {
        return b.average.student - a.average.student;
      } else if (sorting === "date") {
        const aMostRecentDate = Math.max(...a.grades.map(g => g.date));
        const bMostRecentDate = Math.max(...b.grades.map(g => g.date));
        return bMostRecentDate - aMostRecentDate;
      }
      return 0;
    });

    return sortedSubjects.flatMap((subject) => {
      const grades = subject.grades
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => a.date - b.date);

      return [
        { type: "header", subject, ui: { isHeader: true, key: "su:" + subject.id } },
        ...grades.map((grade, index) => ({
          type: "grade",
          grade,
          ui: {
            isFirst: index === 0,
            isLast: index === grades.length - 1,
            key: `g:${grade.id}`,
          },
        })),
      ];
    });
  }, [sorting]);

  const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);

  const renderItem = useCallback(({ item, index }: { item: HomeworkItem; index: number }) => {
    if (item.type === "header") {
      const { subject } = item;
      return (
        <Reanimated.View
          layout={ListGradesLayoutTransition}
          style={{
            backgroundColor: subject.color,
            padding: 10,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderCurve: 'continuous',
          }}
        >
          <Typography variant="body1">
            {`${subject.icon} ${subject.name} - Moyenne: ${subject.average.student}`}
          </Typography>
        </Reanimated.View>
      );
    } else if (item.type === "grade") {
      const { grade } = item;
      return (
        <Reanimated.View
          layout={ListGradesLayoutTransition}
          style={[
            {
              padding: 10,
              borderWidth: 1,
              backgroundColor: colors.card,
              borderColor: "#ccc",
              borderTopWidth: 0,
            },
            item.ui.isLast && {
              marginBottom: 10,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              borderCurve: 'continuous',
            }
          ]}
        >
          <Typography variant="body2">
            {`${grade.title} (${new Date(grade.date).toLocaleDateString()}): ${grade.score}/${grade.outOf}`}
          </Typography>
        </Reanimated.View>
      );
    }
    return null;
  }, []);

  return (
    <>
      <NativeHeaderTitle>
        <View style={{ width: 300, height: 50 }}>
          <SegmentedControl
            values={sortings.map(s => s.label)}
            selectedIndex={sortings.findIndex(s => s.value === sorting)}
            onChange={(event) => {
              const selectedValue = sortings[event.nativeEvent.selectedSegmentIndex].value;
              setSorting(selectedValue);
              console.log("Selected sorting:", selectedValue);
              // Handle sorting logic here
            }}
          />
        </View>
      </NativeHeaderTitle>
      <TabFlatList
        backgroundColor={theme.dark ? "#092f45" : "#e8f2f7"}
        foregroundColor="#00689cff"
        height={0}
        data={transformedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.ui.key}
      />
    </>
  );
}