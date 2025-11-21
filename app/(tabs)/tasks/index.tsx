import { Papicons } from '@getpapillon/papicons';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import Reanimated, {
  createAnimatedComponent,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getWeekNumberFromDate, updateHomeworkIsDone, useHomeworkForWeek } from "@/database/useHomework";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { useAlert } from "@/ui/components/AlertProvider";
import ChipButton from '@/ui/components/ChipButton';
import { CircularProgress } from '@/ui/components/CircularProgress';
import { Dynamic } from '@/ui/components/Dynamic';
import Search from '@/ui/components/Search';
import Stack from '@/ui/components/Stack';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import Task from "@/ui/components/Task";
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { generateId } from "@/utils/generateId";
import { error, log } from '@/utils/logger/logger';
import { predictHomework } from "@/utils/magic/prediction";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

type SortMethod = 'date' | 'subject' | 'done';

const AnimatedSectionList = createAnimatedComponent(SectionList<Homework, HomeworkSection>);

interface GroupHeader {
  type: 'header';
  id: string;
  date: Date;
  title: string;
}

interface TaskItemData {
  type: 'task';
  data: Homework;
}

type ListItem = GroupHeader | TaskItemData;

interface HomeworkSection {
  id: string;
  title: string;
  date?: Date;
  data: Homework[];
}

const useMagicPrediction = (content: string) => {
  const [magic, setMagic] = useState<undefined>(undefined);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  useEffect(() => {
    let isCancelled = false;
    if (content && magicEnabled) {
      predictHomework(content, magicEnabled)
        .then(p => !isCancelled && setMagic(p))
        .catch(e => !isCancelled && error(e));
    } else {
      setMagic(undefined);
    }
    return () => {
      isCancelled = true;
    };
  }, [content, magicEnabled]);

  return magic;
};

const formatDateHeader = (date: Date): string => {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const DateHeader = memo(
  ({ title, isCollapsed, onToggle }: { title: string, isCollapsed: boolean, onToggle: () => void }) => {
    const { colors } = useTheme();

    const papillonEasing = Easing.bezier(0.3, 0.3, 0, 1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: withTiming(isCollapsed ? '-180deg' : '0deg', { duration: 350, easing: papillonEasing }) }],
        marginLeft: 'auto'
      };
    });

    return (
      <Dynamic animated key={`header:${title}`} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
        <Pressable onPress={onToggle} style={{ marginBottom: 12 }}>
          <Stack
            direction='horizontal'
            gap={8}
            vAlign='center'
            hAlign='center'
            style={{ width: '100%', opacity: isCollapsed ? 0.6 : 1 }}
          >
            <Typography variant='h6' color='text' style={{ textTransform: 'capitalize', opacity: 0.6 }}>
              {title}
            </Typography>

            <Reanimated.View style={animatedStyle}>
              <Papicons name="ChevronDown" size={20} color={colors.text} style={{ opacity: 0.6 }} />
            </Reanimated.View>
          </Stack>
        </Pressable>
      </Dynamic>
    );
  }
);
DateHeader.displayName = "DateHeader";

const TaskItem = memo(
  ({
    item,
    index,
    fromCache = false,
    onProgressChange
  }: {
    item: Homework;
    index: number;
    fromCache?: boolean;
    onProgressChange: (item: Homework, newProgress: number) => void;
  }) => {
    const cleanContent = useMemo(() => item.content.replace(/<[^>]*>/g, ""), [item.content]);
    const magic = useMagicPrediction(cleanContent);

    return (
      <Reanimated.View style={styles.taskContainer}
        entering={PapillonAppearIn}
        exiting={PapillonAppearOut}
      >
        <Task
          subject={getSubjectName(item.subject)}
          emoji={getSubjectEmoji(item.subject)}
          title={""}
          color={getSubjectColor(item.subject)}
          description={item.content}
          date={new Date(item.dueDate)}
          progress={item.isDone ? 1 : 0}
          fromCache={fromCache ?? false}
          attachments={item.attachments}
          onProgressChange={(newProgress: number) => onProgressChange(item, newProgress)}
        />
      </Reanimated.View>
    );
  }
);
TaskItem.displayName = "TaskItem";

