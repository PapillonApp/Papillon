import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { useTheme } from '@react-navigation/native';
import { WifiOff } from 'lucide-react-native';
import adjust from "@/utils/adjustColor";

const ConnectionWarning = () => {
    const { colors, dark } = useTheme();
    const accounts = useAccountStore((state) => state.accounts);
    const lastUsedAccountId = useAccountStore((state) => state.lastUsedAccount);

    const serviceName = useMemo(() => {
        const account = accounts.find((a) => a.id === lastUsedAccountId);
        const service = account?.services[0];

        if (!service) return "Service Scolaire";

        switch (service.serviceId) {
            case Services.PRONOTE: return "PRONOTE";
            case Services.ECOLEDIRECTE: return "EcoleDirecte";
            case Services.SKOLENGO: return "Skolengo";
            default: return "Service Scolaire";
        }
    }, [accounts, lastUsedAccountId]);

    const baseColor = "#FF3B30";
    const textColor = adjust(baseColor, dark ? 0.1 : -0.15);
    const backgroundColor = adjust(baseColor, dark ? -0.85 : 0.85);

    return (
        <Stack
            gap={2}
            direction="vertical"
            radius={25}
            style={{
                backgroundColor: backgroundColor,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginBottom: 16,
            }}
        >
            <Stack direction="horizontal" gap={14} style={{ alignItems: "center" }}>
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 30,
                        backgroundColor: "#FFFFFF15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <WifiOff size={22} color={textColor} />
                </View>

                <Stack gap={0} style={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        style={{ color: textColor, marginBottom: -3 }}
                        numberOfLines={1}
                    >
                        Connexion impossible
                    </Typography>
                    <Typography
                        variant="body2"
                        style={{ color: textColor, opacity: 0.8 }}
                        numberOfLines={1}
                    >
                        L'accès à {serviceName} semble perturbé.
                    </Typography>
                    <Typography
                        variant="caption"
                        style={{ color: textColor, opacity: 0.6, marginTop: 6 }}
                        numberOfLines={1}
                    >
                        Appuie pour plus d'infos
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default ConnectionWarning;
