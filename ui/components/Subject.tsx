import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Typography from "./Typography";
import Reanimated from "react-native-reanimated";
import { ListGradesLayoutTransition } from "@/app/(tabs)/grades";
import { useTheme } from "@react-navigation/native";
import Stack from "./Stack";

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
          <Typography variant="caption" weight="medium" color="secondary">
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
    padding: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderCurve: "continuous",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 1,
    elevation: 1,
  },
  emojiContainer: {
    width: 32,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

export default memo(Subject);