const EmptyState = memo(({ isSearching }: { isSearching: boolean }) => (
  <View style={styles.emptyContainer}>
    <Typography variant="h4" align="center">
      {isSearching ? t('Tasks_Search_NoResults') : t('Tasks_NoTasks_Title')}
    </Typography>
    <Typography variant="body2" align="center" style={styles.emptyText}>
      {isSearching ? "Essaie avec un autre mot clé." : t('Tasks_NoTasks_Description')}
    </Typography>
  </View>
));
EmptyState.displayName = "EmptyState";

const TasksView: React.FC = () => {
  const { colors } = useTheme();
  const alert = useAlert();
  const currentDate = new Date();

  const [headerHeight, setHeaderHeight] = useState(0);
  const offsetY = useSharedValue(0);

  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumberFromDate(currentDate));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [showUndoneOnly, setShowUndoneOnly] = useState(false);
  const [sortMethod, setSortMethod] = useState<SortMethod>("date");

  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const store = useAccountStore.getState();
  const account = store.accounts.find(acc => acc.id === store.lastUsedAccount);
  type Service = { id: string };
  const services = useMemo(() => account?.services?.map((s: Service) => s.id) ?? [], [account]);
  const manager = getManager();

  const homeworksFromCache = useHomeworkForWeek(selectedWeek, refreshTrigger)
    .filter(h => services.includes(h.createdByAccount));

  const fetchHomeworks = useCallback(
    async (managerToUse = manager) => {
      if (!managerToUse) { return; }
      try {
        const result: Homework[] = await managerToUse.getHomeworks(selectedWeek);
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const newHomeworks: Record<string, Homework> = {};
        for (const hw of result) {
          const id = generateId(
            hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
          );
          newHomeworks[id] = { ...hw, id: hw.id ?? id };
        }
        setHomework(newHomeworks);
        setRefreshTrigger(p => p + 1);
      } catch (e) {
        error("Fetch error", String(e));
      }
    },
    [selectedWeek, manager]
  );

  useEffect(() => {
    fetchHomeworks();
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchHomeworks(updatedManager);
    });
    return () => unsubscribe();
  }, [selectedWeek, fetchHomeworks]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchHomeworks();
    setIsRefreshing(false);
  }, [fetchHomeworks]);

  const onProgressChange = useCallback(
    (item: Homework, _newProgress: number) => {
      const updateHomeworkCompletion = async (homeworkItem: Homework) => {
        try {
          const manager = getManager();
          const id = generateId(
            homeworkItem.subject +
            homeworkItem.content +
            homeworkItem.createdByAccount +
            new Date(homeworkItem.dueDate).toDateString()
          );
          await manager.setHomeworkCompletion(homeworkItem, !homeworkItem.isDone);
          updateHomeworkIsDone(id, !homeworkItem.isDone);
          setRefreshTrigger(prev => prev + 1);
          setHomework(prev => ({
            ...prev,
            [id]: {
              ...(prev[id] ?? homeworkItem),
              isDone: !homeworkItem.isDone,
            }
          }));
        } catch (err) {
          alert.showAlert({
            title: "Une erreur est survenue",
            message: "Ce devoir n'a pas été mis à jour",
            description:
              "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de vous rendre sur l'application officielle de votre établissement afin de définir son état.",
            color: "#D60046",
            icon: "TriangleAlert",
            technical: String(err)
          });
        }
      };

      updateHomeworkCompletion(item);
    },
    [alert]
  );

  const toggleGroup = useCallback((headerId: string) => {
    setCollapsedGroups(prev => {
      if (prev.includes(headerId)) {
        return prev.filter(id => id !== headerId);
      }
      return [...prev, headerId];
    });
  }, []);

  const sections = useMemo<HomeworkSection[]>(() => {
    let data = [...homeworksFromCache];

    if (showUndoneOnly) {
      data = data.filter(h => !h.isDone);
    }

    if (searchTerm.trim().length > 0) {
      const term = normalize(searchTerm);
      data = data.filter(h => {
        const normalizedContent = normalize(h.content);
        const normalizedSubject = normalize(h.subject);
        return (
          normalizedContent.includes(term) ||
          normalizedSubject.includes(term)
        );
      });
    }

    if (sortMethod === 'date') {
      data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else if (sortMethod === 'subject') {
      data.sort((a, b) => a.subject.localeCompare(b.subject));
    } else if (sortMethod === 'done') {
      data.sort((a, b) => Number(a.isDone) - Number(b.isDone));
    }

    if (sortMethod === 'date') {
      const sectionMap = new Map<string, HomeworkSection>();

      data.forEach((hw) => {
        const hwDate = new Date(hw.dueDate);
        const dateKey = hwDate.toDateString();
        const headerId = `header-${dateKey}`;

        if (!sectionMap.has(dateKey)) {
          sectionMap.set(dateKey, {
            id: headerId,
            title: formatDateHeader(hwDate),
            date: hwDate,
            data: []
          });
        }

        // Ajoute tous les devoirs, même si le groupe est rétracté
        sectionMap.get(dateKey)!.data.push(hw);
      });

      return Array.from(sectionMap.values());
    }

    return [
      {
        id: 'all',
        title: '',
        data
      }
    ];
  }, [homeworksFromCache, showUndoneOnly, searchTerm, sortMethod, collapsedGroups]);


  const renderItem = useCallback(
    ({ item, index, section }: { item: Homework, index: number, section: HomeworkSection }) => {
      // Si le groupe est rétracté, ne pas afficher l'item
      if (sortMethod === 'date' && collapsedGroups.includes(section.id)) {
        return null;
      }
      const inFresh = item.id ? homework[item.id] : undefined;
      const source = inFresh ?? item;
      const fromCache = !inFresh;

      return (
        <Reanimated.View layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
          <TaskItem
            item={source}
            index={index}
            fromCache={fromCache}
            onProgressChange={(_, newProgress) => onProgressChange(source, newProgress)}
          />
        </Reanimated.View>
      );
    },
    [homework, onProgressChange, collapsedGroups, sortMethod]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: HomeworkSection }) => {
      if (!section.title || sortMethod !== 'date') {
        return null;
      }

      const isCollapsed = collapsedGroups.includes(section.id);

      return (
        <Reanimated.View layout={LinearTransition}>
          <DateHeader
            title={section.title}
            isCollapsed={isCollapsed}
            onToggle={() => toggleGroup(section.id)}
          />
        </Reanimated.View>
      );
    },
    [collapsedGroups, sortMethod, toggleGroup]
  );

  const keyExtractor = useCallback((item: Homework) => {
    return item.id;
  }, []);

  const sortingOptions = useMemo(
    () => [
      { label: t('Tasks_Sorting_Methods_DueDate'), value: "date", icon: "calendar" },
      { label: t('Tasks_Sorting_Methods_Subject'), value: "subject", icon: "font" },
      { label: t('Tasks_Sorting_Methods_Done'), value: "done", icon: "check" },
    ],
    []
  );

  const activeSortLabel = sortingOptions.find(s => s.value === sortMethod)?.label;
  const menuTitle = (activeSortLabel || t("Tasks_Sort_Default")) +
    (showUndoneOnly ? ` (${t('Tasks_OnlyUndone_Short')})` : '');

  return (
    <View style={styles.container}>
      <TabHeader
        onHeightChanged={setHeaderHeight}
        title={
          <TabHeaderTitle
            leading={t('Tasks_Week')}
            number={selectedWeek.toString()}
            color='#C54CB3'
            onPress={() => log("Open Week Picker")}
          />
        }
        trailing={
          <MenuView
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
              },
              {
                title: t('Task_Show_Title'),
                subactions: [
                  {
                    title: t('Task_OnlyShowUndone'),
                    id: 'only-undone',
                    state: (showUndoneOnly ? 'on' : 'off'),
                    image: Platform.select({ ios: "flag.pattern.checkered" }),
                    imageColor: colors.text,
                  }
                ],
                displayInline: true
              }
            ]}
          >
            <View style={styles.menuButtonContainer}>
              <ChipButton
                icon="filter"
                chevron
              >
                {menuTitle}
              </ChipButton>
            </View>
          </MenuView>
        }
        bottom={
          <Search
            placeholder={t('Tasks_Search_Placeholder')}
            color='#C54CB3'
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        }
        scrollHandlerOffset={offsetY}
      />

      <AnimatedSectionList
        sections={sections}
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          paddingTop: headerHeight + 10
        }}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={<EmptyState isSearching={searchTerm.length > 0} />}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <Stack padding={16} backgroundColor={"#D62B9415"} bordered radius={20} gap={8} hAlign="center" direction='horizontal' style={{ marginBottom: 15 }}>
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
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    height: '100%',
  },
  taskContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 8,
  },
  menuButtonContainer: {
    width: 200,
    alignItems: 'flex-end'
  }
});

export default TasksView;