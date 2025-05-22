import React, { StyleSheet, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";

export default function TabOneScreen() {
    return (
        <View style={styles.container}>
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
