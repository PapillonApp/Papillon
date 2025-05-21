import { Stack } from 'expo-router';

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: 'Tasks',
        }}
      />
    </Stack>
  );
}
