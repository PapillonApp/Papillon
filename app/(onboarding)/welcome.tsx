import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';


const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const animation = React.useRef<LottieView>(null);


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack
                padding={28}
                backgroundColor='#0060D6'
                gap={20}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: insets.top + 60,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    flex: 1,
                    borderCurve: "continuous"
                }}
            >
                <LottieView
                    autoPlay
                    loop={true}
                    ref={animation}
                    style={{
                        width: 275,
                        height: 275,
                    }}
                    source={require('@/assets/lotties/connexion.json')}
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
                        style={{ color: "white" }}
                    >
                        L’unique application pour gérer toute ta vie scolaire et universitaire au même endroit !
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
                    onPress={() => router.push('/(onboarding)/service')}
                    color='black'
                    size='large'
                    icon={<Icon papicon color={"#FF0000"}>
                        <Papicons.Info />
                    </Icon>}

                />
                <Button
                    title="Besoin d'aide ?"
                    onPress={() => router.push('/(onboarding)/help')}
                    variant='outline'
                    size='large'
                    icon={<Papicons.Butterfly color={colors.text} />}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
