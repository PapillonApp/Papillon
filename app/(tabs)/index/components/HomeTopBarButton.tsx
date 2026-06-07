import React from 'react';
import { TouchableNativeFeedback, View } from 'react-native';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';

interface HomeTopBarButtonProps {
  icon: string;
  onPress?: () => void;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, onPress }) => {
  return (
    <TouchableNativeFeedback
      useForeground
      onPress={onPress}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00000038',
          overflow: 'hidden',
        }}
      >
        <Icon size={26} fill='white'>
          <Papicons name={icon} />
        </Icon>
      </View>
    </TouchableNativeFeedback>
  );
};

export default HomeTopBarButton;
