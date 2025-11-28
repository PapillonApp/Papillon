import React from 'react';
import { FlatList, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './UserProfile';

import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

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
          justifyContent: 'center',
        }}
      >
        <UserProfile subtitle='En cours de développement' />
      </View>
    </>
  );
};

export default HomeTopBar;