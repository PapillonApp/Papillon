import * as React from "react";
import { memo, useCallback, useMemo, useEffect } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CalendarKit, { PackedAllDayEvent, PackedEvent, HeaderItemProps as CalendarKitHeaderItemProps, EventItem as CalendarKitEventItem } from "@howljs/calendar-kit";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { useTheme } from "@react-navigation/native";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { AlertTriangle, CalendarDays } from "lucide-react-native";
import { PapillonHeaderAction } from "@/components/Global/PapillonModernHeader";
import { getSubjectData } from "@/services/shared/Subject";
import { PapillonNavigation } from "@/router/refs";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { TimetableClassStatus} from "@/services/shared/Timetable";
import { NativeText } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import type { Screen } from "@/router/helpers/types";
import {Account} from "@/stores/account/types";
import { fetchIcalData } from "@/services/local/ical";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

const LOCALES = {
  en: {
    weekDayShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    meridiem: { ante: "am", post: "pm" },
    more: "more",
  },
  fr: {
    weekDayShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    meridiem: { ante: "am", post: "pm" },
    more: "plus",
  },
} as const;

interface EventItemProps {
  event: PackedEvent | PackedAllDayEvent
}

const EventItem = memo<EventItemProps>(({ event }) => {
  const theme = useTheme();

  const subjectData = useMemo(
    () => getSubjectData(event.event.title),
    [event.event.title] // Optimized dependency array
  );

  const [layout, setLayout] = React.useState({ width: 0, height: 0 });

  const isCanceled = event.event.status === TimetableClassStatus.CANCELED;
  const isWide = layout.width > 100;

  const handlePress = () => {
    PapillonNavigation.current?.navigate("LessonDocument", { lesson: event.event });
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: subjectData.color },
    isCanceled && styles.canceledContainer
  ];

  const contentStyle = [
    styles.contentContainer,
    { backgroundColor: subjectData.color + "22", borderColor: theme.colors.border },
    isCanceled && styles.canceledContent
  ];

  const titleStyle = [
    styles.title,
    isWide && styles.wideTitleVariant,
    { color: "#ffffff" }
  ];

  const roomStyle = [
    styles.room,
    { color: "#ffffff" }
  ];

  return (
    <TouchableOpacity
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      style={containerStyle}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {event.event.statusText && (
        <View style={styles.alertBadge}>
          <AlertTriangle
            size={18}
            color="#ffffff"
            strokeWidth={2}
            style={styles.alertIcon}
          />
        </View>
      )}
      <View style={{
        height: 6,
        backgroundColor: "#00000042",
        overflow: "hidden",
      }}>
        <Image
          source={require("../../../../assets/images/mask_stripes_long.png")}
          resizeMode="cover"

          style={{ width: 2000, height: 16, tintColor: "#000000", opacity: 0.3 }}
        />
      </View>
      <View style={contentStyle}>
        <Text numberOfLines={3} style={titleStyle}>
          {subjectData.pretty}
        </Text>
        <Text numberOfLines={2} style={roomStyle}>
          {event.event.room}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

interface HeaderItemProps {
  header: CalendarKitHeaderItemProps
}

const HeaderItem = memo<HeaderItemProps>(({ header }) => {
  const theme = useTheme();

  const cols = header.extra.columns;
  const start = header.startUnix;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStamp = today.getTime();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        height: 50,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
      }}
    >
      {Array.from({ length: cols }, (_, i) => (
        <View
          key={i}
          style={[
            {
              flex: 1,
              height: 50,
              justifyContent: "center",
              gap: 1,
              paddingTop: 1,
            }
          ]}
        >
          {cols > 1 && (
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                fontFamily: "medium",
                opacity: 0.6,
                letterSpacing: 0.5,
                color: theme.colors.text,
              }}
            >
              {new Date(start
              + i * 24 * 60 * 60 * 1000
              ).toLocaleDateString("fr-FR", {weekday: "short"})}
            </Text>
          )}
          <Text
            style={[
              {
                textAlign: "center",
                fontSize: 17,
                fontFamily: "semibold",
                paddingVertical: 3,
                paddingHorizontal: 10,
                alignSelf: "center",
                borderRadius: 12,
                minWidth: 42,
                borderCurve: "continuous",
                overflow: "hidden",
                color: theme.colors.text,
              },
              start
              + i * 24 * 60 * 60 * 1000 === todayStamp && {
                backgroundColor: theme.colors.primary,
                color: "white",
              }
            ]}
          >
            {new Date(start
              + i * 24 * 60 * 60 * 1000
            ).toLocaleDateString("fr-FR",
              cols > 1 ? {day: "numeric"} : {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
          </Text>
        </View>
      ))}
    </View>
  );
});

const displayModes = ["Semaine", "3 jours", "Journée"];

