import Icon from "@/ui/components/Icon";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import * as Papicons from "@getpapillon/papicons"
import { useTheme } from "@react-navigation/native";
import { Dynamic } from "@/ui/components/Dynamic";
import { MenuView } from "@react-native-menu/menu";
import { Period } from "@/services/shared/grade";
import { getPeriodName, getPeriodNumber } from "../grades";
import { useMemo } from "react";
import { Attendance } from "@/services/shared/attendance";
import Stack from "@/ui/components/Stack";
// ...existing code...
import { useHeaderHeight } from "@react-navigation/elements";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import adjust from "@/utils/adjustColor";
import List from "@/ui/components/List";
import Item, { Trailing } from "@/ui/components/Item";

export default function AttendanceView() {

  const theme = useTheme()
  const { colors } = theme;
  const header = useHeaderHeight();

  const search = useLocalSearchParams();
  const currentPeriod = JSON.parse(String(search.currentPeriod)) as Period;
  const periods = JSON.parse(String(search.periods)) as Period[];
  const attendances = JSON.parse(String(search.attendances)) as Attendance[];

  const period = currentPeriod;

  const { missedTime, missedTimeUnjustified, unjustifiedAbsenceCount, unjustifiedDelayCount } = useMemo(() => {
    let missed = 0;
    let unjustified = 0;
    let unjustifiedAbs = 0;
    let unjustifiedDelays = 0;
    for (const attendance of attendances) {
      for (const absence of attendance.absences) {
        missed += absence.timeMissed;
        if (!absence.justified) {
          unjustified += absence.timeMissed;
          unjustifiedAbs += 1;
        }
      }
      for (const delay of attendance.delays) {
        if (!delay.justified) unjustifiedDelays += 1;
      }
    }
    return { missedTime: missed, missedTimeUnjustified: unjustified, unjustifiedAbsenceCount: unjustifiedAbs, unjustifiedDelayCount: unjustifiedDelays };
  }, [attendances]);

  const dangerColor = useMemo(() => adjust("#C50000", -0.15), []);
  const dangerBg = "#C5000030";
  const dangerBorder = "#0000000D";

  return (
    <>
      {period && (
        <>
          <ScrollView>
            <View
              style={{
                flex: 1,
                gap: 23.5,
                paddingHorizontal: 20
              }}
            >
              <Stack
                card
                direction="horizontal"
                width={"100%"}
                style={{ marginTop: header + 20 }}
              >
                <Stack
                  vAlign="center"
                  hAlign="center"
                  padding={12}
                  style={{ width: '50%' }}
                >
                  <Icon papicon opacity={0.5}>
                    <Papicons.Ghost />
                  </Icon>
                  <Typography color="secondary">
                    Heures manquées
                  </Typography>
                  <Stack direction="horizontal" gap={0}>
                    <AnimatedNumber variant="h5">
                      {String(Math.floor((missedTime % 3600) / 60)).padStart(2, '0')}
                    </AnimatedNumber>
                    <Typography variant="h5">
                      h
                    </Typography>
                    <AnimatedNumber variant="h5">
                      {String(Math.floor(missedTime / 3600)).padStart(2, '0')}
                    </AnimatedNumber>
                  </Stack>
                </Stack>
                <Stack
                  vAlign="center"
                  hAlign="center"
                  padding={12}
                  style={{ flex: 1, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderLeftWidth: 1, borderLeftColor: colors.border }}
                  backgroundColor="#F9E5E5"
                >
                  <Icon papicon fill={adjust("#C50000", -0.15)}>
                    <Papicons.Minus />
                  </Icon>
                  <Typography style={{ color: adjust("#C50000", -0.15) }}>
                    Heures injustifiées
                  </Typography>
                  <Stack direction="horizontal" gap={0}>
                    <AnimatedNumber variant="h5" color={adjust("#C50000", -0.15)}>
                      {String(Math.floor((missedTimeUnjustified % 3600) / 60)).padStart(2, '0')}
                    </AnimatedNumber>
                    <Typography variant="h5" color={adjust("#C50000", -0.15)}>
                      h
                    </Typography>
                    <AnimatedNumber variant="h5" color={adjust("#C50000", -0.15)}>
                      {String(Math.floor(missedTimeUnjustified / 3600)).padStart(2, '0')}
                    </AnimatedNumber>
                  </Stack>
                </Stack>
              </Stack>

              <Stack
                direction="horizontal"
                hAlign="center"
                style={{
                  justifyContent: "space-between"
                }}
              >
                <Stack direction="horizontal" hAlign="center">
                  <Icon papicon opacity={0.5}>
                    <Papicons.Ghost />
                  </Icon>
                  <Typography variant="h5" style={{ opacity: 0.5 }}>Absences</Typography>
                </Stack>
                <Typography variant="h5" style={{ opacity: 0.5 }}>x{unjustifiedAbsenceCount}</Typography>
              </Stack>
              <View style={{ flex: 1 }}>
                <List>
                  {attendances.map((attendance, index) =>
                    attendance.absences.map((absence, absenceIndex) => {
                      const fromDate = new Date(absence.from);
                      const day = fromDate.getDate().toString().padStart(2, '0');
                      const month = (fromDate.getMonth() + 1).toString().padStart(2, '0');
                      return (
                        <Item key={`${index}-${absenceIndex}`}>
                          <Trailing>
                            <Stack direction="horizontal" hAlign="center">
                              {!absence.justified && (
                                <Icon papicon fill={dangerColor}>
                                  <Papicons.Minus />
                                </Icon>
                              )}
                              <View style={{ padding: 6, paddingHorizontal: 12, backgroundColor: absence.justified ? "transparent" : dangerBg, borderRadius: 25, borderWidth: 2, borderColor: dangerBorder }}>
                                <Typography variant="title" color={absence.justified ? "white" : dangerColor}>{String(Math.floor(absence.timeMissed / 60)).padStart(2, '0')}h{String(absence.timeMissed % 60).padStart(2, '0')}</Typography>
                              </View>
                            </Stack>
                          </Trailing>
                          <Typography>
                            {absence.reason || "Aucune raison"}
                          </Typography>
                          <Typography color="#7F7F7F">
                            {day}/{month}
                          </Typography>
                        </Item>
                      );
                    })
                  )}
                </List>
              </View>
              <Stack
                direction="horizontal"
                hAlign="center"
                style={{
                  justifyContent: "space-between"
                }}
              >
                <Stack direction="horizontal" hAlign="center">
                  <Icon papicon opacity={0.5}>
                    <Papicons.Clock />
                  </Icon>
                  <Typography variant="h5" style={{ opacity: 0.5 }}>Retards</Typography>
                </Stack>
                <Typography variant="h5" style={{ opacity: 0.5 }}>x{unjustifiedDelayCount}</Typography>
              </Stack>
              <View style={{ flex: 1 }}>
                <List>
                  {attendances.map((attendance, index) =>
                    attendance.delays.map((delay, absenceIndex) => {
                      const fromDate = new Date(delay.givenAt);
                      const day = fromDate.getDate().toString().padStart(2, '0');
                      const month = (fromDate.getMonth() + 1).toString().padStart(2, '0');
                      return (
                        <Item key={`${index}-${absenceIndex}`}>
                          <Trailing>
                            <Stack direction="horizontal" hAlign="center">
                              {!delay.justified && (
                                <Icon papicon fill={dangerColor}>
                                  <Papicons.Minus />
                                </Icon>
                              )}
                              <View style={{ padding: 6, paddingHorizontal: 12, backgroundColor: delay.justified ? "transparent" : dangerBg, borderRadius: 25, borderWidth: 2, borderColor: dangerBorder }}>
                                <Typography variant="title" color={delay.justified ? "white" : dangerColor}>{delay.duration}m</Typography>
                              </View>
                            </Stack>
                          </Trailing>
                          <Typography>
                            {delay.reason || "Aucune raison"}
                          </Typography>
                          <Typography color="#7F7F7F">
                            {day}/{month}
                          </Typography>
                        </Item>
                      );
                    })
                  )}
                </List>
              </View>
            </View>
          </ScrollView>
          <NativeHeaderSide side="Left" style={{ marginTop: 15 }}>
            <NativeHeaderPressable onPress={() => { router.back() }}>
              <View style={{
                backgroundColor: colors.text + 15,
                padding: 10,
                borderRadius: 100,
              }}>
                <Icon size={26} fill={colors.text + 50} papicon>
                  <Papicons.Cross />
                </Icon>
              </View>
            </NativeHeaderPressable>
          </NativeHeaderSide>
          <NativeHeaderTitle style={{ marginTop: 4 }}>
            <MenuView actions={
              periods.map((item) => ({
                id: "period:" + item.id,
                title: item.name,
                subtitle: `${new Date(item.start).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric",
                })} - ${new Date(item.end).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric",
                })}`,
                state: item?.id === item.id ? "on" : "off",
                image: Platform.select({
                  ios: (getPeriodNumber(item.name || "0")) + ".calendar"
                }),
                imageColor: colors.text,
              }))}>
              <Dynamic
                animated={true}
                style={{
                  flexDirection: "row",
                  alignItems: Platform.OS === 'android' ? "left" : "center",
                  justifyContent: "center",
                  gap: 4,
                  width: 200,
                  height: 60,
                }}
              >
                <Dynamic animated>
                  <Typography inline variant="navigation">{getPeriodName(period?.name ?? "")}</Typography>
                </Dynamic>
                <Dynamic animated>
                  <NativeHeaderHighlight>{getPeriodNumber(period?.name ?? "")}</NativeHeaderHighlight>
                </Dynamic>
                <Dynamic animated>
                  <Papicons.ChevronDown strokeWidth={2.5} color={colors.text} opacity={0.6} />
                </Dynamic>
              </Dynamic>
            </MenuView>
          </NativeHeaderTitle >
        </>
      )}
    </>
  )
}