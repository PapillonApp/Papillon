import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Screen } from "@/router/helpers/types";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import { useHomeworkStore } from "@/stores/homework";
import { useCurrentAccount } from "@/stores/account";
import { HeaderCalendar } from "./HomeworksHeader";
import HomeworkItem from "./Atoms/Item";
import { RefreshControl } from "react-native-gesture-handler";
import HomeworksNoHomeworksItem from "./Atoms/NoHomeworks";
import { Homework } from "@/services/shared/Homework";
import PagerView from "react-native-pager-view";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { Account, AccountService } from "@/stores/account/types";
import { debounce } from "lodash";
import { dateToEpochWeekNumber, epochWNToDate } from "@/utils/epochWeekNumber";
import InfinitePager from "react-native-infinite-pager";
import { getSubjectData } from "@/services/shared/Subject";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

// Types pour les props du composant HomeworkList
type HomeworkListProps = {
  groupedHomework: Record<string, Record<string, Homework[]>>;
  loading: boolean;
  onDonePressHandler: (homework: Homework) => void;
};

const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long"
  });
};

const HomeworkList: React.FC<HomeworkListProps> = React.memo(({ groupedHomework, loading, onDonePressHandler }) => {
  const [collapsedSubjects, setCollapsedSubjects] = useState<Record<string, boolean>>({});
  const theme = useTheme();

  const toggleSubject = useCallback((subject: string) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  }, []);

  if (!loading && Object.keys(groupedHomework).length === 0) {
    return <HomeworksNoHomeworksItem />;
  }

  return (
    <>
      {Object.entries(groupedHomework).map(([day, subjects]) => (
        <View key={day}>
          <NativeListHeader label={day} />
          <NativeList>
            {Object.entries(subjects).map(([subject, homeworks]) => {
              const isCollapsed = collapsedSubjects[subject];
              const rotateStyle = useAnimatedStyle(() => {
                return {
                  transform: [{ rotate: withTiming(isCollapsed ? "0deg" : "180deg") }],
                };
              });

              return (
                <View key={subject}>
                  <TouchableOpacity
                    onPress={() => toggleSubject(subject)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{
                      color: getSubjectData(subject).color,
                      fontWeight: "bold",
                      fontSize: 16
                    }}>
                      {getSubjectData(subject).pretty}
                    </Text>
                    <Animated.View style={rotateStyle}>
                      <ChevronDown size={20} color={theme.colors.text} />
                    </Animated.View>
                  </TouchableOpacity>
                  {!isCollapsed && homeworks.map((homework, idx) => (
                    <HomeworkItem
                      key={homework.id}
                      index={idx}
                      total={homeworks.length}
                      homework={homework}
                      onDonePressHandler={async () => onDonePressHandler(homework)}
                    />
                  ))}
                </View>
              );
            })}
          </NativeList>
        </View>
      ))}
    </>
  );
}, (prevProps, nextProps) => prevProps.groupedHomework === nextProps.groupedHomework && prevProps.loading === nextProps.loading);

// Types pour les props du composant HomeworksPage
type HomeworksPageProps = {
  index: number;
  isActive: boolean;
  loaded: boolean;
  homeworks: Record<number, Homework[]>;
  account: Account;
  updateHomeworks: () => Promise<void>;
  loading: boolean;
  getDayName: (date: string | number | Date) => string;
};

