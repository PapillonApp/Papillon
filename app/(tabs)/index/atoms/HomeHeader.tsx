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

const HomeHeader = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Canteen Services
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const availableCanteenCards = account?.services.filter(service => service.serviceId === (Services.TURBOSELF || Services.ALISE || Services.ARD || Services.ECOLEDIRECTE)) ?? []

  // School Life
  const attendancesPeriodsRef = useRef<Period[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const absencesCount = useMemo(() => {
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
        availableCanteenCards.length + (availableCanteenCards.length > 1 ? t("Home_Cards_Button_Description_Plurial") :
          t("Home_Cards_Button_Description_Singular")) : t("Home_Cards_Button_Description_None")
    },
    {
      title: "Menu",
      icon: "cutlery",
      color: "#7ED62B",
      description: "Menu du jour"
    },
    {
      title: t("Profile_Attendance_Title"),
      icon: "chair",
      color: "#D62B94",
      description: absencesCount + " absences",
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
      title: "Messages",
      icon: "textbubble",
      color: "#2B7ED6",
      description: `${chats.length} ` + (chats.length > 1 ? t("Home_Chats_Plurial") : t("Home_Chats_Singular"))
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
        borderRadius: 20,
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
    </LiquidGlassView>
  ), [colors])

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Stack>
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
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6
          }}
          style={{
            width: "100%",
            overflow: "visible",
            gap: 6
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
    flexDirection: "row",
    borderCurve: "circular",
    borderRadius: 20,
    padding: 10,
    gap: 8
  }
})

export default HomeHeader;