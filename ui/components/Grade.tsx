import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Typography from "./Typography";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import Stack from "./Stack";

const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);


export interface GradeProps {
  isFirst?: boolean;
  isLast?: boolean;
  title: string;
  date: number;
  score: number;
  outOf: number;
  color?: string; // Optional color prop for custom styling
}

const Grade: React.FC<GradeProps> = React.memo(
  ({ isFirst, isLast, title, date, score, outOf, color }) => {
    const theme = useTheme();
    const { colors } = theme;

    const formattedDate = useMemo(
      () => new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      [date]
    );
    const formattedScore = useMemo(() => score.toFixed(2), [score]);

    console.log("Rendering Grade:", title, isFirst, isLast);

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
            borderCurve: "continuous",
          },
          lastItem: {
            marginBottom: 16,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          },
          firstItem: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
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
        style={[styles.container, isLast && styles.lastItem, isFirst && styles.firstItem]}
      >
        <Stack
          direction="horizontal"
          hAlign="center"
          vAlign="center"
          style={styles.stackPadding}
        >
          <Stack inline style={styles.flexContainer} gap={0}>
            <Typography variant="title">{title}</Typography>
            <Typography variant="body2" color="secondary" inline style={{ marginTop: 2, marginBottom: 2 }}>
              {formattedDate}
            </Typography>
          </Stack>
          <Stack
            direction="horizontal"
            hAlign="end"
            vAlign="end"
            inline
            gap={1}
            backgroundColor={color + "33"}
            style={{
              marginTop: 2,
              paddingHorizontal: 10,
              paddingVertical: 0,
              borderRadius: 20,
            }}
          >
            <Typography variant="h5" color={color}>{formattedScore}</Typography>
            <Typography variant="caption" color={color} style={{ marginBottom: 4 }}>
              /{outOf}
            </Typography>
          </Stack>
        </Stack>
      </Reanimated.View>
    );
  }
);

export default Grade;