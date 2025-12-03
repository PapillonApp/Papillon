import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { LiquidGlassContainer, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { getChatsFromCache } from '@/database/useChat';
import { AccountManager, getManager, subscribeManagerUpdate } from '@/services/shared';
import { Attendance } from '@/services/shared/attendance';
import { Chat } from '@/services/shared/chat';
import { Period } from '@/services/shared/grade';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeHeader = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Canteen Services
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const availableCanteenCards = account?.services.filter(service => service.serviceId === (Services.TURBOSELF || Services.ALISE || Services.ARD || Services.ECOLEDIRECTE)) ?? []

  // School Life
  const attendancesPeriodsRef = useRef<Period[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const absencesCount = useMemo(() => {
    if (!attendances || !attendances.absences) return 0;
    let count = 0;
    attendances.forEach(attendances => count += attendances.absences.length);
    return count;
  }, [attendances]);

  const updateAttendance = async function (manager: AccountManager) {
    const periods = await manager.getAttendancePeriods();
    const currentPeriod = getCurrentPeriod(periods);
    const attendances = await manager.getAttendanceForPeriod(currentPeriod.name);

    attendancesPeriodsRef.current = periods;
    setAttendances(attendances);
  }

  // Discussions
  const [chats, setChats] = useState<Chat[]>([]);
  const updateDiscussions = async function (manager: AccountManager) {
    const fetchedChats = await manager.getChats();
    setChats(fetchedChats);
  }

  // Listen for initialization 
  useEffect(() => {
    const init = async () => {
      const cachedChats = await getChatsFromCache();
      setChats(cachedChats);
    };

    init();

    const unsubscribe = subscribeManagerUpdate((_) => {
      const manager = getManager();
      updateAttendance(manager);
      updateDiscussions(manager);
    });

    return () => unsubscribe();
  }, []);

  // Buttons in the header
  const HomeHeaderButtons = useMemo(() => [
    {
      title: t("Home_Cards_Button_Title"),
      icon: "card",
      color: "#EE9F00",
      description: availableCanteenCards.length > 0 ?
        (availableCanteenCards.length > 1 ? t("Home_Cards_Button_Description_Number", { number: availableCanteenCards.length }) :
          t("Home_Cards_Button_Description_Singular")) : t("Home_Cards_Button_Description_None")
    },
    {
      title: t("Home_Menu_Button_Title"),
      icon: "cutlery",
      color: "#7ED62B",
      description: t("Home_Menu_Button_Description")
    },
    {
      title: t("Home_Attendance_Title"),
      icon: "chair",
      color: "#D62B94",
      description: (absencesCount > 1 ? t("Home_Attendance_Button_Description_Number", { number: absencesCount }) : t("Home_Attendance_Button_Description_Singular")),
      onPress: () => {
        const periods = attendancesPeriodsRef.current;
        router.push({
          pathname: "/(features)/attendance",
          params: {
            periods: JSON.stringify(periods),
            currentPeriod: JSON.stringify(getCurrentPeriod(periods)),
            attendances: JSON.stringify(attendances),
          },
        });
      }
    },
    {
      title: t("Home_Chats_Button_Title"),
      icon: "textbubble",
      color: "#2B7ED6",
      description: (chats.length > 1 ? t("Home_Chats_Button_Description_Number", { number: chats.length }) : t("Home_Chats_Button_Description_Singular"))
    }
  ], [availableCanteenCards, absencesCount, t])

  const renderHeaderButton = useCallback(({ item }: { item: typeof HomeHeaderButtons[0] }) => (
    <LiquidGlassView
      glassOpacity={0.4}
      glassTintColor={colors.card}
      glassType='regular'
      isInteractive={true}
      style={{
        flex: 1,
        borderRadius: 22
      }}
    >
      <Pressable
        style={[styles.headerBtn]}
        onPress={item.onPress}
      >
        <View
          style={{
            backgroundColor: item.color + 30,
            borderRadius: 50,
            padding: 7
          }}
        >
          <Papicons name={item.icon} color={item.color} size={25} />
        </View>
        <View style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          <Typography nowrap variant="h6" color={colors.text + 95} style={{ lineHeight: 0 }}>{item.title}</Typography>
          <Typography nowrap variant="title" color={colors.text + 60} style={{ lineHeight: 0 }}>{item.description}</Typography>
        </View>
      </Pressable>
    </LiquidGlassView >
  ), [colors])

  return (
    <View
      style={{
        paddingHorizontal: 0,
        paddingVertical: 12,
        width: "100%",
        flex: 1
      }}
    >
      <View style={{ height: insets.top + 56 }} />

      <Stack inline flex width={"100%"}>
        <FlatList
          scrollEnabled={false}
          data={HomeHeaderButtons}
          numColumns={2}
          renderItem={renderHeaderButton}
          keyExtractor={(item) => item.title}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            gap: 6
          }}
          columnWrapperStyle={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6
          }}
          style={{
            width: "100%",
            overflow: "visible",
          }}
          removeClippedSubviews
          maxToRenderPerBatch={6}
          windowSize={1}
        />
      </Stack>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    borderCurve: "circular",
    borderRadius: 20,
    padding: 10,
    gap: 8
  }
})

export default HomeHeader;