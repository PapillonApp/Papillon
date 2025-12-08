import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StatusBar, View } from 'react-native';

import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { useEvent } from "expo";
import AnimatedPressable from '@/ui/components/AnimatedPressable';

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Papicons } from '@getpapillon/papicons';
import { useNavigation } from 'expo-router';

import Reanimated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Typography from '@/ui/components/Typography';
import { Cooking, Warning } from '@/app/(modals)/wrapped/stories/consent';
import { Welcome } from '@/app/(modals)/wrapped/stories/welcome';

const WrappedView = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [aboutToExit, setAboutToExit] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mainBackground = useVideoPlayer({
    assetId: require('@/assets/video/wrapped.mp4'),
  }, player => {
    player.loop = true;
    player.play();
  });

  const altBackground = useVideoPlayer({
    assetId: require('@/assets/video/wrapped_alt.mp4'),
  }, player => {
    player.loop = true;
    player.play();
  });

  const redBackground = useVideoPlayer({
    assetId: require('@/assets/video/wrapped_red.mp4'),
  }, player => {
    player.loop = true;
    player.play();
  });

  const slides = [Welcome, Warning, Cooking];
  const sliderRef = useRef<FlatList>(null);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {!aboutToExit && (
        <>
          {(currentIndex == 0 || currentIndex == 1 || currentIndex == 2) && (
            <>
              <StatusBar barStyle={"light-content"} />
              <WrappedBackgroundVideo player={mainBackground} />
            </>
          )}
        </>
      )}

      <LiquidGlassView
        style={{
          position: 'absolute',
          top: insets.top + 2,
          right: 16,
          zIndex: 100,
          borderRadius: 120,
        }}
        glassType="clear"
        isInteractive={true}
        glassOpacity={0.6}
        glassTintColor={"#000"}
      >
        <Pressable
          style={{
            padding: 10
          }}
          onPress={() => {
            setTimeout(() => {
              setAboutToExit(true);
            }, 0);
            setTimeout(() => {
              navigation.goBack();
            }, 50);
          }}
        >
          <Papicons name="cross" size={24} color='white' />
        </Pressable>
      </LiquidGlassView>

      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          padding: 16,
          gap: 8,
          zIndex: 100,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {slides.map((_, index) => (
          <Reanimated.View
            layout={LinearTransition.springify().duration(300)}
            key={index}
            style={{
              width: index === currentIndex ? 8 : 6,
              height: index === currentIndex ? 42 : 6,
              borderRadius: 5,
              backgroundColor: index === currentIndex ? '#FFF' : '#FFFFFF95',

              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: index === currentIndex ? 0.3 : 1,
              shadowRadius: 5,
            }}
          />
        ))}
      </View>

      <FlatList
        removeClippedSubviews={true}
        windowSize={1}
        data={slides}
        renderItem={({ item: Item, index }) => (
          <Item isCurrent={index === currentIndex} sliderRef={sliderRef} />
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToInterval={Dimensions.get('screen').height}
        decelerationRate="fast"
        onScroll={e => {
          const index = Math.round(e.nativeEvent.contentOffset.y / Dimensions.get('screen').height);
          setCurrentIndex(index);
        }}
        ref={sliderRef}
      />
    </View>
  );
};

const WrappedBackgroundVideo = ({ player }: { player: VideoPlayer }) => {
  const { isPlaying, oldIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (!isPlaying) {
      player.play();
    }
  }, [isPlaying]);

  return (
    <Reanimated.View
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
      }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <VideoView
        player={player}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        contentFit="cover"
        nativeControls={false}
      />
    </Reanimated.View>
  );
};

export default WrappedView;