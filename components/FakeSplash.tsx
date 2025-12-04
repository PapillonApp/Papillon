import { SplashScreen } from "expo-router";
import React, { useState } from "react";
import { Image, Platform } from "react-native";

import Reanimated, { Easing, withDelay, withTiming } from "react-native-reanimated";

import { VideoSource, useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from "expo";

const assetId = require('@/assets/video/splash.mp4');

const videoSource: VideoSource = {
  assetId
};

export const PapillonSplashOut = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
    },
    animations: {
      opacity: withTiming(0, {
        duration: 400,
        easing: Easing.bezier(0.3, 0, 0, 1),
      }),
    },
  };
};

const FakeSplash = ({ isAppReady }: { isAppReady: boolean }) => {
  if (Platform.OS !== 'ios' || __DEV__) {
    SplashScreen.hideAsync();
    return null;
  };

  const [isSplashLoaded, setSplashLoaded] = useState(false);

  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });

  const { isPlaying, oldIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const SplashLoaded = () => {
    SplashScreen.hideAsync();
    setSplashLoaded(true);
  };

  if (isAppReady && isSplashLoaded) {
    if (!isPlaying && oldIsPlaying) {
      return null;
    }
  }

  return (
    <Reanimated.View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: "#29947A",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      exiting={PapillonSplashOut}
      onLayout={SplashLoaded}
    >
      <VideoView
        player={player}
        style={{
          width: 300,
          height: 300,
        }}
        nativeControls={false}
      />
    </Reanimated.View>
  );
};

export default FakeSplash;