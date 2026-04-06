import Icon from "@/ui/components/Icon";
import { useLocalSearchParams } from "expo-router";
import { Platform, View } from "react-native";
import { Papicons } from "@getpapillon/papicons"
import { useTheme } from "@react-navigation/native";
import { Period } from "@/services/shared/grade";
import { getPeriodName, getPeriodNumber, isPeriodWithNumber } from "@/utils/services/periods";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Attendance } from "@/services/shared/attendance";
import Stack from "@/ui/components/Stack";
import adjust from "@/utils/adjustColor";
import { error } from "@/utils/logger/logger";
import { getManager } from "@/services/shared";
import { t } from "i18next";
import i18n from "@/utils/i18n";
import ActionMenu from "@/ui/components/ActionMenu";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import List from "@/ui/new/List";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typography from "@/ui/new/Typography";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import * as DateLocale from 'date-fns/locale';
import ActivityIndicator from "@/ui/components/ActivityIndicator";

const formatEventTime = (durationData: number, detailed = false) => {
  if(detailed) {
    return durationData >= 60
      ? t("Attendance_Duration_HoursMinutes_Detailed", { hours: Math.floor(durationData / 60), minutes: lz(durationData % 60) })
      : t("Attendance_Duration_Minutes", { value: durationData })
  }

  return durationData >= 60
    ? t("Attendance_Duration_HoursMinutes_Compact", { hours: Math.floor(durationData / 60), minutes: lz(durationData % 60) })
    : t("Attendance_Duration_Minutes", { value: durationData })
}

