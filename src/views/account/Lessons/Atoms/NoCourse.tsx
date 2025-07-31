import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Calendar } from "lucide-react-native";
import { Platform, Text } from "react-native";

import Reanimated, {
  FadeIn,
  FadeOut
} from "react-native-reanimated";

const LessonsNoCourseItem = () => {
  const colors = useTheme().colors;

  return (
    <Reanimated.View
      entering={Platform.OS === "ios" ? FadeIn.springify().mass(1).damping(20).stiffness(300): undefined}
      exiting={Platform.OS === "ios" ? FadeOut.springify().mass(1).damping(20).stiffness(300): undefined}
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Calendar
        size={30}
        strokeWidth={1.7}
        color={colors.text}
      />

      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          textAlign: "center",
          fontFamily: "semibold",
          marginTop: 10,
        }}
      >
        Aucun cours ce jour
      </Text>

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          textAlign: "center",
          fontFamily: "medium",
          marginTop: 4,
          opacity: 0.5,
        }}
      >
        Profite bien de ta journée !
      </Text>
    </Reanimated.View>
  );
};

export default LessonsNoCourseItem;
