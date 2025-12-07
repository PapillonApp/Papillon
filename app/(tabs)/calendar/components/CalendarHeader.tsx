import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import ChipButton from '@/ui/components/ChipButton';
import Calendar from "@/ui/components/Calendar";
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

  const toggleDatePicker = () => {
    calendarRef.current?.toggle();
  };

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
          <ChipButton
            icon="calendar"
            chevron
            actions={[
              {
                id: 'manage_icals',
                title: t("Tab_Calendar_Icals"),
                subtitle: t("Tab_Calendar_Icals_Description"),
                imageColor: colors.text,
                image: Platform.select({
                  ios: 'calendar',
                  android: 'ic_menu_add',
                }),
              }
            ]}
            onPressAction={({ nativeEvent }) => {
              if (nativeEvent.event === 'manage_icals') {
                router.push({
                  pathname: "./calendar/icals",
                  params: {}
                });
              }
            }}
          />
        }
      />
    </>
  );
});
