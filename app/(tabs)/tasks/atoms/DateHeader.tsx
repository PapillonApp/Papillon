import React, { memo } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { Papicons } from '@getpapillon/papicons';

import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';

interface DateHeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const DateHeader = memo(
  ({ title, isCollapsed, onToggle }: DateHeaderProps) => {
    const { colors } = useTheme();

    const papillonEasing = Easing.bezier(0.3, 0.3, 0, 1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: withTiming(isCollapsed ? '-180deg' : '0deg', { duration: 350, easing: papillonEasing }) }],
        marginLeft: 'auto'
      };
    });

    return (
      <Dynamic animated key={`header:${title}`} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.6}>
          <Stack
            direction='horizontal'
            gap={8}
            vAlign='center'
            hAlign='center'
            padding={[6, 10]}
            style={{ width: '100%', opacity: isCollapsed ? 0.6 : 1 }}
          >
            <Typography variant='h6' color='text' style={{ textTransform: 'capitalize', opacity: 0.6 }}>
              {title}
            </Typography>

            <Reanimated.View style={animatedStyle}>
              <Papicons name="ChevronDown" size={20} color={colors.text} style={{ opacity: 0.6 }} />
            </Reanimated.View>
          </Stack>
        </TouchableOpacity>
      </Dynamic>
    );
  }
);
DateHeader.displayName = "DateHeader";

export default DateHeader;
