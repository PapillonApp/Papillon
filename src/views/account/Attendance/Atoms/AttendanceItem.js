import { useState } from "react";
import { View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { FadeIn, FadeInUp, FadeOut, FadeOutDown } from "react-native-reanimated";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { leadingZero } from "@/utils/format/attendance_time";
import { animPapillon } from "@/utils/ui/animations";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { timestampToString } from "@/utils/format/DateHelper";
var NO_JUSTICATION = "Aucune description";
var AttendanceItem = function (_a) {
    var title = _a.title, icon = _a.icon, attendances = _a.attendances, missed = _a.missed;
    var theme = useTheme();
    var _b = useState(false), showMore = _b[0], setShowMore = _b[1];
    var sorted = attendances.sort(function (a, b) {
        if ("timestamp" in b && "timestamp" in a)
            return b.timestamp - a.timestamp;
        // Seulement le type `Absence` utilise `fromTimestamp`.
        // Tout les autres utilisent `timestamp`.
        return b.fromTimestamp - a.fromTimestamp;
    });
    return (<NativeList animated entering={animPapillon(FadeIn)} exiting={animPapillon(FadeOut)}>
      <NativeItem animated endPadding={16} icon={icon} trailing={<View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
            }}>
            {missed && (<NativeText variant="subtitle">
                {missed.hours + " h"} {leadingZero(missed.minutes)} min
              </NativeText>)}
          </View>}>
        <NativeText variant="overtitle">
          {title} ({sorted.length})
        </NativeText>
      </NativeItem>

      {sorted.slice(0, showMore ? sorted.length : 3).map(function (item, index) {
            var totalTime = "";
            if ("hours" in item) {
                var _a = item.hours.split("h").map(Number), hours = _a[0], minutes = _a[1];
                if (hours === 0) {
                    totalTime = "".concat(leadingZero(minutes), " min");
                }
                else {
                    totalTime = "".concat(hours, "h ").concat(leadingZero(minutes), "min");
                }
            }
            else if ("duration" in item) {
                totalTime = item.duration + " min";
            }
            var timestamp = "fromTimestamp" in item ? item.fromTimestamp : item.timestamp;
            var toTimestamp = "toTimestamp" in item ? item.toTimestamp : null;
            var not_justified = "justified" in item && !item.justified;
            var justification = "reasons" in item ? item.reasons || NO_JUSTICATION : "reason" in item ? item.reason.text : NO_JUSTICATION;
            var dateString = toTimestamp && new Date(timestamp).toLocaleDateString("fr-FR") === new Date(toTimestamp).toLocaleDateString("fr-FR")
                ? "le ".concat(new Date(timestamp).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                }), " de ").concat(new Date(timestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }), " \u00E0 ").concat(new Date(toTimestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }))
                : toTimestamp
                    ? "du ".concat(new Date(timestamp).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                        year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    }), " \u00E0 ").concat(new Date(timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }), "\nau ").concat(new Date(toTimestamp).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                        year: new Date(toTimestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    }), " \u00E0 ").concat(new Date(toTimestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }))
                    : "".concat(new Date(timestamp).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                        year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    }), " \u00E0 ").concat(new Date(timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }));
            return (<NativeItem key={timestamp} entering={animPapillon(FadeInUp).delay((showMore ? index - 3 : index) * 20 + 50)} exiting={animPapillon(FadeOutDown).delay(index * 20)} animated endPadding={16} trailing={<NativeText style={{
                        color: not_justified ? "#D10000" : theme.colors.text,
                        fontSize: 16,
                    }}>
                {totalTime}
              </NativeText>} separator>
            <NativeText variant="title">
              {justification}
            </NativeText>

            {not_justified ? (<NativeText variant="overtitle" style={{
                        color: "#D10000",
                    }}>
                Non justifié
              </NativeText>) : (<NativeText variant="overtitle" style={{
                        color: "#29947A",
                    }}>
                Justifié
              </NativeText>)}

            <NativeText variant="default">
              {timestampToString(timestamp)}
            </NativeText>
            <NativeText variant="subtitle">
              {dateString}
            </NativeText>
          </NativeItem>);
        })}

      {attendances.length > 3 && (<NativeItem animated icon={showMore ? <ChevronUp /> : <ChevronDown />} onPress={function () { return setShowMore(!showMore); }} chevron={false}>
          <NativeText variant="subtitle">
            Afficher {showMore ? "moins" : "plus"}
          </NativeText>
        </NativeItem>)}
    </NativeList>);
};
export default AttendanceItem;
