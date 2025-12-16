import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React, { memo, useCallback, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Switch, View, Image } from 'react-native';
import Reanimated, { FadeInDown, FadeOut, FadeOutUp, ZoomIn } from 'react-native-reanimated';

import Stack from '@/ui/components/Stack';
import Typography from "@/ui/components/Typography";
import adjust from '@/utils/adjustColor';

type ConsentItem = {
  title: string;
  icon: string;
  enabled: boolean;
};

const ConsentButton = memo(({
  item,
  index,
  borderColor,
  onToggle
}: {
  item: ConsentItem;
  index: number;
  borderColor: string;
  onToggle: (index: number) => void;
}) => (
  <Reanimated.View
    entering={FadeInDown.springify().duration(400).delay(index * 100 + 500)}
    exiting={FadeOutUp.springify().duration(400).delay(index * 100 + 500)}
  >
    <LiquidGlassView
      glassTintColor='white'
      glassOpacity={0.2}
      glassType='clear'
      isInteractive
      style={{
        justifyContent: "space-between",
        borderRadius: 20,
        borderCurve: "circular",
        borderWidth: 1,
        borderColor,
        width: 300
      }}>
      <Stack
        direction='horizontal'
        padding={15}
      >
        <Stack direction='horizontal' style={{ alignItems: "center", flex: 1 }} gap={10}>
          <Papicons name={item.icon} color={ICON_COLOR} />
          <Typography variant='title' color={ICON_COLOR}>{item.title}</Typography>
        </Stack>
        <Switch value={item.enabled} onValueChange={() => onToggle(index)} trackColor={TRACK_COLOR} />
      </Stack>
    </LiquidGlassView>
  </Reanimated.View>
));

ConsentButton.displayName = 'ConsentButton';

const INITIAL_ITEMS: ConsentItem[] = [
  { title: "Mes notes", icon: "Pie", enabled: true },
  { title: "Absences et retards", icon: "Chair", enabled: true },
  { title: "Emploi du temps", icon: "Calendar", enabled: true },
  { title: "Tâches", icon: "Tasks", enabled: true }
];

const ICON_COLOR = '#31424A';
const TRACK_COLOR = { true: "#C50000" };

export const Consent = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
  const { colors } = useTheme();
  const [consentItems, setConsentItems] = useState(INITIAL_ITEMS);

  const toggleConsent = useCallback((index: number) => {
    setConsentItems(prev => prev.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item
    ));
  }, []);

  const renderItem = useCallback(({ item, index }: { item: ConsentItem; index: number }) => (
    <ConsentButton item={item} index={index} borderColor={colors.border} onToggle={toggleConsent} />
  ), [colors.border, toggleConsent]);

  return (
    <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center' }}>
      {isCurrent && (
        <>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center"
            }}>
            <Reanimated.View
              entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(200)}
              exiting={FadeOut.duration(800)}
            >
              <Image
                source={require('@/assets/images/monYearbook.png')}
                style={{
                  width: Dimensions.get('window').width * 0.6,
                  height: 80,
                  alignSelf: 'center',
                  marginBottom: 20
                }}
                resizeMode="contain"
              />
              <Typography variant="h2" weight="bold" align='center' color={adjust(colors.background, 0.1)} style={{ marginBottom: 2 }}>
                Ton Yearbook, à ton image
              </Typography>
              <Typography variant="body1" align='center' color={adjust(colors.background, 0.3)} style={{ marginBottom: 40, opacity: 0.7 }}>
                Sélectionne les souvenirs que tu veux revivre.
              </Typography>
              <FlatList
                data={consentItems}
                renderItem={renderItem}
                removeClippedSubviews
                style={styles.listContent}
              />
            </Reanimated.View>
          </View>

          <Reanimated.View
            entering={ZoomIn.delay(400).springify().duration(800).dampingRatio(0.5)}
            style={{
              position: "absolute",
              bottom: 70
            }}
          >
            <Stack direction='horizontal' hAlign='center' gap={5}>
              <Papicons name='ArrowUp' color='white' />
              <Typography variant='h4' color='white'>Swipe pour continuer</Typography>
            </Stack>
          </Reanimated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    width: 350,
    marginBottom: 40
  },
  listContent: {
    gap: 20,
    alignItems: "center"
  }
})