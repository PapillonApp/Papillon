import React from "react";
import Typography from "./Typography";

import Reanimated from "react-native-reanimated";
import { ListGradesLayoutTransition } from "@/app/(tabs)/grades";
import { useTheme } from "@react-navigation/native";

export interface GradeProps {
  isLast?: boolean;
  title: string;
  date: number;
  score: number;
  outOf: number;
}

const Grade: React.FC<GradeProps> = ({
  isLast,
  title,
  date,
  score,
  outOf,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Reanimated.View
      layout={ListGradesLayoutTransition}
      style={[
        {
          padding: 10,
          borderWidth: 1,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderTopWidth: 0,
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,
          shadowOpacity: 1,
          elevation: 1,
        },
        isLast && {
          marginBottom: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderCurve: 'continuous',
        }
      ]}
    >
      <Typography variant="body2">
        {`${title} (${new Date(date).toLocaleDateString()}): ${score}/${outOf}`}
      </Typography>
    </Reanimated.View>
  );
}

export default React.memo(Grade);