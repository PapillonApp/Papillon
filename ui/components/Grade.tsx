import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Typography from "./Typography";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import Stack from "./Stack";

const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);


export interface GradeProps {
  isLast?: boolean;
  title: string;
  date: number;
  score: number;
  outOf: number;
}

const Grade: React.FC<GradeProps> = React.memo(
  ({ isLast, title, date, score, outOf }) => {
    const theme = useTheme();
    const { colors } = theme;

    const formattedDate = useMemo(
      () => new Date(date).toLocaleDateString(),
      [date]
    );
    const formattedScore = useMemo(() => score.toFixed(2), [score]);

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
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
          lastItem: {
            marginBottom: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            borderCurve: "continuous",
          },
          stackPadding: {
            paddingHorizontal: 4,
          },
          flexContainer: {
            flex: 1,
          },
        }),
      [colors]
    );

    return (
      <Reanimated.View
        layout={ListGradesLayoutTransition}
        style={[styles.container, isLast && styles.lastItem]}
      >
        <Stack
          direction="horizontal"
          hAlign="center"
          vAlign="center"
          style={styles.stackPadding}
        >
          <Stack inline style={styles.flexContainer} gap={0}>
            <Typography variant="title">{title}</Typography>
            <Typography variant="caption" color="secondary">
              {formattedDate}
            </Typography>
          </Stack>
          <Stack
            direction="horizontal"
            hAlign="end"
            vAlign="end"
            inline
            gap={0}
          >
            <Typography variant="body1">{formattedScore}</Typography>
            <Typography variant="caption" color="secondary">
              /{outOf}
            </Typography>
          </Stack>
        </Stack>
      </Reanimated.View>
    );
  }
);

export default Grade;