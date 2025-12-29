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
import { getSubjectName } from '@/utils/subjects/name';
import { getSubjectEmoji } from '@/utils/subjects/emoji';

import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const audioHit = require('@/assets/audio/wrapped_hit_3.mp3');
const audioRiser = require('@/assets/audio/wrapped_riser.mp3');


export const StepRoom = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  const { topRoom, topRoomCount } = useWrappedStats();

  const [step, setStep] = useState(-1);

  const hitPlayer = useAudioPlayer(audioHit);
  const riserPlayer = useAudioPlayer(audioRiser);

  const playHit = () => {
    hitPlayer.seekTo(0);
    hitPlayer.play();
  };

  const playRiser = () => {
    riserPlayer.seekTo(0);
    riserPlayer.play();
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (isCurrent) {
      setStep(-1);
      timers.push(setTimeout(() => setStep(0), 500));
      timers.push(setTimeout(() => playRiser(), 1200));
      timers.push(setTimeout(() => setStep(1), 3200));
      timers.push(setTimeout(() => playHit(), 3100));
    } else {
      setStep(-1);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [isCurrent]);


  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center', backgroundColor: "#00000075" }}>
      {isCurrent && (
        <>
          {step >= 0 && (
            <Stack animated layout={LinearTransition.springify().duration(1000)} gap={6} vAlign='center' hAlign='center' style={{ width: Dimensions.get('screen').width - 80, ...SHADOW_OVER_ANIMATED_BG }}>
              <Reanimated.View
                entering={FadeInDown.springify().duration(1000).delay(0)}
                exiting={FadeOutUp.springify()}
                layout={LinearTransition.springify()}
              >

                <Reanimated.View
                  entering={ZoomIn.springify().duration(2000).dampingRatio(0.4)}
                  exiting={FadeOut.duration(100)}
                >
                  <Papicons name="MapPin" size={48} color='white' />
                </Reanimated.View>
              </Reanimated.View>
              <Reanimated.View
                entering={FadeInDown.springify().duration(1000).delay(800)}
                exiting={FadeOutUp.springify()}
                layout={LinearTransition.springify()}
              >
                <Typography color='white' variant='h2' align='center'>
                  Et la salle ou tu aura été le plus souvent...
                </Typography>
              </Reanimated.View>

              {step >= 1 && (
                <Reanimated.View
                  entering={FadeInDown.springify().duration(1000).delay(0)}
                  exiting={FadeOutUp.springify()}
                  style={{ marginTop: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderColor: "white", borderWidth: 1 }}
                >
                  <Typography weight='bold' color='white' variant='h3' align='center'>
                    {topRoom}
                  </Typography>
                </Reanimated.View>
              )}

              {step >= 1 && (
                <Reanimated.View
                  entering={FadeInDown.springify().duration(1000).delay(300)}
                  exiting={FadeOutUp.springify()}
                >
                  <Typography color='white' variant='title' align='center'>
                    avec {topRoomCount} cours
                  </Typography>
                </Reanimated.View>
              )}

            </Stack>
          )}

        </>
      )}
    </View>
  );
};