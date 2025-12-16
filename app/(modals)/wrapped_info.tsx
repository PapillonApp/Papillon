
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

export default function WrappedInfoModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.card, paddingBottom: insets.bottom + 10 }]}>
            <Stack style={styles.iconContainer}>
                <Papicons name="Info" size={64} fill={colors.primary} color={colors.primary} />
            </Stack>

            <Typography variant="h2" align="center" style={styles.title}>
                À propos du Yearbook
            </Typography>

            <Typography variant="body1" align="center" color="secondary" style={styles.description}>
                Le Yearbook est une rétrospective de ton année scolaire. Il rassemble tes statistiques, notes, et moments forts pour te donner une vue d'ensemble de ta progression.
            </Typography>

            <View style={styles.spacer} />

            <Typography variant="body2" align="center" color="secondary" style={styles.footer}>
                Ces données ne quitteront jamais ton appareil !
            </Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        marginTop: 32,
    },
    title: {
        marginBottom: 8,
    },
    description: {
        maxWidth: 320,
        lineHeight: 24,
    },
    spacer: {
        height: 48,
    },
    footer: {
        maxWidth: 300,
        opacity: 0.7,
    },
});
