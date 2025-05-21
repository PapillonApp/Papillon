import { screenOptions } from '@/utils/theme/ScreenOptions';
import { Stack } from 'expo-router';

export default function Layout() {

  return (
    <Stack
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: 'Calendar',
        }}
      />
    </Stack>
  );
}
