import { useTheme } from "@react-navigation/native";
import React, { StyleSheet, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";

export default function TabOneScreen() {
    const theme = useTheme();
    const { colors } = theme;
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <UnderConstructionNotice />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});
