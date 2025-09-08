import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import React, { Alert, Dimensions, FlatList, Platform, View } from "react-native";

import { getManager, initializeAccountManager, subscribeManagerUpdate } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import Stack from "@/ui/components/Stack";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import Typography from "@/ui/components/Typography";
import TabFlatList from "@/ui/components/TabFlatList";
import LinearGradient from "react-native-linear-gradient";

import { Papicons } from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Course from "@/ui/components/Course";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import { Dynamic } from "@/ui/components/Dynamic";
import { useTheme } from "@react-navigation/native";
import adjust from "@/utils/adjustColor";

import { CompactGrade } from "@/ui/components/CompactGrade";
import { log, warn } from "@/utils/logger/logger";

import { CourseStatus, Course as SharedCourse } from "@/services/shared/timetable";
import { getHomeworksFromCache, getWeekNumberFromDate, updateHomeworkIsDone, useHomeworkForWeek } from "@/database/useHomework";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getStatusText } from "../calendar";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { useHeaderHeight } from "@react-navigation/elements";
import { t } from "i18next";
import { Grade, Period } from "@/services/shared/grade";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import { useAlert } from "@/ui/components/AlertProvider";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import GradesWidget from "./widgets/Grades";
import { AvailablePatterns, Pattern } from "@/ui/components/Pattern/Pattern";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTimetable } from "@/database/useTimetable";
import { checkConsent } from "@/utils/logger/consent";
import { useSettingsStore } from "@/stores/settings";
import { Homework } from "@/services/shared/homework";
import Task from "@/ui/components/Task";
import { getSubjectName } from "@/utils/subjects/name";
import { truncatenateString } from "@/ui/utils/Truncatenate";
import { Sparkle } from "lucide-react-native";
import { useMagicPrediction } from "../tasks";
import { generateId } from "@/utils/generateId";

