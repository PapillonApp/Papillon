import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import React from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Reanimated, { FadeOut, ZoomIn } from 'react-native-reanimated';


export const Welcome = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center' }}>
      {isCurrent && (
        <>
          <Reanimated.Image
            entering={ZoomIn.delay(100).springify().duration(800).dampingRatio(0.5)}
            exiting={FadeOut.duration(300)}
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/monYearbook.png')}
            style={{
              height: 180,
              width: 280,
              overflow: 'visible',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
            resizeMode="contain"
          />

          <Reanimated.View
            entering={ZoomIn.delay(400).springify().duration(800).dampingRatio(0.5)}
            exiting={FadeOut.duration(300)}
            style={{
              position: "absolute",
              bottom: 70
            }}
          >
            <Stack direction='horizontal' hAlign='center' gap={5}>
              <Papicons name='ArrowUp' color='white' />
              <Typography variant='h4' color='white'>Swipe pour le révéler</Typography>
            </Stack>
          </Reanimated.View>
        </>
      )}
    </View>
  );
};