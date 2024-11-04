import React, { useEffect, useLayoutEffect, useState } from "react";

import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  Clock2,
  QrCode,
  Utensils,
} from "lucide-react-native";

import type { Screen } from "@/router/helpers/types";
import RestaurantCard from "@/components/Restaurant/RestaurantCard";
import { HorizontalList, Item } from "@/components/Restaurant/ButtonList";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { Balance } from "@/services/shared/Balance";
import { balanceFromExternal } from "@/services/balance";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { qrcodeFromExternal } from "@/services/qrcode";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import { getMenu } from "@/services/menu";
import type { Menu as PawnoteMenu } from "pawnote";
import { PapillonHeaderSelector } from "@/components/Global/PapillonModernHeader";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { LessonsDateModal } from "../Lessons/LessonsHeader";
import { BookingTerminal, BookingDay } from "@/services/shared/Booking";
import { bookDayFromExternal, getBookingsAvailableFromExternal } from "@/services/booking";

const Menu: Screen<"Menu"> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(store => store.account);
  const linkedAccounts = useCurrentAccount(store => store.linkedAccounts);
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 200));
    setActiveIndex(Math.max(0, Math.min(index, allBalances ? allBalances.length - 1 : 0)));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allBalances, setAllBalances] = useState<Balance[] | null>(null);
  const [allHistories, setAllHistories] = useState<ReservationHistory[] | null>(null);
  const [allQRCodes, setAllQRCodes] = useState<number[] | null>(null);
  const [allBookings, setAllBookings] = useState<BookingTerminal[] | null>(null);
  const [currentMenu, setCurrentMenu] = useState<PawnoteMenu | null>(null);

  const [currentWeek, setCurrentWeek] = useState<number>(0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = React.useState(new Date(today));
  const [isMenuLoading, setMenuLoading] = useState(false);

  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    void async function () {
      try {
        console.log("Fetching Restaurant data...");
        const newBalances: Balance[] = [];
        const newHistories: ReservationHistory[] = [];
        const newQRCodes: number[] = [];
        const newBookings: BookingTerminal[] = [];

        const dailyMenu = account ? await getMenu(account, pickerDate) : null;

        const accountPromises = linkedAccounts.map(async (account) => {
          try {
            const [balance, history, cardnumber, booking] = await Promise.all([
              balanceFromExternal(account).catch(err => {
                console.warn(`Error fetching balance for account ${account}:`, err);
                return [];
              }),
              reservationHistoryFromExternal(account).catch(err => {
                console.warn(`Error fetching history for account ${account}:`, err);
                return [];
              }),
              qrcodeFromExternal(account).catch(err => {
                console.warn(`Error fetching QR code for account ${account}:`, err);
                return 0;
              }),
              getBookingsAvailableFromExternal(account, getWeekNumber(today)).catch(err => {
                console.warn(`Error fetching bookings for account ${account}:`, err);
                return [];
              })
            ]);

            newBalances.push(...balance);
            newHistories.push(...history);
            newBookings.push(...booking);
            if (cardnumber !== 0) newQRCodes.push(cardnumber);

          } catch (error) {
            console.warn(`An error occurred with account ${account}:`, error);
          }
        });

        await Promise.all(accountPromises);

        setAllBalances(newBalances);
        setAllHistories(newHistories);
        setAllQRCodes(newQRCodes);
        setAllBookings(newBookings);
        setCurrentMenu(dailyMenu);
        setIsInitialised(true);
      } catch (error) {
        console.warn("An error occurred while fetching data:", error);
      }
    }();
  }, [linkedAccounts]);


  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const updateDatePicker = async (date: Date) => {
    setMenuLoading(true);
    const newWeek = getWeekNumber(date);

    if (currentWeek !== newWeek) {
      setCurrentWeek(newWeek);

      const allBookings: BookingTerminal[] = [];
      for (const account of linkedAccounts) {
        const bookingsForAccount = await getBookingsAvailableFromExternal(account, newWeek);

        allBookings.push(...bookingsForAccount);
      }

      setAllBookings(allBookings);
    }

    const dailyMenu = account ? await getMenu(account, date) : null;
    setCurrentMenu(dailyMenu);
    setMenuLoading(false);
  };

  const handleBookTogglePress = async (terminal: BookingTerminal, bookingDay: BookingDay) => {
    const newBookingStatus = !bookingDay.booked;

    const updatedBookings = allBookings?.map((term) =>
      term === terminal
        ? {
          ...term,
          days: term.days.map((day) =>
            day === bookingDay ? { ...day, booked: newBookingStatus } : day
          ),
        }
        : term
    );

    setAllBookings(updatedBookings ?? null);

    try {
      await bookDayFromExternal(terminal.account, bookingDay.id, pickerDate, newBookingStatus);
    } catch {
      const revertedBookings = allBookings?.map((term) =>
        term === terminal
          ? {
            ...term,
            days: term.days.map((day) =>
              day === bookingDay ? { ...day, booked: !newBookingStatus } : day
            ),
          }
          : term
      );

      setAllBookings(revertedBookings ?? null);
      Alert.alert("Erreur", "Une erreur est survenue lors de la réservation du repas");
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {!isInitialised ? (
        <ActivityIndicator size="large" style={{ padding: 50 }} />
      ) : (
        <>
          {allBalances?.length === 0 ? (
            <MissingItem
              emoji="🤔"
              title="Vous n'avez lié aucun compte"
              description="Pour accéder à la cantine, vous devez lier un compte dans l'onglet services externes."
              entering={animPapillon(FadeInDown)}
              exiting={animPapillon(FadeOut)}
            />
          ) : (
            <Reanimated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth}
              onScroll={handleScroll}
              decelerationRate="fast"
              scrollEnabled={(allBalances ?? []).length > 1}
              contentContainerStyle={{ alignItems: "center", gap: 16 }}
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              entering={FadeInUp}
              exiting={FadeOutDown}
            >
              {allBalances?.map((item, index) => (
                <View style={{ width: screenWidth - 32 }} key={index}>
                  <RestaurantCard solde={item.amount} repas={item.remaining} />
                </View>
              ))}
            </Reanimated.ScrollView>
          )}

          {allBalances && allBalances.length > 1 && (
            <View style={styles.dotsContainer}>
              {allBalances.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeIndex
                      ? { backgroundColor: colors.text }
                      : { backgroundColor: colors.text + "25" },
                  ]}
                />
              ))}
            </View>
          )}

          <HorizontalList style={styles.horizontalList}>
            <Item
              title="Historique"
              icon={<Clock2 color={colors.text} />}
              onPress={() => navigation.navigate("RestaurantHistory", { histories: allHistories ?? [] })}
              enable={allHistories?.length !== 0}
            />
            <Item
              title="QR-Code"
              icon={<QrCode color={colors.text} />}
              onPress={() => navigation.navigate("RestaurantQrCode", { QrCodes: allQRCodes ?? [] })}
              enable={allQRCodes?.length !== 0}
            />
          </HorizontalList>

          <View style={styles.calendarContainer}>
            <PapillonHeaderSelector loading={isMenuLoading} onPress={() => setShowDatePicker(true)}>
              <Reanimated.View layout={animPapillon(LinearTransition)}>
                <Reanimated.View
                  key={pickerDate.toLocaleDateString("fr-FR", { weekday: "short" })}
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(150)}
                >
                  <Reanimated.Text
                    style={[
                      styles.weekPickerText,
                      styles.weekPickerTextIntl,
                      { color: theme.colors.text },
                    ]}
                  >
                    {pickerDate.toLocaleDateString("fr-FR", { weekday: "long" })}
                  </Reanimated.Text>
                </Reanimated.View>
              </Reanimated.View>

              <AnimatedNumber
                value={pickerDate.getDate().toString()}
                style={[
                  styles.weekPickerText,
                  styles.weekPickerTextNbr,
                  { color: theme.colors.text },
                ]}
              />

              <Reanimated.Text
                style={[
                  styles.weekPickerText,
                  styles.weekPickerTextIntl,
                  { color: theme.colors.text },
                ]}
                layout={animPapillon(LinearTransition)}
              >
                {pickerDate.toLocaleDateString("fr-FR", { month: "long" })}
              </Reanimated.Text>
            </PapillonHeaderSelector>
          </View>

          {allBookings && allBookings.length > 0 && (allBookings?.some((terminal) => terminal.days.some((day) => day.date.toDateString() === pickerDate.toDateString())) ?? false) && (
            <>
              <NativeListHeader label={allBookings.length > 1 ? "Réservations disponibles" : "Réservation disponible"} />
              <NativeList>
                {allBookings.map((terminal, index) => (
                  <React.Fragment key={index}>
                    {terminal.days.map((bookingDay, dayIndex) =>
                      bookingDay.date.toDateString() === pickerDate.toDateString() ? (
                        <NativeItem
                          separator
                          disabled={!bookingDay.canBook || (allBalances?.every((balance) => balance.remaining === 0) ?? false)}
                          icon={<Utensils />}
                          key={dayIndex}
                          trailing={
                            <Switch
                              value={bookingDay.booked}
                              disabled={!bookingDay.canBook || (allBalances?.every((balance) => balance.remaining === 0) ?? false)}
                              onValueChange={() => handleBookTogglePress(terminal, bookingDay)}
                            />
                          }
                        >
                          <NativeText style={{ fontSize: 16, fontFamily: "semibold", color: theme.colors.text }}>
                            Réserver mon repas
                          </NativeText>
                          <NativeText variant="subtitle">Borne "{terminal.terminalLabel}"</NativeText>
                        </NativeItem>
                      ) : null
                    )}
                  </React.Fragment>
                ))}
              </NativeList>
            </>
          )}

          {isMenuLoading ? (
            <ActivityIndicator size="large" style={{ padding: 50 }} />
          ) : currentMenu?.lunch ? (
            <>
              <NativeListHeader label="Menus du jour" />
              <NativeList>
                {[
                  { title: "Entrée", items: currentMenu.lunch.entry },
                  { title: "Plat", items: currentMenu.lunch.main },
                  { title: "Fromage", items: currentMenu.lunch.fromage },
                  { title: "Dessert", items: currentMenu.lunch.dessert },
                  { title: "Boisson", items: currentMenu.lunch.drink },
                ].map(({ title, items }, index) =>
                  items && (
                    <NativeItem key={index}>
                      <NativeText variant="subtitle">{title}</NativeText>
                      {items.map((food, idx) => (
                        <NativeText key={idx} variant="title">
                          {food.name ?? ""}
                        </NativeText>
                      ))}
                    </NativeItem>
                  )
                )}
              </NativeList>
            </>
          ) : (
            <MissingItem
              emoji="❌"
              title="Aucun menu prévu"
              description={`Malheureusement, aucun menu n'est prévu pour le ${pickerDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}.`}
              entering={animPapillon(FadeInDown)}
              exiting={animPapillon(FadeOut)}
              style={{ marginTop: 16 }}
            />
          )}

          <LessonsDateModal
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            currentDate={pickerDate}
            onDateSelect={(date: Date) => {
              const newDate = new Date(date);
              newDate.setHours(0, 0, 0, 0);
              setPickerDate(newDate);
              updateDatePicker(newDate);
              setShowDatePicker(false);
            }}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  lottieIcon: {
    width: 26,
    height: 26,
  },
  headerTitleText: {
    fontFamily: "semibold",
    fontSize: 17.5,
  },
  headerRightButton: {
    padding: 6,
    borderRadius: 18,
    opacity: 0.6,
  },
  scrollViewContent: {
    padding: 16,
  },
  horizontalList: {
    marginTop: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: -10,
    gap: 10,
  },
  calendarButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  calendarTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
  },
  calendarText: {
    fontFamily: "semibold",
    fontSize: 17,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 14.5,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },
});

export default Menu;
