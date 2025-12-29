import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StatusBar, View } from 'react-native';

import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { useEvent } from "expo";
import AnimatedPressable from '@/ui/components/AnimatedPressable';

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Papicons } from '@getpapillon/papicons';
import { useNavigation } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import Reanimated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Typography from '@/ui/components/Typography';
import { Consent } from '@/app/(modals)/wrapped/stories/consent';
import { Loading } from '@/app/(modals)/wrapped/stories/loading';
import { StatsDev } from '@/app/(modals)/wrapped/stories/stats_dev';
import { Welcome } from '@/app/(modals)/wrapped/stories/welcome';
import { IntroHours } from './stories/intro_hours';
import { StepSubject } from './stories/step_subject';
import { StepTeacher } from './stories/step_teacher';
import { StepRoom } from './stories/step_room';
import { useIsFocused } from '@react-navigation/native';
import { Volume2Icon, VolumeIcon, VolumeXIcon } from 'lucide-react-native';

const audioLoop = require('@/assets/audio/wrapped_loop.mp3');

const WrappedView = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [aboutToExit, setAboutToExit] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [statsLocked, setStatsLocked] = useState(false);

  const loopPlayer = useAudioPlayer(audioLoop);

  const [muted, setMuted] = useState(false);

  const playLoop = () => {
    loopPlayer.seekTo(0);
    loopPlayer.loop = true;
    loopPlayer.play();
  };

  useEffect(() => {
    if (isFocused) {
      playLoop();
    }
    else {
      loopPlayer.pause();
    }
  }, [isFocused]);

  setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: "mixWithOthers"
  });

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

  const slides = statsLocked ? [IntroHours, StepSubject, StepTeacher, StepRoom] : [Welcome, Consent, Loading, ...(loadingFinished ? [IntroHours] : [])];
  const sliderRef = useRef<FlatList>(null);

  useEffect(() => {
    if (statsLocked && sliderRef.current) {
      setCurrentIndex(0);
      sliderRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [statsLocked]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {!aboutToExit && (
        <>
          {(currentIndex == 0 || currentIndex == 1 || currentIndex == 2) && !statsLocked && (
            <>
              <StatusBar barStyle={"light-content"} />
              <WrappedBackgroundVideo player={mainBackground} />
            </>
          )}

          {statsLocked && (
            <>
              <StatusBar barStyle={"light-content"} />
              <WrappedBackgroundVideo player={altBackground} />
            </>
          )}
        </>
      )}

      <Image
        source={require('@/assets/logo.png')}
        style={{
          position: 'absolute',
          top: insets.top + 14,
          left: 0,
          zIndex: 20000,
          width: '100%',
          height: 24,
          objectFit: 'contain',
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <LiquidGlassView
        style={{
          position: 'absolute',
          top: insets.top + 2,
          left: 16,
          zIndex: 200,
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
            navigation.navigate('(modals)/wrapped_info' as never);
          }}
        >
          <Papicons name="Info" size={24} color='white' />
        </Pressable>
      </LiquidGlassView>

      <LiquidGlassView
        style={{
          position: 'absolute',
          top: insets.top + 2,
          left: 68,
          zIndex: 200,
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
            loopPlayer.muted = !loopPlayer.muted;
            setMuted(loopPlayer.muted);
          }}
        >
          {muted ? <VolumeXIcon size={24} color='white' /> : <Volume2Icon size={24} color='white' />}
        </Pressable>
      </LiquidGlassView>

      <LiquidGlassView
        style={{
          position: 'absolute',
          top: insets.top + 2,
          right: 16,
          zIndex: 200,
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
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          padding: 9,
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
          <Item
            isCurrent={index === currentIndex}
            sliderRef={sliderRef}
            onFinished={() => setLoadingFinished(true)}
          />
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
        disableIntervalMomentum={true}
        onScroll={e => {
          const index = Math.round(e.nativeEvent.contentOffset.y / Dimensions.get('screen').height);
          setCurrentIndex(index);

          if (!statsLocked && loadingFinished && slides.length > 1 && index === slides.length - 1) {
            setStatsLocked(true);
          }
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