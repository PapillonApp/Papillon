import { Papicons } from '@getpapillon/papicons';
import { CircularProgress } from '@/ui/components/CircularProgress';
import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, View, StyleSheet } from 'react-native';
import Reanimated, { FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

import Stack from '@/ui/components/Stack';
import Typography from "@/ui/components/Typography";
import adjust from '@/utils/adjustColor';

import { fetchHistory } from '../helpers/fetchHistory';
import { SHADOW_OVER_ANIMATED_BG } from '../_layout';
import AnimatedNumber from '@/ui/components/AnimatedNumber';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const audioDrumroll = require('@/assets/audio/wrapped_counter.mp3');
const audioHit = require('@/assets/audio/wrapped_hit.mp3');

export const Loading = ({ isCurrent, sliderRef, onFinished }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList>, onFinished?: () => void }) => {
  const { colors } = useTheme();
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("Démarrage...");
  const [animationKey, setAnimationKey] = useState(0);

  const drumrollPlayer = useAudioPlayer(audioDrumroll);
  const hitPlayer = useAudioPlayer(audioHit);

  const playDrumroll = () => {
    drumrollPlayer.seekTo(0);
    drumrollPlayer.loop = true;
    drumrollPlayer.play();
  };

  useEffect(() => {
    if (isCurrent) {
      playDrumroll();
    }
    else {
      drumrollPlayer.pause();
    }
  }, [isCurrent]);

  const playHit = () => {
    drumrollPlayer.pause();
    hitPlayer.seekTo(0);
    hitPlayer.play();
  };

  useEffect(() => {
    if (isCurrent) {
      fetchHistory();

      setProgress(0);
      setStepText("Démarrage...");
      setAnimationKey(prev => prev + 1);
      const startTime = Date.now();
      const duration = 10000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);

        setProgress(newProgress);

        if (newProgress < 30) {
          setStepText("Analyse de tes résultats...");
        } else if (newProgress < 60) {
          setStepText("Compilation des souvenirs...");
        } else if (newProgress < 90) {
          setStepText("Génération des statistiques...");
        } else {
          setStepText("Finitions...");
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setStepText("C'est prêt !");
          playHit();
          if (onFinished) onFinished();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isCurrent]);

  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000052' }}>
      {isCurrent && (
        <>
          <Reanimated.View
            entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(200)}
            exiting={FadeOut.duration(800)}
            style={{ alignItems: 'center', gap: 32, ...SHADOW_OVER_ANIMATED_BG }}
          >
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress
                key={animationKey}
                radius={80}
                strokeWidth={12}
                backgroundColor={adjust(colors.background, 0.1) + '20'}
                fill={adjust(colors.background, 0.1)}
                percentageComplete={progress}
              />
              {progress >= 100 && (
                <Reanimated.View
                  entering={ZoomIn.springify().dampingRatio(0.6)}
                  style={{ position: 'absolute' }}
                >
                  <Papicons name="Check" size={80} color={adjust(colors.background, 0.1)} />
                </Reanimated.View>
              )}
            </View>

            <Reanimated.View layout={LinearTransition.springify()} style={{ alignItems: 'center', gap: 8 }}>
              {progress < 100 && (
                <Reanimated.View
                  layout={LinearTransition.springify()}
                  style={{
                    width: 150,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  exiting={ZoomOut.duration(300)}>
                  <Typography variant="h1" style={{ fontSize: 48, lineHeight: 48, fontVariant: ['tabular-nums'] }} weight="semibold" align='center' color={adjust(colors.background, 0.1)}>
                    {progress.toFixed(0)}%
                  </Typography>
                </Reanimated.View>
              )}

              <Reanimated.View
                layout={LinearTransition.springify()}
                key={stepText + ":(as:stepText)"}
                entering={FadeInUp.springify()}
                exiting={FadeOutDown.springify()}
              >
                <Typography variant="title" align='center' color={adjust(colors.background, 0.3)} style={{ opacity: 1, minWidth: 250 }}>
                  {stepText}
                </Typography>
              </Reanimated.View>
            </Reanimated.View>
          </Reanimated.View>

          {progress >= 100 && (
            <Reanimated.View
              entering={ZoomIn.delay(400).springify().duration(800).dampingRatio(0.5)}
              style={{
                position: "absolute",
                bottom: 70,
                ...SHADOW_OVER_ANIMATED_BG
              }}
            >
              <Stack direction='horizontal' hAlign='center' gap={5}>
                <Papicons name='ArrowUp' color='white' />
                <Typography variant='h4' color='white'>Swipe pour découvrir</Typography>
              </Stack>
            </Reanimated.View>
          )}
        </>
      )}
    </View>
  );
};