const HomeworksPage: React.FC<HomeworksPageProps> = React.memo(({ index, isActive, loaded, homeworks, account, updateHomeworks, loading, getDayName }) => {
  const [refreshing, setRefreshing] = useState(false);
  if (!loaded) {
    return <ScrollView
      style={{ flex: 1, padding: 16, paddingTop: 0 }}
    >

      <View style={{padding: 32}}>
        <Text style={{color: "white", fontSize: 16, textAlign: "center"}}>
          {index}
        </Text>
      </View>
    </ScrollView>;
  }

  const homeworksInWeek = homeworks[index] ?? [];
  const sortedHomework = useMemo(
    () => homeworksInWeek.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()),
    [homeworksInWeek]
  );

  const groupedHomework = useMemo(
    () => {
      const grouped = sortedHomework.reduce((acc, curr) => {
        const dayName = getDayName(curr.due);
        const formattedDate = formatDate(curr.due);
        const day = `${dayName} ${formattedDate}`;

        if (!acc[day]) {
          acc[day] = {};
        }

        if (!acc[day][curr.subject]) {
          acc[day][curr.subject] = [];
        }

        acc[day][curr.subject].push(curr);

        return acc;
      }, {} as Record<string, Record<string, Homework[]>>);

      // Sort subjects by the number of homework items
      Object.keys(grouped).forEach(day => {
        grouped[day] = Object.fromEntries(
          Object.entries(grouped[day]).sort(([, a], [, b]) => b.length - a.length)
        );
      });

      return grouped;
    },
    [sortedHomework, getDayName]
  );

  const handleDonePress = useCallback(
    async (homework: Homework) => {
      await toggleHomeworkState(account, homework);
      await updateHomeworks();
    },
    [account, updateHomeworks]
  );

  const refreshAction = useCallback(async () => {
    setRefreshing(true);
    await updateHomeworks();
    setRefreshing(false);
  }, [updateHomeworks]);

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, paddingTop: 0 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshAction}
        />
      }
    >
      <HomeworkList
        groupedHomework={groupedHomework}
        loading={loading}
        onDonePressHandler={handleDonePress}
      />

    </ScrollView>
  );
}, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index;
});

const initialIndex = dateToEpochWeekNumber(new Date());

const HomeworksScreen: Screen<"Homeworks"> = ({ navigation }) => {
  const theme = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);

  // NOTE: PagerRef is a pain to type, please help me...
  const PagerRef = useRef<any>(null);

  const [epochWeekNumber, setEpochWeekNumber] = useState<number>(initialIndex);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("[Homeworks]: account instance changed");
    if (account.instance) {
      const WN = initialIndex;
      manuallyChangeWeek(WN);
    }
  }, [account.instance]);

  const manuallyChangeWeek = (index: number) => {
    setEpochWeekNumber(index);
    PagerRef.current?.setPage(index);
  };

  const MemoizedHeaderCalendar = useMemo(
    () => (
      <HeaderCalendar
        epochWeekNumber={epochWeekNumber}
        oldPageIndex={epochWeekNumber}
        showPicker={() => {
          // TODO: Implement date picker logic here
        }}
        changeIndex={(index: number) => manuallyChangeWeek(index)}
      />
    ),
    [epochWeekNumber, manuallyChangeWeek]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => MemoizedHeaderCalendar,
    });
  }, [navigation, epochWeekNumber]);

  const updateHomeworks = useCallback(async () => {
    setLoading(true);
    console.log("[Homeworks]: updating cache...",epochWeekNumber, epochWNToDate(epochWeekNumber));
    await updateHomeworkForWeekInCache(account, epochWNToDate(epochWeekNumber));
    console.log("[Homeworks]: updated cache !", epochWNToDate(epochWeekNumber));
    setLoading(false);
  }, [account, epochWeekNumber]);

  const debouncedUpdateHomeworks = useMemo(() => debounce(updateHomeworks, 500), [updateHomeworks]);

  const getDayName = (date: string | number | Date): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[new Date(date).getDay()];
  };

  useEffect(() => {
    debouncedUpdateHomeworks();
  }, [navigation, account.instance, epochWeekNumber]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {account.instance && (
        <InfinitePager
          ref={PagerRef}
          initialIndex={initialIndex}
          pageBuffer={3}
          PageComponent={
            ({index, isActive}) => (<View style={{height: "100%"}}>
              <HomeworksPage
                key={index}
                index={index}
                isActive={true}
                loaded={true}
                homeworks={homeworks}
                account={account}
                updateHomeworks={updateHomeworks}
                loading={loading}
                getDayName={getDayName}
              /></View>
            )}
          style={{ flex: 1}}
          onPageChange={setEpochWeekNumber}
        />
      )}
    </View>
  );
};

export default HomeworksScreen;
