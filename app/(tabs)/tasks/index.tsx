import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import Reanimated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import ChipButton from '@/ui/components/ChipButton';

import Search from '@/ui/components/Search';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import Typography from '@/ui/components/Typography';

const TasksView: React.FC = () => {
  const [headerHeight, setHeaderHeight] = useState(0);

  const offsetY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  return (
    <View
      style={{ flex: 1 }}
    >
      <TabHeader
        onHeightChanged={setHeaderHeight}
        title={<TabHeaderTitle leading="Semaine" number={"51"} color='#C54CB3' />}
        bottom={<Search placeholder='Rechercher une note' color='#C54CB3' />}
        scrollHandlerOffset={offsetY}
      />

      <Reanimated.ScrollView
        style={{ flex: 1, height: '100%' }}
        contentContainerStyle={{ padding: 16, paddingTop: headerHeight + 16 }}
        onScroll={scrollHandler}
      >
        <Typography>aaa</Typography>
        <Typography variant='h1'>aaa</Typography>
      </Reanimated.ScrollView>
    </View>
  )
};

export default TasksView;