export default function AttendanceView() {
  const theme = useTheme()
  const { colors } = theme;
  const search = useLocalSearchParams();
  const parsedPeriods = useMemo(
    () => normalizePeriods(parseJsonParam<Period[]>(search.periods, [])),
    [search.periods]
  );
  const parsedCurrentPeriod = useMemo(
    () => normalizePeriod(parseJsonParam<Period | null>(search.currentPeriod, null)),
    [search.currentPeriod]
  );
  const initialPeriod = useMemo(
    () => parsedCurrentPeriod ?? (parsedPeriods.length > 0 ? getCurrentPeriod(parsedPeriods) : undefined),
    [parsedCurrentPeriod, parsedPeriods]
  );
  const initialAttendances = useMemo(
    () => parseJsonParam<Attendance[]>(search.attendances, []),
    [search.attendances]
  );
  const hasInitialRouteData = parsedPeriods.length > 0 && Boolean(initialPeriod) && hasSerializableParam(search.attendances);

  const [periods, setPeriods] = useState<Period[]>(parsedPeriods);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [period, setPeriod] = useState<Period | undefined>(initialPeriod);
  const [isLoading, setIsLoading] = useState(!hasInitialRouteData);
  const [headerHeight, setHeaderHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const dangerColor = adjust("#C50000", theme.dark ? 0.4 : -0.1);
  const dangerBg = adjust("#C50000", theme.dark ? -0.65 : 0.85);

  const successColor = adjust("#00C851", theme.dark ? 0.3 : -0.1);
  const successBg = adjust("#00C851", theme.dark ? -0.75 : 0.85);

  const fetchAttendanceData = useCallback(async (selectedPeriod?: Period) => {
    const manager = getManager();
    if (!manager) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let nextPeriods = periods;
      if (nextPeriods.length === 0) {
        nextPeriods = await manager.getAttendancePeriods();
        setPeriods(nextPeriods);
      }

      const nextPeriod = selectedPeriod ?? (nextPeriods.length > 0 ? getCurrentPeriod(nextPeriods) : undefined);
      if (!nextPeriod) {
        setPeriod(undefined);
        setAttendances([]);
        return;
      }

      const attendancesFetched = await manager.getAttendanceForPeriod(nextPeriod.name);
      setAttendances(attendancesFetched);
      setPeriod(nextPeriod);
    } catch (err) {
      error(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [periods]);

  useEffect(() => {
    if (!hasInitialRouteData) {
      void fetchAttendanceData();
    }
  }, [fetchAttendanceData, hasInitialRouteData]);

  const { missedTime, missedTimeUnjustified, absenceCount, delayCount } = useMemo(() => {
    let missed = 0;
    let unjustified = 0;
    let absencesTotal = 0;
    let delaysTotal = 0;

    for (const attendance of attendances) {
      for (const absence of attendance.absences) {
        absencesTotal += 1;
        missed += absence.timeMissed;
        if (!absence.justified) {
          unjustified += absence.timeMissed;
        }
      }

      for (const delay of attendance.delays) {
        delaysTotal += 1;
        if (!delay.justified) {
          unjustified += delay.duration
        }
        missed += delay.duration
      }
    }

    return {
      missedTime: missed,
      missedTimeUnjustified: unjustified,
      absenceCount: absencesTotal,
      delayCount: delaysTotal
    };
  }, [attendances]);

  const hasAbsences = useMemo(
    () => attendances.some((attendance) => attendance.absences.length > 0),
    [attendances]
  );
  const hasDelays = useMemo(
    () => attendances.some((attendance) => attendance.delays.length > 0),
    [attendances]
  );

  return (
    <>
      <TabHeader
        showAndroidBackButton
        modal={Platform.OS !== "android"}
        onHeightChanged={setHeaderHeight}
        title={
          <ActionMenu
            key={String(period?.id ?? "")}
            onPressAction={async ({ nativeEvent }) => {
              const actionId = nativeEvent.event;

              if (actionId.startsWith("period:")) {
                const selectedPeriodId = actionId.replace("period:", "");
                const selectedPeriod = periods.find(item => item.id === selectedPeriodId);

                if (!selectedPeriod) {
                  error(t("Attendance_InvalidPeriod"));
                  return;
                }

                await fetchAttendanceData(selectedPeriod);
              }
            }}
            actions={
              periods.map((item) => ({
                id: "period:" + item.id,
                title: (getPeriodName(item.name || "") + " " + (isPeriodWithNumber(item.name || "") ? getPeriodNumber(item.name || "0") : "")).trim(),
                subtitle: `${new Date(item.start).toLocaleDateString(i18n.language, {
                  month: "short",
                  year: "numeric",
                })} - ${new Date(item.end).toLocaleDateString(i18n.language, {
                  month: "short",
                  year: "numeric",
                })}`,
                state: String(period?.id ?? "") === String(item.id ?? "") ? "on" : "off",
                image: Platform.select({
                  ios: (getPeriodNumber(item.name || "0")) + ".calendar"
                }),
                imageColor: colors.text,
              }))
            }
          >
            <TabHeaderTitle
              chevron={periods.length > 1}
              leading={period ? getPeriodName(period.name ?? "") : t("Home_Attendance_Title")}
              number={period && isPeriodWithNumber(period.name ?? "") ? getPeriodNumber(period.name ?? "") : undefined}
              loading={isLoading}
            />
          </ActionMenu>
        }
      />

      <List
        contentContainerStyle={{
          padding: 16,
          paddingTop: headerHeight,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {isLoading && attendances.length === 0 ? (
          <Stack hAlign="center" vAlign="center" padding={24}>
            <ActivityIndicator size={42} />
          </Stack>
        ) : !hasAbsences && !hasDelays ? (
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Ghost" />
              </Icon>
            </List.Leading>

            <Typography variant="title">
              {t("Attendance_NoEvent_Title")}
            </Typography>
            <Typography color="textSecondary">
              {t("Attendance_NoEvent_Description")}
            </Typography>
          </List.Item>
        ) : (
          <List.Section>
            {missedTimeUnjustified > 0 ? (
              <List.Item
                style={{
                  backgroundColor: dangerBg,
                }}
              >
                <List.Leading>
                  <Icon fill={dangerColor}>
                    <Papicons name="AlertTriangle" />
                  </Icon>
                </List.Leading>

                <Typography variant="title" color={dangerColor}>
                  {t("Attendance_Hours_Unjustified_Value", { duration: formatEventTime(missedTimeUnjustified, true) })}
                </Typography>
                <Typography color={dangerColor}>
                  {t("Attendance_Unjustified_Description")}
                </Typography>
              </List.Item>
            ) : (
              <List.Item
                style={{
                  backgroundColor: successBg,
                }}
              >
                <List.Leading>
                  <Icon fill={successColor}>
                    <Papicons name="Check" />
                  </Icon>
                </List.Leading>

                <Typography variant="title" color={successColor}>
                  {t("Attendance_NoUnjustified_Title")}
                </Typography>
                <Typography color={successColor}>
                  {t("Attendance_NoUnjustified_Description")}
                </Typography>
              </List.Item>
            )}

            <List.Item>
              <Typography variant="action">
                {t("Attendance_Hours_Missed")}
              </Typography>
              <List.Trailing>
                <Typography variant="title" weight="bold" color={missedTimeUnjustified > 0 ? dangerColor : "textSecondary"}>
                  {formatEventTime(missedTime, true)}
                </Typography>
              </List.Trailing>
            </List.Item>
          </List.Section>
        )}

        {hasAbsences && (
          <List.Section>
            <List.SectionTitle>
              <Icon opacity={0.5} size={20}>
                <Papicons name="UserCross" />
              </Icon>
              <Typography variant="body1" weight="semibold" color="textSecondary" style={{ flex: 1 }}>
                {t("Attendance_Missing")}
              </Typography>
              <Typography variant="title" weight="medium" color={"textSecondary"}>
                {absenceCount}
              </Typography>
            </List.SectionTitle>

            {attendances.map((attendance, index) =>
              attendance.absences.map((absence, absenceIndex) => {
                const fromDate = new Date(absence.from);
                const dateString = formatDistanceToNowStrict(fromDate, {
                  locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                  addSuffix: true
                });
                const dayString = formatDate(fromDate, "eeee d MMMM", {
                  locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                });

                return (
                  <List.Item key={absence.id ?? `absence-${index}-${absenceIndex}`}>
                    <Typography variant="title">
                      {absence.reason || t("Attendance_NoReason")}
                    </Typography>
                    <Typography color="textSecondary" numberOfLines={1}>
                      {dateString} · {dayString}
                    </Typography>
                    <List.Trailing>
                      <AttendanceTimer evt={absence} />
                    </List.Trailing>
                  </List.Item>
                );
              })
            )}
          </List.Section>
        )}

        {hasDelays && (
          <List.Section>
            <List.SectionTitle>
              <Icon opacity={0.5} size={20}>
                <Papicons name="Clock" />
              </Icon>
              <Typography variant="body1" weight="semibold" color="textSecondary" style={{ flex: 1 }}>
                {t("Attendance_Delays")}
              </Typography>
              <Typography variant="title" weight="medium" color={"textSecondary"}>
                {delayCount}
              </Typography>
            </List.SectionTitle>

            {attendances.map((attendance, index) =>
              attendance.delays.map((delay, delayIndex) => {
                const fromDate = new Date(delay.givenAt);
                const date = fromDate.getTime();
                const dateString = formatDistanceToNowStrict(date, {
                  locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                  addSuffix: true
                });
                const dayFormatted = formatDate(date, "eeee d MMMM", {
                  locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                });
                
                return (
                  <List.Item key={delay.id ?? `delay-${index}-${delayIndex}`}>
                    <Typography variant="title">
                      {delay.reason || t("Attendance_NoReason")}
                    </Typography>
                    <Typography color="textSecondary">
                      {dateString} · {dayFormatted}
                    </Typography>
                    <List.Trailing>
                      <AttendanceTimer evt={delay} />
                    </List.Trailing>
                  </List.Item>
                );
              })
            )}
          </List.Section>
        )}

      </List>
    </>
  );
}

const lz = (num: number) => num.toString().padStart(2, "0");

function getSearchParamValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasSerializableParam(value: string | string[] | undefined): boolean {
  const rawValue = getSearchParamValue(value);
  return Boolean(rawValue && rawValue !== "undefined");
}

function parseJsonParam<T>(value: string | string[] | undefined, fallback: T): T {
  const rawValue = getSearchParamValue(value);
  if (!rawValue || rawValue === "undefined") {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as T | null | undefined;
    return parsedValue ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizePeriod(period?: Period | null): Period | undefined {
  if (!period) {
    return undefined;
  }

  return {
    ...period,
    start: new Date(period.start),
    end: new Date(period.end),
  };
}

function normalizePeriods(periods: Period[]): Period[] {
  return periods
    .map((period) => normalizePeriod(period))
    .filter((period): period is Period => Boolean(period));
}

const AttendanceTimer = ({ evt }: { evt: any }) => {
  const theme = useTheme();
  const { colors } = theme;

  const dangerColor = adjust("#C50000", theme.dark ? 0.4 : -0.1);
  const dangerBg = dangerColor + "30";

  const durationData = evt.timeMissed || evt.duration || 0;

  const durationText = formatEventTime(durationData);

  return (
    <Stack direction="horizontal" hAlign="center" gap={8}>
      {!evt.justified && (
        <Icon papicon fill={dangerColor}>
          <Papicons name={"Minus"} />
        </Icon>
      )}
      <View style={{ padding: 6, paddingHorizontal: evt.justified ? 3 : 12, backgroundColor: evt.justified ? "transparent" : dangerBg, borderRadius: 25, overflow: "hidden" }}>
        <Typography variant="title" color={evt.justified ? colors.text : dangerColor}>{durationText}</Typography>
      </View>
    </Stack>
  )
}
