import React, { useEffect } from 'react';
import { Image, View } from 'react-native';

import { VideoSource, useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from "expo";
import Stack from '@/ui/components/Stack';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { useNavigation } from 'expo-router';

const assetId = require('@/assets/video/wrapped.mp4');

const videoSource: VideoSource = {
  assetId
};

const WrappedBanner = () => {
  const navigation = useNavigation();

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  const { isPlaying, oldIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (!isPlaying) {
      player.play();
    }
  }, [isPlaying]);

  return (
    <AnimatedPressable
      onPress={() => navigation.navigate('(modals)/wrapped')}
    >
      <View
        style={{
          marginTop: 12,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <VideoView
          player={player}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 20,
            borderColor: '#00000030',
            borderWidth: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
          contentFit="cover"
          nativeControls={false}
        />

        <Image
          source={require('@/assets/images/monYearbook.png')}
          style={{
            height: 120,
            width: 180,
            overflow: 'visible',
            marginBottom: 6,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.4,
            shadowRadius: 3.84,
          }}
          resizeMode="contain"
        />
      </View>
    </AnimatedPressable>
  );
};

export default WrappedBanner;