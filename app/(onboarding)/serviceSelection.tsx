import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import AnimatedNumber from '@/ui/components/AnimatedNumber';
import { Services } from '@/stores/account/types';


const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const animation = React.useRef<LottieView>(null);
    const [step, setStep] = useState<number>(1);
    const [selectedService, setSelectedService] = useState<Services>()
    const [prevTextValue, setPrevText] = useState<string>("Sélectionne ton service scolaire");
    const [nextTextValue, setNextText] = useState<string>("Comment souhaites-tu te connecter ?");
    const [backgroundColor, setBackgroundColor] = useState<string>("#D51A67");

    const animatedBackgroundColor = useSharedValue("#D51A67");
    const prevText = useSharedValue(1);
    const nextText = useSharedValue(0);

    React.useEffect(() => {
        animatedBackgroundColor.value = withTiming(backgroundColor, { duration: 200 });
    }, [backgroundColor]);

    function handleStepChange(newStep: number, newText: string, duration = 200) {
        if (newText !== prevTextValue) {
            setStep(newStep)
            prevText.value = withTiming(0, { duration: duration });
            nextText.value = withTiming(1, { duration: duration });
            setNextText(newText)
            setTimeout(() => {
                setPrevText(newText);
                setTimeout(() => {
                    prevText.value = 1;
                    nextText.value = 0;
                }, 10);
            }, duration);
        }
    }

    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: animatedBackgroundColor.value,
        };
    });

    const animatedPrevTextStyle = useAnimatedStyle(() => {
        return {
            opacity: prevText.value,
        };
    });

    const animatedNextTextStyle = useAnimatedStyle(() => {
        return {
            opacity: nextText.value,
        };
    });

    const loginMethods = [
        {
            id: "map",
            availableFor: [Services.PRONOTE],
            description: "Utiliser ma position",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.MapPin />
                </Icon>
            )
        },
        {
            id: "search",
            availableFor: [Services.PRONOTE],
            description: "Rechercher une ville",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Search />
                </Icon>
            )
        },
        {
            id: "qrcode",
            availableFor: [Services.PRONOTE],
            description: "J'ai un QR-Code",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.QrCode />
                </Icon>
            )
        },
        {
            id: "url",
            availableFor: [Services.PRONOTE],
            description: "J'ai une URL de connexion",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Link />
                </Icon>
            )
        }
    ]

    const services = [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: <Image source={require("@/assets/images/service_pronote.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                handleStepChange(2, "Comment souhaites-tu te connecter ?");
                setBackgroundColor("#E37900");
                setSelectedService(Services.PRONOTE)
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "ed",
            title: "ÉcoleDirecte",
            type: "main",
            image: <Image source={require("@/assets/images/service_ed.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                handleStepChange(2, "Comment souhaites-tu te connecter ?");
                setBackgroundColor("#E37900");
                setSelectedService(Services.ECOLEDIRECTE)
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "skolengo",
            title: "Skolengo",
            type: "main",
            image: <Image source={require("@/assets/images/service_skolengo.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                setBackgroundColor("#E37900");
                log("Skolengo login");
            },
            variant: 'service' as const,
            color: 'light' as const,
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
                handleStepChange(1, "Sélectionne ton service universitaire");
                setBackgroundColor("#000000");
                log("University login");
            },
            variant: 'primary' as const,
            style: { backgroundColor: theme.dark ? colors.border : "black" },
        },
    ];


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View
                style={[
                    {
                        padding: 28,
                        gap: 30,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingTop: insets.top + 40,
                        borderBottomLeftRadius: 50,
                        borderBottomRightRadius: 50,
                        paddingBottom: 30,
                        borderCurve: "continuous",
                        zIndex: 2
                    },
                    animatedBackgroundStyle
                ]}
            >
                {step === 1 && (
                    <LottieView
                        autoPlay
                        loop={false}
                        ref={animation}
                        style={{
                            width: width * 0.5,
                            height: width * 0.5,
                        }}
                        source={require('@/assets/lotties/school-services.json')}
                    />
                )}
                {step === 2 && (
                    <LottieView
                        autoPlay
                        loop={false}
                        ref={animation}
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        source={require('@/assets/lotties/connexion.json')}
                    />
                )}
                <Stack
                    vAlign='start'
                    hAlign='start'
                    width="100%"
                    gap={10}
                >
                    <Stack
                        direction="horizontal"
                        gap={5}
                        style={{ alignItems: 'baseline' }}
                    >
                        <Typography
                            variant='h3'
                            color='white'
                        >
                            Etape
                        </Typography>
                        <AnimatedNumber variant='h3' color='white'>
                            {step}
                        </AnimatedNumber>
                        <Typography color='white' variant='h3' style={{ opacity: 0.65 }}>sur 3</Typography>
                    </Stack>
                    <View>
                        <Animated.View
                            style={[animatedPrevTextStyle, { position: 'absolute' }]}
                        >
                            <Typography
                                variant="h1"
                                style={{ color: "white", fontSize: 34 }}
                            >
                                {prevTextValue}
                            </Typography>
                        </Animated.View>
                        <Animated.View
                            style={animatedNextTextStyle}
                        >
                            <Typography
                                variant="h1"
                                style={{ color: "white", fontSize: 34 }}
                            >
                                {nextTextValue}
                            </Typography>
                        </Animated.View>
                    </View>
                </Stack>
            </Animated.View>
            <ScrollView
                style={{ overflow: "visible", zIndex: 0, marginBottom: 30 }}
                contentContainerStyle={{
                    padding: 20,
                    gap: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {step === 2 && selectedService !== undefined && loginMethods.filter(method => method.availableFor.includes(selectedService)).map((method) => (
                    <Button
                        title={method.description}
                        onPress={() => { console.log("test") }}
                        variant="service"
                        size="large"
                        alignment="start"
                        key={method.id}
                        icon={method.icon}
                        color="primary"
                        style={{
                            paddingLeft: 15,
                            gap: 10,
                        }}
                    />
                ))}
                {step === 1 && services.map((service) => {
                    const index = services.findIndex(s => s.name === service.name);
                    const isFirstOther = service.type === "other" && services.findIndex(s => s.type === "other") === index;
                    return (
                        <React.Fragment key={service.name}>
                            {isFirstOther && (
                                <Stack
                                    flex
                                    direction="horizontal"
                                    gap={8}
                                    style={{ alignItems: 'center', marginVertical: 10, marginHorizontal: 70 }}
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
                                    ...service.style,
                                    paddingLeft: 15,
                                    gap: 10,
                                }}
                            />
                        </React.Fragment>
                    );
                })}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {

    },
});
