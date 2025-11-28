import React from 'react';
import { FlatList, View } from 'react-native';
import Wallpaper from './atoms/Wallpaper';
import HomeHeader from './atoms/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Stack from '@/ui/components/Stack';
import UserProfile from './atoms/UserProfile';
import HomeTopBar from './atoms/HomeTopBar';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Wallpaper />

      <HomeTopBar />

      <FlatList
        data={[]}
        renderItem={({ item }) => <View />}
        keyExtractor={(item, index) => index.toString()}

        ListHeaderComponent={<HomeHeader />}

        style={{
          flex: 1,
        }}

        contentContainerStyle={{
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom,
        }}
      />
    </>
  );
};

export default HomeScreen;