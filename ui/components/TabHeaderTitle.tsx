
import React from 'react';

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeHeaderHighlight } from '@/ui/components/NativeHeader';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import Icon from './Icon';
import { TouchableOpacity } from 'react-native';
import Stack from './Stack';
import { Dynamic } from './Dynamic';
import { LayoutAnimationConfig } from 'react-native-reanimated';
import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';
import ActivityIndicator from './ActivityIndicator';

export interface TabHeaderTitleProps {
  leading?: string,
  number?: string,
  trailing?: string,
  chevron?: boolean,
  color?: string,
  loading?: boolean,
  onPress?: () => void,
};

const TabHeaderTitle: React.FC<TabHeaderTitleProps> = ({
  leading,
  number,
  trailing,
  chevron = true,
  color,
  loading = false,
  onPress = () => { }
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LayoutAnimationConfig skipEntering>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
        onPress={onPress}
      >
        <Stack
          direction='horizontal'
          hAlign='center'
          gap={4}
        >
          {leading &&
            typeof leading === 'string' ? (
            <Dynamic animated>
              <Typography variant="header">{leading}</Typography>
            </Dynamic>
          ) : (
            leading
          )}

          {number && (
            <Dynamic animated>
              <NativeHeaderHighlight variant='navigation' color={color}>{number}</NativeHeaderHighlight>
            </Dynamic>
          )}

          {trailing &&
            typeof trailing === 'string' ? (
            <Dynamic animated>
              <Typography variant="header">{trailing}</Typography>
            </Dynamic>
          ) : (
            trailing
          )}

          {chevron && (
            <Dynamic animated>
              <Icon size={20} opacity={0.5}>
                <Papicons name="chevrondown" />
              </Icon>
            </Dynamic>
          )}

          {loading && (
            <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <ActivityIndicator size={22} strokeWidth={3} color={color} style={{ marginLeft: 8 }} />
            </Dynamic>
          )}
        </Stack>
      </TouchableOpacity>
    </LayoutAnimationConfig>
  )
};

export default TabHeaderTitle;