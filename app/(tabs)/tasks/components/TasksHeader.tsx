import { useTheme } from '@react-navigation/native';
import type { MenuAction } from '@react-native-menu/menu';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';

import { getDateRangeOfWeek, getWeekNumberFromDate } from '@/database/useHomework';
import ChipButton from '@/ui/components/ChipButton';
import Search from '@/ui/components/Search';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';

export type SortMethod = 'date' | 'subject' | 'done';
type TasksHeaderMenuAction = MenuAction & { papicon?: string };

interface TasksHeaderProps {
  defaultWeek: number;
  selectedWeek: number;
  isLoading: boolean;
  onToggleWeekPicker: () => void;
  setHeaderHeight: (height: number) => void;
  setShowUndoneOnly: React.Dispatch<React.SetStateAction<boolean>>;
  setSortMethod: React.Dispatch<React.SetStateAction<SortMethod>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sortMethod: SortMethod;
  shouldCollapseHeader: boolean;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  defaultWeek,
  selectedWeek,
  isLoading,
  onToggleWeekPicker,
  setHeaderHeight,
  setShowUndoneOnly,
  setSortMethod,
  setSearchTerm,
  sortMethod,
  shouldCollapseHeader,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const sortingOptions = useMemo(
    () => [
      { label: t('Tasks_Sorting_Methods_DueDate'), value: "date", icon: "calendar", papicon: "calendar" },
      { label: t('Tasks_Sorting_Methods_Subject'), value: "subject", icon: "font", papicon: "font" },
      { label: t('Tasks_Sorting_Methods_Done'), value: "done", icon: "check", papicon: "check" },
    ],
    []
  );

  const activeSortLabel = sortingOptions.find(s => s.value === sortMethod)?.label;
  const menuTitle = (activeSortLabel || t("Tasks_Sort_Default"));
  const menuActions: TasksHeaderMenuAction[] = [
    {
      title: t('Task_Sorting_Title'),
      papicon: "filter",
      subactions: sortingOptions.map((method) => ({
        title: method.label,
        id: "sort:" + method.value,
        papicon: method.papicon,
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
  ];

  return (
    <TabHeader
      onHeightChanged={setHeaderHeight}
      title={
        <TabHeaderTitle
          leading={t('Tasks_Week')}
          subtitle={selectedWeek === defaultWeek ? t('Tasks_ThisWeek') : undefined}
          number={getWeekNumberFromDate(getDateRangeOfWeek(selectedWeek, new Date().getFullYear()).start).toString()}
          color='#C54CB3'
          loading={isLoading}
          onPress={onToggleWeekPicker}
          height={56}
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
          actions={menuActions}
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
          style={{
            marginTop: 6
          }}
        />
      }
      shouldCollapseHeader={shouldCollapseHeader}
    />
  );
};

export default TasksHeader;
