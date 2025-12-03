import React from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './UserProfile';

import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import { LiquidGlassContainer, LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { Papicons } from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';

const HomeTopBar = ({ height = 56 }: { height?: number }) => {
  const insets = useSafeAreaInsets();

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
            style={{
              width: "100%",
              height: "101%",
            }}
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
        <UserProfile subtitle='En cours de développement' />


        <Stack
          direction="horizontal"
          hAlign="center"
          vAlign="end"
          gap={12}
          inline
        >
          <LiquidGlassView
            glassType="clear"
            isInteractive={true}
            glassOpacity={0}
            style={{
              width: 42,
              height: 42,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pressable>
              <Icon size={26} fill='white'>
                <Papicons name="palette" />
              </Icon>
            </Pressable>
          </LiquidGlassView>

          <LiquidGlassView
            glassType="clear"
            isInteractive={true}
            glassOpacity={0}
            style={{
              width: 42,
              height: 42,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pressable>
              <Icon size={26} fill='white'>
                <Papicons name="gears" />
              </Icon>
            </Pressable>
          </LiquidGlassView>
        </Stack>
      </View>
    </>
  );
};

export default HomeTopBar;