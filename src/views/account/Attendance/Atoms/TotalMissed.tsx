import { View } from "react-native";

import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { leadingZero } from "@/utils/format/attendance_time";
import { animPapillon } from "@/utils/ui/animations";
import { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import AnimatedNumber from "@/components/Global/AnimatedNumber";

interface TotalMissedProps {
  totalMissed: {
    total: {
      hours: number;
      minutes: number;
    };
    unJustified: {
      hours: number;
      minutes: number;
    };
  };
}

const TotalMissed = ({ totalMissed }: TotalMissedProps) => {
  const theme = useTheme();

  return (
    <NativeList
      animated
      entering={animPapillon(FadeIn)}
      exiting={animPapillon(FadeOut)}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <View>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "flex-end",
            }}
          >
            <AnimatedNumber
              value={totalMissed.total.hours}
              style={{
                fontSize: 28,
                lineHeight: 28,
                fontFamily: "semibold",
              }}
            />
            <NativeText
              style={{
                fontSize: 18,
                lineHeight: 18,
                marginBottom: 1,
                color: theme.colors.text + "88",
              }}
            >
              h {leadingZero(totalMissed.total.minutes)}
            </NativeText>
          </View>
          <NativeText
            style={{
              color: theme.colors.text + "88",
            }}
          >
            manquées
          </NativeText>
        </View>
        <View
          style={{
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "flex-end",
            }}
          >
            <AnimatedNumber
              value={totalMissed.unJustified.hours}
              style={{
                fontSize: 28,
                lineHeight: 28,
                color: (totalMissed.unJustified.hours > 0) ? "#D10000" : theme.colors.text,
              }}
            />
            <NativeText
              style={{
                fontSize: 18,
                lineHeight: 18,
                marginBottom: 1,
                color: (totalMissed.unJustified.hours > 0) ? "#D10000" : theme.colors.text + "88",
              }}
            >
              h {leadingZero(totalMissed.unJustified.minutes)}
            </NativeText>
          </View>
          <NativeText
            style={{
              color: (totalMissed.unJustified.hours > 0) ? "#D10000" : theme.colors.text + "88",
            }}
          >
            injustifiées
          </NativeText>
        </View>
      </View>
    </NativeList>
  );
};

export default TotalMissed;