import { LiquidGlassContainer } from '@sbaiahmed1/react-native-blur';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Stack from '@/ui/components/Stack';
import { getCurrentPeriod } from '@/utils/grades/helper/period';

import HomeHeaderButton, { HomeHeaderButtonItem } from '../components/HomeHeaderButton';
import { useHomeHeaderData } from '../hooks/useHomeHeaderData';

const HomeHeader = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { availableCanteenCards, attendancesPeriods, attendances, absencesCount, news } = useHomeHeaderData();
  const currentAttendancePeriod = attendancesPeriods.length > 0
    ? getCurrentPeriod(attendancesPeriods)
    : undefined;

  const HomeHeaderButtons: HomeHeaderButtonItem[] = useMemo(() => [
    {
      title: t("Home_Cards_Button_Title"),
      image: require("@/assets/shaded_icons/cards.png"),
      icon: "card",
      color: "#c800ad",
      description: availableCanteenCards.length > 0 ?
        (availableCanteenCards.length > 1 ? t("Home_Cards_Button_Description_Number", { number: availableCanteenCards.length }) :
          t("Home_Cards_Button_Description_Singular")) : t("Home_Cards_Button_Description_None"),
      route: "/(features)/(cards)/cards"
    },
    {
      title: t("Home_Menu_Button_Title"),
      image: require("@/assets/shaded_icons/menu.png"),
      icon: "cutlery",
      color: "#46c700",
      description: t("Home_Menu_Button_Description"),
      route: "/(features)/soon"
    },
    {
      title: t("Home_Attendance_Title"),
      image: require("@/assets/shaded_icons/homework.png"),
      icon: "chair",
      color: "#ffae00",
      description: absencesCount > 0 ?
        (absencesCount > 1 ? t("Home_Attendance_Button_Description_Number", { number: absencesCount }) : t("Home_Attendance_Button_Description_Singular"))
        : t("Home_Attendance_Button_Description_None"),
      route: "/(features)/attendance",
      params: {
        periods: JSON.stringify(attendancesPeriods),
        currentPeriod: JSON.stringify(currentAttendancePeriod),
        attendances: JSON.stringify(attendances),
      },
    },
    {
      title: t("Tab_News"),
      image: require("@/assets/shaded_icons/actu.png"),
      icon: "newspaper",
      color: "#0080ff",
      description: news[0]?.title ?? t("News_Empty_Title"),
      route: "/(features)/(news)/news"
    }
  ], [availableCanteenCards, absencesCount, news, currentAttendancePeriod, attendancesPeriods, attendances, t]);

  return (
    <View style={{ paddingHorizontal: 0, width: "100%", flex: 1, overflow: "visible" }}>
      <View style={{ height: insets.top + 56 + (insets.right > 10 ? 10 : 0) }} />
      <LiquidGlassContainer spacing={8} style={{ overflow: "visible" }}>
        <Stack inline flex width={"100%"} style={{ overflow: "visible" }}>
          <View style={{ width: '100%', gap: 6, overflow: "visible" }}>
            {Array.from({ length: Math.ceil(HomeHeaderButtons.length / 2) }).map((_, i) => (

              <View key={i} style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
                {HomeHeaderButtons.slice(i * 2, i * 2 + 2).map((item) => (
                  <HomeHeaderButton
                    key={item.title} item={item}
                  />
                ))}
                {HomeHeaderButtons.slice(i * 2, i * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </Stack>
      </LiquidGlassContainer>
    </View>
  );
};

export default HomeHeader;
