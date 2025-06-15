import { Link, useNavigation, useRouter } from "expo-router";
import { RefreshCcw } from "lucide-react-native";
import { useState } from "react";
import React, { ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";

export default function TabOneScreen() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <Stack gap={16} hAlign="center">
                <UnderConstructionNotice />

                <Button
                    title="Click Me"
                    onPress={() => router.navigate("/page")}
                />

                <Button
                    title="Load something"
                    inline
                    loading={loading}
                    variant="outline"
                    onPress={() => setLoading(!loading)}
                />
            </Stack>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    containerContent: {
        justifyContent: "center",
        alignItems: "center",
    }
});
