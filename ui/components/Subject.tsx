import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Typography from "./Typography";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import Stack from "./Stack";

const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);

export interface SubjectProps {
  color: string;
  emoji: string;
  name: string;
  average: number;
  outOf: number;
}

const Subject: React.FC<SubjectProps> = ({
  color,
  emoji,
  name,
  average,
  outOf
}) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Reanimated.View
      layout={ListGradesLayoutTransition}
      style={[styles.container, { backgroundColor: color }]}
    >
      <Stack direction="horizontal" hAlign="center" gap={12}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>
            {emoji}
          </Text>
        </View>

        <Typography variant="title" color="#fff" style={styles.flex1}>
          {name}
        </Typography>

        <Stack
          direction="horizontal"
          backgroundColor={colors.card}
          inline
          radius={120}
          gap={1}
          hAlign="end"
          style={styles.gradeContainer}
        >
          <Typography variant="body1" weight="bold" color={color}>
            {average.toFixed(2)}
          </Typography>
          <Typography variant="caption" weight="semibold" color="secondary" style={{ fontSize: 13, opacity: 0.8 }}>
            {`/${outOf}`}
          </Typography>
        </Stack>
      </Stack>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: "#00000022",
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 6,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderCurve: "continuous",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 1,
    elevation: 1,
    paddingBottom: 6 + 24,
    marginBottom: -24,
  },
  emojiContainer: {
    width: 34,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "#ffffff63",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 20,
  },
  flex1: {
    flex: 1,
  },
  gradeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default memo(Subject);