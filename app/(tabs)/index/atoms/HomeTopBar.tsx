import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './UserProfile';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import HomeTopBarButton from '../components/HomeTopBarButton';
import { useRouter } from 'expo-router';

const HomeTopBar = ({ height = 56 }: { height?: number }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      {Platform.OS === 'ios' && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: height + insets.top,
            zIndex: 10,
            overflow: "hidden"
          }}
        >
          <ProgressiveBlurView
            blurAmount={10}
            blurType="systemMaterial"
            direction="blurredTopClearBottom"
            startOffset={0}
            reducedTransparencyFallbackColor="#00000000"
            style={{ width: "100%", height: "101%" }}
          />
        </View>
      )}

      <View
        style={{
          height: height,
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          zIndex: 11,
          alignItems: 'center',
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <UserProfile />

        <Stack direction="horizontal" hAlign="center" vAlign="end" gap={8} inline>
          <HomeTopBarButton icon="palette" onPress={() => router.push("/(modals)/wallpaper")} />
          <HomeTopBarButton icon="gears" onPress={() => router.push("/(settings)/settings")} />
        </Stack>
      </View>
    </>
  );
};

export default HomeTopBar;