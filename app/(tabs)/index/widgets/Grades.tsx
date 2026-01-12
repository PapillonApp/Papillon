import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Reanimated, { LinearTransition } from 'react-native-reanimated';

import { getManager, subscribeManagerUpdate } from '@/services/shared';
import { Period, Subject } from "@/services/shared/grade";
import { CompactGrade } from '@/ui/components/CompactGrade';
import { Dynamic } from '@/ui/components/Dynamic';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { LegendList } from '@legendapp/list';

const HomeGradesWidget = React.memo(() => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const manager = getManager();

    const [currentPeriod, setCurrentPeriod] = useState<Period>();
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const fetchPeriods = async (managerToUse = manager) => {
        if (!managerToUse) return;

        const result = await managerToUse.getGradesPeriods();
        const currentPeriodFound = getCurrentPeriod(result);
        setCurrentPeriod(currentPeriodFound);
    };

    const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
        setLoading(true);
        if (period && managerToUse) {
            const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);
            if (grades?.subjects) {
                setSubjects(grades.subjects);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        const unsubscribe = subscribeManagerUpdate((updatedManager) => {
            fetchPeriods(updatedManager);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentPeriod) {
            fetchGradesForPeriod(currentPeriod);
        }
    }, [currentPeriod]);

    const sortedGrades = useMemo(() => {
        const allGrades = subjects.flatMap((subject) => subject.grades);
        return allGrades
            .sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime())
            .slice(0, 5);
    }, [subjects]);

    const getSubjectById = useCallback((id: string) => {
        return subjects.find((subject) => subject.id === id);
    }, [subjects]);

    const renderItem = useCallback(({ item: grade }: { item: any }) => {
        const subject = getSubjectById(grade.subjectId);

        return (
            <Reanimated.View
                layout={LinearTransition}
                entering={PapillonAppearIn}
                exiting={PapillonAppearOut}
            >
                <CompactGrade
                    key={grade.id + "_compactGrade_widget"}
                    emoji={getSubjectEmoji(subject?.name || "")}
                    title={getSubjectName(subject?.name || "")}
                    description={grade.description}
                    score={grade.studentScore?.value || 0}
                    outOf={grade.outOf?.value || 20}
                    disabled={grade.studentScore?.disabled}
                    status={grade.studentScore?.status}
                    color={getSubjectColor(subject?.name || "")}
                    date={grade.givenAt}
                    hasMaxScore={grade?.studentScore?.value === grade?.maxScore?.value && !grade?.studentScore?.disabled}
                    onPress={() => {
                        // @ts-expect-error navigation types
                        navigation.navigate('(modals)/grade', {
                            grade: grade,
                            subjectInfo: {
                                name: getSubjectName(subject?.name || ""),
                                color: getSubjectColor(subject?.name || ""),
                                emoji: getSubjectEmoji(subject?.name || ""),
                                originalName: subject?.name || ""
                            },
                        });
                    }}
                />
            </Reanimated.View>
        );
    }, [subjects, getSubjectById, navigation]);

    const keyExtractor = useCallback((item: any) => item.id, []);

    if (sortedGrades.length === 0 && !loading) {
        return (
            <Stack
                inline
                flex
                hAlign="center"
                vAlign="center"
                padding={[22, 16]}
                gap={2}
                style={{ paddingTop: 12 }}
            >
                <Typography align="center" variant="title" color="text">
                    {t('Grades_Empty_Title')}
                </Typography>
                <Typography align="center" variant="body1" color="secondary">
                    {t('Grades_Empty_Description')}
                </Typography>
            </Stack>
        );
    }

    return (
        <LegendList
            horizontal
            scrollEnabled={true}
            data={sortedGrades}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 10, paddingLeft: 12, gap: 12 }}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
        />
    );
});

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
});

export default HomeGradesWidget;