import { Check, Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import { CheckCheck } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Reanimated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Attachment } from "@/services/shared/attachment";
import Icon from "@/ui/components/Icon";
import SkeletonView from "@/ui/components/SkeletonView";
import { formatHTML } from "@/utils/format/html";

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Dynamic } from "./Dynamic";
import Stack from "./Stack";
import Typography from "./Typography";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

interface TaskProps {
  title: string;
  description: string;
  fromCache?: boolean;
  color?: string;
  emoji?: string;
  subject?: string;
  date?: string | Date;
  progress?: number;
  attachments?: Attachment[];
  onPress?: () => void;
  onProgressChange?: (progress: number) => void;
  skeleton?: boolean;
}

const TaskComponent: React.FC<TaskProps> = ({
  title,
  description,
  fromCache,
  attachments,
  color = "#888888",
  emoji,
  subject,
  date,
  progress,
  onPress = () => { /* empty */ },
  onProgressChange = () => { /* empty */ },
  skeleton = false,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const [currentProgress, setCurrentProgress] = useState(() => progress ?? 0);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (progress !== undefined) { setCurrentProgress(progress); }
  }, [progress]);

  const completed = currentProgress === 1;

  const toggleProgress = useCallback(() => {
    if (fromCache) { return; }
    const newProgress = currentProgress !== 1 ? 1 : 0;
    setCurrentProgress(newProgress);
    onProgressChange(newProgress);
  }, [currentProgress, onProgressChange, fromCache]);

  const formattedDate = useMemo(() => {
    if (!date) { return null; }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }, [date]);

  const containerStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderColor: colors.border,
  }), [colors.card, colors.border]);

  const animatedChipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isPressed ? 0.95 : 1, { duration: 50 }) },
        { translateY: withSpring(isHovered ? -2 : 0) },
      ],
      borderColor: completed ? color + "88" : colors.border,
      backgroundColor: completed ? color + "22" : "transparent",
    };
  }, [isPressed, isHovered, completed, color, colors.text, containerStyle]);

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.container, containerStyle]}
      layout={Animation(LinearTransition, "list")}
    >
      <LinearGradient
        colors={[color + "15", color + "00"]}
        locations={[0, 0.5]}
        style={StyleSheet.absoluteFill}
      />

      <LayoutAnimationConfig skipEntering skipExiting>
        <Stack style={styles.contentPadding}>

          <Stack direction="horizontal" gap={8} vAlign="start" hAlign="center" style={styles.headerContainer}>
            {emoji && (
              skeleton ? (
                <SkeletonView style={styles.emojiSkeleton} />
              ) : (
                <Stack backgroundColor={color + "32"} inline radius={80} vAlign="center" hAlign="center" style={styles.emojiContainer}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Stack>
              )
            )}

            {subject && (
              <Typography variant="body1" weight="semibold" color={color} style={{ flex: 1 }} skeleton={skeleton} skeletonWidth={150}>
                {subject}
              </Typography>
            )}

            {formattedDate && (
              <Typography variant="body2" weight="medium" color="secondary" skeleton={skeleton}>
                {formattedDate}
              </Typography>
            )}
          </Stack>

          {title && (
            <Typography variant="h5" weight="bold" style={styles.title} skeleton={skeleton} skeletonWidth={250}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="secondary" style={styles.description} skeleton={skeleton} skeletonLines={2} skeletonWidth={230}>
              {formatHTML(description, true)}
            </Typography>
          )}

          {attachments && attachments.length > 0 && (
            <View style={styles.attachmentWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentScrollContent}>
                {fromCache ? (
                  <AnimatedPressable layout={Animation(LinearTransition, "list")} style={[styles.chip, containerStyle]}>
                    <Icon size={20} fill={"#D60046" + 80} skeleton={skeleton}>
                      <Papicons name={"Cross"} />
                    </Icon>
                    <Typography variant="body2" color={"#D60046" + 80} skeleton={skeleton}>
                      Impossible de récupérer la pièce jointe
                    </Typography>
                  </AnimatedPressable>
                ) : (
                  attachments.map((attachment) => (
                    <AnimatedPressable
                      key={attachment.url}
                      layout={Animation(LinearTransition, "list")}
                      onPress={() => Linking.openURL(attachment.url)}
                      style={[styles.chip, containerStyle]}
                    >
                      <Icon size={20} fill={colors.text} skeleton={skeleton}>
                        <Papicons name={"Paper"} />
                      </Icon>
                      <Typography variant="body2" color="text" skeleton={skeleton}>
                        {attachment.name}
                      </Typography>
                    </AnimatedPressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {progress !== undefined && !skeleton && (
            <View style={styles.footerWrapper}>
              <AnimatedPressable
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                disabled={fromCache || skeleton}
                onPress={toggleProgress}
                layout={Animation(LinearTransition, "list")}
                style={[
                  styles.statusButton,
                  animatedChipStyle
                ]}
              >
                <Dynamic
                  animated
                  layout={Animation(LinearTransition, "list")}
                  entering={PapillonAppearIn}
                  exiting={PapillonAppearOut}
                  key={`icon-${completed}`}
                >
                  {completed ? (
                    <View style={{ paddingLeft: 12, paddingRight: 8 }}>
                      <Icon>
                        <CheckCheck size={20} strokeWidth={2.5} opacity={1} color={color} />
                      </Icon>
                    </View>
                  ) : (
                    <Check size={20} strokeWidth={2.5} opacity={0.5} color={colors.text} />
                  )}
                </Dynamic>

                {completed && (
                  <Reanimated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(100)}
                    style={styles.textContainer}
                  >
                    <Typography variant="body2" weight="semibold" color={color}>
                      {t("Task_Complete")}
                    </Typography>
                  </Reanimated.View>
                )}
              </AnimatedPressable>
            </View>
          )}

        </Stack>
      </LayoutAnimationConfig>
    </AnimatedPressable>
  );
};

const Task = React.memo(TaskComponent);
Task.displayName = "Task";

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 24,
    borderCurve: "continuous",
    elevation: 1,
    overflow: "hidden",
  },
  contentPadding: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 10,
  },
  emojiSkeleton: {
    width: 26,
    height: 26,
    borderRadius: 80
  },
  emojiContainer: {
    width: 26,
    height: 26
  },
  emojiText: {
    fontSize: 12
  },
  title: {
    marginBottom: 4,
    lineHeight: 24
  },
  description: {
    lineHeight: 20
  },
  attachmentWrapper: {
    position: 'relative',
    marginTop: 15,
    height: 42,
  },
  attachmentScrollContent: {
    gap: 5,
  },
  chip: {
    height: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 160,
    borderCurve: "continuous",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  footerWrapper: {
    marginTop: 12,
    width: '100%',
    alignItems: 'flex-end',
  },
  statusButton: {
    height: 42,
    minWidth: 42,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderRadius: 160,
    borderCurve: "continuous",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    overflow: "hidden",
  },
  textContainer: {
    marginLeft: 8,
    paddingRight: 16,
  }
});

export default Task;