const IndexScreen = () => {
  const now = new Date();
  const weekNumber = getWeekNumberFromDate(now)
  const [currentPage, setCurrentPage] = useState(0);
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const services = useMemo(() =>
    account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );

  const [courses, setCourses] = useState<SharedCourse[]>([]);

  const timetableData = useTimetable(undefined, weekNumber);
  const weeklyTimetable = useMemo(() =>
    timetableData.map(day => ({
      ...day,
      courses: day.courses.filter(course => services.includes(course.createdByAccount))
    })).filter(day => day.courses.length > 0),
    [timetableData, services]
  );
  const [grades, setGrades] = useState<Grade[]>([]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const alert = useAlert();

  const settingsStore = useSettingsStore(state => state.personalization)

  const Initialize = async () => {
    try {
      await initializeAccountManager()
      log("Refreshed Manager received")

      await Promise.all([fetchEDT(), fetchGrades()]);

      if (settingsStore.showAlertAtLogin) {
        alert.showAlert({
          title: "Synchronisation réussie",
          description: "Toutes vos données ont été mises à jour avec succès.",
          icon: "CheckCircle",
          color: "#00C851",
          withoutNavbar: true,
          delay: 1000
        });
      }

    } catch (error) {
      alert.showAlert({
        title: "Connexion impossible",
        description: "Il semblerait que ta session a expiré. Tu pourras renouveler ta session dans les paramètres en liant à nouveau ton compte.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error)
      })
    }
  };

  useMemo(() => {
    Initialize();
  }, []);


  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    const date = new Date();
    const weekNumber = getWeekNumberFromDate(date)
    await manager.getWeeklyTimetable(weekNumber)
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [freshHomeworks, setFreshHomeworks] = useState<Record<string, Homework>>({});
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  const fetchHomeworks = useCallback(async () => {
    const manager = getManager();
    const current = await manager.getHomeworks(weekNumber);
    const next = await manager.getHomeworks(weekNumber + 1);
    const result = [...current, ...next]
    const newHomeworks: Record<string, Homework> = {};
    for (const hw of result) {
      const id = generateId(hw.subject + hw.content + hw.createdByAccount);
      newHomeworks[id] = hw;
    }
    setFreshHomeworks(newHomeworks);
    setRefreshTrigger(prev => prev + 1);
  }, [weekNumber]);

  async function setHomeworkAsDone(homework: Homework) {
    const manager = getManager();
    const id = generateId(homework.subject + homework.content + homework.createdByAccount);
    await manager.setHomeworkCompletion(homework, !homework.isDone);
    updateHomeworkIsDone(id, !homework.isDone)
    setRefreshTrigger(prev => prev + 1);
    setFreshHomeworks(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isDone: !homework.isDone,
      }
    }));
  }

  const fetchGrades = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping grades fetch');
      return;
    }
    const gradePeriods = await manager.getGradesPeriods()
    const validPeriods: Period[] = []
    const date = new Date().getTime()
    for (const period of gradePeriods) {
      if (period.start.getTime() > date && period.end.getTime() > date) {
        validPeriods.push(period);
      }
    }

    const grades: Grade[] = []
    const currentPeriod = getCurrentPeriod(validPeriods)

    const periodGrades = await manager.getGradesForPeriod(currentPeriod, currentPeriod.createdByAccount)
    periodGrades.subjects.forEach(subject => {
      subject.grades.forEach(grade => {
        grades.push(grade);
      });
    });

    setGrades(grades.sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime()).splice(0, 10))
  }, [])

  useEffect(() => {
    const fetchHomeworksFromCache = async () => {
      const currentWeekHomeworks = await getHomeworksFromCache(weekNumber);
      const nextWeekHomeworks = await getHomeworksFromCache(weekNumber + 1);
      const fullHomeworks = [...currentWeekHomeworks, ...nextWeekHomeworks];

      // get the closest due date from now
      const sortedHomeworks = fullHomeworks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const splicedHomeworks = sortedHomeworks.splice(0, 3);
      setHomeworks(splicedHomeworks);
    };
    fetchHomeworksFromCache();
  }, [refreshTrigger])

  useEffect(() => {
    const fetchData = async () => {
      date.setUTCHours(0, 0, 0, 0);
      const currentTime = new Date();

      const dayCourse = weeklyTimetable.find(day => day.date.getTime() === date.getTime())?.courses ?? [];
      setCourses(dayCourse.filter(course => course.from.getTime() > currentTime.getTime()));
    };
    fetchData();
  }, [weeklyTimetable]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((_) => {
      fetchEDT()
      fetchGrades()
      fetchHomeworks()
    });

    return () => unsubscribe();
  }, []);

  const theme = useTheme();
  const { colors } = theme;

  const [firstName] = useMemo(() => {
    if (!lastUsedAccount) return [null, null, null, null];

    let firstName = account?.firstName;
    let lastName = account?.lastName;
    let level = account?.className;
    let establishment = account?.schoolName;

    return [firstName, lastName, level, establishment];
  }, [account, accounts]);

  const date = useMemo(() => new Date(), []);

  const accent = colors.primary;
  const foreground = adjust(accent, theme.dark ? 0.4 : -0.4);
  const foregroundSecondary = adjust(accent, theme.dark ? 0.6 : -0.7) + "88";

  const headerHeight = useHeaderHeight();

  const [fullyScrolled, setFullyScrolled] = useState(false);


  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  if (accounts.length === 0) {
    router.replace("/(onboarding)/welcome");
    return null
  }

  useEffect(() => {
    if (accounts.length > 0) {
      checkConsent().then(consent => {
        if (!consent.given) {
          router.push("../consent");
        }
      });
    }
  }, []);

  const MagicTaskWrapper = useCallback(({ item }: { item: Homework }) => {
    const description = item.content.replace(/<[^>]*>/g, "");
    const dueDate = new Date(item.dueDate);
    const inFresh = freshHomeworks[item.id]

    return (
      <CompactTask
        fromCache={false}
        setHomeworkAsDone={() => setHomeworkAsDone(inFresh)}
        ref={item}
        subject={getSubjectName(item.subject)}
        color={getSubjectColor(item.subject)}
        description={description}
        emoji={getSubjectEmoji(item.subject)}
        dueDate={dueDate}
        done={item.isDone}
      />

    );
  }, [freshHomeworks]);

  const headerItems = [
    (
      <Stack
        direction="vertical"
        hAlign="center"
        vAlign="center"
        gap={2}
        padding={20}
      >
        <Typography variant="h1" style={{ marginBottom: 2, fontSize: 44, lineHeight: 56 }}>
          👋
        </Typography>
        <Dynamic animated key={"welcome:" + firstName}>
          <Typography variant="h3" color={foreground}>
            {firstName ? t("Home_Welcome_Name", { name: firstName }) : t("Home_Welcome")}
          </Typography>
        </Dynamic>
        <Typography variant="body1" color={foregroundSecondary}>
          {courses.length == 0 ? t("Home_Planned_None")
            : courses.length == 1 ? t("Home_Planned_One")
              : t("Home_Planned_Number", { number: courses.length })}
        </Typography>
      </Stack>
    ),
    <GradesWidget header accent={foreground} />,
  ];

  return (
    <>
      <LinearGradient
        colors={[accent + "77", accent + "00"]}
        locations={[0, 0.5]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%" }}
      />
      <Pattern
        pattern={AvailablePatterns.CROSS}
        width={"100%"}
        height={250 + insets.top}
        color={foreground}
      />

      {!runsIOS26 && fullyScrolled && (
        <Reanimated.View
          entering={Animation(FadeInUp, "list")}
          exiting={Animation(FadeOutUp, "default")}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight + 1,
              backgroundColor: colors.card,
              zIndex: 1000000,
            },
            Platform.OS === 'android' && {
              elevation: 4,
            },
            Platform.OS === 'ios' && {
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }
          ]}
        />
      )}

      <TabFlatList
        translucent={true}
        removeClippedSubviews={true}
        backgroundColor="transparent"
        onFullyScrolled={handleFullyScrolled}
        height={200}
        header={
          <>
            <FlatList
              style={{
                backgroundColor: "transparent",
                borderCurve: "continuous",
                paddingBottom: 12
              }}
              horizontal
              data={headerItems}
              snapToInterval={Dimensions.get("window").width}
              decelerationRate={"fast"}
              showsHorizontalScrollIndicator={false}
              onScroll={e => {
                const page = Math.round(
                  e.nativeEvent.contentOffset.x / Dimensions.get("window").width
                );
                setCurrentPage(page);
              }}
              scrollEventThrottle={16}
              keyExtractor={(_, index) => "headerItem:" + index}
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              removeClippedSubviews={true}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: Dimensions.get("window").width,
                    flex: 1,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {item}
                </View>
              )}
            />

            {/* Pagination */}
            {headerItems.length > 1 &&
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 10,
                  gap: 6,
                }}
              >
                {headerItems.map((item, i) => (
                  <Reanimated.View
                    key={"pagination:" + i}
                    layout={Animation(LinearTransition)}
                    style={{
                      width: currentPage === i ? 16 : 6,
                      height: currentPage === i ? 8 : 6,
                      backgroundColor: currentPage === i ? foreground : foregroundSecondary,
                      borderRadius: 200,
                      opacity: currentPage === i ? 1 : 0.5
                    }}
                  />
                ))}
              </View>
            }
          </>
        }
        gap={12}
        data={[
          {
            icon: <Papicons name={"Butterfly"} />,
            title: "Papillon 8 est là !",
            redirect: "/changelog",
            buttonLabel: "En savoir plus"
          },
          courses.length > 0 && {
            icon: <Papicons name={"Calendar"} />,
            title: t("Home_Widget_NextCourses"),
            redirect: "(tabs)/calendar",
            render: () => (
              <Stack padding={12} gap={4} style={{ paddingBottom: 6 }}>
                {courses.slice(0, 2).map(item => (
                  <Course
                    key={item.id}
                    id={item.id}
                    name={item.subject}
                    teacher={item.teacher}
                    room={item.room}
                    color={getSubjectColor(item.subject)}
                    status={{ label: item.customStatus ? item.customStatus : getStatusText(item.status), canceled: (item.status === CourseStatus.CANCELED) }}
                    variant="primary"
                    start={Math.floor(item.from.getTime() / 1000)}
                    end={Math.floor(item.to.getTime() / 1000)}
                    readonly={!!item.createdByAccount}
                    onPress={() => {
                      (navigation as any).navigate('(modals)/course', {
                        course: item,
                        subjectInfo: {
                          id: item.id,
                          name: item.subject,
                          color: getSubjectColor(item.subject),
                          emoji: getSubjectEmoji(item.subject),
                        }
                      });
                    }}
                  />
                ))}
              </Stack>
            )
          },
          homeworks.length > 0 && {
            icon: <Papicons name={"Tasks"} />,
            title: t("Home_Widget_NewHomeworks"),
            redirect: "/(tabs)/tasks",
            render: () => (
              <FlatList
                showsVerticalScrollIndicator={false}
                style={{
                  borderBottomLeftRadius: 26,
                  borderBottomRightRadius: 26,
                  overflow: "hidden",
                  width: "100%",
                  padding: 10,
                  paddingHorizontal: 10,
                  gap: 10
                }}
                contentContainerStyle={{
                  gap: 12
                }}
                data={homeworks}
                keyExtractor={(item, index) => item.id + index}
                renderItem={({ item }) => (
                  <MagicTaskWrapper item={item} />
                )}

              />
            )
          },
          grades.length > 0 && {
            icon: <Papicons name={"Grades"} />,
            title: t("Home_Widget_NewGrades"),
            redirect: "(tabs)/grades",
            render: () => (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  borderBottomLeftRadius: 26,
                  borderBottomRightRadius: 26,
                  overflow: "hidden",
                  width: "100%"
                }}
                contentContainerStyle={{
                  paddingTop: 8,
                  paddingBottom: 14,
                  paddingHorizontal: 14,
                  gap: 12
                }}
                data={grades}
                keyExtractor={(item, index) => item.id + index}
                renderItem={({ item }) => (
                  <CompactGrade
                    title={item.subjectName}
                    score={item.studentScore?.value ?? 0}
                    description={item.description}
                    outOf={item.outOf.value}
                    emoji={getSubjectEmoji(item.subjectName)}
                    disabled={item.studentScore?.disabled}
                    status={item.studentScore?.status}
                    color={adjust(getSubjectColor(item.subjectName), -0.1)}
                    date={item.givenAt}
                    variant="home"
                    onPress={() => {
                      (navigation as any).navigate('(modals)/grade', {
                        grade: item,
                        subjectInfo: {
                          id: item.subjectId,
                          name: item.subjectName,
                          emoji: getSubjectEmoji(item.subjectName),
                          color: getSubjectColor(item.subjectName)
                        },
                        allGrades: grades
                      });
                    }}
                  />
                )}
              />
            )
          },
          {
            icon: <Papicons name={"Butterfly"} />,
            title: "Onboarding",
            redirect: "/(onboarding)/welcome",
            buttonLabel: "Aller",
            dev: true
          },
          {
            icon: <Papicons name={"Butterfly"} />,
            title: "Devmode",
            redirect: "/devmode",
            buttonLabel: "Aller",
            dev: true
          },
          {
            icon: <Papicons name={"Butterfly"} />,
            title: "Demo components",
            redirect: "/demo",
            buttonLabel: "Aller",
            dev: true
          },
        ].filter(item => item !== false && (item.dev ? __DEV__ : true))}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => {
          if (!item || (item.dev && !__DEV__)) {
            return null;
          }

          return (
            <Reanimated.View
              entering={PapillonAppearIn}
              exiting={PapillonAppearOut}
              layout={Animation(LinearTransition, "list")}
            >
              <Stack card radius={26}>
                <Stack direction="horizontal" vAlign="center" hAlign="center" padding={12} gap={10} style={{ paddingBottom: item.render ? 0 : undefined, marginTop: -1, height: item.render ? 44 : 56 }}>
                  <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
                    {item.icon}
                  </Icon>
                  <Typography nowrap style={{ flex: 1, opacity: 0.6 }} variant="title" color="text">
                    {item.title}
                  </Typography>
                  {(item.redirect || item.onPress) && (
                    <AnimatedPressable
                      onPress={() => item.onPress ? item.onPress() : router.navigate(item.redirect)}
                    >
                      <Stack bordered direction="horizontal" hAlign="center" padding={[12, 6]} gap={6}>
                        <Typography variant="body2" color="secondary" inline style={{ marginTop: 2 }}>
                          {item.buttonLabel ?? "Afficher plus"}
                        </Typography>
                        <Icon size={20} papicon opacity={0.5}>
                          <Papicons name={"ArrowRightUp"} />
                        </Icon>
                      </Stack>
                    </AnimatedPressable>
                  )}
                </Stack>
                {item.render && (
                  <item.render />
                )}
              </Stack>
            </Reanimated.View>
          )
        }}
        paddingTop={0}
      />

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible.")
          }}
        >
          <Icon size={28}>
            <Papicons name={"Menu"} color={foreground} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle style={{ flexDirection: "row", alignItems: "center", gap: 4 }} ignoreTouch={true}>
        <Typography variant="navigation" color={foreground}>
          {date.toLocaleDateString("fr-FR", { weekday: "long" })}
        </Typography>
        <NativeHeaderHighlight color={foreground} style={{ marginBottom: 0 }}>
          {date.toLocaleDateString("fr-FR", { day: "numeric" })}
        </NativeHeaderHighlight>
        <Typography variant="navigation" color={foreground}>
          {date.toLocaleDateString("fr-FR", { month: "long" })}
        </Typography>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => router.navigate("/(modals)/notifications")}
        >
          <Icon size={28}>
            <Papicons name={"Bell"} color={foreground} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}

