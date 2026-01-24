
import { Papicons } from '@getpapillon/papicons';
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { LayoutAnimationConfig, LinearTransition } from 'react-native-reanimated';

import { NativeHeaderHighlight } from '@/ui/components/NativeHeader';
import Typography from '@/ui/components/Typography';

import { Animation } from '../utils/Animation';
import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';
import ActivityIndicator from './ActivityIndicator';
import { Dynamic } from './Dynamic';
import Icon from './Icon';
import Stack from './Stack';

export interface TabHeaderTitleProps {
  leading?: string,
  number?: string,
  trailing?: string,
  subtitle?: string,
  chevron?: boolean,
  color?: string,
  loading?: boolean,
  height?: number,
  onPress?: () => void,
};

const TabHeaderTitle: React.FC<TabHeaderTitleProps> = ({
  leading,
  number,
  trailing,
  subtitle,
  chevron = true,
  color,
  loading = false,
  height,
  onPress = () => { }
}) => {
  return (
    <LayoutAnimationConfig skipEntering>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
        onPress={() => {
          onPress();
        }}
      >
        <Stack
          animated
          direction='vertical'
          gap={0}
          vAlign='center'
          height={height}
        >
          <Stack
            animated
            direction='horizontal'
            hAlign='center'
            gap={4}
            style={{
              maxWidth: Dimensions.get('window').width - 230,
            }}
          >
            {leading &&
              typeof leading === 'string' ? (
              <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"leading:" + leading.toString()}>
                <Typography variant="header" nowrap>{leading}</Typography>
              </Dynamic>
            ) : (
              leading
            )}

            {number && (
              <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <NativeHeaderHighlight variant='navigation' color={color}>{number}</NativeHeaderHighlight>
              </Dynamic>
            )}

            {trailing &&
              typeof trailing === 'string' ? (
              <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"trailing:" + trailing.toString()}>
                <Typography variant="header">{trailing}</Typography>
              </Dynamic>
            ) : (
              trailing
            )}

            {chevron && (
              <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Icon size={20} opacity={0.5}>
                  <Papicons name="chevrondown" />
                </Icon>
              </Dynamic>
            )}

            {loading && (
              <Dynamic animated layout={Animation(LinearTransition, "list")}>
                <ActivityIndicator size={22} strokeWidth={3} color={color} style={{ marginLeft: 8 }} />
              </Dynamic>
            )}
          </Stack>
          {subtitle && (
            <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"subtitle:" + subtitle.toString()}>
              <Typography variant="body1" color={"secondary"}>
                {subtitle}
              </Typography>
            </Dynamic>
          )}
        </Stack>
      </TouchableOpacity>
    </LayoutAnimationConfig>
  )
};

export default TabHeaderTitle;