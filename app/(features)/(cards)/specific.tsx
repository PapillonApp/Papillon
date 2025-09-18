import { useCallback, useEffect, useState, useMemo } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Switch } from "react-native-gesture-handler";

import adjust from "@/utils/adjustColor";
import { getCodeType, getServiceColor } from "@/utils/services/helper";
import { warn } from "@/utils/logger/logger";
import { getWeekNumberFromDate } from "@/database/useHomework";

import { getManager } from "@/services/shared";
import { Balance } from "@/services/shared/balance";
import { BookingDay, CanteenHistoryItem } from "@/services/shared/canteen";

import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import List from "@/ui/components/List";
import Item, { Trailing } from "@/ui/components/Item";
import Calendar from "@/ui/components/Calendar";
import TableFlatList from "@/ui/components/TableFlatList";
import { Card } from "./cards";

import { Calendar as CalendarIcon, ChevronDown, Clock, Papicons, QrCode } from "@getpapillon/papicons";
import { useAlert } from "@/ui/components/AlertProvider";
import { Services } from "@/stores/account/types";
import { useTranslation } from "react-i18next";
import { Capabilities } from "@/services/shared/types";

export default function QRCodeAndCardsPage() {
  const alert = useAlert();
  const search = useLocalSearchParams();
  const serviceName = String(search.serviceName);
  const service = Number(search.service) as Services;
  const wallet = JSON.parse(String(search.wallet)) as Balance;

  const theme = useTheme();
  const { colors } = theme;
  const headerHeight = useHeaderHeight();

  const manager = getManager();
  const hasBookingCapacity = manager.clientHasCapatibility(Capabilities.CANTEEN_BOOKINGS, wallet.createdByAccount)

  const [history, setHistory] = useState<CanteenHistoryItem[]>([]);
  const [qrcode, setQR] = useState("");
  const [date, setDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(getWeekNumberFromDate(date));
  const [bookingWeek, setBookingWeek] = useState<BookingDay[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const bookingDay = useMemo(() => {
    const target = new Date(date);
    target.setUTCHours(0, 0, 0, 0);
    return bookingWeek.find(day => {
      const dayDate = new Date(day.date);
      dayDate.setUTCHours(0, 0, 0, 0);
      return dayDate.getTime() === target.getTime();
    });
  }, [date, bookingWeek]);

  const fetchQRCode = useCallback(async () => {
    try {
      const { data } = await manager.getCanteenQRCodes(wallet.createdByAccount);
      setQR(data);
    } catch (error) {
      warn(String(error));
    }
  }, [manager, wallet.createdByAccount]);

  const fetchHistory = useCallback(async () => {
    const history = await manager.getCanteenTransactionsHistory(wallet.createdByAccount);
    setHistory(history);
  }, [manager, wallet.createdByAccount]);

  const fetchBookingWeek = useCallback(async () => {
    const bookings = await manager.getCanteenBookingWeek(weekNumber, wallet.createdByAccount);
    setBookingWeek(bookings);
  }, [manager, weekNumber, wallet.createdByAccount]);

  useEffect(() => {
    fetchQRCode();
    fetchHistory();
  }, [fetchQRCode, fetchHistory]);

  useEffect(() => {
    fetchBookingWeek();
  }, [fetchBookingWeek]);

  const handleDateChange = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      const newWeek = getWeekNumberFromDate(newDate);
      if (newWeek !== weekNumber) setWeekNumber(newWeek);
      if (Platform.OS === "ios") setShowDatePicker(false);
    },
    [weekNumber]
  );

  const serviceColor = useMemo(() => adjust(getServiceColor(service), -0.1), [service]);

  const handleToggle = async (index: number) => {
    if (!bookingDay) return;
    const updatedBookingDay = { ...bookingDay };
    const item = updatedBookingDay.available[index];
    const previous = item.booked;
    item.booked = !previous;
    setBookingWeek(prev =>
      prev.map(day => (day.date === bookingDay.date ? updatedBookingDay : day))
    );

    try {
      await manager.setMealAsBooked(item);
    } catch (error) {
      alert.showAlert({
        title: "Erreur lors de la réservation",
        description: "Une erreur est survenue lors de la réservation de ton repas, il n'a donc pas été réservé.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: false
      });
      item.booked = previous;
      setBookingWeek(prev =>
        prev.map(day => (day.date === bookingDay.date ? updatedBookingDay : day))
      );
    }
  };

  const { t } = useTranslation();

  return (
    <>
      <Calendar
        key={`calendar-${date.toISOString()}`}
        date={date}
        onDateChange={handleDateChange}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

      <LinearGradient
        colors={[getServiceColor(service) + 40, colors.background, colors.background, colors.background]}
        locations={[0, 0.87]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView>
        <View style={{ padding: 15, paddingTop: headerHeight, flex: 1, gap: 20 }}>
          <Card index={0} service={service} wallet={wallet} disabled inSpecificView />

          {qrcode && (
            <AnimatedPressable
              onPress={() => router.push({ pathname: "/(features)/(cards)/qrcode", params: { qrcode, type: getCodeType(service), service } })}
              style={{
                width: "100%",
                backgroundColor: colors.background,
                padding: 33,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Stack direction="horizontal" hAlign="center" vAlign="center" gap={5}>
                <QrCode />
                <Typography variant="h6">Afficher le QR-Code</Typography>
              </Stack>
            </AnimatedPressable>
          )}

          <Stack card direction="horizontal" width="100%">
            <Stack
              width="50%"
              vAlign="center"
              hAlign="center"
              style={{ borderRightWidth: 1, borderRightColor: colors.border }}
              padding={12}
            >
              <Icon papicon opacity={0.5}>
                <Papicons name="PiggyBank" />
              </Icon>
              <Typography color="secondary">Solde</Typography>
              <ContainedNumber color={serviceColor}>
                {(wallet.amount / 100).toFixed(2)} {wallet.currency}
              </ContainedNumber>
            </Stack>

            <Stack width="50%" vAlign="center" hAlign="center" padding={12}>
              <Icon papicon opacity={0.5}>
                <Papicons name="Cutlery" />
              </Icon>
              <Typography color="secondary">Repas restants</Typography>
              <ContainedNumber color={serviceColor}>{wallet.lunchPrice > 0 ? String(Math.floor(wallet.amount / wallet.lunchPrice)) : "Indéterminé"}</ContainedNumber>
            </Stack>
          </Stack>

          {hasBookingCapacity && (
            <View>
              <AnimatedPressable onPress={() => setShowDatePicker(prev => !prev)}>
                <Stack hAlign="center" vAlign="center">
                  <Stack direction="horizontal" style={{ flex: 1 }} gap={5}>
                    <Icon papicon opacity={0.5}>
                      <CalendarIcon />
                    </Icon>
                    <Typography color="secondary">Réserver mon repas</Typography>
                  </Stack>
                  <Stack direction="horizontal" style={{ flex: 1 }} gap={5} hAlign="center" vAlign="center">
                    <Typography color="secondary">
                      {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </Typography>
                    <ChevronDown opacity={0.5} size={18} />
                  </Stack>
                </Stack>
              </AnimatedPressable>
              {bookingDay ? (
                <TableFlatList
                  sections={[
                    {
                      items: bookingDay.available.map((item, index) => ({
                        title: "Borne Self",
                        trailing: (
                          <Switch
                            disabled={!item.canBook || (wallet.lunchRemaining < 1 && wallet.lunchPrice !== 0)}
                            value={item.booked}
                            onValueChange={() => handleToggle(index)}
                          />
                        ),
                      })),
                    },
                  ]}
                />
              ) : (
                <Stack hAlign="center" vAlign="center" margin={16} gap={16}>
                  <View style={{ alignItems: "center" }}>
                    <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
                      <Papicons name="Card" />
                    </Icon>
                    <Typography variant="h4" color="text" align="center">
                      {t("Profile_Cards_No_Reservation")}
                    </Typography>
                    <Typography variant="body2" color="secondary" align="center">
                      {t("Profile_Cards_No_Available_Reservation")}
                    </Typography>
                  </View>
                </Stack>
              )}
            </View>
          )}



          {history.length > 0 && (
            <View style={{ display: "flex", gap: 13.5 }}>
              <Stack direction="horizontal" style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }} gap={5}>
                <Icon papicon opacity={0.5}>
                  <Clock />
                </Icon>
                <Typography color="secondary">{t("Profile_Cards_History")}</Typography>
              </Stack>
              <List>
                {history.slice(0, 10).map((c, index) =>
                  <Item key={`${c.label}-${c.date.getTime()}-${index}`}>
                    <Trailing>
                      <ContainedNumber color={adjust(c.amount < 0 ? "#C50000" : "#42C500", -0.1)}>
                        {c.amount > 0 ? "+" : ""}{(c.amount / 100).toFixed(2)} {c.currency}
                      </ContainedNumber>
                    </Trailing>
                    <Typography>{c.label}</Typography>
                    <Stack direction="horizontal" hAlign="center">
                      <Typography color="secondary">{c.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</Typography>
                      <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: colors.text + 80 }} />
                      <Typography color="secondary">
                        {c.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </Typography>
                    </Stack>
                  </Item>)}
              </List>
            </View>
          )}
        </View>
      </ScrollView>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => router.back()}>
          <Icon papicon opacity={0.5}>
            <Papicons name="Cross" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle>
        <Typography>{serviceName}</Typography>
      </NativeHeaderTitle>
    </>
  );
}
