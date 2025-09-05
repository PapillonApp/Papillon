import { useTheme } from "@react-navigation/native";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";

import Stack from "./Stack";
import Typography from "./Typography";
import SkeletonView from "@/ui/components/SkeletonView";

const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);

export interface SubjectProps {
  color: string;
  emoji: string;
  name: string;
  average: number;
  disabled?: boolean;
  status?: string;
  outOf: number;
  skeleton?: boolean;
}

const Subject: React.FC<SubjectProps> = ({
  color,
  emoji,
  name,
  average,
  disabled = false,
  status,
  outOf,
  skeleton = false,
}) => {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      layout={ListGradesLayoutTransition}
      style={[styles.container, { backgroundColor: skeleton ? colors.text + "10" : color + 33 }]}
    >
      <Stack direction="horizontal" hAlign="center" gap={12}>
        {skeleton ? (
          <SkeletonView style={styles.emojiContainer} />
        ):(
          <View style={[styles.emojiContainer, { backgroundColor: color + 50 }]}>
            <Text style={styles.emoji}>
              {emoji}
            </Text>
          </View>
        )}
        <Typography nowrap variant="title" color={color} style={styles.flex1} skeleton={skeleton} skeletonWidth={120}>
          {name}
        </Typography>

        <Stack
          direction="horizontal"
          backgroundColor={skeleton ? colors.text + "05" : color + "25"}
          inline
          radius={120}
          gap={1}
          hAlign="end"
          style={styles.gradeContainer}
        >
          {skeleton ? (
            <Typography skeleton />
          ) : (
            <>
              <Typography variant="body1" weight="bold" color={color}>
                {disabled ? status : (average ?? 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" weight="semibold" color={color + "DF"} style={{ fontSize: 13, opacity: 0.8 }}>
                {`/${outOf}`}
              </Typography>
            </>
          )}
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
    padding: 7,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderCurve: "continuous",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 1,
    elevation: 1,
    paddingBottom: 7 + 24,
    marginBottom: -24,
  },
  emojiContainer: {
    width: 34,
    aspectRatio: 1,
    borderRadius: 20,
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