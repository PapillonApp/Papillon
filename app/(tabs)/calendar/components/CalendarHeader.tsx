import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';
import { useTheme } from "expo-router/react-navigation";
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import * as WebBrowser from 'expo-web-browser';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import ChipButton from '@/ui/components/ChipButton';
import Calendar from "@/ui/components/Calendar";
import { useAlert } from '@/ui/components/AlertProvider';
import { getManager } from '@/services/shared';
import { error as logError } from '@/utils/logger/logger';
import i18n from '@/utils/i18n';

interface CalendarHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onHeaderHeightChange: (height: number) => void;
  calendarRef: any;
  isLoading?: boolean;
}

export const CalendarHeader = React.memo(({ date, onDateChange, onHeaderHeightChange, calendarRef, isLoading }: CalendarHeaderProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  const alert = useAlert();
  const [exporting, setExporting] = useState(false);

  const toggleDatePicker = () => {
    calendarRef.current?.toggle();
  };

  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const manager = getManager();
      if (!manager) {
        throw new Error("Compte non initialisé (réessaie après synchro)");
      }
      const raw = await manager?.getTimetablePdf(date);
      // Compat : anciennes versions renvoyaient un tableau (fetchData multiple).
      const url = Array.isArray(raw) ? raw.find(v => typeof v === "string" && v.trim().length > 0) : raw;
      if (!url || typeof url !== "string" || !/^https?:\/\//.test(url.trim())) {
        throw new Error("PDF indisponible (URL vide)");
      }
      await WebBrowser.openBrowserAsync(url.trim(), {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (e) {
      logError(String(e));
      alert.showAlert({
        title: "Export PDF impossible",
        message: "Impossible d'ouvrir l'emploi du temps en PDF. Réessaie.",
        description: "Impossible d'ouvrir l'emploi du temps en PDF. Réessaie.",
        icon: "Cross",
        color: "#D60046",
        delay: 3000,
      });
    } finally {
      setExporting(false);
    }
  }, [date, exporting, alert]);

  // know if date is today, yesterday, or tomorrow
  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = date.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  const isTomorrow = date.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  const subtitle = isToday ? t("Today") : isYesterday ? t("Yesterday") : isTomorrow ? t("Tomorrow") : "";

  return (
    <>
      <Calendar
        ref={calendarRef}
        date={date}
        onDateChange={onDateChange}
        color={"#D6502B"}
      />

      <TabHeader
        onHeightChanged={onHeaderHeightChange}
        title={
          <TabHeaderTitle
            leading={date.toLocaleDateString(i18n.language, { weekday: "long" })}
            number={date.toLocaleDateString(i18n.language, { day: "numeric" })}
            trailing={date.toLocaleDateString(i18n.language, { month: "long" })}
            subtitle={subtitle}
            color='#D6502B'
            height={56}
            onPress={() => toggleDatePicker()}
            loading={isLoading}
          />
        }
        trailing={
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <ChipButton
              single
              icon="paper"
              onPress={handleExportPdf}
            />
            <ChipButton
              icon="calendar"
              chevron
              actions={[
                {
                  id: 'manage_calendars',
                  title: "Calendriers Android",
                  subtitle: "Afficher les événements de l'appareil",
                  imageColor: colors.text,
                  image: Platform.select({
                    ios: 'calendar',
                    android: 'ic_menu_add',
                  }),
                }
              ]}
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'manage_calendars' || nativeEvent.event === 'manage_icals') {
                  router.push({
                    pathname: "/(tabs)/calendar/android-calendars" as any,
                    params: {}
                  });
                }
              }}
            />
          </View>
        }
      />
    </>
  );
});
