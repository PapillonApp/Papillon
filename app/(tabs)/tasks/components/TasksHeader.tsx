import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';

import ChipButton from '@/ui/components/ChipButton';
import Search from '@/ui/components/Search';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';

export type SortMethod = 'date' | 'subject' | 'done';

interface TasksHeaderProps {
    selectedWeek: number;
    onToggleWeekPicker: () => void;
    setHeaderHeight: (height: number) => void;
    setShowUndoneOnly: React.Dispatch<React.SetStateAction<boolean>>;
    setSortMethod: React.Dispatch<React.SetStateAction<SortMethod>>;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortMethod: SortMethod;
    shouldCollapseHeader: boolean;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
    selectedWeek,
    onToggleWeekPicker,
    setHeaderHeight,
    setShowUndoneOnly,
    setSortMethod,
    setSearchTerm,
    sortMethod,
    shouldCollapseHeader,
}) => {
    const { colors } = useTheme();

    const sortingOptions = useMemo(
        () => [
            { label: t('Tasks_Sorting_Methods_DueDate'), value: "date", icon: "calendar" },
            { label: t('Tasks_Sorting_Methods_Subject'), value: "subject", icon: "font" },
            { label: t('Tasks_Sorting_Methods_Done'), value: "done", icon: "check" },
        ],
        []
    );

    const activeSortLabel = sortingOptions.find(s => s.value === sortMethod)?.label;
    const menuTitle = (activeSortLabel || t("Tasks_Sort_Default"));

    return (
        <TabHeader
            onHeightChanged={setHeaderHeight}
            title={
                <TabHeaderTitle
                    leading={t('Tasks_Week')}
                    number={selectedWeek.toString()}
                    color='#C54CB3'
                    onPress={onToggleWeekPicker}
                />
            }
            trailing={
                <ChipButton
                    onPressAction={({ nativeEvent }) => {
                        const actionId = nativeEvent.event;
                        if (actionId === 'only-undone') {
                            setShowUndoneOnly(prev => !prev);
                        } else if (actionId.startsWith("sort:")) {
                            setSortMethod(actionId.replace("sort:", "") as SortMethod);
                        }
                    }}
                    actions={[
                        {
                            title: t('Task_Sorting_Title'),
                            subactions: sortingOptions.map((method) => ({
                                title: method.label,
                                id: "sort:" + method.value,
                                state: (sortMethod === method.value ? 'on' : 'off'),
                                image: Platform.select({
                                    ios:
                                        method.value === 'date'
                                            ? "calendar"
                                            : method.value === 'subject'
                                                ? "character"
                                                : "checkmark.circle"
                                }),
                                imageColor: colors.text,
                            })),
                            displayInline: true
                        }
                    ]}
                    icon="filter"
                    chevron
                >
                    {menuTitle}
                </ChipButton>
            }
            bottom={
                <Search
                    placeholder={t('Tasks_Search_Placeholder')}
                    color='#C54CB3'
                    onTextChange={setSearchTerm}
                />
            }
            shouldCollapseHeader={shouldCollapseHeader}
        />
    );
};

export default TasksHeader;
