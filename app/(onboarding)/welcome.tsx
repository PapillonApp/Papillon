import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import { Papicons } from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import ViewContainer from '@/ui/components/ViewContainer';


const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (animation.current) {
        animation.current.reset();
        animation.current.play();
      }
    }, [])
  );

  return (
    <ViewContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack
          padding={32}
          backgroundColor='#0060D6'
          gap={40}
          style={{
            height: Dimensions.get('window').height - 200,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingTop: insets.top + 20,
            borderBottomLeftRadius: 42,
            borderBottomRightRadius: 42,
            paddingBottom: 34,
            borderCurve: "continuous"
          }}
        >
          <LottieView
            autoPlay={false}
            loop={false}
            ref={animation}
            style={{
              width: 250,
              height: 250,
            }}
            source={require('@/assets/lotties/onboarding.json')}
          />
          <Stack
            flex
            vAlign='start'
            hAlign='start'
            width="100%"
            gap={6}
          >
            <Image
              source={require('@/assets/logo.png')}
              resizeMode='contain'
              style={{
                width: 136,
                height: 36,
                marginBottom: 2,
              }}
            />
            <Typography
              variant="h1"
              style={{ color: "white", fontSize: 32, lineHeight: 34 }}
            >
              L'application pour gérer ta vie scolaire
            </Typography>
            <Typography
              variant="h5"
              style={{ color: "#FFFFFF80", lineHeight: 22, fontSize: 18 }}
            >
              Connecte tes applications scolaires pour accéder à tes notes, cours, devoirs et bien plus dans l'interface Papillon !
            </Typography>
          </Stack>
        </Stack>
        <Stack
          padding={20}
          style={{
            flex: 1,
            marginBottom: insets.bottom + 20,
          }}
          gap={10}
        >
          <Button
            title="Commencer"
            onPress={() => {
              requestAnimationFrame(() => {
                router.push('/(onboarding)/serviceSelection');
              });
            }}
            style={{
              backgroundColor: theme.dark ? colors.border : "black",
            }}
            size='large'
            icon={
              <Papicons name={"Butterfly"} />
            }
          />
          <Button
            title="Besoin d'aide ?"
            onPress={() => log("Help button pressed")}
            variant="ghost"
            color='text'
            size='large'
          />
        </Stack>
      </View>
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between"
  },
});
