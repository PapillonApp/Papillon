import React from 'react';
import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

import { CircularProgress } from '@/ui/components/CircularProgress';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { Homework } from "@/services/shared/homework";

interface TasksSummaryProps {
    sections: { data: Homework[] }[];
}

const TasksSummary: React.FC<TasksSummaryProps> = ({ sections }) => {
    const { colors } = useTheme();

    return (
        <Reanimated.View
            entering={PapillonAppearIn}
            exiting={PapillonAppearOut}
            layout={LinearTransition}
        >
            <Stack padding={16} backgroundColor={"#D62B9415"} bordered radius={20} gap={8} hAlign="center" direction='horizontal' style={{ marginBottom: 15, marginTop: 8 }}>
                <CircularProgress
                    backgroundColor={colors.text + "22"}
                    percentageComplete={
                        sections.reduce((acc, section) => acc + section.data.filter(hw => hw.isDone).length, 0) /
                        Math.max(1, sections.reduce((acc, section) => acc + section.data.length, 0)) * 100
                    }
                    radius={15}
                    strokeWidth={5}
                    fill={"#D62B94"}
                />
                <Typography variant="title" color='#D62B94'>
                    {(() => {
                        const total = sections.reduce((acc, section) => acc + section.data.length, 0);
                        const undone = sections.reduce((acc, section) => acc + section.data.filter(hw => !hw.isDone).length, 0);
                        return `${undone} tâche${undone !== 1 ? 's' : ''} restante${undone !== 1 ? 's' : ''} cette semaine`;
                    })()}
                </Typography>
            </Stack>
        </Reanimated.View>
    );
};

export default TasksSummary;
