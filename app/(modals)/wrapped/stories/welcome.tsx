import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import React from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Reanimated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { SHADOW_OVER_ANIMATED_BG } from '../_layout';


export const Welcome = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000052', paddingHorizontal: 40, gap: 6 }}>
      {isCurrent && (
        <>
          <Reanimated.Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/images/monYearbook.png')}
            style={{
              height: 120,
              width: Dimensions.get('window').width * 0.8,
              alignSelf: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              marginBottom: 20
            }}
            resizeMode="contain"
          />

          <Typography variant="h3" weight="bold" align='center' color={"white"} style={{ marginBottom: 2, ...SHADOW_OVER_ANIMATED_BG }}>
            Mon année en revue
          </Typography>

          <Typography variant="navigation" align='center' weight='semibold' color={"white"} style={{ marginBottom: 2, ...SHADOW_OVER_ANIMATED_BG }}>
            Ton Yearbook, c'est le moyen de se remémorer ton année scolaire. C'est parti ?
          </Typography>

          <Reanimated.View
            style={{
              position: "absolute",
              bottom: 70,
              ...SHADOW_OVER_ANIMATED_BG
            }}
          >
            <Stack direction='horizontal' hAlign='center' gap={5}>
              <Papicons name='ArrowUp' color='white' />
              <Typography variant='h4' color='white'>Swipe pour commencer</Typography>
            </Stack>
          </Reanimated.View>
        </>
      )}
    </View>
  );
};