import React from 'react';
import { Pressable, View } from 'react-native';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';

interface HomeTopBarButtonProps {
  icon: string;
  onPress?: () => void;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF28',
        overflow: 'hidden',
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </View>
    </Pressable>
  );
};

export default HomeTopBarButton;
