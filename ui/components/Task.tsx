import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Typography from './Typography';
import Stack from './Stack';

import Reanimated, { LinearTransition } from 'react-native-reanimated';
import { Animation } from '../utils/Animation';

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

  const backgroundStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
  };

  console.log("Task component rendered with progress:", progress);

  const notStarted = progress === 0;
  const completed = progress === 1;

  const changeProgress = () => {
    // change to random progress for demonstration
    const newProgress = Math.random();
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  };

  const resetProgress = () => {
    if (onProgressChange) {
      onProgressChange(0);
    }
  };

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
          {date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
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
          layout={Animation(LinearTransition)}
          style={[styles.chip, backgroundStyle]}
          onPress={changeProgress}
          onLongPress={resetProgress}
        >
          <Reanimated.View
            layout={Animation(LinearTransition)}
            style={[
              styles.progressContainer,
              { borderColor: colors.text + '55' },
              notStarted && styles.notStarted
            ]}>
            {!notStarted && !completed && (
              <Reanimated.View
                layout={Animation(LinearTransition)}
                style={[styles.progress, { width: Math.ceil(progress * 100), backgroundColor: color }]}
              />
            )}
          </Reanimated.View>

          {!notStarted && !completed && (
            <Typography variant='body2'>
              {Math.ceil(progress * 100)}%
            </Typography>
          )}

          {notStarted && (
            <Typography variant='body2' color='secondary'>
              Commencer
            </Typography>
          )}
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
  },
  progressContainer: {
    width: 100,
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
  notStarted: {
    width: 18,
    height: 18,
  }
});

export default Task;