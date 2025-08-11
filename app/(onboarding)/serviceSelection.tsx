import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import AnimatedNumber from '@/ui/components/AnimatedNumber';
import { Services } from '@/stores/account/types';
import Svg, { Path } from 'react-native-svg';


const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const animation = React.useRef<LottieView>(null);
    const [step, setStep] = useState<number>(1);
    const [stepId, setStepId] = useState<string>("select-school-service");
    const [selectedService, setSelectedService] = useState<Services>()
    const [prevTextValue, setPrevText] = useState<string>("Sélectionne ton service scolaire");
    const [nextTextValue, setNextText] = useState<string>("Comment souhaites-tu te connecter ?");
    const [backgroundColor, setBackgroundColor] = useState<string>("#D51A67");

    const heightMultiplier = useSharedValue(0);
    const animatedBackgroundColor = useSharedValue("#D51A67");
    const prevText = useSharedValue(1);
    const nextText = useSharedValue(0);

    React.useEffect(() => {
        animatedBackgroundColor.value = withTiming(backgroundColor, { duration: 200 });
    }, [backgroundColor]);

    React.useEffect(() => {
        const showSub = Keyboard.addListener('keyboardWillShow', () => {
            heightMultiplier.value = withTiming(0.48, { duration: 250 });
        });
        const hideSub = Keyboard.addListener('keyboardWillHide', () => {
            heightMultiplier.value = withTiming(0.8, { duration: 250 });
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    function handleStepChange(newStep: number, newText: string, duration = 600, heightMultiplierRaw = 0, newStepId?: string) {
        if (newText !== prevTextValue) {
            prevText.value = withTiming(0, { duration: duration });
            nextText.value = withTiming(1, { duration: duration });
            heightMultiplier.value = withTiming(heightMultiplierRaw, { duration: duration * 1.2, easing: Easing.out(Easing.exp) })
            setStep(newStep)

            if (newStepId) {
                setStepId(newStepId)
            }

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
            minHeight: height * heightMultiplier.value
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
            ),
            onPress: () => {
                console.log("map pressed")
            }
        },
        {
            id: "search",
            availableFor: [Services.PRONOTE],
            description: "Rechercher une ville",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Search />
                </Icon>
            ),
            onPress: () => {
                console.log("search pressed")
            }
        },
        {
            id: "qrcode",
            availableFor: [Services.PRONOTE],
            description: "J'ai un QR-Code",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.QrCode />
                </Icon>
            ),
            onPress: () => {
                console.log("qrcode pressed")
            }
        },
        {
            id: "url",
            availableFor: [Services.PRONOTE],
            description: "J'ai une URL de connexion",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Link />
                </Icon>
            ),
            onPress: () => {
                handleStepChange(2, "Indique l'adresse URL de ton établissement", undefined, 0.8, "enter-url")
                setBackgroundColor("#C6C6C6C6")
            }
        }
    ]

    const services = [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: <Image source={require("@/assets/images/service_pronote.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                handleStepChange(2, "Comment souhaites-tu te connecter ?", 600, 0.60, "select-method");
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
                handleStepChange(1, "Sélectionne ton service universitaire", undefined, undefined, "select-univ-service");
                setBackgroundColor("#000000");
                log("University login");
            },
            variant: 'primary' as const,
            style: { backgroundColor: theme.dark ? colors.border : "black" },
        },
    ];


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
                            paddingBottom: 20,
                            borderCurve: "continuous",
                            zIndex: 2
                        },
                        animatedBackgroundStyle
                    ]}
                >
                    {step === 2 && stepId === "enter-url" && (
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                            elevation: 4
                        }}>
                            <LinkIcon />
                        </View>
                    )}
                    {step === 1 && stepId === "select-univ-service" && (
                        <LottieView
                            autoPlay
                            loop={false}
                            ref={animation}
                            style={{
                                width: width * 0.5,
                                height: width * 0.5,
                            }}
                            source={require('@/assets/lotties/uni-services.json')}
                        />
                    )}
                    {step === 1 && stepId === "select-school-service" && (
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
                    {step === 2 && stepId === "select-method" && (
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
                                color={stepId === "enter-url" ? "#2F2F2F" : 'white'}
                            >
                                Etape
                            </Typography>
                            <AnimatedNumber variant='h3' color={stepId === "enter-url" ? "#2F2F2F" : 'white'} disableMoveAnimation>
                                {step}
                            </AnimatedNumber>
                            <Typography color={stepId === "enter-url" ? "#2F2F2F" : 'white'} variant='h3' style={{ opacity: 0.65 }}>sur 3</Typography>
                        </Stack>
                        <View>
                            <Animated.View
                                style={[animatedPrevTextStyle, { position: 'absolute' }]}
                            >
                                <Typography
                                    variant="h1"
                                    style={{ color: stepId === "enter-url" ? "#2F2F2F" : "white", fontSize: 32 }}
                                >
                                    {prevTextValue}
                                </Typography>
                            </Animated.View>
                            <Animated.View
                                style={animatedNextTextStyle}
                            >
                                <Typography
                                    variant="h1"
                                    style={{ color: stepId === "enter-url" ? "#2F2F2F" : "white", fontSize: 32 }}
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
                    {stepId === "enter-url" && (
                        <Stack
                            flex
                            style={{
                                backgroundColor: "#F2F2F2",
                                padding: 13,
                                paddingHorizontal: 23,
                                borderRadius: 30,
                                shadowColor: "rgba(0, 0, 0, 0.15)",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 1,
                                shadowRadius: 3.3,
                                borderWidth: 1,
                                borderColor: "#0000001F",
                                gap: 10,
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                                <Papicons.Link />
                            </Icon>
                            <TextInput
                                placeholder={"URL de ton instance PRONOTE"}
                                placeholderTextColor={colors.text + "50"}
                                value={""}
                                onChangeText={() => { }}
                                style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium" }}
                            />
                        </Stack>
                    )}
                    {stepId === "select-method" && selectedService !== undefined && loginMethods.filter(method => method.availableFor.includes(selectedService)).map((method) => (
                        <Button
                            title={method.description}
                            onPress={() => { method.onPress() }}
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
                    {stepId === "select-school-service" && services.map((service) => {
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
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const LinkIcon = () => (
    <Svg
        width={182}
        height={139}
        fill="none"
    >
        <Path
            fill="#fff"
            d="M139.878 31.3C130.977 13.247 112.399.814 90.887.814L51.86.884C23 2.348.062 26.2.062 55.413l.07 2.795c1.242 24.52 18.64 44.755 41.765 50.294 8.51 17.265 25.866 29.387 46.193 30.419l39.027.069c29.214 0 53.067-22.937 54.53-51.799l.068-2.795c0-25.76-17.835-47.347-41.837-53.096Z"
        />
        <Path
            fill="#9A9A9A"
            d="M90.887 15.558c18.262 0 33.655 12.285 38.368 29.041 21.016 1.111 37.716 18.504 37.716 39.797l-.05 2.05c-1.067 21.056-18.481 37.8-39.804 37.8H90.89l-2.053-.051c-17.356-.88-31.782-12.864-36.316-28.99-20.338-1.074-36.633-17.394-37.664-37.743l-.051-2.05c0-21.321 16.744-38.735 37.8-39.803l2.054-.05h36.227Zm38.979 48.187c-3.832 18.009-19.827 31.518-38.979 31.518H73.115c3.661 5.977 10.252 9.965 17.775 9.965h36.227c11.505 0 20.836-9.327 20.836-20.832 0-10.573-7.88-19.306-18.087-20.651Zm-38.976-.18c-8.612 0-16.002 5.226-19.175 12.679h19.172c8.612 0 16.004-5.226 19.179-12.679H90.89ZM54.66 34.581c-11.505 0-20.832 9.326-20.832 20.832.001 10.573 7.878 19.305 18.083 20.65 3.694-17.363 18.692-30.546 36.926-31.47l2.053-.051h17.773C105 38.567 98.408 34.58 90.887 34.58H54.66Z"
        />
    </Svg>
)