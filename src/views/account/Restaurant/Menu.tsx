import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Text,
  Dimensions
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  AlertTriangle,
  BadgeX,
  ChefHat,
  CookingPot,
  MapPin,
  Plus,
  Sprout,
  Utensils,
} from "lucide-react-native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { balanceFromExternal } from "@/services/balance";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeIn, FadeInDown, FadeOut, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { reservationHistoryFromExternal } from "@/services/reservation-history";
import { qrcodeFromExternal } from "@/services/qrcode";
import { getMenu } from "@/services/menu";
import type { FoodAllergen, FoodLabel, Menu as PawnoteMenu } from "pawnote";
import { PapillonHeaderSelector } from "@/components/Global/PapillonModernHeader";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { LessonsDateModal } from "../Lessons/LessonsHeader";
import { BookingTerminal, BookingDay } from "@/services/shared/Booking";
import { bookDayFromExternal, getBookingsAvailableFromExternal } from "@/services/booking";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronLeft, ChevronRight} from "lucide-react-native";
import DrawableImportRestaurant from "@/components/Drawables/DrawableImportRestaurant";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Account, AccountService } from "@/stores/account/types";
import { Balance } from "@/services/shared/Balance";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import { STORE_THEMES, StoreTheme } from "./Cards/StoreThemes";
import MenuCard from "./Cards/Card";
import { useAlert } from "@/providers/AlertProvider";

export const formatCardIdentifier = (identifier: string, dots: number = 4, separator: string = " ") => {
  if(!identifier) {
    return "";
  }

  const visiblePart = identifier.slice(-4);
  const maskedPart = identifier.slice(-(4 + dots), -4).replace(/./g, "•");
  return maskedPart + separator + (visiblePart.match(/.{1,4}/g) ?? []).join(" ");
};

export interface ServiceCard {
  service: string | AccountService;
  account: Account | null;
  identifier: string;
  balance: never[] | Balance[];
  history: never[] | ReservationHistory[];
  cardnumber: string | Blob | null;
  // @ts-ignore
  theme: StoreTheme;
}

