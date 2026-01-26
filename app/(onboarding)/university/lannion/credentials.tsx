import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    View,
} from "react-native";
import Reanimated, {
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { authenticateWithCredentials, LannionAPI } from "@/services/lannion/module";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";

const ANIMATION_DURATION = 170;

const upperFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function LannionCredentials() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const alert = useAlert();
    const { t } = useTranslation();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const university = "IUT de Lannion";
    const color = "#e0001a";

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

    async function handleLogin(password: string, username: string) {
        setIsLoggingIn(true);
        try {
            const store = useAccountStore.getState();

            const client = await authenticateWithCredentials(username, password);

            const api = new LannionAPI(client);
            const relevesResult = await api.getAllReleves();

            if (!relevesResult.success || !relevesResult.data || relevesResult.data.length === 0) {
                throw new Error(relevesResult.error || "Failed to fetch student data");
            }
            const firstReleve: any = relevesResult.data[0];
            const etudiant = firstReleve.relevé?.etudiant;

            const accountUUID = String(uuid());
            const studentName = upperFirst(etudiant?.nom) || "Unknown";
            const studentFirstName = upperFirst(etudiant?.prenom) || "Student";

            const account: Account = {
                id: accountUUID,
                firstName: studentFirstName,
                lastName: studentName,
                schoolName: university,
                services: [
                    {
                        id: uuid(),
                        auth: {
                            additionals: {
                                username: username,
                                password: password
                            },
                        },
                        serviceId: Services.LANNION,
                        createdAt: (new Date()).toISOString(),
                        updatedAt: (new Date()).toISOString()
                    }
                ],
                createdAt: (new Date()).toISOString(),
                updatedAt: (new Date()).toISOString()
            };

            store.addAccount(account);
            store.setLastUsedAccount(accountUUID);

            const settingsStore = useSettingsStore.getState();
            const disabledTabs = settingsStore.personalization.disabledTabs || [];
            const newDisabledTabs = Array.from(new Set([...disabledTabs, "news", "tasks"]));

            settingsStore.mutateProperty("personalization", {
                disabledTabs: newDisabledTabs
            });

            setIsLoggingIn(false);

            return router.push({
                pathname: "../../end/color",
                params: {
                    accountId: accountUUID
                }
            });
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                alert.showAlert({
                    title: "Erreur d'authentification",
                    description: "Les identifiants que tu as saisis sont incorrects ou une erreur est survenue lors de la connexion.",
                    icon: "TriangleAlert",
                    color: "#D60046",
                    withoutNavbar: true
                });
            }
            setIsLoggingIn(false);
        }
    }

    if (Platform.OS === 'android') {
        return (
            <Stack padding={20} gap={8} style={{ paddingTop: insets.top + 20 }}>
                <Typography variant="h3">
                    Lannion n'est pas encore disponible sur Android
                </Typography>
                <Typography variant="body1" color="secondary">
                    On travaille dur pour rendre les librairies nécessaires disponibles sur Android.
                </Typography>
                <View style={{ marginTop: 24 }} />
                <Button
                    title="Retour"
                    onPress={() => router.back()}
                />
            </Stack>
        )
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderBottomLeftRadius: 42,
                    borderBottomRightRadius: 42,
                    padding: 20,
                    paddingTop: insets.top + 20,
                    paddingBottom: 34,
                    flex: 1,
                    backgroundColor: color,
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
                />
                <Stack vAlign="start" hAlign="start" width="100%" gap={12}>
                    <Stack direction="horizontal">
                        <Typography variant="h5" style={{ color: "#FFF", fontSize: 18 }}>
                            {t("STEP")} 2
                        </Typography>
                        <Typography variant="h5" style={{ color: "#FFFFFF90", fontSize: 18 }}>
                            {t("STEP_OUTOF")} 3
                        </Typography>
                    </Stack>
                    <Typography variant="h1" style={{ color: "#FFF", fontSize: 32 }}>
                        {t("ONBOARDING_LOGIN_CREDENTIALS")} {university}
                    </Typography>
                </Stack>
            </View>

            <Stack padding={20} gap={10}>
                <OnboardingInput
                    icon={"User"}
                    placeholder={t("INPUT_USERNAME")}
                    text={username}
                    setText={setUsername}
                    isPassword={false}
                    keyboardType={"default"}
                    inputProps={{
                        autoCapitalize: "none",
                        autoCorrect: false,
                        spellCheck: false,
                        textContentType: "username",
                        editable: !isLoggingIn,
                    }}
                />
                <OnboardingInput
                    icon={"Lock"}
                    placeholder={t("INPUT_PASSWORD")}
                    text={password}
                    setText={setPassword}
                    isPassword={true}
                    keyboardType={"default"}
                    inputProps={{
                        autoCapitalize: "none",
                        autoCorrect: false,
                        spellCheck: false,
                        textContentType: "password",
                        onSubmitEditing: () => {
                            Keyboard.dismiss();
                            if (!isLoggingIn && username.trim() && password.trim()) { handleLogin(password, username); }
                        },
                        returnKeyType: "done",
                        editable: !isLoggingIn,
                    }}
                />
                <Button
                    title={isLoggingIn ? t("ONBOARDING_LOADING_LOGIN") : t("LOGIN_BTN")}
                    style={{
                        backgroundColor: (theme.dark ? theme.colors.border : "#000000") + (isLoggingIn ? "50" : "FF"),
                    }}
                    size="large"
                    onPress={() => {
                        if (!isLoggingIn && username.trim() && password.trim()) {
                            handleLogin(password, username);
                        }
                    }}
                    disabled={isLoggingIn}
                    loading={isLoggingIn}
                />
            </Stack>

            <OnboardingBackButton />
        </KeyboardAvoidingView>
    );
}
