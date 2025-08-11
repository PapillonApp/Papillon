import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
                backgroundColor='#D51A67'
                gap={30}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: insets.top + 20,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    paddingBottom: 30,
                    borderCurve: "continuous"
                }}
            >
                <LottieView
                    autoPlay
                    loop={false}
                    ref={animation}
                    style={{
                        width: 250,
                        height: 250,
                    }}
                    source={require('@/assets/lotties/school-services.json')}
                />
                <Stack
                    flex
                    vAlign='start'
                    hAlign='start'
                    width="100%"
                    gap={10}
                >
                    <Typography
                        variant='h3'
                        color='white'
                    >
                        Etape 1 <Typography color='white' variant='h3' style={{ opacity: 0.65 }}>sur 3</Typography>
                    </Typography>
                    <Typography
                        variant="h1"
                        style={{ color: "white", fontSize: 34 }}
                    >
                        Sélectionne ton service scolaire
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
                    icon={
                        <Icon papicon size={24} fill={"#FFFFFF"} style={{ backgroundColor: "transparent" }}>
                            <Papicons.Butterfly />
                        </Icon>
                    }
                />
                <Button
                    title="Besoin d'aide ?"
                    onPress={() => router.push('/(onboarding)/help')}
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
