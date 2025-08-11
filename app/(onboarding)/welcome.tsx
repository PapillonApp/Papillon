import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';


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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack
                padding={28}
                backgroundColor='#0060D6'
                gap={60}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: insets.top + 20,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    paddingBottom: 40,
                    borderCurve: "continuous"
                }}
            >
                <LottieView
                    autoPlay={false}
                    loop={false}
                    ref={animation}
                    style={{
                        width: 280,
                        height: 280,
                    }}
                    source={require('@/assets/lotties/onboarding.json')}
                />
                <Stack
                    flex
                    vAlign='start'
                    hAlign='start'
                    width="100%"
                    gap={10}
                >
                    <Image
                        source={require('@/assets/logo.png')}
                        resizeMode='contain'
                        style={{
                            width: 140,
                            height: 40,
                        }}
                    />
                    <Typography
                        variant="h1"
                        style={{ color: "white", fontSize: 34 }}
                    >
                        L'application pour gérer ta vie scolaire
                    </Typography>
                    <Typography
                        variant="h5"
                        style={{ color: "#FFFFFF80", lineHeight: 25 }}
                    >
                        Connecte tes applications scolaires pour accéder à tes notes, cours, devoirs et bien plus dans l'interface Papillon !
                    </Typography>
                </Stack>
            </Stack>
            <Stack
                padding={20}
                style={{
                    marginBottom: insets.bottom + 20,
                }}
                gap={10}
            >
                <Button
                    title="Commencer"
                    onPress={() => router.push('/(onboarding)/serviceSelection')}
                    style={{
                        backgroundColor: theme.dark ? colors.border : "black",
                    }}
                    size='large'
                    icon={
                        <Icon papicon size={24} fill={"white"} style={{ backgroundColor: "transparent" }}>
                            <Papicons.Butterfly />
                        </Icon>
                    }
                />
                <Button
                    title="Besoin d'aide ?"
                    onPress={() => log("Help button pressed")}
                    variant="ghost"
                    size='large'
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },
});
