import { useTheme } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import * as Localization from "expo-localization";
import { t } from "i18next";
import { CheckCheck, CircleDashed, Sparkle } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text } from "react-native";
import Reanimated, {
  LayoutAnimationConfig,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut, PapillonZoomIn, PapillonZoomOut } from "../utils/Transition";
import { Dynamic } from "./Dynamic";
import Stack from "./Stack";
import Typography from "./Typography";
import Icon from "@/ui/components/Icon";
import SkeletonView from "@/ui/components/SkeletonView";
import { Papicons } from "@getpapillon/papicons";
import { Attachment } from "@/services/shared/attachment";
import { ScrollView } from "react-native-gesture-handler";
import HTMLTypography from "@/ui/components/HTMLTypography";
import { formatHTML } from "@/utils/format/html";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

interface TaskProps {
  title: string;
  description: string;
  fromCache?: boolean;
  color?: string;
  emoji?: string;
  subject?: string;
  date?: string | Date;
  progress?: number; // 0 to 1
  index?: number;
  attachments?: Attachment[];
  magic?: string; // For future use, if needed
  onPress?: () => void;
  onProgressChange?: (progress: number) => void;
  skeleton?: boolean;
}

const Task: React.FC<TaskProps> = ({
                                     title,
                                     description,
                                     fromCache,
                                     attachments,
                                     color = "#888888",
                                     emoji,
                                     subject,
                                     date,
                                     progress,
                                     index,
                                     magic,
                                     onPress = () => {
                                     },
                                     onProgressChange = () => {
                                     },
                                     skeleton = false,
                                   }) => {
  const theme = useTheme();
  const { colors } = theme;

  const backgroundStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderColor: colors.border,
  }), [colors.card, colors.border]);

  const [currentProgress, setCurrentProgress] = React.useState(() => progress);

  React.useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  const notStarted = currentProgress === 0;
  const completed = currentProgress === 1;

  const toggleProgress = useCallback(() => {
    const newProgress = currentProgress !== 1 ? 1 : 0;
    setCurrentProgress(newProgress);
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  }, [currentProgress, onProgressChange]);

  const resetProgress = useCallback(() => {
    if (onProgressChange) {
      onProgressChange(0);
    }
  }, []);

  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const currentDate = useMemo(() => {
    if (!date) {
      return undefined;
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return undefined;
    }
    return new Date(date);
  }, [date]);

  const animatedChipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isPressed ? 1.05 : 1, { duration: 150 }) },
        { translateY: withSpring(isHovered ? -4 : isPressed ? -2 : 0) },
      ],
      borderColor: completed ? color + "88" : isPressed ? colors.text + "40" : colors.text + "22",
    };
  }, [isPressed, colors.text]);

  return (
    <Reanimated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      layout={Animation(LinearTransition, "list")}
      style={{ overflow: "hidden" }}
    >
      {magic && (
        <Reanimated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 38 + 20,
            backgroundColor: skeleton ? colors.text + "10" : color + "33",
            zIndex: -1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderColor: skeleton ? colors.border : color + "33",
            borderWidth: 1,
          }}
          layout={Animation(LinearTransition, "list")}
        >
          <Reanimated.View
            style={{
              height: 38,
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingHorizontal: 16,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Icon size={14}
                  skeleton={skeleton}
            >
              <Sparkle fill={color}
                       stroke={color}
                       strokeWidth={2}
              />
            </Icon>
            <Typography color={color}
                        weight="semibold"
                        skeleton={skeleton}
                        skeletonWidth={200}
            >
              {magic}
            </Typography>
          </Reanimated.View>
        </Reanimated.View>
      )}
      <AnimatedPressable
        onPress={onPress}
        style={[
          styles.container,
          backgroundStyle,
          {
            transformOrigin: "center top",
            marginTop: magic ? 38 : 0,
            overflow: "hidden",
          },
        ]}
        onLayout={/*(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log(`Task size: ${width}x${height}`);
      }*/ undefined} // Uncomment to log size
        layout={Animation(LinearTransition, "list")}
      >

        <LayoutAnimationConfig skipEntering
                               skipExiting
        >
          <Stack direction="horizontal"
                 gap={8}
                 vAlign="start"
                 hAlign="center"
                 style={{ marginBottom: 10 }}
          >
            {emoji && (
              <>
                {skeleton ? (
                  <SkeletonView style={{ width: 26, height: 26, borderRadius: 80 }} />
                ) : (
                  <Stack backgroundColor={color + "32"}
                         inline
                         radius={80}
                         vAlign="center"
                         hAlign="center"
                         style={{ width: 26, height: 26 }}
                  >
                    <Text style={{ fontSize: 12 }}>
                      {emoji}
                    </Text>
                  </Stack>
                )}
              </>
            )}
            {subject && (
              <Typography variant="body1"
                          weight="semibold"
                          color={color}
                          style={{ flex: 1 }}
                          skeleton={skeleton}
                          skeletonWidth={150}
              >
                {subject}
              </Typography>
            )}
            {currentDate && (
              <Typography variant="body2"
                          weight="medium"
                          color="secondary"
                          skeleton={skeleton}
              >
                {currentDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </Typography>
            )}
          </Stack>
          {title && (
            <Typography variant="h5"
                        weight="bold"
                        style={{ marginBottom: 4, lineHeight: 24 }}
                        skeleton={skeleton}
                        skeletonWidth={250}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2"
                        color="secondary"
                        style={{ lineHeight: 20 }}
                        skeleton={skeleton}
                        skeletonLines={2}
                        skeletonWidth={230}
            >
              {formatHTML(description, true)}
            </Typography>
          )}
          <LinearGradient
            colors={[colors.card, colors.card + "00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 16,
              zIndex: 1,
            }}
          />
          <LinearGradient
            colors={[colors.card + "00", colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 16,
              zIndex: 1,
            }}
          />
          {attachments && attachments.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingTop: 15, gap: 5, flex: 1 }}
            >
              {fromCache ? (
                <AnimatedPressable
                  layout={Animation(LinearTransition, "list")}
                  style={[styles.chip, backgroundStyle]}
                >
                  <Icon size={20}
                        fill={"#D60046" + 80}
                        skeleton={skeleton}
                  >
                    <Papicons name={"Cross"} />
                  </Icon>
                  <Typography variant="body2"
                              color={"#D60046" + 80}
                              skeleton={skeleton}
                  >
                    Impossible de récupérer la pièce jointe
                  </Typography>
                </AnimatedPressable>
              ) : (
                <>
                  {
                    attachments.map(attachment => (
                      <AnimatedPressable
                        key={attachment.url}
                        layout={Animation(LinearTransition, "list")}
                        onPress={() => {
                          Linking.openURL(attachment.url);
                        }}
                        style={[styles.chip, backgroundStyle]}
                      >
                        <Icon size={20}
                              fill={colors.text}
                              skeleton={skeleton}
                        >
                          <Papicons name={"Paper"} />
                        </Icon>
                        <Typography variant="body2"
                                    color="text"
                                    skeleton={skeleton}
                        >
                          {attachment.name}
                        </Typography>
                      </AnimatedPressable>
                    ))
                  }
                </>
              )}
            </ScrollView>
          )}
          {(progress !== undefined || currentDate) && (
            <>
              <ScrollView horizontal
                          style={{ overflow: "visible" }}
                          showsHorizontalScrollIndicator={false}
              >
                <Stack style={{ marginTop: 12 }}
                       direction="horizontal"
                       gap={8}
                >
                  {progress !== undefined && (
                    <AnimatedPressable
                      onPressIn={() => setIsPressed(true)}
                      onPressOut={() => setIsPressed(false)}
                      onHoverIn={() => setIsHovered(true)}
                      onHoverOut={() => setIsHovered(false)}
                      disabled={fromCache}
                      onPress={toggleProgress}
                      layout={Animation(LinearTransition, "list")}
                      style={[styles.chip, backgroundStyle, completed && {
                        backgroundColor: color + "22",
                        borderColor: color,
                      }, animatedChipStyle]}
                      pointerEvents={skeleton ? "none" : "auto"}
                    >
                      {(notStarted || completed) && !skeleton && (
                        <Dynamic
                          animated
                          layout={Animation(LinearTransition, "list")}
                          entering={PapillonZoomIn}
                          exiting={PapillonZoomOut}
                          key={"progress-icon:" + (notStarted ? "a" : "b")}
                        >
                          {notStarted ? (
                            <CircleDashed size={20}
                                          strokeWidth={2.5}
                                          opacity={0.7}
                                          color={colors.text}
                            />
                          ) : (
                            <CheckCheck size={20}
                                        strokeWidth={2.5}
                                        opacity={1}
                                        color={color}
                            />
                          )}
                        </Dynamic>
                      )}

                      {!notStarted && !completed && !skeleton && (
                        <Dynamic animated>
                          <Reanimated.View
                            layout={Animation(LinearTransition, "list")}
                            style={[
                              styles.progressContainer,
                              { backgroundColor: colors.text + "12" },
                            ]}
                          >
                            <Reanimated.View
                              layout={Animation(LinearTransition, "list")}
                              style={[styles.progress, {
                                width: currentProgress * 70,
                                backgroundColor: color,
                              }]} // Use numeric width
                            />
                          </Reanimated.View>
                        </Dynamic>
                      )}

                      <Dynamic animated={true}
                               layout={Animation(LinearTransition, "list")}
                               key={"progress-text:" + currentProgress}
                      >
                        {!notStarted && !completed && (
                          <Typography variant="body2"
                                      skeleton={skeleton}
                                      skeletonWidth={80}
                          >
                            {Math.ceil(currentProgress * 100)}%
                          </Typography>
                        )}

                        {(notStarted || completed) && (
                          <Typography variant="body2"
                                      color={!notStarted ? color : "secondary"}
                                      skeleton={skeleton}
                                      skeletonWidth={80}
                          >
                            {notStarted ? t("Task_Start") : t("Task_Complete")}
                          </Typography>
                        )}
                      </Dynamic>
                    </AnimatedPressable>
                  )}

                  {currentDate && (
                    <AnimatedPressable
                      layout={Animation(LinearTransition, "list")}
                      style={[styles.chip, backgroundStyle]}
                    >
                      <Icon size={20}
                            fill={colors.text}
                            skeleton={skeleton}
                      >
                        <Papicons name={"Calendar"} />
                      </Icon>
                      <Typography variant="body2"
                                  color="text"
                                  skeleton={skeleton}
                      >
                        {formatDistanceToNow(currentDate, {
                          addSuffix: true,
                          locale: Localization.getLocales()[0].languageTag.split("-")[0] === "fr" ? fr : undefined,
                        })}
                      </Typography>
                    </AnimatedPressable>
                  )}
                </Stack>
              </ScrollView>
            </>
          )}
        </LayoutAnimationConfig>
      </AnimatedPressable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 24,
    borderCurve: "continuous",
    elevation: 1,
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
  progressContainer: {
    width: 70,
    height: 6,
    borderRadius: 40,
    justifyContent: "center",

  },
  progress: {
    height: 12,
    borderRadius: 40,
  },
});

export default Task;