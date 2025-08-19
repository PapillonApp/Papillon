import { CompactGrade } from "@/ui/components/CompactGrade";
import TableFlatList from "@/ui/components/TableFlatList";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { View } from "react-native";

import Reanimated from 'react-native-reanimated';
import * as Papicons from '@getpapillon/papicons';

export default function GradesModal() {
  const { params } = useRoute();
  const { grade, subjectInfo } = params;

  return (
    <TableFlatList
      sections={[
        {
          title: "Détails",
          icon: <Papicons.ArrowRightUp />,
          items: [
            {
              icon: <Papicons.Plus />,
              title: "Note la plus haute",
              description: "Note maximale obtenue dans le groupe"
            },
            {
              icon: <Papicons.Minus />,
              title: "Note la plus basse",
              description: "Note minimale obtenue dans le groupe"
            }
          ]
        }
      ]}
      ListHeaderComponent={
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Reanimated.View
            sharedTransitionTag={grade.id + "_compactGrade"}
          >
            <CompactGrade
              key={grade.id + "_compactGrade"}
              emoji={subjectInfo.emoji}
              title={subjectInfo.name}
              description={grade.description}
              score={grade.studentScore?.value ?? 0}
              outOf={grade.outOf?.value ?? 20}
              disabled={grade.studentScore?.disabled}
              color={subjectInfo.color}
              date={grade.givenAt}
            />
          </Reanimated.View>
        </View>
      }
    />
  )
}