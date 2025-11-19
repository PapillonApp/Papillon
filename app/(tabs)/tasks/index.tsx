import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import Reanimated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import ChipButton from '@/ui/components/ChipButton';

import Search from '@/ui/components/Search';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import Typography from '@/ui/components/Typography';

const TasksView: React.FC = () => {
  const [headerHeight, setHeaderHeight] = useState(0);

<<<<<<< Updated upstream
export const useMagicPrediction = (content: string) => {
  const [magic, setMagic] = useState<any>(undefined);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  useEffect(() => {
    let isCancelled = false;

    const loadMagic = async () => {
      try {
        const prediction = await predictHomework(content, magicEnabled);
        if (!isCancelled) {
          setMagic(prediction);
        }
      } catch (error) {
        console.error("Error predicting homework:", error);
        if (!isCancelled) {
          setMagic(undefined);
        }
      }
    };

    if (content) {
      loadMagic();
    }

    return () => {
      isCancelled = true;
    };
  }, [content, magicEnabled]);

  return magic;
};

const TaskItem = memo(({ item, fromCache = false, index, onProgressChange }: {
  item: Homework;
  fromCache: boolean;
  index: number;
  onProgressChange: (item: Homework, newProgress: number) => void;
}) => {
  try {
    const cleanContent = item.content.replace(/<[^>]*>/g, "");
    const magic = useMagicPrediction(cleanContent);

    return (
      <Task
        subject={getSubjectName(item.subject)}
        emoji={getSubjectEmoji(item.subject)}
        title={""}
        color={getSubjectColor(item.subject)}
        description={item.content}
        date={new Date(item.dueDate)}
        progress={item.isDone ? 1 : 0}
        index={index}
        magic={magic}
        fromCache={fromCache ?? false}
        onProgressChange={(newProgress: number) => onProgressChange(item, newProgress)}
      />
    );
  } catch (error) {
    return null;
  }
});

const EmptyListComponent = memo(() => (
  <LayoutAnimationConfig skipEntering>
    <Dynamic animated key={'empty-list:warn'}>
      <Stack
        hAlign="center"
        vAlign="center"
        margin={16}
      >
        <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
          <Papicons name={"Check"} />
        </Icon>
        <Typography variant="h4" color="text" align="center">
          {t('Tasks_NoTasks_Title')}
        </Typography>
        <Typography variant="body2" color="secondary" align="center">
          {t('Tasks_NoTasks_Description')}
        </Typography>
      </Stack>
    </Dynamic>
  </LayoutAnimationConfig>
));

export default function TabOneScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const headerHeight = useHeaderHeight();
  const alert = useAlert()
  const windowDimensions = useWindowDimensions();

  const currentDate = new Date()

  const [fullyScrolled, setFullyScrolled] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumberFromDate(currentDate));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const store = useAccountStore.getState()
  const account = store.accounts.find(account => store.lastUsedAccount);
  const services: string[] = account?.services?.map((service: { id: string }) => service.id) ?? [];
  const homeworksFromCache = useHomeworkForWeek(selectedWeek, refreshTrigger).filter(homework => services.includes(homework.createdByAccount));
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const manager = getManager();

  const fetchHomeworks = async (managerToUse = manager) => {
    if (!managerToUse) {
      return;
    }
    const result = await managerToUse.getHomeworks(selectedWeek);
    result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const newHomeworks: Record<string, Homework> = {};
    for (const hw of result) {
      const id = generateId(
        hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
      );
      newHomeworks[id] = hw;
    }
    setHomework(newHomeworks);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchHomeworks(updatedManager);
    });

    return () => unsubscribe();
  }, [selectedWeek]);

  useEffect(() => {
    fetchHomeworks();
  }, [selectedWeek]);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  const onProgressChange = useCallback((item: Homework, newProgress: number) => {
    const updateHomeworkCompletion = async (homeworkItem: Homework) => {
      try {
        const manager = getManager();
        const id = generateId(
          homeworkItem.subject + homeworkItem.content + homeworkItem.createdByAccount + homeworkItem.dueDate.toDateString()
        );
        await manager.setHomeworkCompletion(homeworkItem, !homeworkItem.isDone);
        updateHomeworkIsDone(id, !homeworkItem.isDone)
        setRefreshTrigger(prev => prev + 1);
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            isDone: !homeworkItem.isDone,
          }
        }));
      } catch (error) {
        alert.showAlert({
          title: "Une erreur est survenue",
          message: "Ce devoir n'a pas été mis à jour",
          description: "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de vous rendre sur l'application officielle de votre établissement afin de définir son état.",
          color: "#D60046",
          icon: "TriangleAlert",
          technical: String(error)
        });
      }
    };

    updateHomeworkCompletion(item);
  }, [selectedWeek]);

  const lengthHomeworks = React.useMemo(() => {
    return homeworksFromCache.length;
  }, [homeworksFromCache]);

  const leftHomeworks = React.useMemo(() => {
    return (homeworksFromCache.filter((h) => !h.isDone).length);
  }, [homeworksFromCache]);

  const percentageComplete = React.useMemo(() => {
    return ((lengthHomeworks - leftHomeworks) / lengthHomeworks * 100);
  }, [lengthHomeworks, leftHomeworks]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const fetchHomeworks = async () => {
      try {
        const result = await manager.getHomeworks(selectedWeek);
        const newHomeworks: Record<string, Homework> = {};
        for (const hw of result) {
          const id = generateId(
            hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
          );
          newHomeworks[id] = hw;
        }
        setHomework(prev => ({ ...prev, ...newHomeworks }));
      } catch (error) {
        alert.showAlert({
          title: "Erreur de chargement",
          message: "Impossible de charger les devoirs",
          description: "Veuillez vérifier votre connexion internet et réessayer.",
          color: "#D60046",
          icon: "TriangleAlert",
          technical: String(error)
        });
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchHomeworks();
  }, [selectedWeek, manager, alert]);

  const renderItem = useCallback(({ item, index }: { item: Homework; index: number }) => {
    const inFresh = homework[item.id]
    if (showUndoneOnly && item.isDone)
      return null;
    return (
      <TaskItem
        key={item.id}
        item={item}
        index={index}
        fromCache={!inFresh}
        onProgressChange={(item, newProgress) => onProgressChange(inFresh, newProgress)}
      />
    )
  }, [onProgressChange, homeworksFromCache]);

  const keyExtractor = useCallback((item: Homework) => item.id, []);

  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const WeekPickerRef = useRef<FlatList>(null);

  const layoutPicker = useCallback(() => {
    if (WeekPickerRef.current) {
      const offset = selectedWeek * 60;
      WeekPickerRef.current.scrollToOffset({
        offset,
        animated: false,
      });
    }
  }, [selectedWeek]);

  const handleWeekScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 60; // width of each item in the picker
    const index = Math.round(contentOffsetX / itemWidth);
    if (index < 0 || index >= 56) { return; } // prevent out of bounds
    requestAnimationFrame(() => {
      setSelectedWeek(index);
    });
  }, []);

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  function getStatusText() {
    switch (leftHomeworks) {
      case 0:
        return t('Tasks_NoTasks_Nav');
      case 1:
        return t('Tasks_Nav_One');
      default:
        return t('Tasks_Nav_Left', { count: leftHomeworks });
    }
  }

  const statusText = useMemo(() => getStatusText(), [lengthHomeworks, leftHomeworks]);

  function marginTop(): number {
    if (runsIOS26) {
      if (fullyScrolled) {
        return 6
      }
      return 0
    }

    if (Platform.OS === 'ios') {
      return -4
    }

    return -2
  }

  const sortingMethods = [
    {
      label: t('Tasks_Sorting_Methods_DueDate'),
      method: (a: Homework, b: Homework) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      image: Platform.select({
        ios: "calendar"
      }),
    },
    {
      label: t('Tasks_Sorting_Methods_Subject'),
      method: (a: Homework, b: Homework) => a.subject.localeCompare(b.subject),
      image: Platform.select({
        ios: "character"
      }),
    },
    {
      label: t('Tasks_Sorting_Methods_Done'),
      method: (a: Homework, b: Homework) => Number(a.isDone) - Number(b.isDone),
      image: Platform.select({
        ios: "checkmark.circle"
      }),
    },
  ]

  const [selectedMethod, setSelectedMethod] = useState(0);
  const [showUndoneOnly, setShowUndoneOnly] = useState(false);

  const sortedHomeworks = useMemo(() => {
    const sortingMethod = sortingMethods[selectedMethod].method;
    return [...homeworksFromCache].sort(sortingMethod);
  }, [homeworksFromCache, selectedMethod]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchTermState, setSearchTermState] = useState("");

  const searchResult = useMemo(() => {
    if (!showSearch || searchTermState.length === 0) return [];
    return sortedHomeworks.filter(hw => {
      const content = hw.content.toLowerCase();
      const subject = hw.subject.toLowerCase();
      const searchTerm = searchTermState.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
      return content.includes(searchTerm) || subject.includes(searchTerm);
    }).slice(0, 5); // limit to 5 results
  }, [showSearch, sortedHomeworks, searchTermState]);

  const insets = useSafeAreaInsets();

  return (
    <>
      <Modal
        visible={showSearch}
        animationType="fade"
        transparent={true}
      >
        <BlurView intensity={70} style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", flex: 1, alignContent: "center", justifyContent: "flex-start" }} tint={theme.dark ? "dark" : "light"} experimentalBlurMethod="dimezisBlurView">
          <KeyboardAvoidingView behavior="padding">
            <LiquidGlassContainerView
              style={{
                position: "absolute",
                top: insets.top + 10,
                zIndex: 1000000,
                flexDirection: "row",
                width: Dimensions.get('window').width - 32,
                left: 16,
                paddingHorizontal: 0,
                height: 46,
                gap: 12,
              }}
            >
              <LiquidGlassView
                interactive
                style={{
                  flex: 1,
                  borderRadius: 160,
                  borderCurve: "continuous",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingHorizontal: 16,
                  gap: 10,
                  flexDirection: "row",
                  backgroundColor: runsIOS26 ? "transparent" : theme.colors.text + "11",
                }}
                effect="regular"
                tintColor={"#00000000"}
              >
                <Papicons name={"Search"} color={colors.text} size={24} opacity={0.5} />
                <TextInput
                  placeholder={t('Tasks_Search_Placeholder')}
                  placeholderTextColor={colors.text + "56"}
                  style={{
                    fontFamily: "medium",
                    fontSize: 18,
                    flex: 1,
                    color: colors.text,
                  }}
                  value={searchTermState}
                  onChangeText={setSearchTermState}
                  autoFocus
                />

                {showSearch && searchTermState.length > 0 && (
                  <Pressable onPress={() => setSearchTermState("")} hitSlop={16}>
                    <Papicons name={"cross"} color={colors.text} size={18} opacity={0.5} />
                  </Pressable>
                )}
              </LiquidGlassView>

              <LiquidGlassView
                interactive
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 160,
                  borderCurve: "continuous",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                effect="regular"
              >
                <Pressable onPress={() => setShowSearch(false)} hitSlop={32}>
                  <Papicons name={"cross"} color={PlatformColor('labelColor')} size={24} opacity={0.5} />
                </Pressable>
              </LiquidGlassView>
            </LiquidGlassContainerView>

            <LayoutAnimationConfig skipEntering skipExiting>
              <Reanimated.FlatList
                data={searchResult}
                style={{
                }}
                contentContainerStyle={{
                  paddingTop: insets.top + 72,
                  paddingBottom: insets.bottom,
                  paddingHorizontal: 20,
                  gap: 16,
                }}
                itemLayoutAnimation={LinearTransition}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={<EmptyListComponent />}
              />
            </LayoutAnimationConfig>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>

      <TabFlatList
        radius={36}
        backgroundColor={theme.dark ? "#2e0928" : "#F7E8F5"}
        foregroundColor="#9E0086"
        key={sortedHomeworks.length}
        data={sortedHomeworks}
        initialNumToRender={2}
        numColumns={windowDimensions.width > 1050 ? 3 : windowDimensions.width < 800 ? 1 : 2}
        onFullyScrolled={handleFullyScrolled}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={200}
          />
        }
        gap={16}
        header={(
          <Stack direction={"horizontal"} hAlign={"end"} style={{ padding: 20 }}>
            <LayoutAnimationConfig skipEntering>
              <Dynamic animated style={{ flex: 1 }} key={`left-homeworks:${leftHomeworks > 0 ? "undone" : "done"}`}>
                {lengthHomeworks === 0 ? (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Papicons name={"Check"} color={"#C54CB3"} size={36} style={{ marginBottom: 4 }} />
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_NoTasks_Title')} {"\n"}{t('Tasks_NoTasks_ForWeek', { week: selectedWeek })}
                    </Typography>
                  </Stack>
                ) : (leftHomeworks > 0 ? (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Dynamic animated key={`left-homeworks-count:${leftHomeworks}`} entering={PapillonZoomIn} exiting={PapillonAppearOut}>
                      <AnimatedNumber inline variant={"h1"} style={{ fontSize: 36, marginBottom: 4 }} color={"#C54CB3"}>
                        {leftHomeworks}
                      </AnimatedNumber>
                    </Dynamic>
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_LeftHomeworks_Title')} {"\n"}{t('Tasks_LeftHomeworks_Time')}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Papicons name={"Check"} color={"#C54CB3"} size={36} style={{ marginBottom: 4 }} />
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_Done_AllTasks')} {"\n"}{t('Tasks_Done_CompletedTasks')}
                    </Typography>
                  </Stack>
                ))}
              </Dynamic>
            </LayoutAnimationConfig>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }} key={`circular-progress-week-ct:${selectedWeek}`}>
              <CircularProgress
                backgroundColor={colors.text + "22"}
                percentageComplete={lengthHomeworks === 0 ? 100 : percentageComplete}
                radius={35}
                strokeWidth={7}
                fill={"#C54CB3"}
              />
            </View>
          </Stack>
        )}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyListComponent />}
=======
  const offsetY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  return (
    <View
      style={{ flex: 1 }}
    >
      <TabHeader
        onHeightChanged={setHeaderHeight}
        title={<TabHeaderTitle leading="Semaine" number={"51"} color='#C54CB3' />}
        bottom={<Search placeholder='Rechercher une note' color='#C54CB3' />}
        scrollHandlerOffset={offsetY}
>>>>>>> Stashed changes
      />

      <Reanimated.ScrollView
        style={{ flex: 1, height: '100%' }}
        contentContainerStyle={{ padding: 16, paddingTop: headerHeight + 16 }}
        onScroll={scrollHandler}
      >
        <Typography>aaa</Typography>
        <Typography variant='h1'>aaa</Typography>
      </Reanimated.ScrollView>
    </View>
  )
};

export default TasksView;