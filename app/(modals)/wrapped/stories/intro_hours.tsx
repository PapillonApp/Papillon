import { useWrappedStats } from '@/database/useWrappedStats';
import AnimatedNumber from '@/ui/components/AnimatedNumber';
import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutUp, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { SHADOW_OVER_ANIMATED_BG } from '../_layout';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const audioDrumroll = require('@/assets/audio/wrapped_counter.mp3');
const audioHit = require('@/assets/audio/wrapped_hit_2.mp3');
const audioWhoosh = require('@/assets/audio/wrapped_whoosh.mp3');

export const IntroHours = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  const { totalHours } = useWrappedStats();

  const whooshPlayer = useAudioPlayer(audioWhoosh);
  const hitPlayer = useAudioPlayer(audioHit);

  const playWhoosh = () => {
    whooshPlayer.seekTo(0);
    whooshPlayer.volume = 0.5;
    whooshPlayer.play();
  };

  const playHit = () => {
    hitPlayer.seekTo(0);
    hitPlayer.play();
  };

  const [step, setStep] = useState(-1);

  const randStats = useMemo(() => [
    {
      number: Math.round(totalHours / 0.85),
      unit: "épisodes",
      description: "de Stranger Things",
      emoji: "🎞️"
    },
    {
      number: Math.round(totalHours / 0.25),
      unit: "parties",
      description: "de Fortnite",
      emoji: "🎮"
    },
    {
      number: Math.round(totalHours / 1.5),
      unit: "matchs",
      description: "de football",
      emoji: "⚽️"
    },
    {
      number: Math.round(totalHours / 4.5),
      unit: "trajets",
      description: "Paris - Lyon en TGV",
      emoji: "🚄"
    },
    {
      number: Math.round(totalHours / 4.7),
      unit: "marathons",
      description: "selon un adulte moyen",
      emoji: "🏃‍♂️"
    },
    {
      number: Math.round(totalHours / 0.01),
      unit: "vidéos",
      description: "sur TikTok",
      emoji: "🎥"
    },
    {
      number: Math.round(totalHours / 11.3),
      unit: "intégrales",
      description: "du Seigneur des Anneaux",
      emoji: "🎬"
    },
    {
      number: Math.round(totalHours / 0.1),
      unit: "oeufs",
      description: "à la coque parfaitement cuits",
      emoji: "🍳"
    },
    {
      number: Math.round(totalHours / 72),
      unit: "voyages",
      description: "aller-simple vers la Lune",
      emoji: "🌕"
    },
    {
      number: Math.round(totalHours / 24),
      unit: "vies",
      description: "de papillon",
      emoji: "🦋"
    },
    {
      number: Math.round(totalHours / 0.05),
      unit: "bols",
      description: "de nouilles instantanées",
      emoji: "🍜"
    }
  ], [totalHours]);

  const [randStat, setRandStat] = useState(Math.floor(Math.random() * randStats.length));

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    if (isCurrent) {
      setStep(-1);

      // Push each timeout into an array so we can clear them all
      timeouts.push(setTimeout(() => setStep(0), 500));
      timeouts.push(setTimeout(() => setStep(1), 3200));
      timeouts.push(setTimeout(() => playHit(), 4100));
      timeouts.push(setTimeout(() => setStep(2), 6000));
      timeouts.push(setTimeout(() => playWhoosh(), 7700));
      timeouts.push(setTimeout(() => playHit(), 8800));
      timeouts.push(setTimeout(() => setStep(3), 8000));
    } else {
      setStep(-1);
    }

    const interval = loopRandStats();

    // CLEANUP: This runs when isCurrent changes or component unmounts
    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(interval);
    };
  }, [isCurrent]);

  const loopRandStats = () => {
    return setInterval(() => {
      setRandStat((prev) => (prev + 1) % randStats.length);
    }, 3500);
  };

  useEffect(() => {
    const interval = loopRandStats();
    return () => clearInterval(interval);
  }, [isCurrent]);

  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center', backgroundColor: "#00000075" }}>
      {isCurrent && (
        <>
          {step === 0 && (
            <Reanimated.View
              entering={FadeInDown.springify().duration(1000).delay(500)}
              exiting={FadeOutUp.springify().duration(600)}
              style={{ ...SHADOW_OVER_ANIMATED_BG }}
            >
              <Stack gap={6} vAlign='center' hAlign='center' padding={40}>
                <Papicons name="clock" size={48} color='white' />
                <Typography color='white' variant='h3' align='center'>
                  On a passé pas mal de temps ensemble...
                </Typography>
              </Stack>
            </Reanimated.View>
          )}

          {step >= 1 && (
            <Stack animated layout={LinearTransition.springify().duration(1000)} gap={6} vAlign='center' hAlign='center' style={{ width: Dimensions.get('screen').width - 30, ...SHADOW_OVER_ANIMATED_BG }}>
              <Reanimated.View
                entering={FadeInDown.springify().duration(1000).delay(400)}
                exiting={FadeOutUp.springify()}
                layout={LinearTransition.springify()}
              >
                <Papicons name="clock" size={48} color='white' />
              </Reanimated.View>
              <Reanimated.View
                entering={FadeInDown.springify().duration(1000).delay(600)}
                exiting={FadeOutUp.springify()}
                layout={LinearTransition.springify()}
              >
                <Typography color='white' variant='h3' align='center'>
                  Et en cours, tu es resté
                </Typography>
              </Reanimated.View>

              <Reanimated.View
                entering={ZoomIn.springify().duration(1000).dampingRatio(0.5).delay(1200)}
                exiting={FadeOutUp.springify()}
                layout={LinearTransition.springify()}
              >
                <Stack gap={8} direction='horizontal' vAlign='center' hAlign='center'>
                  <AnimatedNumber color='white' variant='h1' style={{ fontSize: 48, lineHeight: 48 }}>
                    {totalHours.toFixed(0)}
                  </AnimatedNumber>
                  <Typography color='white' variant='h1'>
                    heures
                  </Typography>
                </Stack>
              </Reanimated.View>

              {step >= 2 && (
                <Reanimated.View
                  entering={FadeInDown.springify().duration(1000).delay(200)}
                  exiting={FadeOutUp.springify()}
                  style={{ marginTop: -2 }}
                >
                  <Typography color='white' variant='h4' align='center'>
                    Ça en fait, du temps !
                  </Typography>
                </Reanimated.View>
              )}

              {step >= 3 && (
                <Stack
                  style={{ marginTop: 56, width: "100%" }}
                  hAlign='center'
                  vAlign='center'
                >
                  <Reanimated.View
                    entering={FadeInDown.springify().duration(1000).delay(0)}
                    exiting={FadeOutUp.springify()}
                  >
                    <Reanimated.View
                      entering={ZoomIn.springify().duration(1000).dampingRatio(0.5)}
                      exiting={FadeOut.duration(100)}
                      key={randStat + ":(as:randstat-emoji)"}
                    >
                      <Text style={{ fontSize: 48 }}>
                        {randStats[randStat].emoji}
                      </Text>
                    </Reanimated.View>
                  </Reanimated.View>
                  <Reanimated.View
                    entering={FadeInDown.springify().duration(1000).delay(200)}
                    exiting={FadeOutUp.springify()}
                    style={{ marginTop: 3 }}
                  >
                    <Typography color='white' variant='h4' align='center'>
                      C'est comme
                    </Typography>
                  </Reanimated.View>
                  <Reanimated.View
                    entering={ZoomIn.springify().duration(1000).dampingRatio(0.5).delay(1000)}
                    exiting={FadeOutUp.springify()}
                    layout={LinearTransition.springify()}
                    style={{ width: "100%", marginTop: 3 }}
                    gap={2}
                  >
                    <Stack layout={LinearTransition.springify()} animated gap={7} direction='horizontal' vAlign='center' hAlign='center' style={{ width: "100%" }}>
                      {randStats[randStat].number > 0 ?
                        <AnimatedNumber color='white' variant='h1' style={{ fontSize: 48, lineHeight: 48 }}>
                          {randStats[randStat].number}
                        </AnimatedNumber>
                        :
                        <Typography color='white' variant='h1'>
                          Aucun(e)
                        </Typography>
                      }

                      <Dynamic animated layout={LinearTransition.springify()}>
                        <Reanimated.View
                          key={randStat + ":(as:randstat-unit)"}
                          entering={FadeIn.springify().duration(1000).delay(200)}
                          exiting={FadeOut.springify().duration(200)}
                        >
                          <Typography color='white' variant='h1'>
                            {randStats[randStat].unit}
                          </Typography>
                        </Reanimated.View>
                      </Dynamic>
                    </Stack>
                  </Reanimated.View>
                  <Reanimated.View
                    entering={FadeInDown.springify().duration(1000).delay(1500)}
                    style={{ width: "100%" }}
                  >
                    <Reanimated.View
                      entering={FadeInDown.springify().duration(1000)}
                      exiting={FadeOutUp.springify()}
                      key={randStat + ":(as:randstat)"}
                      style={{ width: "100%" }}
                    >
                      <Typography color='white' variant='h4' align='center'>
                        {randStats[randStat].description}
                      </Typography>
                    </Reanimated.View>
                  </Reanimated.View>
                </Stack>
              )}

            </Stack>
          )}

        </>
      )}
    </View>
  );
};