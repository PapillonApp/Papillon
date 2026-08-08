import React from 'react';
import { Pressable, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';
import { Link } from 'expo-router';

interface HomeTopBarButtonProps {
  icon: string;
  route?: string;
  onPress?: () => void;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, route, onPress }) => {
  return (
    <LiquidGlassView
      glassType="clear"
      isInteractive={true}
      glassOpacity={0}
      style={{
        width: 42,
        height: 42,
        borderRadius: 30,
      }}
    >
      <Link asChild href={route ?? "/(features)/soon"}>
      <Link.AppleZoom>
      <Pressable
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </Pressable>
      </Link.AppleZoom>
      </Link>
    </LiquidGlassView>
  );
};

export default HomeTopBarButton;
