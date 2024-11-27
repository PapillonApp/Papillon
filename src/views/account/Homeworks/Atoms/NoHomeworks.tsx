import { useTheme } from "@react-navigation/native";
import { Calendar } from "lucide-react-native";
import { Platform, Text } from "react-native";

import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp
} from "react-native-reanimated";

const HomeworksNoHomeworksItem = () => {
  const colors = useTheme().colors;

  return (
    <Reanimated.View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
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
        Aucun devoir cette semaine
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

export default HomeworksNoHomeworksItem;