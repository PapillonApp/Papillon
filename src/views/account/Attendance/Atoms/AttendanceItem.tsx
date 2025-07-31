import { type ReactNode, useState } from "react";
import type { Attendance } from "@/services/shared/Attendance";
import type { Absence } from "@/services/shared/Absence";

import { View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { FadeIn, FadeInUp, FadeOut, FadeOutDown } from "react-native-reanimated";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { leadingZero } from "@/utils/format/attendance_time";
import { animPapillon } from "@/utils/ui/animations";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { timestampToString } from "@/utils/format/DateHelper";

interface AttendanceItemProps {
  title: string
  icon: ReactNode
  attendances: Attendance[keyof Attendance]
  missed?: { hours: number, minutes: number }
}

const NO_JUSTICATION = "Aucune description";

const AttendanceItem: React.FC<AttendanceItemProps> = ({
  title,
  icon,
  attendances,
  missed
}) => {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);

  const sorted = attendances.sort((a, b) => {
    if ("timestamp" in b && "timestamp" in a)
      return b.timestamp - a.timestamp;

    // Seulement le type `Absence` utilise `fromTimestamp`.
    // Tout les autres utilisent `timestamp`.
    return (b as Absence).fromTimestamp - (a as Absence).fromTimestamp;
  });

  return (
    <NativeList
      animated
      entering={animPapillon(FadeIn)}
      exiting={animPapillon(FadeOut)}
    >
      <NativeItem
        animated
        endPadding={16}
        icon={icon}
        trailing={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {missed && (
              <NativeText
                variant="subtitle"
              >
                {missed.hours + " h"} {leadingZero(missed.minutes)} min
              </NativeText>
            )}
          </View>
        }
      >
        <NativeText variant="overtitle">
          {title} ({sorted.length})
        </NativeText>
      </NativeItem>

      {sorted.slice(0, showMore ? sorted.length : 3).map((item, index) => {
        let totalTime = "";
        if ("hours" in item) {
          const [hours, minutes] = item.hours.split("h").map(Number);
          if (hours === 0) {
            totalTime = `${leadingZero(minutes)} min`;
          } else {
            totalTime = `${hours}h ${leadingZero(minutes)}min`;
          }
        }
        else if ("duration" in item) {
          totalTime = item.duration + " min";
        }

        const timestamp = "fromTimestamp" in item ? item.fromTimestamp : item.timestamp;
        const toTimestamp = "toTimestamp" in item ? item.toTimestamp : null;
        const not_justified = "justified" in item && !item.justified;
        const justification = "reasons" in item ? item.reasons || NO_JUSTICATION : "reason" in item ? item.reason.text : NO_JUSTICATION;
        const dateString = toTimestamp && new Date(timestamp).toLocaleDateString("fr-FR") === new Date(toTimestamp).toLocaleDateString("fr-FR")
          ? `le ${new Date(timestamp).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
          })} de ${new Date(timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })} à ${new Date(toTimestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
          : toTimestamp
            ? `du ${new Date(timestamp).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
            })} à ${new Date(timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}\nau ${new Date(toTimestamp).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: new Date(toTimestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
            })} à ${new Date(toTimestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
            : `${new Date(timestamp).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
            })} à ${new Date(timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

        return (
          <NativeItem
            key={timestamp}
            entering={animPapillon(FadeInUp).delay((showMore ? index - 3 : index) * 20 + 50)}
            exiting={animPapillon(FadeOutDown).delay(index * 20)}
            animated
            endPadding={16}
            trailing={
              <NativeText
                style={{
                  color: not_justified ? "#D10000" : theme.colors.text,
                  fontSize: 16,
                }}
              >
                {totalTime}
              </NativeText>
            }
            separator
          >
            <NativeText variant="title">
              {justification}
            </NativeText>

            {not_justified ? (
              <NativeText variant="overtitle" style={{
                color: "#D10000",
              }}>
                Non justifié
              </NativeText>
            ) : (
              <NativeText variant="overtitle" style={{
                color: "#29947A",
              }}>
                Justifié
              </NativeText>
            )}

            <NativeText variant="default">
              {timestampToString(timestamp)}
            </NativeText>
            <NativeText variant="subtitle">
              {dateString}
            </NativeText>
          </NativeItem>
        );
      })}

      {attendances.length > 3 && (
        <NativeItem
          animated
          icon={showMore ? <ChevronUp /> : <ChevronDown />}
          onPress={() => setShowMore(!showMore)}
          chevron={false}
        >
          <NativeText variant="subtitle">
            Afficher {showMore ? "moins" : "plus"}
          </NativeText>
        </NativeItem>
      )}
    </NativeList>
  );
};

export default AttendanceItem;
