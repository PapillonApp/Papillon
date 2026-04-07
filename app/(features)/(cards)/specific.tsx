import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Switch } from "react-native-gesture-handler";

import adjust from "@/utils/adjustColor";
import {
  getCodeType,
  getServiceColor,
  getWalletDisplayAmount,
  isQRCodeOnlyWallet,
} from "@/utils/services/helper";
import { warn } from "@/utils/logger/logger";
import { getWeekNumberFromDate } from "@/database/useHomework";

import { getManager } from "@/services/shared";
import { Balance } from "@/services/shared/balance";
import { BookingDay, CanteenHistoryItem, CanteenKind } from "@/services/shared/canteen";

import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import List from "@/ui/components/List";
import Item, { Trailing } from "@/ui/components/Item";
import Calendar, { CalendarRef } from "@/ui/components/Calendar";
import { Card } from "./cards";

import { Calendar as CalendarIcon, ChevronDown, Clock, Papicons, QrCode } from "@getpapillon/papicons";
import { useAlert } from "@/ui/components/AlertProvider";
import { Services } from "@/stores/account/types";
import { useTranslation } from "react-i18next";
import { Capabilities } from "@/services/shared/types";
import i18n from "@/utils/i18n";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import ChipButton from "@/ui/components/ChipButton";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EDCanteenWeekDayStatus,
  getEDCanteenBadgeDetails,
} from "@/services/ecoledirecte/qrcode";
import { useAccountStore } from "@/stores/account";

