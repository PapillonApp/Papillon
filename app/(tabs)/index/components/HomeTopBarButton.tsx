import React from 'react';
import { Pressable, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';

interface HomeTopBarButtonProps {
  icon: string;
  onPress?: () => void;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, onPress }) => {
  return (
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
      <Pressable onPress={onPress}>
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </Pressable>
    </LiquidGlassView>
  );
};

export default HomeTopBarButton;
