import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    View,
} from "react-native";
import Reanimated, {
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { useTranslation } from "react-i18next";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAlert } from "@/ui/components/AlertProvider";

const ANIMATION_DURATION = 100;

export default function LocalAccountName() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const alert = useAlert();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const keyboardListeners = useMemo(() => ({
        show: () => {
            "worklet";
            opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
            scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
        },
        hide: () => {
            "worklet";
            opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
            scale.value = withTiming(1, { duration: ANIMATION_DURATION });
        },
    }), [opacity]);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
        const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardListeners]);

    const { t } = useTranslation();

    const handleContinue = () => {
        if (firstName.trim().length === 0 || lastName.trim().length === 0) {
            alert.showAlert({
                title: "Informations manquantes",
                icon: "TriangleAlert",
                color: "#D60046",
                withoutNavbar: true
            });
            return;
        }

        router.push({
            pathname: "/(onboarding)/local/summary",
            params: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            },
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, marginBottom: insets.bottom }}
            behavior="padding"
        >
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderBottomLeftRadius: 42,
                    borderBottomRightRadius: 42,
                    padding: 20,
                    paddingTop: insets.top + 20,
                    paddingBottom: 34,
                    borderCurve: "continuous",
                    flex: 1,
                    backgroundColor: "#6B46C1",
                }}
            >
                <Reanimated.View
                    style={{
                        flex: 1,
                        marginBottom: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: opacity,
                        transform: [{ scale: scale }],
                    }}
                >
                    <LottieView
                        source={require("../../../assets/lotties/onboarding.json")}
                        autoPlay
                        loop={false}
                        style={{
                            aspectRatio: 1,
                            height: "100%",
                            maxHeight: 250,
                        }}
                    />
                </Reanimated.View>
                <Stack
                    vAlign="start"
                    hAlign="start"
                    width="100%"
                    gap={12}
                >
                    <Stack
                        direction="horizontal"
                    >
                        <Typography
                            variant="h5"
                            style={{ color: "#FFF", lineHeight: 22, fontSize: 18 }}
                        >
                            {t("STEP")} 1
                        </Typography>
                        <Typography
                            variant="h5"
                            style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
                        >
                            {t("STEP_OUTOF")} 2
                        </Typography>
                    </Stack>
                    <Typography
                        variant="h1"
                        style={{ color: "#FFF", fontSize: 32, lineHeight: 34 }}
                    >
                        {t("ONBOARDING_LOCAL_ASKNAME")}
                    </Typography>
                </Stack>
            </View>
            <Stack padding={20} gap={10}>
                <OnboardingInput
                    icon={"Font"}
                    placeholder={t("ONBOARDING_LOCAL_LASTNAME")}
                    text={lastName}
                    setText={setLastName}
                    isPassword={false}
                    inputProps={{
                        autoCapitalize: "words",
                        autoCorrect: false,
                        spellCheck: false,
                        textContentType: "familyName",
                        returnKeyType: "done",
                        onSubmitEditing: () => {
                            // Focus next input if available
                        },
                    }}
                />
                <OnboardingInput
                    icon={"Bold"}
                    placeholder={t("ONBOARDING_LOCAL_FIRSTNAME")}
                    text={firstName}
                    setText={setFirstName}
                    isPassword={false}
                    inputProps={{
                        autoCapitalize: "words",
                        autoCorrect: false,
                        spellCheck: false,
                        textContentType: "givenName",
                        returnKeyType: "next",
                        onSubmitEditing: handleContinue,
                    }}
                />
                <Button
                    title={t("CONFIRM_BTN")}
                    style={{
                        backgroundColor: theme.dark ? theme.colors.border : "black",
                    }}
                    size="large"
                    disableAnimation
                    onPress={handleContinue}
                />
            </Stack>
            <OnboardingBackButton />
        </KeyboardAvoidingView>
    );
}