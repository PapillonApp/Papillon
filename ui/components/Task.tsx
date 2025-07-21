import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Typography from './Typography';
import Stack from './Stack';

import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { Animation } from '../utils/Animation';
import { Dynamic } from './Dynamic';
import { Calendar, CheckCheck, CircleDashed } from 'lucide-react-native';

import { format, formatDistance, formatDistanceToNow, formatRelative, subDays } from 'date-fns'
import { fr } from 'date-fns/locale';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

const Task = ({
  title = "Exercices",
  description = "Faire les exercices 1, 2 et 3 de la page 200 et voir les infos sur beaucoup d’infos il faut resumer",
  color = "#558000",
  emoji = "📚",
  subject = "Mathématiques",
  date = new Date(),
  progress = 0,
  onProgressChange,
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

  const changeProgress = useCallback(() => {
    // change to random progress for demonstration
    const newProgress = Math.random();
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  }, []);

  const resetProgress = useCallback(() => {
    if (onProgressChange) {
      onProgressChange(0);
    }
  }, []);

  return (
    <AnimatedPressable
      style={[
        styles.container,
        backgroundStyle,
      ]}
    >
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
          layout={Animation(LinearTransition, "list")}
          style={[styles.chip, backgroundStyle, completed && { backgroundColor: color + '22' }]}
          onPress={changeProgress}
          onLongPress={resetProgress}
        >
          {(notStarted || completed) && (
            <Dynamic animated layout={Animation(LinearTransition, "list")}>
              {notStarted ? (
                <CircleDashed size={20} strokeWidth={2.5} opacity={0.7} color={colors.text} />
              ) : (
                <CheckCheck size={20} strokeWidth={2.5} opacity={0.7} color={colors.text} />
              )}
            </Dynamic>
          )}

          {!notStarted && !completed && (
            <Dynamic animated>
              <Reanimated.View
                layout={Animation(LinearTransition, "list")}
                style={[
                  styles.progressContainer,
                  { borderColor: colors.text + '55' }
                ]}>
                <Reanimated.View
                  layout={Animation(LinearTransition, "list")}
                  style={[styles.progress, { width: (currentProgress * 100) + "%", backgroundColor: color }]}
                />
              </Reanimated.View>
            </Dynamic>
          )}

          <Dynamic animated layout={Animation(LinearTransition, "list")} key={'progress-text:' + currentProgress}>
            {!notStarted && !completed && (
              <Typography variant='body2'>
                {Math.ceil(currentProgress * 100)}%
              </Typography>
            )}

            {(notStarted || completed) && (
              <Typography variant='body2' color='secondary'>
                {notStarted ? "Commencer" : "Terminé"}
              </Typography>
            )}
          </Dynamic>
        </AnimatedPressable>

        <AnimatedPressable
          layout={Animation(LinearTransition, "list")}
          style={[styles.chip, backgroundStyle, completed && { backgroundColor: color + '22' }]}
          onPress={changeProgress}
          onLongPress={resetProgress}
        >
          <Calendar
            size={20}
            strokeWidth={2.5}
            color={colors.text}
          />
          <Typography variant='body2' color='text'>
            {formatDistanceToNow(date, {
              addSuffix: true,
              locale: fr,
            })}
          </Typography>
        </AnimatedPressable>
      </Stack>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    boxShadow: '0 0px 5px rgba(0,0,0,0.1)',
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  chip: {
    height: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    boxShadow: '0 0px 5px rgba(0,0,0,0.1)',
    borderRadius: 160,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  progressContainer: {
    width: 70,
    height: 18,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  progress: {
    height: '100%',
    borderRadius: 40,
  },
});

export default Task;