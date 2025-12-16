import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";

export default function WrappedInfoModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <View style={[styles.iconContainer, { backgroundColor: adjust(colors.primary, 0.1) + '20' }]}>
                    <Papicons name="Info" size={32} fill={colors.primary} color={colors.primary} />
                </View>

                <Typography variant="h2" weight="bold" align="center" style={styles.title}>
                    À propos du Yearbook
                </Typography>

                <Typography variant="body1" align="center" color="secondary" style={styles.description}>
                    Le Yearbook est une rétrospective de ton année scolaire.{'\n'}Il rassemble tes statistiques, notes, et moments forts pour te donner une vue d'ensemble de ta progression.
                </Typography>

                <View style={[styles.privacyContainer, { backgroundColor: adjust(colors.background, 0.05), borderColor: colors.border }]}>
                    <View style={[styles.privacyIcon, { backgroundColor: colors.primary }]}>
                        <Papicons name="Lock" size={16} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="body2" weight="bold" style={{ marginBottom: 2 }}>
                            Confidentialité
                        </Typography>
                        <Typography variant="body2" color="secondary" style={styles.privacyText}>
                            Ton Yearbook est calculé localement sur ton téléphone.
                        </Typography>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    title: {
        marginBottom: 8,
        fontSize: 24,
    },
    description: {
        maxWidth: 320,
        lineHeight: 20,
        marginBottom: 24,
        fontSize: 15,
    },
    privacyContainer: {
        width: '100%',
        maxWidth: 340,
        flexDirection: 'row',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    privacyIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyText: {
        opacity: 0.8,
        lineHeight: 18,
        fontSize: 13,
    },
});
