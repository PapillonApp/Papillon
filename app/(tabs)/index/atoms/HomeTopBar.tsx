import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "expo-router/react-navigation";

import { TipIds } from '@/constants/Tips';
import Stack from '@/ui/components/Stack';
import Tip from '@/ui/components/Tip';

import HomeTopBarButton from '../components/HomeTopBarButton';
import UserProfile from './UserProfile';

const WALLPAPER_TIP_STYLE = { bottom: 0, left: 0, right: 0 } as const;

const HomeTopBar = ({ height = 56 }: { height?: number }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      {Platform.OS === "ios" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: height + insets.top,
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <ProgressiveBlurView
            blurAmount={10}
            blurType="systemUltraThinMaterial"
            direction="blurredTopClearBottom"
            startOffset={0}
            reducedTransparencyFallbackColor="#00000000"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}

      <View
        style={{
          height: height,
          position: "absolute",
          top: insets.top,
          left: insets.left,
          right: insets.right,
          paddingHorizontal: 16,
          zIndex: 11,
          justifyContent: "center",
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 670,
            alignItems: "center",
            flexDirection: "row",
            gap: 16,
          }}
        >
          <UserProfile />

          <Stack
            direction="horizontal"
            hAlign="center"
            vAlign="end"
            gap={7}
            inline
          >
            {/* The tip anchors to the button's own box, pinned along its
                bottom edge so the callout drops below it and points back up. */}
            <View>
              <HomeTopBarButton
                icon="palette"
                route="/(modals)/wallpaper"
                onPress={() => router.push("/(modals)/wallpaper")}
              />
              <Tip
                tipId={TipIds.homeWallpaper}
                title={t("Home_Tip_Wallpaper_Title")}
                message={t("Home_Tip_Wallpaper_Message")}
                systemImage="photo.on.rectangle.angled"
                width={42}
                style={WALLPAPER_TIP_STYLE}
              />
            </View>
            <HomeTopBarButton
              icon="gears"
              route="/(settings)/settings"
              onPress={() => router.push("/(settings)/settings")}
            />
          </Stack>
        </View>
      </View>
    </>
  );
};

export default HomeTopBar;