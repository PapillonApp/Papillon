import React from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './UserProfile';

import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { Papicons } from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';

const HomeTopBar = ({ height = 56 }: { height?: number }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {Platform.OS === 'ios' && (
        <ProgressiveBlurView
          blurType="systemMaterial"
          blurAmount={14}
          direction="blurredTopClearBottom"
          startOffset={0}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: height + insets.top + 24,
            zIndex: 10,
          }}
        />
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
          flex
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