import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Reanimated, { Easing, LinearTransition } from "react-native-reanimated";

import Stack from "./Stack";
import Typography from "./Typography";

const ListGradesLayoutTransition = LinearTransition.easing(Easing.inOut(Easing.circle)).duration(300);


export interface GradeProps {
  isFirst?: boolean;
  isLast?: boolean;
  title: string;
  date: number;
  score: number;
  outOf: number;
  disabled?: boolean;
  status?: string;
  color?: string; // Optional color prop for custom styling
  onPress?: () => void;
  skeleton?: boolean;
}

const Grade: React.FC<GradeProps> = React.memo(
  ({ isFirst, isLast, title, date, score, outOf, color, disabled, status, onPress, skeleton = false }) => {
    const theme = useTheme();
    const { colors } = theme;

    const formattedDate = useMemo(
      () => new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      [date],
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
            borderCurve: "continuous",
          },
          lastItem: {
            marginBottom: 16,
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
          },
          firstItem: {
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          },
          stackPadding: {
            paddingHorizontal: 4,
          },
          flexContainer: {
            flex: 1,
          },
        }),
      [colors],
    );

    const [isPressed, setIsPressed] = useState(false);

    return (
      <Reanimated.View
        layout={ListGradesLayoutTransition}
      >
        <Pressable
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
        >
          <Reanimated.View
            style={[styles.container, isLast && styles.lastItem, isFirst && styles.firstItem]}
          >
            {isPressed && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#00000020",
                  zIndex: 1,
                  borderTopLeftRadius: isFirst ? 22 : 0,
                  borderTopRightRadius: isFirst ? 22 : 0,
                  borderBottomLeftRadius: isLast ? 22 : 0,
                  borderBottomRightRadius: isLast ? 22 : 0,
                }}
              />
            )}

            <Stack
              direction="horizontal"
              hAlign="center"
              vAlign="center"
              style={styles.stackPadding}
            >
              <Stack inline
                     style={styles.flexContainer}
                     gap={0}
              >
                <Typography
                  variant="title"
                  skeleton={skeleton}
                  skeletonWidth={150}
                  numberOfLines={2}
                  style={{ lineHeight: 20 }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body2"
                  color="secondary"
                  inline
                  style={{ marginTop: skeleton ? 0 : 2, marginBottom: skeleton ? 0 : 2 }}
                  skeleton={skeleton}
                  skeletonWidth={100}
                  nowrap
                >
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
                {skeleton ? (
                  <Typography
                    variant="h5"
                    skeleton
                  />
                ) : (
                  <>
                    <Typography
                      variant="h5"
                      color={color}
                    >
                      {disabled ? status : formattedScore}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={color}
                      style={{ marginBottom: 4 }}
                    >
                      /{outOf}
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
          </Reanimated.View>
        </Pressable>
      </Reanimated.View>
    );
  },
);

export default Grade;