export default function QRCodeAndCardsPage() {
  const alert = useAlert();
  const search = useLocalSearchParams();
  const serviceName = String(search.serviceName);
  const service = Number(search.service) as Services;
  const wallet = JSON.parse(String(search.wallet)) as Balance;
  const accounts = useAccountStore((state) => state.accounts);

  const theme = useTheme();
  const { colors } = theme;

  const manager = getManager();
  const hasBookingCapacity = manager?.clientHasCapatibility(Capabilities.CANTEEN_BOOKINGS, wallet.createdByAccount) ?? false;
  const hasQRCodeCapacity = manager?.clientHasCapatibility(Capabilities.CANTEEN_QRCODE, wallet.createdByAccount) ?? false;
  const hasHistoryCapacity = manager?.clientHasCapatibility(Capabilities.CANTEEN_HISTORY, wallet.createdByAccount) ?? false;
  const isQRCodeOnly = useMemo(
    () => isQRCodeOnlyWallet(service, wallet),
    [service, wallet]
  );

  const [history, setHistory] = useState<CanteenHistoryItem[]>([]);
  const [qrcode, setQR] = useState("");
  const [loadingQRCode, setLoadingQRCode] = useState(false);
  const [accountKind, setAccountKind] = useState<CanteenKind>(CanteenKind.ARGENT)
  const [date, setDate] = useState(new Date());
  const [weekNumber, setWeekNumber] = useState(getWeekNumberFromDate(date));
  const [bookingWeek, setBookingWeek] = useState<BookingDay[]>([]);
  const calendarRef = useRef<CalendarRef>(null);

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
    if (!hasQRCodeCapacity) {
      setQR("");
      setLoadingQRCode(false);
      return;
    }

    setLoadingQRCode(true);
    try {
      const { data } = await manager.getCanteenQRCodes(wallet.createdByAccount);
      setQR(data ?? "");
    } catch (error) {
      warn(String(error));
      setQR("");
    } finally {
      setLoadingQRCode(false);
    }
  }, [hasQRCodeCapacity, manager, wallet.createdByAccount]);

  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!hasHistoryCapacity) {
      setHistory([]);
      return;
    }

    setLoadingHistory(true);
    const history = await manager.getCanteenTransactionsHistory(wallet.createdByAccount);
    setHistory(history);
    setLoadingHistory(false);
  }, [hasHistoryCapacity, manager, wallet.createdByAccount]);

  const fetchBookingWeek = useCallback(async () => {
    if (!hasBookingCapacity) {
      setBookingWeek([]);
      return;
    }

    const bookings = await manager.getCanteenBookingWeek(weekNumber, wallet.createdByAccount);
    setBookingWeek(bookings);
  }, [hasBookingCapacity, manager, weekNumber, wallet.createdByAccount]);

  const fetchKind = useCallback(async () => {
    if (!hasBookingCapacity) {
      return;
    }

    const kind = await manager.getCanteenKind(wallet.createdByAccount);
    setAccountKind(kind);
  }, [hasBookingCapacity, manager, wallet.createdByAccount]);

  useEffect(() => {
    fetchQRCode();
    fetchHistory();
    fetchKind();
  }, [fetchQRCode, fetchHistory, fetchKind]);

  useEffect(() => {
    fetchBookingWeek();
  }, [fetchBookingWeek]);

  const handleDateChange = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      const newWeek = getWeekNumberFromDate(newDate);
      if (newWeek !== weekNumber) setWeekNumber(newWeek);
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
        icon: "AlertTriangle",
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
  const insets = useSafeAreaInsets();

  const [headerHeight, setHeaderHeight] = useState(insets.top + 66);
  const serviceAccount = useMemo(
    () =>
      accounts
        .flatMap((account) => account.services)
        .find((entry) => entry.id === wallet.createdByAccount),
    [accounts, wallet.createdByAccount]
  );
  const edBadgeDetails = useMemo(
    () =>
      service === Services.ECOLEDIRECTE
        ? getEDCanteenBadgeDetails(serviceAccount?.auth.additionals)
        : null,
    [service, serviceAccount?.auth.additionals]
  );

  return (
    <>
      <Calendar
        ref={calendarRef}
        key={`calendar-${date.toISOString()}`}
        date={date}
        onDateChange={handleDateChange}
      />

      <LinearGradient
        colors={[getServiceColor(service) + 40, colors.background, colors.background, colors.background]}
        locations={[0, 0.87]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <TabHeader
        modal
        onHeightChanged={setHeaderHeight}
        title={
          <TabHeaderTitle
            chevron={false}
            leading={serviceName}
            subtitle={getWalletDisplayAmount(wallet, service)}
          />
        }
        trailing={
          <ChipButton
            single
            icon="cross"
            onPress={() => {
              router.dismiss();
            }}
          />
        }
      />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingTop: headerHeight - 12 }}>
        <View style={{ padding: 15, flex: 1, gap: 20 }}>
          <Card index={0} service={service} wallet={wallet} disabled inSpecificView />

          {hasQRCodeCapacity && (
            <AnimatedPressable
              onPress={() => {
                if (!qrcode || loadingQRCode) {
                  return;
                }

                router.push({
                  pathname: "/(features)/(cards)/qrcode",
                  params: {
                    qrcode,
                    type: getCodeType(service),
                    service,
                    clientId: wallet.createdByAccount,
                  }
                })
              }}
              disabled={!qrcode || loadingQRCode}
              style={{
                width: "100%",
                backgroundColor: colors.background,
                paddingVertical: 18,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: qrcode && !loadingQRCode ? 1 : 0.75,
              }}
            >
              <Stack direction="horizontal" hAlign="center" vAlign="center" gap={10}>
                <QrCode color={getServiceColor(service)} />
                <Typography variant="h6">
                  {loadingQRCode ? "Chargement du QR-Code..." : "Afficher le QR-Code"}
                </Typography>
                {loadingQRCode && <ActivityIndicator size={16} />}
              </Stack>
            </AnimatedPressable>
          )}

          {isQRCodeOnly ? (
            <Stack card padding={16} gap={10}>
              <Stack direction="horizontal" gap={8} hAlign="center">
                <Icon papicon opacity={0.6}>
                  <Papicons name="Card" />
                </Icon>
                <Typography variant="title">Badge cantine ED</Typography>
              </Stack>
              <Typography color="secondary">
                Cet etablissement expose uniquement un badge/code-barres via EcoleDirecte. Aucun solde ni historique monetaire n'est disponible.
              </Typography>
              {edBadgeDetails?.regime && (
                <Item>
                  <Typography>Regime</Typography>
                  <Trailing style={{ flexShrink: 1, maxWidth: "68%" }}>
                    <Typography variant="body2" color="secondary" align="right">
                      {edBadgeDetails.regime}
                    </Typography>
                  </Trailing>
                </Item>
              )}
              {edBadgeDetails?.hasSchedule && (
                <Stack gap={12} style={{ marginTop: 4 }}>
                  <WeekTypeRow
                    title="Midi (semaine type)"
                    days={edBadgeDetails.lunch}
                    accentColor={serviceColor}
                    colors={colors}
                  />
                  <WeekTypeRow
                    title="Soir (semaine type)"
                    days={edBadgeDetails.dinner}
                    accentColor={serviceColor}
                    colors={colors}
                  />
                </Stack>
              )}
            </Stack>
          ) : (
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
          )}

          {hasBookingCapacity && (
            <View>
              <AnimatedPressable onPress={() => calendarRef.current?.toggle()}>
                <Stack hAlign="center" vAlign="center" style={{ padding: 20 }}>
                  <Stack direction="horizontal" gap={5}>
                    <Typography color="secondary">Réserver mon repas</Typography>
                  </Stack>
                  <Stack direction="horizontal" gap={5} hAlign="center" vAlign="center">
                    <Typography color="secondary">
                      {date.toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" })}
                    </Typography>
                    <ChevronDown opacity={0.5} size={18} />
                  </Stack>
                  {bookingDay ? (
                    <List style={{ marginTop: 10 }}>
                      {bookingDay.available.map((item, index) => (
                        <Item key={item.label}>
                          <Typography>
                            Borne {item.label}
                          </Typography>
                          <Trailing>
                            <Switch
                              disabled={accountKind === CanteenKind.FORFAIT ? false : !item.canBook || (wallet.lunchRemaining < 1 && wallet.lunchPrice !== 0)}
                              value={item.booked}
                              onValueChange={() => handleToggle(index)}
                            />
                          </Trailing>
                        </Item>
                      ))}
                    </List>
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
                </Stack>
              </AnimatedPressable>
            </View>
          )}

          {hasHistoryCapacity && loadingHistory && history.length === 0 && (
            <Stack padding={20} hAlign="center" vAlign="center" gap={4}>
              <ActivityIndicator size={42} />
              <Typography align="center" variant="title" color="text" style={{ marginTop: 8 }}>
                {t("Profile_Cards_Loading_History")}
              </Typography>
              <Typography align="center" variant="body2" color="secondary">
                {t("Profile_Cards_Loading_History_Description")}
              </Typography>
            </Stack>
          )}

          {hasHistoryCapacity && history.length > 0 && (
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
                      <Typography color="secondary">{c.date.toLocaleDateString(i18n.language, { day: "2-digit", month: "2-digit", year: "numeric" })}</Typography>
                      <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: colors.text + 80 }} />
                      <Typography color="secondary">
                        {c.date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </Typography>
                    </Stack>
                  </Item>)}
              </List>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function WeekTypeRow({
  title,
  days,
  accentColor,
  colors,
}: {
  title: string;
  days: EDCanteenWeekDayStatus[];
  accentColor: string;
  colors: {
    border: string;
    text: string;
  };
}) {
  return (
    <Stack gap={10} style={{ width: "100%" }}>
      <Typography color="secondary">{title}</Typography>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        {days.map((day, index) => (
          <View
            key={`${title}-${day.label}-${index}`}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: "center",
              gap: 8,
            }}
          >
            <Typography variant="body2" color="secondary">
              {day.label}
            </Typography>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: day.enabled ? `${accentColor}22` : colors.border,
              }}
            >
              <Papicons
                name={day.enabled ? "Check" : "Cross"}
                size={18}
                color={day.enabled ? accentColor : `${colors.text}80`}
              />
            </View>
          </View>
        ))}
      </View>
    </Stack>
  );
}
