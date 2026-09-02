import React from 'react';
import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { useTheme } from "expo-router/react-navigation";

import { CircularProgress } from '@/ui/components/CircularProgress';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { Homework } from "@/services/shared/homework";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dynamic } from "@/ui/components/Dynamic";

interface TasksSummaryProps {
  sections: { data: Homework[] }[];
  headerHeight: number;
}

const TasksSummary: React.FC<TasksSummaryProps> = ({
  sections,
  headerHeight,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const colors = theme.colors;

  if (sections.length === 0) {
    return null;
  }

  return (
    <Reanimated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      layout={LinearTransition}
      style={{
        marginTop:
          headerHeight + (Platform.OS === "android" ? 10 : -insets.top + 10),
      }}
    >
      {Platform.OS === "ios" && (
        <LinearGradient
          colors={[theme.colors.tint + "90", theme.colors.tint + "00"]}
          start={[0, 0.7]}
          end={[0, 1]}
          style={{
            position: "absolute",
            top: -500,
            left: -20,
            right: -20,
            bottom: -20,
            borderRadius: 20,
            zIndex: -1,
            opacity: 0.2,
          }}
        />
      )}
      <Dynamic animated>
        <Stack flex width={"100%"} hAlign={"center"}>
          <Dynamic animated>
          <Stack
            flex
            gap={16}
            hAlign="center"
            vAlign="center"
            direction="horizontal"
            style={{ marginBottom: 16 }}
          >
            <CircularProgress
              backgroundColor={colors.tint + "15"}
              percentageComplete={
                (sections.reduce(
                  (acc, section) =>
                    acc + section.data.filter(hw => hw.isDone).length,
                  0
                ) /
                  Math.max(
                    1,
                    sections.reduce(
                      (acc, section) => acc + section.data.length,
                      0
                    )
                  )) *
                100
              }
              radius={15}
              strokeWidth={5}
              fill={theme.colors.tint}
              showCheckmark={true}
            />
            <Typography variant="title" color={theme.colors.tint}>
              {(() => {
                const total = sections.reduce(
                  (acc, section) => acc + section.data.length,
                  0
                );
                const undone = sections.reduce(
                  (acc, section) =>
                    acc + section.data.filter(hw => !hw.isDone).length,
                  0
                );

                if (undone === 0) {
                  return "Toutes les tâches sont terminées !";
                }

                return `${undone} tâche${undone !== 1 ? "s" : ""} restante${undone !== 1 ? "s" : ""} cette semaine`;
              })()}
            </Typography>
          </Stack>
          </Dynamic>
        </Stack>
      </Dynamic>
    </Reanimated.View>
  );
};

export default TasksSummary;
