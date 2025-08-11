import React from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
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

    const services = [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: <Image source={require("@/assets/images/service_pronote.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                log("Pronote login");
            },
            variant: 'outline' as const,
            color: "primary",
        },
        {
            name: "ed",
            title: "ÉcoleDirecte",
            type: "main",
            image: <Image source={require("@/assets/images/service_ed.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                log("EcoleDirecte login");
            },
            variant: 'outline' as const,
            color: "primary",
        },
        {
            name: "skolengo",
            title: "Skolengo",
            type: "main",
            image: <Image source={require("@/assets/images/service_skolengo.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                log("Skolengo login");
            },
            variant: 'outline' as const,
            color: "primary",
        },
        {
            name: "university",
            title: "Service universitaire",
            type: "other",
            image: (
                <Icon papicon size={24} fill={"white"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.University />
                </Icon>
            ),
            onPress: () => {
                log("University login");
            },
            variant: 'primary' as const,
            color: theme.dark ? colors.border : "black",
        },
    ];


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
                        width: 200,
                        height: 200,
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
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                    padding: 20,
                    gap: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {services.map((service, index) => {
                    const isFirstOther = service.type === "other" && services.findIndex(s => s.type === "other") === index;
                    return (
                        <React.Fragment key={index}>
                            {isFirstOther && (
                                <Stack
                                    direction="horizontal"
                                    gap={8}
                                    style={{ alignItems: 'center', marginVertical: 16, marginHorizontal: 40 }}
                                >
                                    <View style={{ flex: 1, height: 2, backgroundColor: colors.text + "45" }} />
                                    <Typography variant="body2" style={{ color: colors.text + "70" }}>
                                        ou
                                    </Typography>
                                    <View style={{ flex: 1, height: 2, backgroundColor: colors.text + "45" }} />
                                </Stack>
                            )}
                            <Button
                                title={service.title}
                                onPress={() => { service.onPress?.() }}
                                variant={service.variant}
                                size='large'
                                alignment='start'
                                icon={service.image}
                                color={service.color}
                                style={{
                                    paddingLeft: 15,
                                    gap: 10,
                                }}
                            />
                        </React.Fragment>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },
});