const Menu: Screen<"Menu"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { isOnline } = useOnlineStatus();

  const account = useCurrentAccount((store) => store.account);
  const linkedAccounts = useCurrentAccount((store) => store.linkedAccounts);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const currentDate = new Date();

  const [allBookings, setAllBookings] = useState<BookingTerminal[] | null>(null);
  const [currentMenu, setCurrentMenu] = useState<PawnoteMenu | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = React.useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [isMenuLoading, setMenuLoading] = useState(false);
  const [isInitialised, setIsInitialised] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [allCards, setAllCards] = useState<Array<ServiceCard> | null>(null);

  const { showAlert } = useAlert();

  const refreshData = async () => {
    setIsRefreshing(true);
    setRefreshCount(refreshCount + 1);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const onDatePickerSelect = async (date?: Date) => {
    if (!date) {
      return;
    }

    const newDate = new Date(date);

    newDate.setHours(0, 0, 0, 0);

    if (newDate.valueOf() === pickerDate.valueOf()) {
      return;
    }

    setPickerDate(newDate);

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

    const dailyMenu = account ? await getMenu(account, date).catch(() => null) : null;
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
      showAlert({
        title: "Erreur",
        message: "Une erreur est survenue lors de la réservation du repas",
        icon: <BadgeX />,
      });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const fetchCardsData = async () => {
    (async () => {
      try {
        const newCards: Array<ServiceCard> = [
          /* {
            service: 5,
            account: null,
            identifier: "123456789",
            balance: [{
              amount: 20.30
            }],
            history: [],
            cardnumber: null,
            theme: STORE_THEMES[1],
          } */
        ];
        const newBookings: BookingTerminal[] = [];

        const dailyMenu = account ? await getMenu(account, pickerDate).catch(() => null) : null;
        const accountPromises = linkedAccounts.map(async (account) => {
          try {
            if (!account || !account.service) {
              return;
            }

            const [balance, history, cardnumber, booking] = await Promise.all([
              balanceFromExternal(account, isRefreshing).catch(err => {
                console.warn(`Error fetching balance for account ${account}:`, err);
                return [];
              }),
              reservationHistoryFromExternal(account).catch(err => {
                console.warn(`Error fetching history for account ${account}:`, err);
                return [];
              }),
              qrcodeFromExternal(account).catch(err => {
                console.warn(`Error fetching QR code for account ${account}:`, err);
                return "0";
              }),
              getBookingsAvailableFromExternal(account, getWeekNumber(new Date()), isRefreshing).catch(err => {
                console.warn(`Error fetching bookings for account ${account}:`, err);
                return [];
              })
            ]);

            newBookings.push(...booking);

            const newCard: ServiceCard = {
              service: account.service,
              identifier: account.username,
              account: account,
              balance: balance,
              history: history,
              cardnumber: cardnumber,
              // @ts-ignore
              theme: STORE_THEMES.find((theme) => theme.id === AccountService[account.service]) ?? STORE_THEMES[0] as StoreTheme,
            };

            newCards.push(newCard);
          } catch (error) {
            setIsInitialised(true);
            console.warn(`An error occurred with account ${account}:`, error);
          }
        });

        await Promise.all(accountPromises);
        setAllCards(newCards);
        setAllBookings(newBookings);
        setCurrentMenu(dailyMenu);
        setIsInitialised(true);
        setIsRefreshing(false);
      } catch (error) {
        console.warn("An error occurred while fetching data:", error);
      }
    })();
  };

  useEffect(() => {
    fetchCardsData();
  }, [linkedAccounts, refreshCount]);

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "Assemblé sur place":
        return <CookingPot size={12} strokeWidth={3} color="#FFFFFF" />;
      case "Issu de l'Agriculture Biologique":
        return <Sprout size={12} strokeWidth={3} color="#FFFFFF" />;
      case "Fait maison - Recette du chef":
        return <ChefHat size={12} strokeWidth={3} color="#FFFFFF" />;
      case "Produits locaux":
        return <MapPin size={12} strokeWidth={3} color="#FFFFFF" />;
      default:
        return null;
    }
  };

  const getLabelName = (label: string) => {
    switch (label) {
      case "Assemblé sur place":
        return "Assemblé sur place";
      case "Issu de l'Agriculture Biologique":
        return "Agriculture Biologique";
      case "Fait maison - Recette du chef":
        return "Fait maison";
      case "Produits locaux":
        return "Produits locaux";
      default:
        return label;
    }
  };

  function renderAllergens (allergens: ReadonlyArray<FoodAllergen>) {
    if (allergens.length === 0) {
      return null;
    }

    return (
      <View style={styles.allergensContainer}>
        <AlertTriangle
          size={16}
          color={colors.text}
          opacity={0.6}
        />
        <NativeText variant="subtitle">
          Allergènes : {allergens.map(allergen => allergen.name).join(", ")}
        </NativeText>
      </View>
    );
  }

  function renderLabels (labels: ReadonlyArray<FoodLabel>) {
    if (labels.length === 0) {
      return null;
    }

    return (
      <View style={styles.labelsContainer}>
        {labels.map((label, k) => (
          <View key={"label-" + k} style={[styles.label, { backgroundColor: label.color ?? "#888888" }]}>
            {getLabelIcon(label.name)}
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>
              {getLabelName(label.name)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <>
      <PapillonHeader route={route} navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsHorizontalScrollIndicator={false}
        scrollIndicatorInsets={{ top: 42 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            progressViewOffset={120}
            onRefresh={() => {
              refreshData();
            }}
          />
        }
      >
        <PapillonHeaderInsetHeight route={route} />

        {!isOnline ? (
          <OfflineWarning cache={false} />
        ) : !isInitialised ? (
          <ActivityIndicator size="large" style={{ padding: 50 }} />
        ) : (
          <>

            {allCards?.length === 0 && !currentMenu && (
              <MissingItem
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
                leading={
                  <DrawableImportRestaurant
                    color={colors.primary}
                    style={{ marginBottom: 10 }}
                  />
                }
                title="Commence par connecter un service externe de cantine"
                description="Papillon te permet d’importer un compte depuis Turboself, ARD, Alize et Izly."
                entering={animPapillon(FadeInDown)}
                exiting={animPapillon(FadeOut)}
                trailing={
                  <ButtonCta
                    value="Ajouter un service"
                    primary
                    onPress={() => navigation.navigate("SettingStack", { view: "SettingsExternalServices" })}
                    style={{ marginTop: 16 }}
                  />
                }
              />
            )}

            <View style={{height: 16}} />

            {(allCards ?? [])?.length > 0 && (
              <ScrollView
                style={{
                  width: (Dimensions.get("window").width - 32),
                  overflow: "visible",
                  maxHeight: (Dimensions.get("window").width - 32) / 1.72
                }}
                contentContainerStyle={{
                  overflow: "visible",
                  gap: 6,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={(allCards ?? [])?.length > 1}
                decelerationRate={"fast"}
                snapToInterval={(Dimensions.get("window").width - 32) + 6}
              >
                {allCards?.map((card, index) => (
                  <Reanimated.View
                    key={index}
                    style={{
                      width: Dimensions.get("window").width - 32,
                    }}
                  >
                    <MenuCard
                      key={index}
                      card={card}
                      onPress={() => {
                        navigation.navigate("RestaurantCardDetail", { card });
                      }}
                    />
                  </Reanimated.View>
                ))}
              </ScrollView>
            )}

            {(currentMenu || (allBookings && allBookings?.some((terminal) => terminal.days.some((day) => day.date?.toDateString() === pickerDate.toDateString())))) &&
              <View style={styles.calendarContainer}>
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  entering={animPapillon(ZoomIn)}
                  exiting={animPapillon(ZoomOut)}
                >
                  <PressableScale
                    onPress={() => {
                      onDatePickerSelect(new Date(pickerDate.setDate(pickerDate.getDate() - 1)));
                      setRefreshCount(refreshCount + 1);
                    }}
                    activeScale={0.8}
                  >
                    <View
                      style={[styles.weekPickerText, {
                        backgroundColor: theme.colors.border,
                        padding: 8,
                        borderRadius: 100,
                      }]}
                    >
                      <ChevronLeft
                        size={24}
                        color={theme.colors.text}
                        strokeWidth={2.5}
                      />
                    </View>
                  </PressableScale>
                </Reanimated.View>
                <PapillonHeaderSelector loading={isMenuLoading} onPress={() => setShowDatePicker(true)}>
                  <Reanimated.View layout={animPapillon(LinearTransition)}>
                    <Reanimated.View
                      key={pickerDate.toLocaleDateString("fr-FR", { weekday: "short" })}
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(150)}
                    >
                      <Reanimated.Text style={[styles.weekPickerText, { color: theme.colors.text }]}>
                        {pickerDate.toLocaleDateString("fr-FR", { weekday: "long" })}
                      </Reanimated.Text>
                    </Reanimated.View>
                  </Reanimated.View>
                  <AnimatedNumber value={pickerDate.getDate().toString()} style={[styles.weekPickerText, { color: theme.colors.text }]} />
                  <Reanimated.Text style={[styles.weekPickerText, { color: theme.colors.text }]} layout={animPapillon(LinearTransition)}>
                    {pickerDate.toLocaleDateString("fr-FR", { month: "long" })}
                  </Reanimated.Text>
                </PapillonHeaderSelector>
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  entering={animPapillon(ZoomIn)}
                  exiting={animPapillon(ZoomOut)}
                >
                  <PressableScale
                    onPress={() => {
                      onDatePickerSelect(new Date(pickerDate.setDate(pickerDate.getDate() + 1)));
                      setRefreshCount(refreshCount + 1);
                    }}
                    activeScale={0.8}
                  >
                    <View
                      style={[styles.weekPickerText, {
                        backgroundColor: theme.colors.border,
                        padding: 8,
                        borderRadius: 100,
                      }]}
                    >
                      <ChevronRight
                        size={24}
                        color={theme.colors.text}
                        strokeWidth={2.5}
                      />
                    </View>
                  </PressableScale>
                </Reanimated.View>
              </View>
            }

            {allBookings && pickerDate.getTime() > currentDate.getTime() && allBookings.some((terminal) => terminal.days.some((day) => day.date?.toDateString() === pickerDate.toDateString())) && (
              <>
                <NativeListHeader label="Réservations disponibles" />
                <NativeList>
                  {allBookings.map((terminal, index) => (
                    <React.Fragment key={index}>
                      {terminal.days.map((bookingDay, dayIndex) =>
                        bookingDay.date?.toDateString() === pickerDate.toDateString() ? (
                          <NativeItem
                            separator
                            disabled={!bookingDay.canBook}
                            icon={<Utensils />}
                            key={dayIndex}
                            trailing={
                              <Switch
                                value={bookingDay.booked}
                                disabled={!bookingDay.canBook}
                                onValueChange={() => handleBookTogglePress(terminal, bookingDay)}
                              />
                            }
                          >
                            <NativeText style={{ fontSize: 16, fontFamily: "semibold", color: theme.colors.text }}>Réserver mon repas</NativeText>
                            <NativeText variant="subtitle">Borne "{terminal.terminalLabel}"</NativeText>
                          </NativeItem>
                        ) : null
                      )}
                    </React.Fragment>
                  ))}
                </NativeList>
              </>
            )}

            <View style={{ height: 16 }} />

            {currentMenu ?
              <>
                {isMenuLoading ? (
                  <ActivityIndicator size="large" style={{ padding: 50 }} />
                ) : currentMenu?.lunch || currentMenu?.dinner ? (
                  <>
                    {currentMenu?.lunch?.main && (
                      <>
                        <NativeListHeader label="Menu du jour" />
                        <NativeList>
                          {[
                            { title: "Entrée", items: currentMenu.lunch.entry },
                            { title: "Plat", items: currentMenu.lunch.main },
                            { title: "Accompagnement", items: currentMenu.lunch.side },
                            { title: "Fromage", items: currentMenu.lunch.fromage },
                            { title: "Dessert", items: currentMenu.lunch.dessert },
                            { title: "Boisson", items: currentMenu.lunch.drink },
                          ].map(({ title, items }, index) =>
                            items && (
                              <NativeItem key={index}>
                                <NativeText variant="subtitle">{title}</NativeText>
                                {items.map((food, idx) => (
                                  <React.Fragment key={idx}>
                                    <NativeText variant="title">
                                      {food.name ?? ""}
                                    </NativeText>
                                    {renderAllergens(food.allergens)}
                                    {renderLabels(food.labels)}
                                  </React.Fragment>
                                ))}
                              </NativeItem>
                            )
                          )}
                        </NativeList>
                      </>
                    )}
                    {currentMenu?.dinner?.main && (
                      <>
                        <NativeListHeader label="Menu du soir" />
                        <NativeList>
                          {[
                            { title: "Entrée", items: currentMenu.dinner.entry },
                            { title: "Plat", items: currentMenu.dinner.main },
                            { title: "Accompagnement", items: currentMenu.dinner.side },
                            { title: "Fromage", items: currentMenu.dinner.fromage },
                            { title: "Dessert", items: currentMenu.dinner.dessert },
                            { title: "Boisson", items: currentMenu.dinner.drink },
                          ].map(({ title, items }, index) =>
                            items && (
                              <NativeItem key={index}>
                                <NativeText variant="subtitle">{title}</NativeText>
                                {items.map((food, idx) => (
                                  <React.Fragment key={idx}>
                                    <NativeText variant="title">
                                      {food.name ?? ""}
                                    </NativeText>
                                    {renderAllergens(food.allergens)}
                                    {renderLabels(food.labels)}
                                  </React.Fragment>
                                ))}
                              </NativeItem>
                            )
                          )}
                        </NativeList>
                      </>
                    )}
                  </>
                ) : (
                  <MissingItem
                    emoji="🍽️"
                    title="Aucun menu prévu"
                    description={`Malheureusement, aucun menu n'est prévu pour le ${pickerDate.toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}.`}
                    entering={animPapillon(FadeInDown)}
                    exiting={animPapillon(FadeOut)}
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
              : <>
                {(allCards ?? []).length > 0 && (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <PressableScale
                      onPress={() => {
                        navigation.navigate("SettingStack", { view: "SettingsExternalServices" });
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        borderRadius: 100,
                        backgroundColor: theme.colors.text + "12",
                        borderColor: theme.colors.text + "40",
                        borderWidth: 0,
                      }}
                    >
                      <Plus size={20} strokeWidth={2.5} color={theme.colors.text} />
                      <NativeText>
                        Ajouter une carte
                      </NativeText>
                    </PressableScale>
                  </View>
                )}
              </>}
            <LessonsDateModal
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              currentDate={pickerDate}
              onDateSelect={onDatePickerSelect}
            />
          </>
        )}
        <InsetsBottomView />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: { padding: 16, flexGrow: 1 },
  accountButtonContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 },
  horizontalList: { marginTop: 10 },
  calendarContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16, marginBottom: -10, gap: 10 },
  weekPickerText: { zIndex: 10000, fontSize: 14.5, fontFamily: "medium", opacity: 0.7 },
  allergensContainer: { display: "flex", flexDirection: "row", alignItems: "center", gap: 5 },
  labelsContainer: { display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  label: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }
});

export default Menu;
