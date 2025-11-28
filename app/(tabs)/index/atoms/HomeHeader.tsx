import Stack from '@/ui/components/Stack';
import React from 'react';
import { View } from 'react-native';
import UserProfile from './UserProfile';
import Typography from '@/ui/components/Typography';

const HomeHeader = () => {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Stack>
        <Typography variant="h4" color='white'>HomeHeader</Typography>
      </Stack>
    </View>
  );
};

export default HomeHeader;