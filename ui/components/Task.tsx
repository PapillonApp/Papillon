import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Typography from './Typography';
import Stack from './Stack';
import * as Localization from "expo-localization";

import Reanimated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, LayoutAnimationConfig, LinearTransition, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Animation } from '../utils/Animation';
import { Dynamic } from './Dynamic';
import { Calendar, CheckCheck, CircleDashed } from 'lucide-react-native';

import { format, formatDistance, formatDistanceToNow, formatRelative, subDays } from 'date-fns'
import { fr } from 'date-fns/locale';
import { PapillonAppearIn, PapillonAppearOut, PapillonZoomIn, PapillonZoomOut } from '../utils/Transition';
import { t } from 'i18next';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

const Task = ({
  title = "Exercices",
  description = "Faire les exercices 1, 2 et 3 de la page 200 et voir les infos sur beaucoup d’infos il faut resumer",
  color = "#558000",
  emoji = "📚",
  subject = "Mathématiques",
  date = new Date(),
  progress = 0,
  index = undefined,
  onPress = () => { },
  onProgressChange = () => { },
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

  const screenWidth = Dimensions.get('window').width; // Get screen width for percentage calculation

  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const animatedChipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isPressed ? 1.05 : 1, { duration: 150 }) },
        { translateY: withSpring(isHovered ? -4 : isPressed ? -2 : 0) },
      ],
      boxShadow: isPressed ? '0px 2px 10px rgba(0, 0, 0, 0.24)' : '0px 0px 3px rgba(0, 0, 0, 0.22)',
      borderColor: completed ? color + "88" : isPressed ? colors.text + '40' : colors.text + '22',
    };
  }, [isPressed, colors.text]);

  return (
    <AnimatedPressable
      onPress={onPress}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      style={[
        styles.container,
        backgroundStyle,
        {
          transformOrigin: 'center top',
        }
      ]}
      onLayout={/*(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log(`Task size: ${width}x${height}`);
      }*/ undefined} // Uncomment to log size
      layout={Animation(LinearTransition, "list")}
    >

      <LayoutAnimationConfig skipEntering skipExiting>
        <Stack direction="horizontal" gap={8} vAlign="start" hAlign="center" style={{ marginBottom: 10 }}>
          <Stack backgroundColor={color + '32'} inline radius={80} vAlign="center" hAlign="center" style={{ width: 26, height: 26 }}>
            <Text style={{ fontSize: 12 }}>
              {emoji}
            </Text>
          </Stack>
          <Typography variant='body1' weight='semibold' color={color} style={{ flex: 1 }}>
            {subject}
          </Typography>
          <Typography variant='body2' weight='medium' color="secondary">
            {/*new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })*/}
          </Typography>
        </Stack>
        <Typography variant='h5' weight='bold' style={{ marginBottom: 4, lineHeight: 24 }}>
          {title}
        </Typography>
        <Typography variant='body1' color='secondary' style={{ lineHeight: 20 }}>
          {description}
        </Typography>
        <Stack style={{ marginTop: 12 }} direction="horizontal" gap={8}>
          <AnimatedPressable
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPress={toggleProgress}
            layout={Animation(LinearTransition, "list")}
            style={[styles.chip, backgroundStyle, completed && { backgroundColor: color + '22', borderColor: color }, animatedChipStyle]}
          >
            {(notStarted || completed) && (
              <Dynamic
                animated
                layout={Animation(LinearTransition, "list")}
                entering={PapillonZoomIn}
                exiting={PapillonZoomOut}
                key={'progress-icon:' + (notStarted ? "a" : "b")}
              >
                {notStarted ? (
                  <CircleDashed size={20} strokeWidth={2.5} opacity={0.7} color={colors.text} />
                ) : (
                  <CheckCheck size={20} strokeWidth={2.5} opacity={1} color={color} />
                )}
              </Dynamic>
            )}

            {!notStarted && !completed && (
              <Dynamic animated>
                <Reanimated.View
                  layout={Animation(LinearTransition, "list")}
                  style={[
                    styles.progressContainer,
                    { backgroundColor: colors.text + '12' }
                  ]}>
                  <Reanimated.View
                    layout={Animation(LinearTransition, "list")}
                    style={[styles.progress, { width: currentProgress * 70, backgroundColor: color }]} // Use numeric width
                  />
                </Reanimated.View>
              </Dynamic>
            )}

            <Dynamic animated={true} layout={Animation(LinearTransition, "list")} key={'progress-text:' + currentProgress}>
              {!notStarted && !completed && (
                <Typography variant='body2'>
                  {Math.ceil(currentProgress * 100)}%
                </Typography>
              )}

              {(notStarted || completed) && (
                <Typography variant='body2' color={!notStarted ? color : 'secondary'}>
                  {notStarted ? t('Task_Start') : t('Task_Complete')}
                </Typography>
              )}
            </Dynamic>
          </AnimatedPressable>

          <AnimatedPressable
            layout={Animation(LinearTransition, "list")}
            style={[styles.chip, backgroundStyle]}
          >
            <Calendar
              size={20}
              strokeWidth={2.5}
              color={colors.text}
            />
            <Typography variant='body2' color='text'>
              {formatDistanceToNow(date, {
                addSuffix: true,
                locale: Localization.getLocales()[0].languageTag.split("-")[0] === 'fr' ? fr : undefined,
              })}
            </Typography>
          </AnimatedPressable>
        </Stack>
      </LayoutAnimationConfig>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 16,
    borderCurve: 'continuous',
    elevation: 1,
  },
  chip: {
    height: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.22)',
    borderRadius: 160,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  progressContainer: {
    width: 70,
    height: 6,
    borderRadius: 40,
    justifyContent: 'center',

  },
  progress: {
    height: 12,
    borderRadius: 40,
  },
});

export default Task;