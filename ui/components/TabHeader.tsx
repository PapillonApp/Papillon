
import React, { useEffect } from 'react';

import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeHeaderHighlight } from '@/ui/components/NativeHeader';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import Icon from './Icon';
import { TouchableOpacity } from 'react-native';
import TabHeaderTitle, { TabHeaderTitleProps } from './TabHeaderTitle';
import Search from './Search';
import Reanimated, { FadeIn, FadeOut, interpolate, SharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { runsIOS26 } from '../utils/IsLiquidGlass';
import getCorners from '../utils/Corners';

interface TabHeaderProps {
  onHeightChanged?: (height: number) => void,
  title?: React.ReactElement<TabHeaderTitleProps>,
  trailing?: React.ReactElement,
  bottom?: React.ReactElement,
  shouldCollapseHeader?: boolean,
};

const TabHeader: React.FC<TabHeaderProps> = ({
  onHeightChanged = () => { },
  title,
  trailing,
  bottom,
  shouldCollapseHeader,
}) => {
  const theme = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    onHeightChanged(height);
  }, [height]);

  return (
    <>
      <Reanimated.View
        style={[{
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : shouldCollapseHeader ? colors.background : 'transparent',
          borderColor: colors.border,
          borderBottomWidth: 0.5,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height,
          zIndex: 99,
          overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
        }]}
      >
        <BlurView
          style={{
            flex: 1,
          }}
          intensity={100}
        />
      </Reanimated.View>

      <View
        style={{
          paddingTop: insets.top + 4,
          paddingBottom: 16,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height);
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            gap: 16,
            paddingHorizontal: 16,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {title}

          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {trailing}
          </View>
        </View>

        {bottom}
      </View>
    </>
  )
};

export default TabHeader;