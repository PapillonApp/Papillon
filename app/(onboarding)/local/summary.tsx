import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { useTranslation } from "react-i18next";
import Avatar from "@/ui/components/Avatar";
import { getInitials } from "@/utils/chats/initials";
import { useAccountStore } from "@/stores/account";
import uuid from "@/utils/uuid/uuid";

export default function LocalAccountSummary() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    const params = useLocalSearchParams();
    const firstName = String(params.firstName);
    const lastName = String(params.lastName);

    const { t } = useTranslation();

    const handleConfirm = () => {
        const accountId = uuid();
        const store = useAccountStore.getState();

        store.addAccount({
            id: accountId,
            firstName,
            lastName,
            services: [],
            customisation: {
                profilePicture: "",
                subjects: {}
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        store.setLastUsedAccount(accountId);

        router.push({
            pathname: "/(onboarding)/end/color",
            params: {
                accountId,
            },
        });
    };

    return (
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
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
                    backgroundColor: "#F59E0B",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        marginBottom: 16,
                        alignItems: "center",
                        justifyContent: "center",
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
                </View>
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
                            {t("STEP")} 2
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
                        {t("ONBOARDING_LOCAL_ASKVERIFY")}
                    </Typography>
                </Stack>
            </View>

            <Stack padding={20} gap={30} vAlign="center" hAlign="center" style={{ flex: 1 }}>
                <Stack vAlign="center" hAlign="center" gap={15} style={{ marginTop: 20 }}>
                    <Avatar
                        size={100}
                        initials={getInitials(`${firstName} ${lastName}`)}
                    />

                    <Stack vAlign="center" hAlign="center" gap={8}>
                        <Typography variant="h3" color="text">
                            {firstName} {lastName}
                        </Typography>
                        <Stack
                            direction="horizontal"
                            gap={8}
                            hAlign="center"
                            radius={100}
                            backgroundColor={theme.colors.card}
                            inline
                            padding={[12, 5]}
                            style={{ borderWidth: 1, borderColor: theme.colors.border }}
                        >
                            <Typography variant="body1" color="secondary">
                                {t("ONBOARDING_LOCAL_VERIFY")}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>

                <View style={{ flex: 1 }} />

                <Stack gap={12} width="100%">
                    <Button
                        title={t("CONFIRM_BTN")}
                        style={{
                            backgroundColor: theme.dark ? theme.colors.border : "black",
                        }}
                        size="large"
                        disableAnimation
                        onPress={handleConfirm}
                    />

                    <Typography variant="caption" color="secondary" align="center">
                        {t("ONBOARDING_LOCAL_SUMMARY")}
                    </Typography>
                </Stack>
            </Stack>

            <OnboardingBackButton />
        </View>
    );
}