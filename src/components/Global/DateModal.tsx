import { useTheme } from "@react-navigation/native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

import { X } from "lucide-react-native";

import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PapillonContextEnter,
  PapillonContextExit,
} from "@/utils/ui/animations";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { dateToEpochWeekNumber, weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

interface DateModalProps {
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => unknown;
  onDateSelect: (date: Date | undefined) => unknown;
  currentDate: Date;
  isHomework: boolean;
}

const DateModal: React.FC<DateModalProps> = ({
  showDatePicker,
  setShowDatePicker,
  onDateSelect,
  currentDate,
  isHomework,
}) => {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  const weekRange = isHomework
    ? weekNumberToDateRange(dateToEpochWeekNumber(currentDate))
    : null;
  const { start: startOfWeek, end: endOfWeek } = weekRange ?? {
    start: new Date(currentDate),
    end: new Date(currentDate),
  };

  const markedDates = React.useMemo(() => {
    const marks: Record<string, MarkingProps> = {};

    if (isHomework && weekRange) {
      let current = new Date(startOfWeek);

      while (current <= endOfWeek) {
        const dateString = current.toISOString().split("T")[0];
        const verifyWeekRange = current.getTime() === startOfWeek.getTime() || current.getTime() === endOfWeek.getTime();

        marks[dateString] = {
          startingDay: current.getTime() === startOfWeek.getTime(),
          endingDay: current.getTime() === endOfWeek.getTime(),
          color: verifyWeekRange ? colors.primary : colors.primary + "70",
          textColor: "#fff",
        };
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      const dateString = currentDate.toISOString().split("T")[0];
      marks[dateString] = {
        selected: true,
        disableTouchEvent: true,
        selectedColor: colors.primary,
        selectedTextColor: "#fff",
      };
    }

    return marks;
  }, [isHomework, weekRange, currentDate, colors]);

  return (
    <Modal transparent={true} visible={showDatePicker}>
      <Reanimated.View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#00000099",
          paddingBottom: insets.bottom + 10,
        }}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Pressable
          style={{
            width: "100%",
            flex: 1,
          }}
          onPress={() => setShowDatePicker(false)}
        />

        <Reanimated.View
          style={[
            {
              width: "90%",
              backgroundColor: colors.card,
              overflow: "hidden",
              borderRadius: 16,
              borderCurve: "continuous",
            },
          ]}
          entering={PapillonContextEnter}
          exiting={PapillonContextExit}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              paddingHorizontal: 18,
              paddingVertical: 10,
              backgroundColor: colors.primary,
              gap: 2,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: "medium",
                color: "#ffffff99",
              }}
            >
              Sélection de la {isHomework ? "semaine" : "date"}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "semibold",
                color: "#fff",
              }}
            >
              {isHomework ? (
                <>
                  Du{" "}
                  {new Date(startOfWeek).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "2-digit",
                  })}{" "}
                  au{" "}
                  {new Date(endOfWeek).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "2-digit",
                  })}
                </>
              ) : (
                new Date(currentDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              )}
            </Text>

            <TouchableOpacity
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                backgroundColor: "#ffffff39",
                opacity: 0.7,
                padding: 6,
                borderRadius: 50,
              }}
              onPress={() => setShowDatePicker(false)}
            >
              <X size={20} strokeWidth={3} color="#fff" />
            </TouchableOpacity>
          </View>

          <Calendar
            markingType={isHomework ? "period" : "dot"}
            current={currentDate.toISOString().split("T")[0]}
            onDayPress={(day: { dateString: string | number | Date }) => {
              setShowDatePicker(false);
              const selectedDate = new Date(day.dateString);
              onDateSelect(selectedDate);
            }}
            markedDates={markedDates}
            theme={{
              textMonthFontWeight: "bold",
              textDayFontWeight: "500",
              textDayHeaderFontWeight: "500",
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.text,
              dayTextColor: colors.text,
              todayTextColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: "#fff",
              monthTextColor: colors.text,
              arrowColor: colors.primary,
              textDisabledColor: dark ? "#555" : "#ccc",
            }}
            firstDay={1}
          />
        </Reanimated.View>
      </Reanimated.View>
    </Modal>
  );
};

export default DateModal;