const Week: Screen<"Week"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isOnline } = useOnlineStatus();

  const outsideNav = route.params?.outsideNav;

  const [isLoading, setIsLoading] = React.useState(false);

  const account = useCurrentAccount((store) => store.account);
  const timetables = useTimetableStore((store) => store.timetables);

  const [displayMode, setDisplayMode] = React.useState("Semaine");

  const customTheme = useMemo(() => ({
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      border: theme.colors.border + "88",
      text: theme.colors.text,
      surface: theme.colors.card,
      onPrimary: theme.colors.background,
      onBackground: theme.colors.text,
      onSurface: theme.colors.text,
    }
  }), [theme.colors]);

  const [events, setEvents] = React.useState<CalendarKitEventItem[]>([]);

  useEffect(() => {
    if(!timetables) return;

    const nevts = Object.values(timetables)
      .flat()
      .map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: { dateTime: new Date(event.startTimestamp) },
        end: { dateTime: new Date(event.endTimestamp) },
        event: event,
      }));

    // @ts-ignore
    setEvents(nevts);
  }, [timetables]);

  const loadTimetableWeek = useCallback(async (weekNumber: number, force = false) => {
    if (!force) {
      if (timetables[weekNumber]) return;
    }

    setIsLoading(true);
    requestAnimationFrame(async () => {
      try {
        await updateTimetableForWeekInCache(account as Account, weekNumber, force);
        await fetchIcalData(account as Account, force);
      } finally {
        setIsLoading(false);
      }
    });
  }, [account, timetables]);

  const handleDateChange = useCallback(async (date: string) => {
    const weekNumber = dateToEpochWeekNumber(new Date(date));
    await loadTimetableWeek(weekNumber);
  }, [loadTimetableWeek]);

  const [openedIcalModal, setOpenedIcalModal] = React.useState(false);

  React.useEffect(() => {
    if(events.length === 0 && (account?.personalization?.icalURLs?.length || 0) > 0) {
      setIsLoading(true);
      requestAnimationFrame(async () => {
        const weekNumber = dateToEpochWeekNumber(new Date());
        await loadTimetableWeek(weekNumber, true);
        setOpenedIcalModal(false);
      });
    }
  }, [account?.personalization?.icalURLs]);

  return (
    <View style={{ flex: 1, marginTop: insets.top }}>
      {!isOnline && (
        <View style={{ padding: 16 }}>
          <OfflineWarning cache={true} />
        </View>
      )}

      {account?.providers?.includes("ical") && Object.values(timetables).flat().length === 0 && (
        <View
          style={{
            zIndex: 100000,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            padding: 24,
          }}
        >
          {isLoading ? (
            <PapillonSpinner
              color={theme.colors.primary}
            />
          ) : (
            <>
              <CalendarDays
                size={36}
                strokeWidth={2}
                color={theme.colors.text}
                style={{ marginBottom: 6 }}
              />
              <NativeText
                variant="title"
                style={{textAlign: "center"}}
              >
                Aucun agenda externe
              </NativeText>
              <NativeText
                variant="subtitle"
                style={{textAlign: "center"}}
              >
                Importez un calendrier depuis une URL de votre agenda externe tel que ADE ou Moodle.
              </NativeText>

              <View style={{ height: 24 }} />

              <ButtonCta
                value="Importer mes cours"
                primary
                onPress={() => {
                  setOpenedIcalModal(true);
                  setTimeout(() => {
                    PapillonNavigation.current?.navigate("LessonsImportIcal", {});
                  }, 100);
                }}
              />
              <ButtonCta
                value="Comment faire ?"
                onPress={() => {
                  Linking.openURL("https://support.papillon.bzh/articles/351142-import-ical");
                }}
              />
            </>
          )}
        </View>
      )}

      <View
        style={{
          zIndex: 1000,
          overflow: "visible",
          position: "absolute",
          left: 12,
          top: 3,
        }}
      >
        <PapillonPicker
          animated
          direction="left"
          delay={0}
          selected={displayMode}
          onSelectionChange={(mode: string) => {
            setIsLoading(true);
            requestAnimationFrame(() => {

              setDisplayMode(mode);
              setIsLoading(false);
            });
          }}
          data={displayModes}
        >
          <PapillonHeaderAction
            icon={
              isLoading ? (
                <PapillonSpinner
                  size={20}
                  strokeWidth={5}
                  color={theme.colors.text}
                />
              ) : (
                <CalendarDays />
              )
            }
          />
        </PapillonPicker>
      </View>

      <CalendarKit
        theme={customTheme}
        numberOfDays={displayMode === "Semaine" ? 5 : displayMode === "3 jours" ? 3 : 1}
        hideWeekDays={displayMode === "Semaine" ? [6, 7] : []}
        pagesPerSide={2}
        scrollByDay={displayMode === "Semaine" ? false : true}
        events={events}
        onDateChanged={handleDateChange}
        initialLocales={LOCALES}
        locale="fr"
        hourFormat="HH:mm"
        renderEvent={(event) => <EventItem event={event} />}
        renderHeaderItem={(header) => <HeaderItem header={header} />}
        dayBarHeight={50}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 5,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  canceledContainer: {
    borderColor: "red",
    borderWidth: 4,
    borderStyle: "dotted",
    backgroundColor: "transparent",
  },
  alertBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#00000099",
    zIndex: 1000,
    borderRadius: 30,
    borderColor: "#ffffff99",
    borderWidth: 2,
    padding: 4,
    paddingBottom: 2,
    paddingLeft: 2,
  },
  alertIcon: {
    margin: 4,
  },
  contentContainer: {
    flex: 1,
    borderRadius: 0,
    padding: 4,
    flexDirection: "column",
    gap: 2,
    borderWidth: 0,
  },
  canceledContent: {
    opacity: 0.5,
    backgroundColor: "grey",
    borderWidth: 0,
  },
  title: {
    fontSize: 11.5,
    letterSpacing: 0.2,
    fontFamily: "semibold",
    textTransform: "uppercase",
    zIndex: 100,
  },
  wideTitleVariant: {
    fontSize: 15,
    letterSpacing: 0.1,
    textTransform: "none",
  },
  room: {
    fontSize: 11,
    letterSpacing: 0.2,
    fontFamily: "medium",
    opacity: 0.6,
    zIndex: 100,
  },
});

export default memo(Week);
