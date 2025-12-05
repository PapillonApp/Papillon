import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, View } from 'react-native';

import { VideoSource, useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from "expo";
import Stack from '@/ui/components/Stack';
import AnimatedPressable from '@/ui/components/AnimatedPressable';

import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Papicons } from '@getpapillon/papicons';
import { useNavigation } from 'expo-router';

import Reanimated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Typography from '@/ui/components/Typography';
import { PapillonZoomIn, PapillonZoomOut } from '@/ui/utils/Transition';
import Button from '@/ui/components/Button';
import { FlashList } from '@shopify/flash-list';

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

  const slides = [Welcome, Intro, Welcome, Intro];
  const sliderRef = useRef<FlatList>(null);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {!aboutToExit && (
        <>
          {(currentIndex == 0 || currentIndex == 1) && (
            <WrappedBackgroundVideo player={mainBackground} />
          )}

          {(currentIndex == 2 || currentIndex == 3) && (
            <WrappedBackgroundVideo player={altBackground} />
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

const WrappedBackgroundVideo = ({ player }) => {
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

const Welcome = ({ isCurrent, sliderRef }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center' }}>
      {isCurrent && (
        <Reanimated.Image
          entering={ZoomIn.delay(100).springify().duration(800).dampingRatio(0.5)}
          exiting={FadeOut.duration(300)}

          source={require('@/assets/images/monYearbook.png')}
          style={{
            height: 180,
            width: 280,
            overflow: 'visible',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const Intro = ({ isCurrent, sliderRef }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  return (
    <View style={{
      width: "100%",
      height: Dimensions.get('screen').height,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 10,
    }}>
      {isCurrent && (
        <>
          <Reanimated.View
            entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(400)}
            exiting={FadeOut.duration(800)}
          >
            <Papicons name="clock" size={48} color='#000' />
          </Reanimated.View>
          <Reanimated.View
            entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(600)}
            exiting={FadeOut.duration(800)}
          >
            <Typography variant="h2" align='center' color='#000'>
              On a passé une belle année ensemble...
            </Typography>
          </Reanimated.View>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <Reanimated.View
              entering={FadeInLeft.springify().dampingRatio(0.5).duration(1800).delay(2000)}
              exiting={FadeOut.duration(800)}
            >
              <Typography variant="h5" align='center' color='#000'>
                Avec parfois des hauts...
              </Typography>
            </Reanimated.View>
            <Reanimated.View
              entering={FadeInRight.springify().dampingRatio(0.5).duration(1800).delay(3200)}
              exiting={FadeOut.duration(800)}
            >
              <Typography variant="h5" align='center' color='#000'>
                et des bas.
              </Typography>
            </Reanimated.View>
          </View>
          <Reanimated.View
            entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(4800)}
            exiting={FadeOut.duration(800)}
            style={{
              marginTop: 20,
            }}
          >
            <AnimatedPressable
              onPress={() => {
                setTimeout(() => {
                  sliderRef.current?.scrollToIndex({
                    index: 2,
                    animated: true,
                  });
                }, 200);
              }}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 18,
                borderRadius: 120,
                borderColor: '#00000055',
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Papicons name="arrowRight" size={24} color='#000' />

              <Typography variant="h5" align='center' color='#000'>
                Découvrir mon Yearbook
              </Typography>
            </AnimatedPressable>
          </Reanimated.View>
        </>
      )}
    </View>
  );
};

export default WrappedView;