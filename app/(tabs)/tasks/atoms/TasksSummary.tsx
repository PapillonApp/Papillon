import React from 'react';
import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

import { CircularProgress } from '@/ui/components/CircularProgress';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { Homework } from "@/services/shared/homework";
import adjust from '@/utils/adjustColor';

interface TasksSummaryProps {
  sections: { data: Homework[] }[];
}

const TasksSummary: React.FC<TasksSummaryProps> = ({ sections }) => {
  const theme = useTheme();
  const colors = theme.colors;

  if (sections.length === 0) {
    return null;
  }

  return (
    <Reanimated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      layout={LinearTransition}
    >
      <Stack padding={16} gap={16} backgroundColor={adjust(theme.colors.primary, theme.dark ? 0.2 : -0.2) + "22"} card radius={20} hAlign="center" direction='horizontal' style={{ marginBottom: 16 }} noShadow>
        <CircularProgress
          backgroundColor={colors.text + "22"}
          percentageComplete={
            sections.reduce((acc, section) => acc + section.data.filter(hw => hw.isDone).length, 0) /
            Math.max(1, sections.reduce((acc, section) => acc + section.data.length, 0)) * 100
          }
          radius={15}
          strokeWidth={5}
          fill={theme.colors.primary}
        />
        <Typography variant="title" color={theme.colors.primary}>
          {(() => {

            const total = sections.reduce((acc, section) => acc + section.data.length, 0);
            const undone = sections.reduce((acc, section) => acc + section.data.filter(hw => !hw.isDone).length, 0);

            if (undone === 0) {
              return "Toutes les tâches sont terminées !";
            }

            return `${undone} tâche${undone !== 1 ? 's' : ''} restante${undone !== 1 ? 's' : ''} cette semaine`;
          })()}
        </Typography>
      </Stack>
    </Reanimated.View>
  );
};

export default TasksSummary;