function CompactTask({ fromCache, setHomeworkAsDone, ref, subject, color, description, emoji, dueDate, done, magic }: { fromCache: boolean, setHomeworkAsDone: (ref: Homework) => void, ref: Homework, subject: string, color: string, description: string, emoji: string, dueDate: Date, done: boolean, magic?: string }) {
  const { colors } = useTheme();

  return (
    <Stack
      style={{
        backgroundColor: color + 50,
        borderRadius: 20,
        width: "100%",
        flex: 1,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      {magic && (
        <Stack gap={10} direction="horizontal" hAlign="center" style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          <Icon size={14} skeleton={false}>
            <Sparkle fill={color} stroke={color} strokeWidth={2} />
          </Icon>
          <Typography color={color} weight='semibold' skeleton={false} skeletonWidth={200}>
            {magic}
          </Typography>
        </Stack>
      )}

      <Stack
        direction="horizontal"
        vAlign="center"
        hAlign="center"
        gap={16}
        padding={[16, 12]}
        style={{ backgroundColor: colors.card, borderTopRightRadius: magic ? 7.5 : undefined, borderTopLeftRadius: magic ? 7.5 : undefined }}
      >
        <Stack
          style={{
            backgroundColor: color + "70",
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 80,
          }}
        >
          <Typography>{emoji}</Typography>
        </Stack>

        <Stack style={{ flex: 1 }} gap={2}>
          <Typography variant="body2">{subject}</Typography>
          <Typography variant="body2" color={colors.text + "95"} numberOfLines={2}>{description}</Typography>
          <Typography variant="caption" color="secondary">
            {dueDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
          </Typography>
        </Stack>

        <AnimatedPressable
          scaleTo={0.8}
          style={{
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: done ? color : colors.border,
            borderRadius: 80,
            padding: 1.3,
            justifyContent: "center",
            alignItems: "center"
          }}
          disabled={fromCache}
          onPress={() => {
            setHomeworkAsDone(ref)
          }}
        >
          {done && (
            <View
              style={{
                backgroundColor: color,
                width: 24,
                height: 24,
                borderRadius: 80,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Papicons size={13} name="Check" fill={"white"} />
            </View>
          )}
        </AnimatedPressable>
      </Stack>
    </Stack>
  )
}

export default IndexScreen;