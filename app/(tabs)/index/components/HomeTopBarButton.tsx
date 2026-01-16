import React from 'react';
import { Pressable, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';

interface HomeTopBarButtonProps {
  icon: string;
  onPress?: () => void;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, onPress }) => {
  return (
    <AnimatedPressable
      onPressIn={onPress}
    >
      <Stack
        card
        style={{
          width: 42,
          height: 42,
          borderRadius: 30,
        }}
        hAlign='center'
        vAlign='center'
        noShadow
        backgroundColor='#FFFFFF50'
      >
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </Stack>
    </AnimatedPressable>
  );
};

export default HomeTopBarButton;
