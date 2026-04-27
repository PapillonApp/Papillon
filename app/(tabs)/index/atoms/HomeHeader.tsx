import { LiquidGlassContainer } from '@sbaiahmed1/react-native-blur';
import { router } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import packageJson from '@/package.json';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { useSettingsStore } from '@/stores/settings';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { Papicons } from '@getpapillon/papicons';

import HomeHeaderButton, { HomeHeaderButtonItem } from '../components/HomeHeaderButton';
import { useHomeHeaderData } from '../hooks/useHomeHeaderData';
import WrappedBanner from './WrappedBanner';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { ListTouchable } from '@/ui/new/List';

const HomeHeader = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const { availableCanteenCards, attendancesPeriods, attendances, absencesCount, chats } = useHomeHeaderData();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const currentVersion = packageJson.version;
  const releaseNotesUrl = `https://papillon.bzh/release-notes/${currentVersion}`;
  const currentAttendancePeriod = attendancesPeriods.length > 0
    ? getCurrentPeriod(attendancesPeriods)
    : undefined;

  useEffect(() => {
    const installedVersion = settingsStore.installedVersion;
    if (!installedVersion) {
      mutateProperty("personalization", {
        installedVersion: currentVersion,
        releaseNotesSeenForVersion: currentVersion,
      });
      return;
    }
    if (installedVersion !== currentVersion) {
      mutateProperty("personalization", { installedVersion: currentVersion });
    }
  }, [currentVersion, mutateProperty, settingsStore.installedVersion]);

  const showReleaseNotesBanner = settingsStore.releaseNotesSeenForVersion !== currentVersion;

  const HomeHeaderButtons: HomeHeaderButtonItem[] = useMemo(() => [
    {
      title: t("Home_Cards_Button_Title"),
      icon: "card",
      color: "#EE9F00",
      description: availableCanteenCards.length > 0 ?
        (availableCanteenCards.length > 1 ? t("Home_Cards_Button_Description_Number", { number: availableCanteenCards.length }) :
          t("Home_Cards_Button_Description_Singular")) : t("Home_Cards_Button_Description_None"),
      onPress: () => {
        router.push("/(features)/(cards)/cards");
      }
    },
    {
      title: t("Home_Menu_Button_Title"),
      icon: "cutlery",
      color: "#7ED62B",
      description: t("Home_Menu_Button_Description"),
      onPress: () => {
        router.push("/(features)/soon");
      }
    },
    {
      title: t("Home_Attendance_Title"),
      icon: "chair",
      color: "#D62B94",
      description: absencesCount > 0 ?
        (absencesCount > 1 ? t("Home_Attendance_Button_Description_Number", { number: absencesCount }) : t("Home_Attendance_Button_Description_Singular"))
        : t("Home_Attendance_Button_Description_None"),
      onPress: () => {
        if (!currentAttendancePeriod) {
          return;
        }

        router.push({
          pathname: "/(features)/attendance",
          params: {
            periods: JSON.stringify(attendancesPeriods),
            currentPeriod: JSON.stringify(currentAttendancePeriod),
            attendances: JSON.stringify(attendances),
          },
        });
      }
    },
    {
      title: t("Home_Chats_Button_Title"),
      icon: "textbubble",
      color: "#2B7ED6",
      description: chats.length > 0 ?
        (chats.length > 1 ? t("Home_Chats_Button_Description_Number", { number: chats.length }) : t("Home_Chats_Button_Description_Singular"))
        : t("Home_Chats_Button_Description_None"),
      onPress: () => {
        router.push("/(features)/soon");
      }
    }
  ], [availableCanteenCards, absencesCount, chats, currentAttendancePeriod, attendancesPeriods, attendances, t]);

  return (
    <View style={{ paddingHorizontal: 0, width: "100%", flex: 1 }}>
      <View style={{ height: insets.top + 56 }} />
      <LiquidGlassContainer>
        <Stack inline flex width={"100%"}>
          <View style={{ width: '100%', gap: 6 }}>
            {Array.from({ length: Math.ceil(HomeHeaderButtons.length / 2) }).map((_, i) => (

              <View key={i} style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
                {HomeHeaderButtons.slice(i * 2, i * 2 + 2).map((item) => (
                  <HomeHeaderButton key={item.title} item={item} />
                ))}
                {HomeHeaderButtons.slice(i * 2, i * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </Stack>
      </LiquidGlassContainer>

      {showReleaseNotesBanner && (

        <Stack card style={{ marginTop: 12, elevation: 2, backgroundColor: (!theme.dark && Platform.OS === 'android') ? '#FFF' : theme.colors.item, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' }} padding={0}>
          <ListTouchable
            onPress={() =>
              WebBrowser.openBrowserAsync(releaseNotesUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
              })
            }>
            <Stack padding={[12, 10]} gap={8} direction='horizontal'>
              <Papicons name="sparkles" size={24} color={colors.tint} />

              <Stack inline flex style={{ marginRight: 32 }}>
                <Typography variant='title'>
                  {t("Home_Release_Notes_Banner", { version: currentVersion })}
                </Typography>
                <Typography variant='body1' color="secondary">
                  {t("Home_Release_Notes_Banner_Description")}
                </Typography>
              </Stack>

              <ListTouchable
                hitSlop={10}
                onPress={(event) => {
                  event.stopPropagation();
                  mutateProperty("personalization", { releaseNotesSeenForVersion: currentVersion });
                }}
              >
                <View 
                style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.text + '11', position: "absolute", top: 10, right: 12 }}>
                <Icon size={16}>
                <Papicons name="Cross" />
                </Icon>
                </View>
              </ListTouchable>
            </Stack>
          </ListTouchable>
        </Stack>
      )}

      {__DEV__ && 1 === 2 && (
        <WrappedBanner />
      )}
    </View>
  );
};

export default HomeHeader;
