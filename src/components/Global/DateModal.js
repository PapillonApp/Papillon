import { useTheme } from "@react-navigation/native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonContextEnter, PapillonContextExit, } from "@/utils/ui/animations";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { dateToEpochWeekNumber, weekNumberToDateRange } from "@/utils/epochWeekNumber";
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
var DateModal = function (_a) {
    var showDatePicker = _a.showDatePicker, setShowDatePicker = _a.setShowDatePicker, onDateSelect = _a.onDateSelect, currentDate = _a.currentDate, isHomework = _a.isHomework;
    var _b = useTheme(), colors = _b.colors, dark = _b.dark;
    var insets = useSafeAreaInsets();
    var weekRange = isHomework
        ? weekNumberToDateRange(dateToEpochWeekNumber(currentDate))
        : null;
    var _c = weekRange !== null && weekRange !== void 0 ? weekRange : {
        start: new Date(currentDate),
        end: new Date(currentDate),
    }, startOfWeek = _c.start, endOfWeek = _c.end;
    var markedDates = React.useMemo(function () {
        var marks = {};
        if (isHomework && weekRange) {
            var current = new Date(startOfWeek);
            while (current <= endOfWeek) {
                var dateString = current.toISOString().split("T")[0];
                var verifyWeekRange = current.getTime() === startOfWeek.getTime() || current.getTime() === endOfWeek.getTime();
                marks[dateString] = {
                    startingDay: current.getTime() === startOfWeek.getTime(),
                    endingDay: current.getTime() === endOfWeek.getTime(),
                    color: verifyWeekRange ? colors.primary : colors.primary + "70",
                    textColor: "#fff",
                };
                current.setUTCDate(current.getUTCDate() + 1);
            }
        }
        else {
            var dateString = currentDate.toISOString().split("T")[0];
            marks[dateString] = {
                selected: true,
                disableTouchEvent: true,
                selectedColor: colors.primary,
                selectedTextColor: "#fff",
            };
        }
        return marks;
    }, [isHomework, weekRange, currentDate, colors]);
    return (<Modal transparent={true} visible={showDatePicker}>
      <Reanimated.View style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#00000099",
            paddingBottom: insets.bottom + 10,
        }} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
        <Pressable style={{
            width: "100%",
            flex: 1,
        }} onPress={function () { return setShowDatePicker(false); }}/>

        <Reanimated.View style={[
            {
                width: "90%",
                backgroundColor: colors.card,
                overflow: "hidden",
                borderRadius: 16,
                borderCurve: "continuous",
            },
        ]} entering={PapillonContextEnter} exiting={PapillonContextExit}>
          <View style={{
            flexDirection: "column",
            alignItems: "flex-start",
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor: colors.primary,
            gap: 2,
        }}>
            <Text style={{
            fontSize: 15,
            fontFamily: "medium",
            color: "#ffffff99",
        }}>
              Sélection de la {isHomework ? "semaine" : "date"}
            </Text>
            <Text style={{
            fontSize: 18,
            fontFamily: "semibold",
            color: "#fff",
        }}>
              {isHomework ? (<>
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
                </>) : (new Date(currentDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }))}
            </Text>

            <TouchableOpacity style={{
            position: "absolute",
            right: 12,
            top: 12,
            backgroundColor: "#ffffff39",
            opacity: 0.7,
            padding: 6,
            borderRadius: 50,
        }} onPress={function () { return setShowDatePicker(false); }}>
              <X size={20} strokeWidth={3} color="#fff"/>
            </TouchableOpacity>
          </View>

          <Calendar markingType={isHomework ? "period" : "dot"} current={currentDate.toISOString().split("T")[0]} onDayPress={function (day) {
            setShowDatePicker(false);
            var selectedDate = new Date(day.dateString);
            onDateSelect(selectedDate);
        }} markedDates={markedDates} theme={{
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
        }} firstDay={1}/>
        </Reanimated.View>
      </Reanimated.View>
    </Modal>);
};
export default DateModal;
