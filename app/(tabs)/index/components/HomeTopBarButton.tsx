import React from 'react';
import { Pressable, TouchableNativeFeedback, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';
import { Link } from 'expo-router';

interface HomeTopBarButtonProps {
  icon: string;
  route?: string;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, route }) => {
  return (
    <Link asChild prefetch href={route ?? "/(features)/soon"}>
    <TouchableNativeFeedback useForeground>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF28',
          overflow: 'hidden',
        }}
      >
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </View>
    </TouchableNativeFeedback>
    </Link>
  );
};

export default HomeTopBarButton;
