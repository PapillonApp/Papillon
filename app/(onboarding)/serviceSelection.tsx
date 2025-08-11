import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import AnimatedNumber from '@/ui/components/AnimatedNumber';
import { Services } from '@/stores/account/types';
import getCurrentIllustration from './utils/illustrationHelper';
import { getLoginMethods, getSupportedServices } from './utils/constants';


const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
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

    function OnboardingStepIndicator(stepId: string, step: number, nextTextValue: string, prevTextValue: string, animatedPrevTextStyle: any, animatedNextTextStyle: any) {
        return (<Stack
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
                    style={[animatedPrevTextStyle as unknown as StyleProp<ViewStyle>, { position: 'absolute' }]}
                >
                    <Typography
                        variant="h1"
                        style={{ color: stepId === "enter-url" ? "#2F2F2F" : "white", fontSize: 32 }}
                    >
                        {prevTextValue}
                    </Typography>
                </Animated.View>
                <Animated.View
                    style={animatedNextTextStyle as unknown as StyleProp<ViewStyle>}
                >
                    <Typography
                        variant="h1"
                        style={{ color: stepId === "enter-url" ? "#2F2F2F" : "white", fontSize: 32 }}
                    >
                        {nextTextValue}
                    </Typography>
                </Animated.View>
            </View>
        </Stack>)
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

    const loginMethods = getLoginMethods(handleStepChange, setBackgroundColor)
    const services = getSupportedServices(handleStepChange, setBackgroundColor, setSelectedService)


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Animated.View
                    style={[
                        styles.illustrationContainer,
                        { paddingTop: insets.top + 40 },
                        animatedBackgroundStyle
                    ]}
                >
                    {stepId && (
                        getCurrentIllustration(stepId)
                    )}

                    {OnboardingStepIndicator(stepId, step, nextTextValue, prevTextValue, animatedPrevTextStyle, animatedNextTextStyle)}
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
    illustrationContainer: {
        padding: 28,
        gap: 30,
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        paddingBottom: 20,
        borderCurve: "continuous",
        zIndex: 2
    }
});
