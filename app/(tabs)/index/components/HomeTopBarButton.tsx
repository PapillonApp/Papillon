import React from 'react';
import { Pressable } from 'react-native';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';
import { Link, type Href } from 'expo-router';

interface HomeTopBarButtonProps {
  icon: string;
  label: string;
  route: Href;
}

const HomeTopBarButton: React.FC<HomeTopBarButtonProps> = ({ icon, label, route }) => {
  return (
    <Link asChild href={route}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        android_ripple={{ color: '#FFFFFF40', foreground: true }}
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
      </Pressable>
    </Link>
  );
};

export default HomeTopBarButton;
