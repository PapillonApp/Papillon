import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    View,
} from "react-native";
import Reanimated, {
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { authenticateWithCAS, ScodocAPI, UPPA_CAS_URL } from "@/services/scodoc/module";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";

const ANIMATION_DURATION = 170;
/** Couleur officielle de l'UPPA */
const UPPA_COLOR = "#003087";
/** URL ScoDoc de l'UPPA (IUT de Bayonne / Pau) — peut être remplacée par l'instance de l'IUT */
const UPPA_SCODOC_URL = "https://scodoc.iutpa.univ-pau.fr";

const upperFirst = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function UppaCasCredentials() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const alert = useAlert();
    const { t } = useTranslation();

    const [scodocUrl, setScodocUrl] = useState<string>(UPPA_SCODOC_URL);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
    }), [opacity, scale]);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
        const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardListeners]);

    async function handleLogin() {
        setIsLoggingIn(true);
        try {
            const baseUrl = scodocUrl.trim().replace(/\/+$/, "");

            // Authenticate via UPPA CAS portal
            const client = await authenticateWithCAS(baseUrl, UPPA_CAS_URL, username, password);
            const api = new ScodocAPI(client);

            // Discover student info
            const discovery = await api.discoverStudent(username);

            if (!discovery.success || !discovery.data) {
                throw new Error(
                    discovery.error || "Impossible de trouver les informations étudiantes"
                );
            }

            const { etudid, deptAcronym, etudiant } = discovery.data;
            client.setStudentInfo(etudid, deptAcronym);

            const store = useAccountStore.getState();
            const accountUUID = String(uuid());

            const firstName = upperFirst(etudiant?.prenom) || "Étudiant";
            const lastName = upperFirst(etudiant?.nom) || "UPPA";

            const account: Account = {
                id: accountUUID,
                firstName,
                lastName,
                schoolName: "UPPA – ScoDoc",
                services: [
                    {
                        id: uuid(),
                        auth: {
                            additionals: {
                                username,
                                password,
                                baseUrl,
                                casUrl: UPPA_CAS_URL,
                                authMode: "cas",
                                etudid: etudid.toString(),
                                deptAcronym,
                            },
                        },
                        serviceId: Services.SCODOC,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            store.addAccount(account);
            store.setLastUsedAccount(accountUUID);

            // Disable tabs not supported by ScoDoc
            const settingsStore = useSettingsStore.getState();
            const disabledTabs = settingsStore.personalization.disabledTabs || [];
            const newDisabledTabs = Array.from(new Set([...disabledTabs, "news", "tasks"]));
            settingsStore.mutateProperty("personalization", { disabledTabs: newDisabledTabs });

            setIsLoggingIn(false);

            router.push({
                pathname: "../../end/color",
                params: { accountId: accountUUID },
            });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            alert.showAlert({
                title: "Erreur de connexion",
                description: message.includes("CAS") || message.includes("Identifiant")
                    ? "Identifiants CAS incorrects. Vérifie ton login et mot de passe UPPA."
                    : "Impossible de se connecter. Vérifie l'URL ScoDoc et tes identifiants CAS UPPA.",
                icon: "TriangleAlert",
                color: "#D60046",
                withoutNavbar: true,
            });
            setIsLoggingIn(false);
        }
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
                    backgroundColor: UPPA_COLOR,
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
                        Connexion UPPA
                    </Typography>
                    <Typography variant="body1" style={{ color: "#FFFFFFCC" }}>
                        Utilise tes identifiants du portail CAS de l&apos;UPPA (même login que l&apos;ENT)
                    </Typography>
                </Stack>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
                <Stack padding={20} gap={10} style={{ paddingBottom: 40 }}>
                    <OnboardingInput
                        icon={"Link"}
                        placeholder={"URL ScoDoc (ex: https://scodoc.iutpa.univ-pau.fr)"}
                        text={scodocUrl}
                        setText={setScodocUrl}
                        isPassword={false}
                        keyboardType={"url"}
                        inputProps={{
                            autoCapitalize: "none",
                            autoCorrect: false,
                            spellCheck: false,
                            textContentType: "URL",
                            editable: !isLoggingIn,
                        }}
                    />
                    <OnboardingInput
                        icon={"User"}
                        placeholder={"Identifiant CAS UPPA (ex: p1234567)"}
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
                                if (!isLoggingIn && scodocUrl.trim() && username.trim() && password.trim()) {
                                    handleLogin();
                                }
                            },
                            returnKeyType: "done",
                            editable: !isLoggingIn,
                        }}
                    />
                    <Button
                        title={isLoggingIn ? t("ONBOARDING_LOADING_LOGIN") : t("LOGIN_BTN")}
                        style={{
                            backgroundColor:
                                (theme.dark ? theme.colors.border : "#000000") +
                                (isLoggingIn ? "50" : "FF"),
                        }}
                        size="large"
                        onPress={() => {
                            if (!isLoggingIn && scodocUrl.trim() && username.trim() && password.trim()) {
                                handleLogin();
                            }
                        }}
                        disabled={isLoggingIn}
                        loading={isLoggingIn}
                    />
                </Stack>
            </ScrollView>

            <OnboardingBackButton />
        </KeyboardAvoidingView>
    );
}
