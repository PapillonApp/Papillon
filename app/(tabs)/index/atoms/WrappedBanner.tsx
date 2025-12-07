import { useFocusEffect } from "@react-navigation/native";
import { useEvent } from "expo";
import { useNavigation } from 'expo-router';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';

import AnimatedPressable from '@/ui/components/AnimatedPressable';

// Import assets
const videoAssetId = require('@/assets/video/wrapped.mp4');
const overlayImage = require('@/assets/images/monYearbook.png');
const placeholderImage = require('@/assets/images/wrapped-static.png');

const videoSource: VideoSource = {
  assetId: videoAssetId
};

// Dimensions for the banner view (adjust as needed)
const BANNER_HEIGHT = 130; // Use a fixed height for better layout stability

const WrappedBanner = () => {
  const navigation = useNavigation();
  // Using a ref to hold the player ensures it doesn't get re-created on every render
  const playerRef = useRef(useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.showNowPlayingNotification = false;
    player.audioMixingMode = "mixWithOthers";
  }));
  const player = playerRef.current;

  // State to track if the component is in focus
  const [isFocused, setIsFocused] = useState(false);
  // State to track if the video is currently loading/buffering
  const [isLoading, setIsLoading] = useState(true);

  // Set the initial player state to loading
  useEvent(player, 'loadStart', () => setIsLoading(true));
  useEvent(player, 'loadedMetadata', () => setIsLoading(false));

  // --- Video Playback Control on Focus/Blur ---
  useFocusEffect(
    useCallback(() => {
      // Screen is focused (visible)
      setIsFocused(true);
      // Play the video when the screen becomes focused
      player.play();

      return () => {
        // Screen is blurred (no longer visible)
        setIsFocused(false);
        // Pause the video to save resources
        try {
          player.pause();
        } catch (e) {
          // Ignore error if native player object is not found
        }
        // For *extreme* optimization on Android/iOS, you might consider:
        // player.replace(null); // This unloads the video resource completely
        // If you unload, you need to call player.replace(videoSource) on focus
      };
    }, [player])
  );

  // Fallback to ensure play state
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  useEffect(() => {
    if (isFocused && !isPlaying) {
      // Only attempt to play if the component is focused
      player.play();
    }
  }, [isFocused, isPlaying, player]);
  // --- End Video Control ---

  // Conditional Video Rendering: Only render VideoView if focused
  const shouldRenderVideo = isFocused && !isLoading;

  return (
    <AnimatedPressable
      onPress={() => navigation.navigate('(modals)/wrapped')}
      style={{ marginTop: 12 }}
    >
      <View
        style={{
          height: BANNER_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
          backgroundColor: '#000',
        }}
      >
        {shouldRenderVideo && (
          <VideoView
            player={player}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 20,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
            contentFit="cover"
            nativeControls={false}
          />
        )}

        <Image
          source={overlayImage}
          style={{
            height: 120,
            width: 180,
            zIndex: 2,
          }}
          resizeMode="contain"
        />

        <Image
          source={placeholderImage}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            zIndex: -1,
          }}
          resizeMode="cover"
        />

        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 20,
          borderColor: '#00000030',
          borderWidth: 1,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      </View>
    </AnimatedPressable>
  );
};

export default WrappedBanner;